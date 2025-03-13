/**
 * Gasless Cross-Chain Swap Application
 * 
 * This application handles the gasless swap process using
 * EIP-2612 and Gelato + Expand as described in the PRD.
 */

// Global state
let web3;
let currentAccount;
let chainId;
let swapState = {
    taskId: null,
    sourceToken: null,
    sourceTokenDecimals: 0,
    nonce: 0,
    signature: null
};

// DOM Elements
const connectButton = document.getElementById('connectWallet');
const executeButton = document.getElementById('executeSwap');
const sourceChainSelect = document.getElementById('sourceChain');
const sourceTokenSelect = document.getElementById('sourceToken');
const destChainSelect = document.getElementById('destChain');
const destTokenSelect = document.getElementById('destToken');
const amountInput = document.getElementById('amount');
const slippageInput = document.getElementById('slippage');
const recipientInput = document.getElementById('recipientAddress');
const tokenSymbolSpan = document.querySelector('.token-symbol');
const userAddressSpan = document.getElementById('userAddress');
const chainIdSpan = document.getElementById('chainId');
const tokenBalanceSpan = document.getElementById('tokenBalance');
const currentNonceSpan = document.getElementById('currentNonce');
const taskIdSpan = document.getElementById('taskId');
const txDetailsElement = document.getElementById('txDetails');
const clearLogButton = document.getElementById('clearLog');

// Constants for EIP-712 typed data
const EIP712_TYPES = {
    Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' }
    ]
};

/**
 * Initializes the application.
 */
async function init() {
    setupEventListeners();
    populateTokenLists();
    
    // Check if MetaMask is installed
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        
        // Handle account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
        
        // Check if already connected
        try {
            const accounts = await web3.eth.getAccounts();
            if (accounts.length > 0) {
                handleAccountsChanged(accounts);
            }
        } catch (error) {
            console.error("Error checking accounts:", error);
        }
    } else {
        console.log("MetaMask is not installed. Please install it to use this application.");
        updateStepStatus('step-connect', 'error', 'MetaMask not found');
    }
}
document.addEventListener("DOMContentLoaded", init);
/**
 * Sets up event listeners for UI interactions.
 */
function setupEventListeners() {
    connectButton.addEventListener('click', connectWallet);
    executeButton.addEventListener('click', executeSwap);
    clearLogButton.addEventListener('click', clearLog);
    sourceChainSelect.addEventListener('change', handleSourceChainChange);
    sourceTokenSelect.addEventListener('change', handleSourceTokenChange);
    destChainSelect.addEventListener('change', handleDestChainChange);
}

/**
 * Populates the token dropdown lists based on selected chains.
 */
function populateTokenLists() {
    populateTokenSelect(sourceTokenSelect, sourceChainSelect.value);
    populateTokenSelect(destTokenSelect, destChainSelect.value);
}

/**
 * Populates a token select element with options for the specified chain.
 */
function populateTokenSelect(selectElement, chainIdValue) {
    // Clear existing options
    selectElement.innerHTML = '';
    
    // Get tokens for the selected chain
    const chainTokens = CONFIG.tokens[chainIdValue];
    if (!chainTokens) {
        const option = document.createElement('option');
        option.text = 'No tokens available for this chain';
        selectElement.add(option);
        return;
    }
    
    // Add options for each token
    Object.entries(chainTokens).forEach(([address, token]) => {
        const option = document.createElement('option');
        option.value = address;
        option.text = `${token.symbol} - ${token.name}`;
        selectElement.add(option);
    });
    
    // Trigger change event to update UI
    selectElement.dispatchEvent(new Event('change'));
}

/**
 * Handles changes to the source chain selection.
 */
function handleSourceChainChange() {
    populateTokenSelect(sourceTokenSelect, sourceChainSelect.value);
    updateTokenSymbol();
    
    // If connected, check if we need to switch networks
    if (currentAccount && chainId != sourceChainSelect.value) {
        switchNetwork(sourceChainSelect.value);
    }
}

/**
 * Handles changes to the destination chain selection.
 */
function handleDestChainChange() {
    populateTokenSelect(destTokenSelect, destChainSelect.value);
}

/**
 * Handles changes to the source token selection.
 */
function handleSourceTokenChange() {
    updateTokenSymbol();
    if (currentAccount) {
        fetchTokenBalance();
        fetchTokenNonce();
    }
}

/**
 * Updates the token symbol display next to the amount input.
 */
