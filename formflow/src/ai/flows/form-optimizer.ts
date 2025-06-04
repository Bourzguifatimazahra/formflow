'use server';

/**
 * @fileOverview An AI agent for optimizing form question sequences based on user responses.
 *
 * - optimizeForm - A function that analyzes form responses and suggests an optimized question sequence.
 * - OptimizeFormInput - The input type for the optimizeForm function.
 * - OptimizeFormOutput - The return type for the optimizeForm function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeFormInputSchema = z.object({
  formId: z.string().describe('The ID of the form to optimize.'),
  responses: z.array(
    z.record(z.string(), z.any())
  ).describe('An array of responses to the form, where each response is a record of question IDs to answers.'),
});
export type OptimizeFormInput = z.infer<typeof OptimizeFormInputSchema>;

const OptimizeFormOutputSchema = z.object({
  optimizedSequence: z.array(z.string()).describe('An array of question IDs representing the optimized question sequence.'),
  rationale: z.string().describe('Explanation of the AI rationale behind the suggested sequence.'),
});
export type OptimizeFormOutput = z.infer<typeof OptimizeFormOutputSchema>;

export async function optimizeForm(input: OptimizeFormInput): Promise<OptimizeFormOutput> {
  return optimizeFormFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeFormPrompt',
  input: {schema: OptimizeFormInputSchema},
  output: {schema: OptimizeFormOutputSchema},
  prompt: `You are an AI form optimization expert. Analyze the provided user responses for form ID {{{formId}}} and suggest an optimized question sequence to maximize completion rates.

Responses:
{{#each responses}}
  - {{{this}}}
{{/each}}

Based on these responses, provide an optimized question sequence (an array of question IDs) and a rationale explaining why this sequence is expected to improve completion rates. The sequence should include all of the same questions as the original form.

Ensure your output adheres to the schema, and is a valid JSON object.

Optimized Question Sequence:`, 
});

const optimizeFormFlow = ai.defineFlow(
  {
    name: 'optimizeFormFlow',
    inputSchema: OptimizeFormInputSchema,
    outputSchema: OptimizeFormOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
