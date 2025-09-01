'use server';

import { extractSchoolSuppliesFromDocument } from '@/ai/flows/extract-school-supplies-from-document';
import {
  normalizeAndMatchSchoolSupplies,
  type NormalizeAndMatchSchoolSuppliesOutput,
} from '@/ai/flows/normalize-and-match-school-supplies';
import { getCachedQuote, saveQuoteToCache } from '@/services/quote-cache-service';
import { createHash } from 'crypto';

const fileToDataURI = async (file: File): Promise<{ dataUri: string; hash: string }> => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Create a hash of the file content
  const hash = createHash('sha256').update(buffer).digest('hex');
  
  const base64 = buffer.toString('base64');
  const dataUri = `data:${file.type};base64,${base64}`;

  return { dataUri, hash };
};


type ActionResponse = {
  data?: NormalizeAndMatchSchoolSuppliesOutput;
  error?: string;
  fromCache?: boolean;
};

export async function processSchoolList(formData: FormData): Promise<ActionResponse> {
  const file = formData.get('file') as File;

  if (!file) {
    return { error: 'No se encontró ningún archivo.' };
  }

  try {
    const { dataUri: documentDataUri, hash: fileHash } = await fileToDataURI(file);

    // Step 1: Check if the quote is in the cache
    const cachedQuote = await getCachedQuote(fileHash);
    if (cachedQuote) {
      console.log(`Cache hit for hash: ${fileHash}`);
      return { data: cachedQuote, fromCache: true };
    }
    
    console.log(`Cache miss for hash: ${fileHash}. Processing new file.`);

    // Step 2: Extract items from the document
    const extractionResult = await extractSchoolSuppliesFromDocument({
      documentDataUri,
    });

    if (!extractionResult.extractedItems || extractionResult.extractedItems.length === 0) {
      return { error: 'No se pudieron extraer artículos de la lista. Intenta con un documento más claro.' };
    }

    // Step 3: Normalize and match the extracted items
    const matchingResult = await normalizeAndMatchSchoolSupplies({
      extractedItems: extractionResult.extractedItems,
    });

    if (!matchingResult.matchedItems || matchingResult.matchedItems.length === 0) {
        return { error: 'No se pudieron encontrar productos que coincidan con tu lista.' };
    }
    
    // Step 4: Add mock data for presentation
    const finalResultWithPrices: NormalizeAndMatchSchoolSuppliesOutput = {
      matchedItems: matchingResult.matchedItems.map(item => ({
        ...item,
        // Mock price and product ID for demo purposes
        productId: item.productId || `PROD-${Math.floor(Math.random() * 10000)}`,
        productName: item.productName || `Producto similar para "${item.normalizedName}"`,
        price: parseFloat((Math.random() * (25 - 0.5) + 0.5).toFixed(2)),
      })),
    };

    // Step 5: Save the new quote to the cache
    await saveQuoteToCache(fileHash, file, finalResultWithPrices);

    return { data: finalResultWithPrices, fromCache: false };
  } catch (err) {
    console.error('Error processing school list:', err);
    return { error: 'Ha ocurrido un error en el servidor. Por favor, inténtalo de nuevo.' };
  }
}