function updateTokenSymbol() {
    const chainTokens = CONFIG.tokens[sourceChainSelect.value];
    if (chainTokens && chainTokens[sourceTokenSelect.value]) {
        tokenSymbolSpan.textContent = chainTokens[sourceTokenSelect.value].symbol;
        swapState.sourceToken = sourceTokenSelect.value;
        swapState.sourceTokenDecimals = chainTokens[sourceTokenSelect.value].decimals;
    } else {
        tokenSymbolSpan.textContent = 'TOKEN';
    }
}

/**
 * Connects to MetaMask wallet.
 */
async function connectWallet() {
    if (!window.ethereum) {
        alert("Please install MetaMask to use this application.");
        return;
    }
    
    updateStepStatus('step-connect', 'active', 'Connecting...');
    
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        handleAccountsChanged(accounts);
        updateStepStatus('step-connect', 'success', 'Connected');
        
        // Check if we need to switch networks
        if (chainId != sourceChainSelect.value) {
            await switchNetwork(sourceChainSelect.value);
        }
    } catch (error) {
        console.error("Error connecting to MetaMask:", error);
        updateStepStatus('step-connect', 'error', 'Connection failed');
        log(`Error connecting: ${error.message}`);
    }
}

/**
 * Handles account changes from MetaMask.
 */
function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // User disconnected
        currentAccount = null;
        userAddressSpan.textContent = 'Not connected';
        connectButton.textContent = 'Connect Wallet';
        executeButton.disabled = true;
        updateStepStatus('step-connect', 'waiting', '');
    } else if (accounts[0] !== currentAccount) {
        // Account changed
        currentAccount = accounts[0];
        userAddressSpan.textContent = `${currentAccount.substring(0, 6)}...${currentAccount.substring(currentAccount.length - 4)}`;
        connectButton.textContent = 'Wallet Connected';
        executeButton.disabled = false;
        updateStepStatus('step-connect', 'success', 'Connected');
        
        // Get chain ID
        web3.eth.getChainId().then(id => {
            chainId = id;
            chainIdSpan.textContent = `${id} (${CONFIG.networks[id]?.name || 'Unknown'})`;
            
            // Populate EIP-712 domain with chain ID
            CONFIG.permitDomain.chainId = chainId;
            
            // Fetch token balance & nonce
            fetchTokenBalance();
            fetchTokenNonce();
        });
    }
}

/**
 * Handles chain changes from MetaMask.
 */
function handleChainChanged(newChainId) {
    // We need to reload the page when the chain changes
    window.location.reload();
}

/**
 * Switches the network in MetaMask.
 */
async function switchNetwork(targetChainId) {
    if (!window.ethereum) return;
    
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: web3.utils.toHex(targetChainId) }],
        });
    } catch (error) {
        console.error("Error switching network:", error);
        log(`Error switching network: ${error.message}`);
    }
}

/**
 * Fetches the token balance for the connected account.
 */
async function fetchTokenBalance() {
    if (!currentAccount || !sourceTokenSelect.value) return;
    
    try {
        // Create minimal ERC20 ABI for balanceOf
        const minABI = [
            {
                constant: true,
                inputs: [{ name: "_owner", type: "address" }],
                name: "balanceOf",
                outputs: [{ name: "balance", type: "uint256" }],
                type: "function",
            },
        ];
        
        const tokenContract = new web3.eth.Contract(minABI, sourceTokenSelect.value);
        const balance = await tokenContract.methods.balanceOf(currentAccount).call();
        
        // Display with token decimals
        const decimals = swapState.sourceTokenDecimals;
        const formattedBalance = (balance / (10 ** decimals)).toFixed(4);
        tokenBalanceSpan.textContent = `${formattedBalance} ${tokenSymbolSpan.textContent}`;
    } catch (error) {
        console.error("Error fetching token balance:", error);
        tokenBalanceSpan.textContent = "Error fetching balance";
    }
}

/**
 * Fetches the current nonce for EIP-2612 permit.
 */
async function fetchTokenNonce() {
    if (!currentAccount || !sourceTokenSelect.value) return;
    
    try {
        // This is a simplified approach - in reality, you need to check if the token
        // supports EIP-2612 and has the correct nonces method
        const eip2612ABI = [
            {
                constant: true,
                inputs: [{ name: "owner", type: "address" }],
                name: "nonces",
                outputs: [{ name: "", type: "uint256" }],
                type: "function",
            },
        ];
        
        // In a real app, we would check if the token supports EIP-2612
        // For this POC, we'll assume it does
        const tokenContract = new web3.eth.Contract(eip2612ABI, sourceTokenSelect.value);
        
        try {
            const nonce = await tokenContract.methods.nonces(currentAccount).call();
            swapState.nonce = nonce;
            currentNonceSpan.textContent = nonce;
        } catch (error) {
            // If nonces() call fails, the token might not support EIP-2612
            console.warn("Token might not support EIP-2612:", error);
            currentNonceSpan.textContent = "N/A (Token may not support EIP-2612)";
        }
    } catch (error) {
        console.error("Error fetching nonce:", error);
        currentNonceSpan.textContent = "Error";
    }
}

