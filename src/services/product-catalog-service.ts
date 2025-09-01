/**
 * @fileOverview A service for interacting with the product catalog.
 * 
 * This service is a placeholder for a real product catalog implementation.
 * In a real-world scenario, this would connect to a database like Firestore
 * to search for products.
 */

// A mock product catalog for demonstration purposes.
// In a real application, this data would come from a database.
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
 * Searches the product catalog for a given query.
 * This is a mock implementation and performs a simple keyword search.
 * @param query The search query.
 * @returns A promise that resolves to an array of matching products.
 */
export async function searchProducts(query: string): Promise<Product[]> {
  console.log(`Searching for: "${query}"`);

  const queryWords = query.toLowerCase().split(/\s+/);

  const results = MOCK_CATALOG.filter(product => {
    return queryWords.some(queryWord => 
        product.productName.toLowerCase().includes(queryWord) || 
        product.keywords.some(keyword => keyword.includes(queryWord))
    );
  }).map(({ productId, productName }) => ({ productId, productName }));

  console.log(`Found ${results.length} results.`);
  return results;
}
