import Groq from 'groq-sdk';
import { z } from 'zod';
import { env } from '../config/env';
import { buildSystemPrompt, buildUserPrompt, buildCorrectionPrompt } from '../utils/promptBuilder';
import { logger } from '../utils/logger';
import type { AssignmentInput } from '@vedaai/shared';

const groq = new Groq({
  apiKey: env.groqApiKey,
});

const AISectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  instruction: z.string(),
  questionType: z.string(),
  totalMarks: z.number(),
  questions: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      type: z.enum(['mcq', 'short', 'long', 'truefalse']),
      difficulty: z.enum(['easy', 'medium', 'hard']),
      marks: z.number(),
      options: z.array(z.string()).optional(),
    })
  ),
});

const AIResponseSchema = z.object({
  sections: z.array(AISectionSchema),
});

type AIResponse = z.infer<typeof AIResponseSchema>;

function extractJSON(text: string): string {
  const cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');

  if (start === -1 || end === -1) {
    throw new Error('No JSON object found in AI response');
  }

  return cleaned.slice(start, end + 1);
}

export async function generatePaper(assignment: AssignmentInput): Promise<string> {
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(assignment);

  logger.info('Sending prompt to Groq (llama-3.3-70b-versatile)...');

  const chatCompletion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 4096,
    temperature: 0.7,
  });

  const content = chatCompletion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No content in Groq AI response');
  }

  return content;
}

export async function parsePaper(rawResponse: string): Promise<AIResponse> {
  const jsonString = extractJSON(rawResponse);
  const parsed = JSON.parse(jsonString);
  const result = AIResponseSchema.safeParse(parsed);

  if (result.success) {
    return result.data;
  }

  logger.warn('AI response validation failed, retrying with correction...');
  const errorMessages = result.error.errors
    .map((e) => `${e.path.join('.')}: ${e.message}`)
    .join('; ');

  const correctionPrompt = buildCorrectionPrompt(errorMessages);

  const correctionCompletion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'assistant', content: rawResponse },
      { role: 'user', content: correctionPrompt },
    ],
    max_tokens: 4096,
    temperature: 0.3,
  });

  const correctionContent = correctionCompletion.choices[0]?.message?.content;
  if (!correctionContent) {
    throw new Error('No content in correction response');
  }

  const correctedJSON = extractJSON(correctionContent);
  const correctedParsed = JSON.parse(correctedJSON);
  const correctedResult = AIResponseSchema.safeParse(correctedParsed);

  if (correctedResult.success) {
    return correctedResult.data;
  }

  throw new Error(
    `AI response validation failed after correction: ${correctedResult.error.message}`
  );
}
