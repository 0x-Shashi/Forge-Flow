import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { executeWorkflow } from './executor';
import { validateWorkflow } from './validator';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'forgeflow-backend' });
});

// Execute workflow
app.post('/api/execute', async (req, res) => {
  try {
    const { workflow } = req.body;
    
    // Validate workflow
    const validation = validateWorkflow(workflow);
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false, 
        errors: validation.errors 
      });
    }
    
    // Execute workflow
    const result = await executeWorkflow(workflow);
    
    res.json({ 
      success: true, 
      execution: result 
    });
  } catch (error) {
    console.error('Execution error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Validate workflow
app.post('/api/validate', (req, res) => {
  try {
    const { workflow } = req.body;
    const validation = validateWorkflow(workflow);
    res.json(validation);
  } catch (error) {
    res.status(400).json({ 
      valid: false, 
      errors: ['Invalid workflow format'] 
    });
  }
});

// Get demo workflows
app.get('/api/demos', (req, res) => {
  res.json({
    demos: [
      { id: 'weather-nft', name: 'Weather-Based NFT Updater' },
      { id: 'sentiment-bot', name: 'Sentiment Trading Bot' },
      { id: 'content-mod', name: 'Content Moderator' },
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 ForgeFlow Backend running on http://localhost:${PORT}`);
});
