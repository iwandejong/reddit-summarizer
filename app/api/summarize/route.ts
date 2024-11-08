import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type RedditComment = {
  data: {
    body: string;
  };
};

export async function POST(request: NextRequest) {
  const { url } = await request.json();

  try {
    // Fetch Reddit thread data
    const response = await fetch(`${url}.json`);
    const data = await response.json();

    // Extract relevant information
    const title = data[0].data.children[0].data.title;
    const selftext = data[0].data.children[0].data.selftext;
    const comments = data[1].data.children
      .filter((child: RedditComment) => child.data && typeof child.data.body === 'string')
      .map((child: RedditComment) => child.data.body)
      .join('\n');

    // Generate summary using OpenAI
    const summary = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes Reddit threads. Provide a concise summary of the main points and key discussions."
        },
        {
          role: "user",
          content: `Summarize this Reddit thread:\n\nTitle: ${title}\n\nPost: ${selftext}\n\nComments: ${comments}`
        }
      ],
      max_tokens: 250
    });

    return NextResponse.json({ summary: summary.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'An error occurred while summarizing the thread. Please try again.' }, { status: 500 });
  }
}