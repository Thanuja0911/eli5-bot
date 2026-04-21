

// export async function POST(req: Request) {
//   // 1. Pull the data sent from the frontend
//   const { messages, complexity, model } = await req.json();

//   // 2. Pick the right instruction based on complexity slider
//   const complexityInstruction = complexityPrompts[complexity] ?? complexityPrompts.eli5;

//   // 3. Stream the response from Anthropic
//   const result = streamText({
//     model: anthropic(model ?? 'claude-haiku-4-5'),
//     system: `You are a helpful teacher who excels at explaining complex topics clearly.
// ${complexityInstruction}
// Keep your explanation concise (3-5 sentences unless the topic needs more).
// Do not use bullet points — write in plain conversational prose.`,
//     messages,
//   });

//   // 4. Return the stream in the format the Vercel AI SDK expects
//   return result.toDataStreamResponse({});
// }

import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

export const runtime = 'edge';

const complexityPrompts: Record<string, string> = {
  eli5:       'Explain this like I am 5 years old. Use simple words, short sentences, and a fun analogy if possible.',
  highschool: 'Explain this for a high school student. Avoid jargon, but you can use everyday examples.',
  college:    'Explain this at a college undergraduate level. You can use some technical terms but define them.',
  expert:     'Explain this at an expert/graduate level. Be precise and use domain-specific terminology.',
};

export async function POST(req: Request) {
  const { messages, complexity, model } = await req.json();

  const complexityInstruction = complexityPrompts[complexity] ?? complexityPrompts.eli5;

  const result = streamText({
    model: anthropic(model ?? 'claude-haiku-4-5'),
    system: `You are a helpful teacher who excels at explaining complex topics clearly.
${complexityInstruction}
Keep your explanation concise (3-5 sentences unless the topic needs more).
Do not use bullet points — write in plain conversational prose.`,
    messages,
  });

  // v6 correct method — pipe the text stream directly into a Response
  const stream = result.textStream;

  return new Response(stream as unknown as ReadableStream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  });
}