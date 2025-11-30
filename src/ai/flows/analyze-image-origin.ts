'use server';

/**
 * @fileOverview Flow for analyzing an image to determine if it is AI-generated.
 *
 * - analyzeImageOrigin - Function to analyze the image.
 * - AnalyzeImageOriginInput - Input type for the analyzeImageOrigin function.
 * - AnalyzeImageOriginOutput - Output type for the analyzeImageOrigin function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeImageOriginInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z.enum(['en', 'fr', 'es']).describe('The language for the output.'),
});
export type AnalyzeImageOriginInput = z.infer<
  typeof AnalyzeImageOriginInputSchema
>;

const AnalyzeImageOriginOutputSchema = z.object({
  isAiGenerated: z
    .boolean()
    .describe('Whether the image is likely AI-generated.'),
  confidence: z
    .number()
    .min(0)
    .max(100)
    .describe(
      'The confidence score (0-100) in the assessment.'
    ),
  explanation: z
    .string()
    .describe(
      'A brief explanation for the assessment (2-3 sentences).'
    ),
});
export type AnalyzeImageOriginOutput = z.infer<
  typeof AnalyzeImageOriginOutputSchema
>;

export async function analyzeImageOrigin(
  input: AnalyzeImageOriginInput
): Promise<AnalyzeImageOriginOutput> {
  return analyzeImageOriginFlow(input);
}

const analyzeImageOriginPrompt = ai.definePrompt({
  name: 'analyzeImageOriginPrompt',
  input: {schema: AnalyzeImageOriginInputSchema},
  output: {schema: AnalyzeImageOriginOutputSchema},
  prompt: `You are an expert in digital image analysis and AI-generated content detection. Your task is to analyze the provided image and determine if it is likely to be AI-generated.

  Your response MUST be in the following language: {{{language}}}.
  
  Analyze the image and provide:
  1.  A boolean verdict ('isAiGenerated').
  2.  A confidence score for your verdict (from 0 to 100).
  3.  A brief, clear, and explanatory rationale for your assessment (2-3 sentences), mentioning any visual artifacts, inconsistencies, or patterns that support your conclusion.

  Image: {{media url=imageDataUri}}`,
});

const analyzeImageOriginFlow = ai.defineFlow(
  {
    name: 'analyzeImageOriginFlow',
    inputSchema: AnalyzeImageOriginInputSchema,
    outputSchema: AnalyzeImageOriginOutputSchema,
  },
  async input => {
    const {output} = await analyzeImageOriginPrompt(input);
    return output!;
  }
);
