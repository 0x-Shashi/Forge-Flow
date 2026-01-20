# ForgeFlow 🚀

A visual, no-code AI workflow builder powered by Solana blockchain.

## Features

- **Drag-and-Drop Workflow Builder** - Create AI-powered automations visually
- **AI-Native** - Built-in support for ChatGPT, DeepSeek, Mistral, and other LLMs via OpenRouter
- **Blockchain Integration** - Save workflows permanently on Solana
- **Multiple Node Types**:
  - 🔷 Trigger - Start workflows manually, on schedule, or via webhook
  - 🔷 API Request - Fetch data from any REST API
  - 🔷 AI Model - Process data with LLMs
  - 🔷 Logic Control - Add conditional branching
  - 🔷 Action - Save, notify, or call webhooks

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Canvas**: React Flow
- **State**: Zustand
- **Blockchain**: Solana Web3.js, Wallet Adapter
- **AI**: OpenRouter API (ChatGPT, DeepSeek, Mistral)

## Quick Start

```bash
# Clone the repo
git clone https://github.com/0x-Shashi/Forge-Flow.git
cd Forge-Flow/frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local and add your OpenRouter API key

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env.local` file in the `frontend` directory:

```
NEXT_PUBLIC_OPENROUTER_KEY=your_openrouter_api_key_here
```

Get your free API key at [OpenRouter](https://openrouter.ai/).

## Project Structure

```
Forge-Flow/
├── frontend/           # Next.js frontend application
│   ├── src/
│   │   ├── app/        # Next.js app router
│   │   ├── components/ # React components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── stores/     # Zustand state stores
│   │   ├── types/      # TypeScript type definitions
│   │   └── utils/      # Utility functions
│   └── public/         # Static assets
├── backend/            # Express.js backend (optional)
└── blockchain/         # Solana program (future)
```

## License

MIT
