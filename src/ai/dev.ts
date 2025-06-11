
import { config } from 'dotenv';
config();

// Import flows to ensure they are registered with Genkit during development
import './flows/suggest-reminder-flow';
import './flows/holiday-lookup';
