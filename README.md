# USDC Buy/Sell Frontend

A modern Next.js frontend for the USDC Buy/Sell Solana program, built with the latest Solana development tools and best practices.

## 🚀 Features

### Core Trading Features
- **USDC Buy/Sell Interface**: Trade USDC with SOL on Solana devnet
- **Market Statistics**: Real-time display of market state including:
  - Total USDC available in vault
  - Total SOL in the program
  - Current exchange rates
- **Transaction Limits**: Maximum 2 SOL worth of USDC per transaction
- **Real-time Updates**: Live market data and transaction confirmations

### Technical Features
- **Modern Stack**: Next.js 15 with React 19 and TypeScript
- **Wallet Integration**: Multi-wallet support via `@wallet-ui/react`
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Data**: Live blockchain data with React Query
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Dark/Light Theme**: Built-in theme switching

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 15**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework

### Solana Integration
- **@wallet-ui/react**: Modern wallet adapter system
- **@coral-xyz/anchor**: Solana program interaction
- **@solana/web3.js**: Solana blockchain communication
- **@solana/spl-token**: Token operations
- **gill**: Solana development utilities

### UI Components
- **Radix UI**: Accessible component primitives
- **Lucide React**: Beautiful icons
- **Sonner**: Toast notifications
- **Next Themes**: Theme management

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Turbopack**: Fast development builds

## 📁 Project Structure

```
fe/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Home page (redirects to trading)
│   │   ├── trading/           # Trading interface
│   │   └── account/           # Account management
│   ├── components/            # React components
│   │   ├── trading/           # Trading-specific components
│   │   │   ├── buy-sell-interface.tsx
│   │   │   └── market-stats.tsx
│   │   ├── solana/            # Solana integration components
│   │   ├── ui/                # Reusable UI components
│   │   └── app-*.tsx          # App-level components
│   ├── lib/                   # Utility libraries
│   │   ├── anchor.ts          # Anchor client wrapper
│   │   ├── constants.ts       # Program constants
│   │   ├── format.ts          # Formatting utilities
│   │   ├── types.ts           # TypeScript types
│   │   └── utils.ts           # General utilities
│   ├── features/              # Feature-based organization
│   │   ├── account/           # Account management
│   │   ├── cluster/           # Cluster management
│   │   └── dashboard/         # Dashboard features
│   └── usdc_buy_sell.json     # Program IDL
├── public/                    # Static assets
├── fund-vault.js             # Vault funding script
└── package.json              # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Solana CLI (for program deployment)
- A Solana wallet (Phantom, Solflare, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd program-NoorahSmith/fe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   NEXT_PUBLIC_PROGRAM_ID=<your-program-id>
   NEXT_PUBLIC_USDC_MINT=<usdc-mint-address>
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Program Constants
The frontend is configured to work with the deployed USDC Buy/Sell program:

```typescript
// src/lib/constants.ts
export const PROGRAM_ID = new PublicKey("G7ebafAsTKEJnQkR1SoezHVs3km5scBrSzpL52Wqe1rV");
export const USDC_MINT = new PublicKey("4f3XEdxWDzxAadHfXyqofXUg1Qsz5kwLCrABp64JqS7h");
export const MARKET_STATE_ADDRESS = new PublicKey("G7ebafAsTKEJnQkR1SoezHVs3km5scBrSzpL52Wqe1rV");
export const VAULT_AUTHORITY_ADDRESS = new PublicKey("8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8");
export const VAULT_TOKEN_ADDRESS = new PublicKey("8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8");
```

### Network Configuration
- **Default Network**: Solana Devnet
- **RPC Endpoint**: `https://api.devnet.solana.com`
- **Wallet Networks**: Supports mainnet, devnet, and testnet

## 💰 Funding the Vault

Before trading, the program vault needs to be funded with USDC:

```bash
# Run the funding script
node fund-vault.js
```

This script will:
1. Connect to Solana devnet
2. Transfer USDC from your wallet to the program vault
3. Confirm the transaction

## 🎯 Usage

### Trading Interface

1. **Connect Wallet**: Click the wallet button in the header
2. **View Market Stats**: See current market state and available liquidity
3. **Buy USDC**: 
   - Enter SOL amount (max 2 SOL)
   - Click "Buy USDC"
   - Confirm transaction in wallet
4. **Sell USDC**:
   - Enter USDC amount
   - Click "Sell USDC" 
   - Confirm transaction in wallet

