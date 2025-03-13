/**
 * Configuration for the Gasless Cross-Chain Swap POC
 */
const CONFIG = {
    // Network configurations
    networks: {
        1: {
            name: "Ethereum",
            rpcUrl: "https://mainnet.infura.io/v3/645bdccc7aa0459fa476e69ea07aa8e0,
            explorerUrl: "https://etherscan.io"
        },
        8453: {
            name: "Base",
            rpcUrl: "https://base-mainnet.infura.io/v3/645bdccc7aa0459fa476e69ea07aa8e0",
            explorerUrl: "https://basescan.org"
        },
        43114: {
            name: "Avalanche",
            rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
            explorerUrl: "https://snowtrace.io"
        },
        501: {
            name: "Solana",
            // This is just for UI display, as we're not directly interacting with Solana
            explorerUrl: "https://explorer.solana.com"
        }
    },
    
    // Token configurations by chain
    tokens: {
        1: { // Ethereum
            "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": {
                symbol: "USDC",
                name: "USD Coin",
                decimals: 6,
                logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png"
            },
            "0xdAC17F958D2ee523a2206206994597C13D831ec7": {
                symbol: "USDT",
                name: "Tether USD",
                decimals: 6,
                logo: "https://cryptologos.cc/logos/tether-usdt-logo.png"
            },
            "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": {
                symbol: "WETH",
                name: "Wrapped Ether",
                decimals: 18,
                logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png"
            }
        },
        8453: { // Base
            "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913": {
                symbol: "USDC",
                name: "USD Coin",
                decimals: 6,
                logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png"
            },
            "0x4200000000000000000000000000000000000006": {
                symbol: "WETH",
                name: "Wrapped Ether",
                decimals: 18,
                logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png"
            }
        },
        43114: { // Avalanche
            "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E": {
                symbol: "USDC",
                name: "USD Coin",
                decimals: 6,
                logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png"
            },
            "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB": {
                symbol: "WETH",
                name: "Wrapped Ether",
                decimals: 18,
                logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png"
            }
        },
        501: { // Solana
            "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": {
                symbol: "USDC",
                name: "USD Coin",
                decimals: 6,
                logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png"
            },
            "So11111111111111111111111111111111111111112": {
                symbol: "SOL",
                name: "Wrapped SOL",
                decimals: 9,
                logo: "https://cryptologos.cc/logos/solana-sol-logo.png"
            },
            "TRUMP_TOKEN_ADDRESS": {
                symbol: "TRUMP",
                name: "Trump Token",
                decimals: 9,
                logo: "https://placeholder.com/trump-token-logo.png"
            }
        }
    },
    
    // Expand and Gelato configurations
    expandRouterAddress: "0xExpandRouterAddress", // Replace with actual address
    expandApiUrl: "https://api.expand.network/v1",
    expandApiKey: "hLY2lKP6tD8DcEwHkD7T7158jykpiyrL4BnoHfAx", // Replace with your API key
    
    gelatoRelayUrl: "https://relay.gelato.digital/relays/v2/sponsored-call",
    gelatoApiKey: "Q5fbaCZUVQBXGJ5wVcmCFx3a2CkdKg5ryfByFIHdRW4_", // Replace with your API key
    
    // Domain for EIP-712 signing
    permitDomain: {
        name: "GaslessSwap",
        version: "1",
        // Chain ID will be added dynamically
        verifyingContract: "0x0000000000000000000000000000000000000001" // Fixed identifier for offchain verification
    },
    
    // Backend API endpoint (for your implementation)
    backendApiUrl: "https://your-backend-api.com/api",
    
    // Default values
    defaultSlippage: 0.5,
    permitDeadlineHours: 1 // Permit valid for 1 hour
};
