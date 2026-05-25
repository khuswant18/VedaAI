import type { AssignmentInput } from '@vedaai/shared';

export function buildSystemPrompt(): string {
  return `You are an expert educator and exam paper creator.
Generate a structured question paper as valid JSON only.
Do not include any markdown, backticks, explanations, or text outside the JSON object.
The JSON must strictly follow this schema:
{
  "sections": [
    {
      "id": "string",
      "title": "Section A",
      "instruction": "Attempt all questions",
      "questionType": "mcq",
      "totalMarks": number,
      "questions": [
        {
          "id": "string",
          "text": "Question text here",
          "type": "mcq",
          "difficulty": "easy" | "medium" | "hard",
          "marks": number,
          "options": ["A. ...", "B. ...", "C. ...", "D. ..."]
        }
      ]
    }
  ]
}

Rules:
- Create one section per question type
- Distribute difficulty: ~40% easy, ~40% medium, ~20% hard
- Questions must be relevant to the subject
- MCQ must always have exactly 4 options
- Total marks must equal the sum of all question marks
- IDs must be unique strings (e.g. "q1", "q2", etc.)
- Section IDs must be unique strings (e.g. "s1", "s2", etc.)
- true/false questions should have options: ["True", "False"]`;
}

export function buildUserPrompt(assignment: AssignmentInput): string {
  const questionsPerType = typeof assignment.questionsPerType === 'object'
    ? JSON.stringify(assignment.questionsPerType)
    : String(assignment.questionsPerType);

  const marksPerType = typeof assignment.marksPerType === 'object'
    ? JSON.stringify(assignment.marksPerType)
    : String(assignment.marksPerType);

  return `Subject: ${assignment.subject}
Title: ${assignment.title}
Question types and counts: ${questionsPerType}
Marks per question type: ${marksPerType}
Additional instructions: ${assignment.additionalInstructions || 'None'}
Context from uploaded material: ${assignment.fileContent || 'None provided'}

Generate the complete question paper JSON now.`;
}

export function buildCorrectionPrompt(errors: string): string {
  return `The JSON you returned had validation errors: ${errors}. Return corrected JSON only. Do not include any markdown, backticks, or explanations.`;
}
