// services/ragService.js (ESM)
import { OpenAI } from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';

let pineconeClient;
let pineconeIndex;

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});

export async function initPinecone() {
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
  });
  pineconeIndex = pc.index(process.env.PINECONE_INDEX);
}

export async function ragQuery(query) {
  // 1) Embed user query
  const embeddingRes = await openai.createEmbedding({
    model: 'text-embedding-ada-002',
    input: query
  });
  const queryEmbedding = embeddingRes.data.data[0].embedding;

  // 2) Query Pinecone
  const queryResponse = await pineconeIndex.query({
    queryRequest: {
      vector: queryEmbedding,
      topK: 3,
      includeMetadata: true,
      namespace: 'executive-orders',
    }
  });

  // 3) Build context
  let context = '';
  queryResponse.matches.forEach((match, idx) => {
    context += `Chunk #${idx + 1} (Score: ${match.score})\n`;
    context += `${match.metadata.text}\n\n`;
  });

  // 4) Chat completion
  const systemMsg = { role: 'system', content: 'You are a helpful policy assistant.' };
  const userMsg = {
    role: 'user',
    content: `
      ANSWER THE QUERY USING THE FOLLOWING CONTEXT. 
      IF UNSURE, SAY SO.

      CONTEXT:
      ${context}

      USER QUERY: ${query}
    `
  };

  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [systemMsg, userMsg],
  });

  return completion.data.choices[0].message.content;
}
