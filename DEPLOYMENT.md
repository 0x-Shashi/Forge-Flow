# 🚀 ForgeFlow Deployment Guide

This guide covers deploying ForgeFlow to production.

## Project Structure

```
ForgeFlow/
├── frontend/      # Next.js web app → Deploy to Vercel
├── backend/       # Express API → Deploy to Railway/Render
└── blockchain/    # Anchor → Deploy to Solana Devnet/Mainnet
```

---

## 1. Frontend Deployment (Vercel)

### Option A: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your repository
5. Set root directory to `frontend`
6. Deploy!

### Option B: Vercel CLI

```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Environment Variables (Optional)

Add these in Vercel dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_HF_TOKEN=your_huggingface_token
NEXT_PUBLIC_FORGEFLOW_PROGRAM_ID=your_program_id
```

---

## 2. Backend Deployment (Railway/Render)

### Option A: Railway

1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub
3. Select the `backend` folder
4. Add environment variables:
   - `PORT=3001`
   - `HF_TOKEN=your_token`
5. Deploy!

### Option B: Render

1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repo
4. Settings:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add environment variables
6. Deploy!

### Option C: Manual (VPS)

```bash
cd backend

# Install dependencies
npm install

# Build
npm run build

# Start with PM2
npm install -g pm2
pm2 start dist/index.js --name forgeflow-api
```

---

## 3. Blockchain Deployment (Solana)

### Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install latest
avm use latest
```

### Deploy to Devnet

```bash
cd blockchain

# Configure Solana for devnet
solana config set --url devnet

# Create wallet (if needed)
solana-keygen new

# Get devnet SOL
solana airdrop 5

# Build the program
anchor build

# Deploy
anchor deploy
```

### Update Program ID

After deployment, update the program ID in:

1. **blockchain/Anchor.toml**

   ```toml
   [programs.devnet]
   forgeflow = "YOUR_NEW_PROGRAM_ID"
   ```

2. **blockchain/programs/forgeflow/src/lib.rs**

   ```rust
   declare_id!("YOUR_NEW_PROGRAM_ID");
   ```

3. **frontend/src/hooks/useSolana.ts**
   ```typescript
   const FORGEFLOW_PROGRAM_ID = new PublicKey("YOUR_NEW_PROGRAM_ID");
   const USE_REAL_BLOCKCHAIN = true; // Enable real blockchain
   ```

### Deploy to Mainnet

```bash
solana config set --url mainnet-beta
anchor build
anchor deploy --provider.cluster mainnet
```

---

## 4. Post-Deployment Checklist

- [ ] Frontend accessible at production URL
- [ ] Wallet connection works on devnet
- [ ] Can create and save workflows
- [ ] Workflow execution works
- [ ] (Optional) Backend API accessible
- [ ] (Optional) Smart contract deployed

---

## 5. Monitoring & Logs

### Frontend (Vercel)

- Dashboard → Project → Logs

### Backend (Railway/Render)

- Dashboard → Service → Logs

### Blockchain (Solana)

- Use [solscan.io](https://solscan.io) (mainnet)
- Use [explorer.solana.com](https://explorer.solana.com/?cluster=devnet) (devnet)

---

## 6. Domain Setup (Optional)

1. In Vercel, go to Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

---

## Need Help?

- **Vercel Issues**: [vercel.com/docs](https://vercel.com/docs)
- **Solana Issues**: [solana.stackexchange.com](https://solana.stackexchange.com)
- **Anchor Issues**: [anchor-lang.com](https://www.anchor-lang.com)
