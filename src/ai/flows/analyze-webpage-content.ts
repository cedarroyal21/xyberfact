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
});
export type AnalyzeWebpageContentInput = z.infer<
  typeof AnalyzeWebpageContentInputSchema
>;

const AnalyzeWebpageContentOutputSchema = z.object({
  summary: z.string().describe('A summary of the webpage content.'),
  keyClaims: z.array(z.string()).describe('The key claims made in the webpage.'),
  arguments: z.array(z.string()).describe('The main arguments presented in the webpage.'),
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
  prompt: `You are an AI assistant designed to analyze webpage content and extract key information.

  Analyze the following webpage content and identify the key claims and arguments presented.
  Also, provide a summary of the webpage content.

  URL: {{{url}}}
  Content: {{{textContent}}}

  Summary:
  Key Claims:
  Arguments:`,
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
