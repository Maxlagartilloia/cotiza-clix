'use server';

import { db } from '@/lib/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import Papa from 'papaparse';

const PRODUCTS_COLLECTION = 'products';

type ActionResponse = {
  processedCount?: number;
  error?: string;
};

// Function to generate keywords from a product name
const generateKeywords = (productName: string): string[] => {
  if (!productName) return [];
  const cleanedName = productName
    .toLowerCase()
    // Remove common punctuation
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    // Remove extra spaces
    .replace(/\s{2,}/g, ' ');

  const words = cleanedName.split(' ');
  const keywords = new Set(words);

  // Add parts of words (e.g., "cuaderno" -> "cuad", "cuader")
  words.forEach(word => {
    if (word.length > 3) {
      for (let i = 4; i <= word.length; i++) {
        keywords.add(word.substring(0, i));
      }
    }
  });

  return Array.from(keywords).filter(kw => kw.length > 1);
};


export async function uploadCatalog(formData: FormData): Promise<ActionResponse> {
  const file = formData.get('file') as File;

  if (!file) {
    return { error: 'No se encontró ningún archivo.' };
  }

  if (file.type !== 'text/csv') {
    return { error: 'El archivo debe ser de tipo CSV.' };
  }

  const fileContent = await file.text();

  return new Promise((resolve, reject) => {
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const products = results.data as { productId: string; productName: string }[];
          
          if (!products || products.length === 0) {
            return resolve({ error: 'El archivo CSV está vacío o tiene un formato incorrecto.' });
          }

          // Check for required headers
          if (!results.meta.fields?.includes('productId') || !results.meta.fields?.includes('productName')) {
            return resolve({ error: 'El archivo CSV debe contener las columnas "productId" y "productName".' });
          }

          const productsCollection = collection(db, PRODUCTS_COLLECTION);
          const batchSize = 500; // Firestore batch limit
          let processedCount = 0;

          for (let i = 0; i < products.length; i += batchSize) {
            const batch = writeBatch(db);
            const batchProducts = products.slice(i, i + batchSize);

            batchProducts.forEach(product => {
                if(product.productId && product.productName) {
                    const docRef = doc(productsCollection, product.productId);
                    const searchKeywords = generateKeywords(product.productName);
                    
                    batch.set(docRef, {
                        productName: product.productName,
                        searchKeywords: searchKeywords
                    });
                    processedCount++;
                }
            });
            await batch.commit();
            console.log(`Processed batch of ${batchProducts.length} products.`);
          }

          resolve({ processedCount });

        } catch (err) {
          console.error('Error processing CSV and writing to Firestore:', err);
          const errorMessage = err instanceof Error ? err.message : 'Error desconocido al guardar en la base de datos.';
          resolve({ error: `Error en el servidor: ${errorMessage}` });
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        resolve({ error: `Error al leer el archivo CSV: ${error.message}` });
      }
    });
  });
}
