import { Workflow } from '@/types/workflow';
import { v4 as uuidv4 } from 'uuid';

/**
 * Demo workflow templates
 */
export const demoWorkflows: Workflow[] = [
  // Weather-Based NFT Updater
  {
    id: 'demo-weather-nft',
    name: 'Weather-Based NFT Updater',
    description: 'Fetches weather data and generates an AI description',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: {
          label: 'Daily Trigger',
          description: 'Run every day',
          triggerType: 'time',
          interval: 24,
          intervalUnit: 'hours',
        },
      },
      {
        id: 'api-1',
        type: 'api',
        position: { x: 250, y: 180 },
        data: {
          label: 'Fetch Weather',
          description: 'Get weather data',
          url: 'https://api.open-meteo.com/v1/forecast?latitude=40.71&longitude=-74.01&current_weather=true',
          method: 'GET',
          headers: {},
        },
      },
      {
        id: 'ai-1',
        type: 'ai',
        position: { x: 250, y: 310 },
        data: {
          label: 'Generate Description',
          description: 'AI weather description',
          model: 'huggingface',
          modelId: 'gpt2',
          userPrompt: 'Describe the weather: Temperature {{data.current_weather.temperature}}°C, Wind {{data.current_weather.windspeed}} km/h',
          temperature: 0.7,
          maxTokens: 100,
        },
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 250, y: 440 },
        data: {
          label: 'Save Result',
          description: 'Store NFT metadata',
          actionType: 'save',
          destination: 'nft_metadata',
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'api-1' },
      { id: 'e2-3', source: 'api-1', target: 'ai-1' },
      { id: 'e3-4', source: 'ai-1', target: 'action-1' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Sentiment Analysis Bot
  {
    id: 'demo-sentiment',
    name: 'Sentiment Trading Bot',
    description: 'Analyzes text sentiment and triggers alerts',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: {
          label: 'Hourly Check',
          description: 'Check every hour',
          triggerType: 'time',
          interval: 1,
          intervalUnit: 'hours',
        },
      },
      {
        id: 'api-1',
        type: 'api',
        position: { x: 250, y: 180 },
        data: {
          label: 'Fetch News',
          description: 'Get crypto news',
          url: 'https://api.coingecko.com/api/v3/search/trending',
          method: 'GET',
          headers: {},
        },
      },
      {
        id: 'ai-1',
        type: 'ai',
        position: { x: 250, y: 310 },
        data: {
          label: 'Analyze Sentiment',
          description: 'AI sentiment analysis',
          model: 'huggingface',
          modelId: 'distilbert-base-uncased',
          userPrompt: 'Analyze sentiment of trending crypto: {{coins}}',
          temperature: 0.3,
          maxTokens: 50,
        },
      },
      {
        id: 'logic-1',
        type: 'logic',
        position: { x: 250, y: 440 },
        data: {
          label: 'Check Sentiment',
          description: 'Is negative?',
          condition: 'result',
          operator: 'contains',
          value: 'negative',
        },
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 100, y: 570 },
        data: {
          label: 'Send Alert',
          description: 'Notify user',
          actionType: 'notify',
        },
      },
      {
        id: 'action-2',
        type: 'action',
        position: { x: 400, y: 570 },
        data: {
          label: 'Log Result',
          description: 'Save to storage',
          actionType: 'save',
          destination: 'sentiment_log',
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'api-1' },
      { id: 'e2-3', source: 'api-1', target: 'ai-1' },
      { id: 'e3-4', source: 'ai-1', target: 'logic-1' },
      { id: 'e4-5', source: 'logic-1', target: 'action-1', sourceHandle: 'true' },
      { id: 'e4-6', source: 'logic-1', target: 'action-2', sourceHandle: 'false' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Content Moderator
  {
    id: 'demo-moderator',
    name: 'Content Moderator',
    description: 'AI-powered content moderation workflow',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: {
          label: 'On New Post',
          description: 'Triggered on new content',
          triggerType: 'event',
          eventCondition: 'new_post',
        },
      },
      {
        id: 'ai-1',
        type: 'ai',
        position: { x: 250, y: 180 },
        data: {
          label: 'Check Content',
          description: 'AI moderation',
          model: 'huggingface',
          modelId: 'facebook/bart-large-cnn',
          userPrompt: 'Classify if this content is safe or harmful: {{content}}',
          temperature: 0.1,
          maxTokens: 20,
        },
      },
      {
        id: 'logic-1',
        type: 'logic',
        position: { x: 250, y: 310 },
        data: {
          label: 'Is Safe?',
          description: 'Check if approved',
          condition: 'response',
          operator: 'contains',
          value: 'safe',
        },
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 100, y: 440 },
        data: {
          label: 'Approve Post',
          description: 'Mark as approved',
          actionType: 'blockchain',
        },
      },
      {
        id: 'action-2',
        type: 'action',
        position: { x: 400, y: 440 },
        data: {
          label: 'Flag for Review',
          description: 'Needs human review',
          actionType: 'notify',
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'ai-1' },
      { id: 'e2-3', source: 'ai-1', target: 'logic-1' },
      { id: 'e3-4', source: 'logic-1', target: 'action-1', sourceHandle: 'true' },
      { id: 'e3-5', source: 'logic-1', target: 'action-2', sourceHandle: 'false' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Get a demo workflow by ID
 */
export function getDemoWorkflow(id: string): Workflow | undefined {
  return demoWorkflows.find((w) => w.id === id);
}

/**
 * Get all demo workflows for display
 */
export function getAllDemoWorkflows(): { id: string; name: string; description: string }[] {
  return demoWorkflows.map((w) => ({
    id: w.id,
    name: w.name,
    description: w.description || '',
  }));
}
