# 🧪 ForgeFlow Testing Guide

Your app is running at: **http://localhost:3000**

---

## Step 1: Basic Interface Check ⬜

Open http://localhost:3000 in your browser and verify:

- [ ] **Navbar** at top with purple "ForgeFlow" logo
- [ ] **Left Sidebar** showing 5 node types (Trigger, API, AI, Logic, Action)
- [ ] **Canvas Area** in the center (starts empty with placeholder)
- [ ] **"Connect Wallet"** button on the right

---

## Step 2: Drag & Drop Nodes ⬜

- [ ] Drag a **Trigger** node from sidebar → drop on canvas
- [ ] Drag an **API Call** node → drop below the Trigger
- [ ] Drag an **AI Processing** node → drop below API
- [ ] Drag an **Action** node → drop below AI

**Expected:** 4 nodes appear on the canvas with colored borders

---

## Step 3: Connect Nodes ⬜

- [ ] Hover over the **bottom handle** (small circle) of Trigger node
- [ ] Click and drag to the **top handle** of API node
- [ ] A line (edge) should connect them
- [ ] Repeat to connect: API → AI → Action

**Expected:** All 4 nodes are connected in a chain

---

## Step 4: Configure Nodes ⬜

- [ ] **Click on the API node** → Config panel slides in from right
- [ ] Enter URL: `https://api.open-meteo.com/v1/forecast?latitude=40.71&longitude=-74.01&current_weather=true`
- [ ] Keep method as GET
- [ ] Click "Test API" button → Should show response

- [ ] **Click on the AI node** → Enter:
  - Provider: Hugging Face
  - Model: gpt2
  - Prompt: "Describe: {{data.current_weather}}"

- [ ] **Click on Action node** → Select "Save Data"

**Expected:** Each node's config panel shows and saves settings

---

## Step 5: Load Demo Workflow ⬜

- [ ] Click **"Workflows"** button in navbar
- [ ] Click **"Weather-Based NFT Updater"** from Demo Templates
- [ ] Workflow loads with pre-connected nodes

**Expected:** 4 nodes appear already connected with configurations

---

## Step 6: Run Workflow ⬜

- [ ] With a workflow loaded, click **"Run Workflow"** (green button)
- [ ] Watch nodes light up as they execute:
  - 🟣 Purple glow = executing
  - 🟢 Green glow = success
  - 🔴 Red glow = error
- [ ] Toast notification shows "Workflow completed successfully!"

**Expected:** Nodes animate during execution, success toast appears

---

## Step 7: Execution History ⬜

- [ ] Look at left sidebar → bottom section
- [ ] Click **"Execution History"** to expand
- [ ] See your recent execution with ✅ Success or ❌ Failed

**Expected:** History shows timestamped execution records

---

## Step 8: Save & Export ⬜

- [ ] Click **"Save"** button → Toast shows "Workflow saved!"
- [ ] Click **"Workflows"** → **"Export JSON"**
- [ ] A .json file downloads to your computer

**Expected:** Workflow saves locally and exports to file

---

## Step 9: Import Workflow ⬜

- [ ] Click **"Workflows"** → **"New Workflow"** (clears canvas)
- [ ] Click **"Workflows"** → **"Import JSON"**
- [ ] Select the file you just exported
- [ ] Workflow reloads!

**Expected:** Previously exported workflow loads back

---

## Step 10: Wallet Connection (Optional) ⬜

> Requires Phantom Wallet browser extension

1. Install Phantom: https://phantom.app
2. Create or import a wallet
3. Switch to **Devnet** (Settings → Developer Settings → Devnet)

Then:

- [ ] Click **"Connect Wallet"** button
- [ ] Phantom popup opens → Click "Connect"
- [ ] Wallet address appears in navbar
- [ ] Balance shows (probably 0 SOL)

---

## Step 11: Get Devnet SOL ⬜

- [ ] After connecting wallet, click the 💧 **water droplet** button
- [ ] Wait for "Received 1 SOL!" toast
- [ ] Balance updates to ~1 SOL

**Alternative:** Go to https://faucet.solana.com and paste your wallet address

---

## Step 12: Save On-Chain ⬜

- [ ] With wallet connected and workflow loaded
- [ ] Click **"Save On-Chain"** button
- [ ] Phantom asks for transaction approval → Click "Approve"
- [ ] Toast shows "Workflow saved (simulated)"

**Note:** This uses simulated storage. Real blockchain requires deploying the Anchor program.

---

## Step 13: Workflow Library ⬜

- [ ] With wallet connected
- [ ] Click **"Workflows"** → **"My Workflows"**
- [ ] Modal opens showing your saved workflows
- [ ] Click one to load it
- [ ] Use toggle (🔛) to enable/disable
- [ ] Use trash (🗑️) to delete

---

## 🎯 Quick Feature Checklist

| Feature            | Status |
| ------------------ | ------ |
| Node drag & drop   | ⬜     |
| Node connections   | ⬜     |
| Config panel       | ⬜     |
| Demo templates     | ⬜     |
| Run workflow       | ⬜     |
| Execution history  | ⬜     |
| Save/Export/Import | ⬜     |
| Wallet connect     | ⬜     |
| Devnet airdrop     | ⬜     |
| On-chain save      | ⬜     |

---

## 🐛 Troubleshooting

### Page won't load

```bash
# Restart the server
cd frontend
npm run dev
```

### Wallet won't connect

- Make sure Phantom is installed
- Switch Phantom to Devnet network
- Refresh the page

### Airdrop fails

- Rate limited - wait 1 minute and try again
- Or use https://faucet.solana.com manually

### Workflow execution fails

- Check all nodes are connected
- Make sure API URL is valid
- Check console (F12) for errors

---

## ✅ All Tests Passed?

Your ForgeFlow installation is working correctly! 🎉

Next steps:

- See DEPLOYMENT.md for production deployment
- See blockchain/README.md for smart contract deployment
