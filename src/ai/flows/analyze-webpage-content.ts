'use server';

/**
 * @fileOverview Analyzes the text content of a webpage to identify key claims and arguments.
 *
 * - analyzeWebpageContent - A function that handles the webpage content analysis.
 * - AnalyzeWebpageContentInput - The input type for the analyzeWebpageContent function.
 * - AnalyzeWebpageContentOutput - The return type for the analyzeWebpageContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeWebpageContentInputSchema = z.object({
  url: z.string().describe('The URL of the webpage to analyze.'),
  textContent: z.string().describe('The text content of the webpage.'),
  language: z.enum(['en', 'fr', 'es']).describe('The language for the output.'),
});
export type AnalyzeWebpageContentInput = z.infer<
  typeof AnalyzeWebpageContentInputSchema
>;

const AnalyzeWebpageContentOutputSchema = z.object({
  summary: z.string().describe('A brief and clear summary of the webpage content (2-3 sentences).'),
  keyClaims: z.array(z.string()).describe('A list of the main claims, stated clearly and briefly.'),
  arguments: z.array(z.string()).describe('A list of the main arguments, stated clearly and briefly.'),
});
export type AnalyzeWebpageContentOutput = z.infer<
  typeof AnalyzeWebpageContentOutputSchema
>;

export async function analyzeWebpageContent(
  input: AnalyzeWebpageContentInput
): Promise<AnalyzeWebpageContentOutput> {
  return analyzeWebpageContentFlow(input);
}

const analyzeWebpageContentPrompt = ai.definePrompt({
  name: 'analyzeWebpageContentPrompt',
  input: {schema: AnalyzeWebpageContentInputSchema},
  output: {schema: AnalyzeWebpageContentOutputSchema},
  prompt: `You are an AI assistant designed to analyze webpage content and extract key information. Your task is to provide a brief and clear analysis.

  Analyze the following webpage content. Your response MUST be in the following language: {{{language}}}.

  - The summary should be concise, no more than two or three sentences.
  - Each key claim and argument should be stated clearly and briefly.

  URL: {{{url}}}
  Content: {{{textContent}}}`,
});

const analyzeWebpageContentFlow = ai.defineFlow(
  {
    name: 'analyzeWebpageContentFlow',
    inputSchema: AnalyzeWebpageContentInputSchema,
    outputSchema: AnalyzeWebpageContentOutputSchema,
  },
  async input => {
    const {output} = await analyzeWebpageContentPrompt(input);
    return output!;
  }
);
