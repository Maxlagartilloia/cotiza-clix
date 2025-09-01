'use server';

/**
 * @fileOverview Extracts school supplies from a document using OCR and AI.
 *
 * - extractSchoolSuppliesFromDocument - A function that handles the extraction process.
 * - ExtractSchoolSuppliesFromDocumentInput - The input type for the extractSchoolSuppliesFromDocument function.
 * - ExtractSchoolSuppliesFromDocumentOutput - The return type for the extractSchoolSuppliesFromDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractSchoolSuppliesFromDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A document containing a list of school supplies, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractSchoolSuppliesFromDocumentInput = z.infer<
  typeof ExtractSchoolSuppliesFromDocumentInputSchema
>;

const ExtractSchoolSuppliesFromDocumentOutputSchema = z.object({
  extractedItems: z
    .array(z.string())
    .describe('The list of extracted school supplies.'),
});
export type ExtractSchoolSuppliesFromDocumentOutput = z.infer<
  typeof ExtractSchoolSuppliesFromDocumentOutputSchema
>;

export async function extractSchoolSuppliesFromDocument(
  input: ExtractSchoolSuppliesFromDocumentInput
): Promise<ExtractSchoolSuppliesFromDocumentOutput> {
  return extractSchoolSuppliesFromDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractSchoolSuppliesFromDocumentPrompt',
  input: {schema: ExtractSchoolSuppliesFromDocumentInputSchema},
  output: {schema: ExtractSchoolSuppliesFromDocumentOutputSchema},
  prompt: `You are a helpful assistant designed to extract a list of school supplies from a document. The document will be passed to you as a data URI. Use OCR if necessary to read the document. Extract each item into a list.

Document: {{media url=documentDataUri}}`,
});

const extractSchoolSuppliesFromDocumentFlow = ai.defineFlow(
  {
    name: 'extractSchoolSuppliesFromDocumentFlow',
    inputSchema: ExtractSchoolSuppliesFromDocumentInputSchema,
    outputSchema: ExtractSchoolSuppliesFromDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
