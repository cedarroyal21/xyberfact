import { config } from 'dotenv';
config();

import '@/ai/flows/evaluate-source-reliability.ts';
import '@/ai/flows/verify-factuality-of-claims.ts';
import '@/ai/flows/analyze-webpage-content.ts';
import '@/ai/flows/generate-video-flow.ts';
