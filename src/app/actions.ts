
'use server';

import { z } from 'zod';
import { analyzeWebpageContent } from '@/ai/flows/analyze-webpage-content';
import { verifyFactualityOfClaims } from '@/ai/flows/verify-factuality-of-claims';
import { evaluateSourceReliability } from '@/ai/flows/evaluate-source-reliability';
import { analyzeImageOrigin } from '@/ai/flows/analyze-image-origin';
import type { AnalysisState, ImageAnalysisState } from '@/lib/types';

const UrlFormSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
  language: z.enum(['en', 'fr', 'es']),
});

const ImageFormSchema = z.object({
  image: z.string().startsWith('data:image/'),
  language: z.enum(['en', 'fr', 'es']),
});

export async function analyzeUrl(
  prevState: AnalysisState,
  formData: FormData
): Promise<AnalysisState> {
  const validatedFields = UrlFormSchema.safeParse({
    url: formData.get('url'),
    language: formData.get('language'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.errors.map((e) => e.message).join(', '),
    };
  }
  const { url, language } = validatedFields.data;

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
      evaluateSourceReliability({ url, pageContent: truncatedContent, language }),
      analyzeWebpageContent({ url, textContent: truncatedContent, language }),
      verifyFactualityOfClaims({ text: truncatedContent, language }),
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


export async function analyzeImage(
  prevState: ImageAnalysisState,
  formData: FormData
): Promise<ImageAnalysisState> {
  const validatedFields = ImageFormSchema.safeParse({
    image: formData.get('image'),
    language: formData.get('language'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.errors.map((e) => e.message).join(', '),
    };
  }

  const { image: imageDataUri, language } = validatedFields.data;

  try {
    const result = await analyzeImageOrigin({ imageDataUri, language });
    return { data: result };
  } catch (e) {
     if (e instanceof Error && e.name === 'AbortError') {
      return { error: 'The request timed out. The server might be slow or unreachable.' };
    }
    return { error: e instanceof Error ? e.message : 'An unknown error occurred during analysis.' };
  }
}
