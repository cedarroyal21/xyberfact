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
});
export type VerifyFactualityOfClaimsInput = z.infer<
  typeof VerifyFactualityOfClaimsInputSchema
>;

const VerifyFactualityOfClaimsOutputSchema = z.object({
  factualityAssessment: z.string().describe('An assessment of the factuality of claims in the text.'),
  potentialBiases: z.string().describe('Identification of potential biases or inaccuracies.'),
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
  prompt: `You are an expert fact-checker. Please assess the factuality of the following text and identify any potential biases or inaccuracies.\n\nText: {{{text}}}`,
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
