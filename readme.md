# Gasless Cross-Chain Swap Proof of Concept

This project is a technical proof-of-concept implementation of the Gasless Cross-Chain Swap operation described in the PRD. It demonstrates how to use EIP-2612 (permit), Gelato Relayer, and Expand.Network to perform gasless cross-chain token swaps.

## Features

- **Gasless Swaps**: Users can perform cross-chain swaps without needing native gas tokens
- **Single-Click UX**: Only one signature required from the user
- **Cross-Chain Support**: Support for multiple source and destination chains
- **Real-time Process Tracking**: Step-by-step visualization of the swap process
- **Debugging Information**: Detailed logs and transaction information

## Technologies Used

- **Web3.js**: For Ethereum blockchain interactions
- **EIP-2612**: For gasless token approvals
- **EIP-712**: For typed data signing
- **Gelato Relayer**: For gas sponsorship and transaction relaying
- **Expand.Network**: For cross-chain execution and liquidity routing

## Setup Instructions

1. Clone this repository to your local machine
2. Update the configuration in `config.js`:
   - Add your Expand.Network API Key
   - Add your Gelato API Key
   - Configure your tokens and contract addresses as needed
3. Open `index.html` in a web browser with MetaMask installed
4. Connect your wallet and start testing gasless cross-chain swaps

## How It Works

1. **User Connection**: The user connects their wallet and selects source/destination tokens and chains
2. **Signature Collection**: The user signs an EIP-2612 permit message using EIP-712 typed data
3. **Backend Verification**: The backend verifies the signature and prepares the swap
4. **Gelato Relay**: Gelato relays the transaction with sponsored gas
5. **Expand Swap**: Expand executes the cross-chain swap and routes liquidity
6. **Completion**: The user receives the destination tokens in their wallet

## Development Notes

- This is a proof-of-concept only and not intended for production use without additional security reviews
- The API calls to the backend, Gelato, and Expand are simulated in this demo
- A real implementation would require comprehensive error handling and retry mechanisms
- The project uses placeholders for certain contract addresses and configurations

## Required Components for Production

1. **Backend Implementation**: To verify signatures and relay transactions to Gelato
2. **Gelato Account Setup**: A funded 1Balance wallet for gas sponsorship
3. **Expand.Network Account**: API key and access
4. **Smart Contract Deployment**: For any custom logic needed

## File Structure

- `index.html`: Main UI for the application
- `styles.css`: CSS styling for the UI
- `config.js`: Configuration settings for networks, tokens, and services
- `app.js`: Main application logic

## Configuration

The `config.js` file allows you to configure:

- Network RPC URLs and chain IDs
- Token addresses and details
- Expand Router address
- API endpoints for Gelato and Expand
- EIP-712 domain settings
- Backend API URL

## License

This project is for demonstration purposes only.
