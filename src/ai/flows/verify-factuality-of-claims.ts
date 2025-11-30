'use server';

/**
 * @fileOverview Fact verification flow to assess the factuality of claims on a webpage.
 *
 * - verifyFactualityOfClaims - A function that handles the fact verification process.
 * - VerifyFactualityOfClaimsInput - The input type for the verifyFactualityOfClaims function.
 * - VerifyFactualityOfClaimsOutput - The return type for the verifyFactualityOfClaims function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyFactualityOfClaimsInputSchema = z.object({
  text: z.string().describe('The text content of the webpage to verify.'),
  language: z.enum(['en', 'fr', 'es']).describe('The language for the output.'),
});
export type VerifyFactualityOfClaimsInput = z.infer<
  typeof VerifyFactualityOfClaimsInputSchema
>;

const VerifyFactualityOfClaimsOutputSchema = z.object({
  factualityAssessment: z.string().describe('A brief and clear assessment of the factuality of claims (2-3 sentences).'),
  potentialBiases: z.string().describe('A brief and clear identification of potential biases or inaccuracies (2-3 sentences).'),
});
export type VerifyFactualityOfClaimsOutput = z.infer<
  typeof VerifyFactualityOfClaimsOutputSchema
>;

export async function verifyFactualityOfClaims(
  input: VerifyFactualityOfClaimsInput
): Promise<VerifyFactualityOfClaimsOutput> {
  return verifyFactualityOfClaimsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifyFactualityOfClaimsPrompt',
  input: {schema: VerifyFactualityOfClaimsInputSchema},
  output: {schema: VerifyFactualityOfClaimsOutputSchema},
  prompt: `You are an expert fact-checker. Please assess the factuality of the following text. Your response must be brief, clear, and explanatory.

  Your response MUST be in the following language: {{{language}}}.
  
  - Provide a brief assessment (2-3 sentences) of the text's factuality.
  - Briefly identify (2-3 sentences) any potential biases or inaccuracies.

  Text: {{{text}}}`,
});

const verifyFactualityOfClaimsFlow = ai.defineFlow(
  {
    name: 'verifyFactualityOfClaimsFlow',
    inputSchema: VerifyFactualityOfClaimsInputSchema,
    outputSchema: VerifyFactualityOfClaimsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