/**
 * Executes the gasless swap process.
 */
async function executeSwap() {
    if (!currentAccount) {
        alert("Please connect your wallet first.");
        return;
    }
    
    // Validate inputs
    const amount = amountInput.value;
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        alert("Please enter a valid amount.");
        return;
    }
    
    // Reset process steps
    resetSteps();
    updateStepStatus('step-connect', 'success', 'Connected');
    updateStepStatus('step-signature', 'active', 'Requesting signature...');
    
    try {
        // 1. Get EIP-2612 permit signature
        await getPermitSignature();
        
        // 2. Send to backend for verification
        await sendToBackend();
        
        // 3. Gelato relay
        await relayThroughGelato();
        
        // 4. Expand swap
        await executeExpandSwap();
        
        // 5. Check for completion
        await checkSwapCompletion();
        
    } catch (error) {
        console.error("Swap execution error:", error);
        log(`Error: ${error.message}`);
    }
}

/**
 * Step 1: Gets the EIP-2612 permit signature from the user.
 */
async function getPermitSignature() {
    // Calculate amount in smallest unit
    const decimals = swapState.sourceTokenDecimals;
    const rawAmount = (parseFloat(amountInput.value) * (10 ** decimals)).toString();

    // Set permit deadline (default: 1 hour from now)
    const deadlineSeconds = Math.floor(Date.now() / 1000) + (CONFIG.permitDeadlineHours * 60 * 60);
    
    // Build the permit message
    const permitMessage = {
        owner: currentAccount,
        spender: CONFIG.expandRouterAddress,
        value: rawAmount,
        nonce: swapState.nonce,
        deadline: deadlineSeconds
    };
    
    log("Requesting EIP-712 permit signature...");
    log(`Amount: ${amountInput.value} ${tokenSymbolSpan.textContent} (${rawAmount} wei)`);
    log(`Nonce: ${swapState.nonce}, Deadline: ${new Date(deadlineSeconds * 1000).toLocaleString()}`);
    
    try {
        // Request signature from MetaMask
        const signResult = await web3.eth.personal.sign(
            JSON.stringify({
                domain: CONFIG.permitDomain,
                types: EIP712_TYPES,
                message: permitMessage
            }),
            currentAccount
        );
        
        // In a real implementation, we would use ethers.js _signTypedData
        // For this POC, we're simulating the signature
        
        swapState.signature = signResult;
        
        // Update UI
        updateStepStatus('step-signature', 'success', 'Signature obtained');
        log(`Permit signature obtained: ${signResult.substring(0, 10)}...`);
        
        return permitMessage;
    } catch (error) {
        updateStepStatus('step-signature', 'error', 'Signature failed');
        log(`Error getting signature: ${error.message}`);
        throw new Error("Failed to get permit signature");
    }
}

/**
 * Step 2: Sends the permit signature to the backend for verification.
 */
async function sendToBackend() {
    // TODO: Implement backend verification

}

/**
 * Step 3: Relays the transaction through Gelato.
 */
async function relayThroughGelato() {
    // TODO: Implement Gelato relay
}

/**
 * Step 4: Expands the swap using the Expand contract.
 */
async function executeExpandSwap() {
    // TODO: Implement Expand swap
}

/**
 * Step 5: Checks for swap completion.
 */ 
async function checkSwapCompletion() {
    // TODO: Implement swap completion check
}

/**
 * Resets the step statuses to their initial state.
 */         
function resetSteps() {
    updateStepStatus('step-connect', 'waiting', '');
    updateStepStatus('step-signature', 'waiting', '');
    updateStepStatus('step-backend', 'waiting', '');
    updateStepStatus('step-gelato', 'waiting', '');
    updateStepStatus('step-expand', 'waiting', '');
}

/**
 * Updates the status of a step in the UI.
 */
function updateStepStatus(stepId, status, message) {
    const stepElement = document.getElementById(stepId);
    if (stepElement) {
        stepElement.classList.remove('active', 'success', 'error', 'waiting');
        stepElement.classList.add(status);
    }
}