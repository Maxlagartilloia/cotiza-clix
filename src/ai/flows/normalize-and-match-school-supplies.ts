'use server';

/**
 * @fileOverview Normalizes and matches extracted school supplies against a product catalog.
 *
 * - normalizeAndMatchSchoolSupplies - A function that normalizes and matches school supplies.
 * - NormalizeAndMatchSchoolSuppliesInput - The input type for the normalizeAndMatchSchoolSupplies function.
 * - NormalizeAndMatchSchoolSuppliesOutput - The return type for the normalizeAndMatchSchoolSupplies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { searchProducts } from '@/services/product-catalog-service';

const NormalizeAndMatchSchoolSuppliesInputSchema = z.object({
  extractedItems: z
    .array(z.string())
    .describe('The list of extracted school supplies.'),
});
export type NormalizeAndMatchSchoolSuppliesInput = z.infer<
  typeof NormalizeAndMatchSchoolSuppliesInputSchema
>;

const MatchedItemSchema = z.object({
  normalizedName: z.string().describe('The normalized name of the item.'),
  productId: z.string().optional().describe('The ID of the matched product in the catalog, if any.'),
  productName: z.string().optional().describe('The name of the matched product in the catalog, if any.'),
  confidence: z.number().describe('The confidence score of the match (0-1).'),
});

const NormalizeAndMatchSchoolSuppliesOutputSchema = z.object({
  matchedItems: z.array(MatchedItemSchema).describe('The list of matched items.'),
});
export type NormalizeAndMatchSchoolSuppliesOutput = z.infer<
  typeof NormalizeAndMatchSchoolSuppliesOutputSchema
>;

export async function normalizeAndMatchSchoolSupplies(
  input: NormalizeAndMatchSchoolSuppliesInput
): Promise<NormalizeAndMatchSchoolSuppliesOutput> {
  return normalizeAndMatchSchoolSuppliesFlow(input);
}

const findMatchingProductTool = ai.defineTool(
    {
        name: 'findMatchingProduct',
        description: 'Finds a matching product in the catalog for a given school supply item.',
        inputSchema: z.object({
            query: z.string().describe('The name of the school supply to search for.'),
        }),
        outputSchema: z.object({
            productId: z.string().optional(),
            productName: z.string().optional(),
        }),
    },
    async (input) => {
        const results = await searchProducts(input.query);
        if (results.length > 0) {
            return results[0]; // Return the top match
        }
        return {};
    }
);


const prompt = ai.definePrompt({
  name: 'normalizeAndMatchSchoolSuppliesPrompt',
  input: {
    schema: NormalizeAndMatchSchoolSuppliesInputSchema,
  },
  output: {schema: NormalizeAndMatchSchoolSuppliesOutputSchema},
  tools: [findMatchingProductTool],
  prompt: `You are an expert in school supplies. Your task is to process a list of extracted school supply items.

For each item in the list, you MUST perform these steps:
1. Normalize the item name. For example, "caja de 12 lapices de colores" should become "Lápices de colores (caja x12)".
2. Use the 'findMatchingProduct' tool to search for the normalized name in the product catalog.
3. Based on the tool's result, determine a confidence score between 0 and 1. A score of 1 means a perfect match, while a score below 0.5 indicates a very low-confidence match or no match found.
4. If the tool returns a product, include its 'productId' and 'productName'. If not, you can omit them.
5. Compile a list of all processed items with their normalized name, match details (if any), and the confidence score.

Return the final list of matched items.

Extracted Items:
{{#each extractedItems}}- {{{this}}}
{{/each}}
  `,
});

const normalizeAndMatchSchoolSuppliesFlow = ai.defineFlow(
  {
    name: 'normalizeAndMatchSchoolSuppliesFlow',
    inputSchema: NormalizeAndMatchSchoolSuppliesInputSchema,
    outputSchema: NormalizeAndMatchSchoolSuppliesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