### Account Management

- **View Balance**: Check your SOL and USDC balances
- **Transaction History**: See recent transactions
- **Airdrop SOL**: Get devnet SOL for testing

## 🔌 Wallet Integration

### Supported Wallets
- **Phantom**: Most popular Solana wallet
- **Solflare**: Feature-rich Solana wallet
- **Backpack**: Developer-focused wallet
- **Mobile Wallets**: Solana Mobile Wallet Adapter support

### Wallet Connection Flow
1. User clicks "Connect Wallet"
2. Wallet selection modal appears
3. User selects preferred wallet
4. Wallet extension opens for connection
5. User approves connection
6. Wallet is connected and ready for transactions

## 🏗️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run ci           # Run all checks (build, lint, format)
```

### Key Components

#### AnchorClient (`src/lib/anchor.ts`)
Wrapper around the Anchor program client that handles:
- Program initialization
- Market state fetching
- Buy/sell transactions
- Error handling

#### BuySellInterface (`src/components/trading/buy-sell-interface.tsx`)
Main trading component featuring:
- Tab-based buy/sell interface
- Amount input validation
- Transaction submission
- Loading states and error handling

#### MarketStats (`src/components/trading/market-stats.tsx`)
Real-time market data display:
- Vault USDC balance
- Program SOL balance
- Exchange rates
- Auto-refresh functionality

### Adding New Features

1. **Create component** in appropriate directory
2. **Add types** to `src/lib/types.ts`
3. **Update constants** in `src/lib/constants.ts` if needed
4. **Add to routing** in `src/app/` directory
5. **Test thoroughly** with devnet

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect repository** to Vercel
2. **Set environment variables**:
   ```
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   NEXT_PUBLIC_PROGRAM_ID=your-program-id
   NEXT_PUBLIC_USDC_MINT=your-usdc-mint
   ```
3. **Deploy**: Automatic deployment on push to main

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm run start
```

## 🐛 Troubleshooting

### Common Issues

#### Wallet Connection Issues
- **Problem**: Wallet not connecting
- **Solution**: Ensure wallet extension is installed and unlocked
- **Check**: Network is set to devnet in wallet

#### Transaction Failures
- **Problem**: "Insufficient funds" error
- **Solution**: Ensure you have enough SOL for transaction fees
- **Check**: Vault has sufficient USDC for trading

#### Build Errors
- **Problem**: TypeScript compilation errors
- **Solution**: Run `npm run lint` to identify issues
- **Check**: All imports are correct and types are defined

#### Network Issues
- **Problem**: RPC connection failures
- **Solution**: Check network connectivity
- **Alternative**: Try different RPC endpoint

### Debug Mode

Enable debug logging by setting:
```env
NEXT_PUBLIC_DEBUG=true
```

## 📚 API Reference

### AnchorClient Methods

```typescript
class AnchorClient {
  // Get current market state
  async getMarketState(): Promise<MarketState | null>
  
  // Get market statistics
  async getMarketStats(): Promise<MarketStats | null>
  
  // Buy USDC with SOL
  async buyUSDC(solAmount: number): Promise<string>
  
  // Sell USDC for SOL
  async sellUSDC(usdcAmount: number): Promise<string>
}
```

### Types

```typescript
interface MarketState {
  usdcMint: PublicKey;
  vaultAuthority: PublicKey;
  vaultTokenAccount: PublicKey;
  totalUsdc: BN;
  totalSol: BN;
}

interface MarketStats {
  totalUsdc: number;
  totalSol: number;
  usdcPerSol: number;
  solPerUsdc: number;
}
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines

- **Code Style**: Follow ESLint and Prettier configurations
- **Type Safety**: Use TypeScript for all new code
- **Testing**: Test all new features on devnet
- **Documentation**: Update README for significant changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Program Repository**: [Anchor Program](../anchor_project/)
- **Solana Docs**: [https://docs.solana.com](https://docs.solana.com)
- **Anchor Docs**: [https://www.anchor-lang.com](https://www.anchor-lang.com)
- **Next.js Docs**: [https://nextjs.org/docs](https://nextjs.org/docs)

## 📞 Support

For support and questions:
- **Issues**: Open a GitHub issue
- **Discussions**: Use GitHub Discussions
- **Documentation**: Check the docs folder

---

**Built with ❤️ for the Solana ecosystem**