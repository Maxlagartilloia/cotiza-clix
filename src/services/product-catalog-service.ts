/**
 * @fileOverview A service for interacting with the product catalog in Firestore.
 */

import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';

const PRODUCTS_COLLECTION = 'products';

// The mock catalog is kept for fallback or testing purposes, but is no longer the primary source.
const MOCK_CATALOG = [
  { productId: 'prod-001', productName: 'Cuaderno Profesional 100 Hojas Raya', keywords: ['cuaderno', 'libreta', 'raya'] },
  { productId: 'prod-002', productName: 'Cuaderno Profesional 100 Hojas Cuadro 7mm', keywords: ['cuaderno', 'libreta', 'cuadro chico', 'c7'] },
  { productId: 'prod-003', productName: 'Lápiz Mirado No. 2', keywords: ['lapiz', 'grafito'] },
  { productId: 'prod-004', productName: 'Caja de 12 Lápices de Colores', keywords: ['colores', 'lapices de colores', 'caja 12'] },
  { productId: 'prod-005', productName: 'Caja de 24 Lápices de Colores', keywords: ['colores', 'lapices de colores', 'caja 24'] },
  { productId: 'prod-006', productName: 'Juego de Geometría Flexible', keywords: ['juego de geometria', 'reglas', 'escuadras'] },
  { productId: 'prod-007', productName: 'Pegamento en Barra 8g', keywords: ['pegamento', 'barra', 'pritt'] },
  { productId: 'prod-008', productName: 'Tijeras Escolares Punta Roma', keywords: ['tijeras', 'punta roma'] },
  { productId: 'prod-009', productName: 'Goma de Borrar Blanca', keywords: ['goma', 'borrador'] },
  { productId: 'prod-010', productName: 'Sacapuntas con Depósito', keywords: ['sacapuntas', 'afilador'] },
  { productId: 'prod-011', productName: 'Plumones Lavables (10 piezas)', keywords: ['plumones', 'marcadores', 'crayola'] },
  { productId: 'prod-012', productName: 'Mochila Escolar Rueditas', keywords: ['mochila', 'ruedas'] },
];

export interface Product {
  productId: string;
  productName: string;
}

/**
 * Searches the product catalog in Firestore for a given query.
 * It searches for keywords in a 'searchKeywords' array field in the documents.
 * @param searchQuery The search query.
 * @returns A promise that resolves to an array of matching products.
 */
export async function searchProducts(searchQuery: string): Promise<Product[]> {
  console.log(`Searching for: "${searchQuery}" in Firestore.`);

  const productsCollection = collection(db, PRODUCTS_COLLECTION);
  // Firestore doesn't support full-text search natively.
  // A common pattern is to store keywords in an array and use 'array-contains-any'.
  // We'll search for the first few words of the query.
  const queryWords = searchQuery.toLowerCase().split(/\s+/).slice(0, 10);

  if (queryWords.length === 0) {
    return [];
  }

  try {
    const q = query(productsCollection, where('searchKeywords', 'array-contains-any', queryWords), limit(5));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        console.log('No matching products found in Firestore.');
        return [];
    }

    const results: Product[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        // The document ID is assumed to be the productId
        productId: doc.id, 
        // Ensure the fields exist on the document
        productName: data.productName || 'Nombre no disponible',
      };
    });

    console.log(`Found ${results.length} results in Firestore.`);
    return results;
  } catch (error) {
    console.error("Error searching products in Firestore:", error);
    // Fallback or re-throw error
    return [];
  }
}
