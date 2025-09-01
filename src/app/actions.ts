'use server';

import { extractSchoolSuppliesFromDocument } from '@/ai/flows/extract-school-supplies-from-document';
import {
  normalizeAndMatchSchoolSupplies,
  type NormalizeAndMatchSchoolSuppliesOutput,
} from '@/ai/flows/normalize-and-match-school-supplies';
import { z } from 'zod';

const fileToDataURI = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString('base64');
  return `data:${file.type};base64,${base64}`;
};

const ActionResponseSchema = z.union([
  z.object({
    success: z.literal(true),
    data: z.any(), // Keeping this flexible for different actions
  }),
  z.object({
    success: z.literal(false),
    error: z.string(),
  }),
]);

type ActionResponse = {
  data?: NormalizeAndMatchSchoolSuppliesOutput;
  error?: string;
};

export async function processSchoolList(formData: FormData): Promise<ActionResponse> {
  const file = formData.get('file') as File;

  if (!file) {
    return { error: 'No se encontró ningún archivo.' };
  }

  try {
    const documentDataUri = await fileToDataURI(file);

    // Step 1: Extract items from the document
    const extractionResult = await extractSchoolSuppliesFromDocument({
      documentDataUri,
    });

    if (!extractionResult.extractedItems || extractionResult.extractedItems.length === 0) {
      return { error: 'No se pudieron extraer artículos de la lista. Intenta con un documento más claro.' };
    }

    // Step 2: Normalize and match the extracted items
    const matchingResult = await normalizeAndMatchSchoolSupplies({
      extractedItems: extractionResult.extractedItems,
    });

    if (!matchingResult.matchedItems || matchingResult.matchedItems.length === 0) {
        return { error: 'No se pudieron encontrar productos que coincidan con tu lista.' };
    }
    
    // Add mock data for presentation
    const finalResultWithPrices: NormalizeAndMatchSchoolSuppliesOutput = {
      matchedItems: matchingResult.matchedItems.map(item => ({
        ...item,
        // Mock price and product ID for demo purposes
        productId: item.productId || `PROD-${Math.floor(Math.random() * 10000)}`,
        productName: item.productName || `Producto similar para "${item.normalizedName}"`,
        price: parseFloat((Math.random() * (25 - 0.5) + 0.5).toFixed(2)),
      })),
    };


    return { data: finalResultWithPrices };
  } catch (err) {
    console.error('Error processing school list:', err);
    return { error: 'Ha ocurrido un error en el servidor. Por favor, inténtalo de nuevo.' };
  }
}
