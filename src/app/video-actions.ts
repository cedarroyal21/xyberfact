'use server';

import { generateVideo } from "@/ai/flows/generate-video-flow";
import { z } from "zod";

const videoPrompts = {
    en: 'A magnifying glass scanning over digital text, revealing hidden code and symbols, representing truth and hidden meanings. Cinematic, abstract, blue and white color palette.',
    fr: 'Une loupe balayant du texte numérique, révélant des codes et des symboles cachés, représentant la vérité et les significations cachées. Cinématographique, abstrait, palette de couleurs bleu et blanc.',
    es: 'Una lupa escaneando texto digital, revelando códigos y símbolos ocultos, que representan la verdad y los significados ocultos. Cinemático, abstracto, paleta de colores azul y blanco.'
}

export async function generateVideoAction(language: 'en' | 'fr' | 'es'): Promise<{ url?: string, error?: string}> {
  try {
    const prompt = videoPrompts[language] || videoPrompts['en'];
    const result = await generateVideo({ prompt });
    return { url: result.url };
  } catch (e) {
    console.error(e);
    return { error: e instanceof Error ? e.message : 'An unknown error occurred during video generation.' };
  }
}
