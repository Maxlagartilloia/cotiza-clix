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

const prompt = ai.definePrompt({
  name: 'normalizeAndMatchSchoolSuppliesPrompt',
  input: {
    schema: NormalizeAndMatchSchoolSuppliesInputSchema,
  },
  output: {schema: NormalizeAndMatchSchoolSuppliesOutputSchema},
  prompt: `You are an expert in school supplies and product catalogs.

  Your task is to normalize the names of the extracted school supplies and match them against a product catalog.
  If you find a match, return the product ID and product name from the catalog.

  Extracted Items:
  {{#each extractedItems}}- {{{this}}}
  {{/each}}

  Return the normalized name, product ID (if found), product name (if found), and a confidence score (0-1) for each item.
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
