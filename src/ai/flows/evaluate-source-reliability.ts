'use server';

/**
 * @fileOverview Flow for evaluating the reliability and credibility of a source website.
 *
 * - evaluateSourceReliability - Function to evaluate source reliability.
 * - EvaluateSourceReliabilityInput - Input type for the evaluateSourceReliability function.
 * - EvaluateSourceReliabilityOutput - Output type for the evaluateSourceReliability function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateSourceReliabilityInputSchema = z.object({
  url: z.string().url().describe('The URL of the website to evaluate.'),
  pageContent: z.string().describe('The text content of the webpage.'),
  language: z.enum(['en', 'fr', 'es']).describe('The language for the output.'),
});
export type EvaluateSourceReliabilityInput = z.infer<typeof EvaluateSourceReliabilityInputSchema>;

const EvaluateSourceReliabilityOutputSchema = z.object({
  reliabilityScore: z
    .number()
    .min(0)
    .max(100)
    .describe('A score from 0 to 100 indicating the reliability of the source.'),
  evaluationRationale: z
    .string()
    .describe('A brief and clear explanation (2-3 sentences) for the given reliability score.'),
});
export type EvaluateSourceReliabilityOutput = z.infer<typeof EvaluateSourceReliabilityOutputSchema>;

export async function evaluateSourceReliability(
  input: EvaluateSourceReliabilityInput
): Promise<EvaluateSourceReliabilityOutput> {
  return evaluateSourceReliabilityFlow(input);
}

const evaluateSourceReliabilityPrompt = ai.definePrompt({
  name: 'evaluateSourceReliabilityPrompt',
  input: {schema: EvaluateSourceReliabilityInputSchema},
  output: {schema: EvaluateSourceReliabilityOutputSchema},
  prompt: `You are an expert in evaluating the reliability and credibility of websites.

  Analyze the following website content and URL to determine its reliability. Consider factors such as domain authority, reputation, transparency, potential biases, and factual accuracy.

  Your response MUST be in the following language: {{{language}}}.

  Website URL: {{{url}}}
  Website Content:
  {{#if pageContent}}
  {{pageContent}}
  {{else}}
  The provided webpage has no textual content.
  {{/if}}

  Provide a reliability score between 0 and 100, where 0 is completely unreliable and 100 is highly reliable. Provide a brief and clear explanation (2-3 sentences) for the assigned score.
  `,
});

const evaluateSourceReliabilityFlow = ai.defineFlow(
  {
    name: 'evaluateSourceReliabilityFlow',
    inputSchema: EvaluateSourceReliabilityInputSchema,
    outputSchema: EvaluateSourceReliabilityOutputSchema,
  },
  async input => {
    const {output} = await evaluateSourceReliabilityPrompt(input);
    return output!;
  }
);
