
'use server';

import { z } from 'zod';
import { analyzeWebpageContent } from '@/ai/flows/analyze-webpage-content';
import { verifyFactualityOfClaims } from '@/ai/flows/verify-factuality-of-claims';
import { evaluateSourceReliability } from '@/ai/flows/evaluate-source-reliability';
import type { AnalysisState } from '@/lib/types';

const FormSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
});

export async function analyzeUrl(
  prevState: AnalysisState,
  formData: FormData
): Promise<AnalysisState> {
  const validatedFields = FormSchema.safeParse({
    url: formData.get('url'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.errors.map((e) => e.message).join(', '),
    };
  }
  const { url } = validatedFields.data;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch URL. Status: ${response.status}`);
    }

    const html = await response.text();

    const textContent = html
      .replace(/<style[^>]*>.*<\/style>/gis, '')
      .replace(/<script[^>]*>.*<\/script>/gis, '')
      .replace(/<nav[^>]*>.*<\/nav>/gis, '')
      .replace(/<footer[^>]*>.*<\/footer>/gis, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!textContent) {
      return { error: 'Could not extract any meaningful text content from the URL.' };
    }
    
    // Limit content size to avoid overwhelming the AI model (approx 15k characters)
    const truncatedContent = textContent.substring(0, 15000);

    const [reliability, analysis, verification] = await Promise.all([
      evaluateSourceReliability({ url, pageContent: truncatedContent }),
      analyzeWebpageContent({ url, textContent: truncatedContent }),
      verifyFactualityOfClaims({ text: truncatedContent }),
    ]);

    return {
      data: { analysis, verification, reliability },
    };
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      return { error: 'The request timed out. The server might be slow or unreachable.' };
    }
    return { error: e instanceof Error ? e.message : 'An unknown error occurred during analysis.' };
  }
}
