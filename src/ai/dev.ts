import { config } from 'dotenv';
config();

import '@/ai/flows/extract-school-supplies-from-document.ts';
import '@/ai/flows/normalize-and-match-school-supplies.ts';