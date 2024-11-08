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

  if (!process.env.OPENAI_API_KEY) {
    console.error("Error: OPENAI_API_KEY environment variable not set.");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  try {
    // Extract subreddit and thread ID from URL
    const urlParts = url.match(/reddit\.com\/r\/([^/]+)\/comments\/([^/]+)/);
    if (!urlParts) {
      throw new Error("Invalid Reddit URL format");
    }
    const [, subreddit, threadId] = urlParts;

    // Fetch thread comments using Reddit API
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/comments/${threadId}.json`,
      {
        headers: {
          'Authorization': `Basic ${process.env.REDDIT_API_KEY}`,
          'User-Agent': 'Reddit-Thread-Summarizer/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch thread comments: ${response.statusText}`);
    }
    
    const data = await response.json();

    // return NextResponse.json({ data });


    // Extract relevant information with optional chaining and type checks
    const title = data[0]?.data?.children[0]?.data?.title || "No title";
    const selftext = data[0]?.data?.children[0]?.data?.selftext || "No content";
    const comments = data[1]?.data?.children
        ?.filter((child: RedditComment) => child.data && typeof child.data.body === 'string')
        .map((child: RedditComment) => child.data.body)
        .join('\n') || "No comments";

    // return NextResponse.json({ title, selftext, comments });
    
    // Generate summary using OpenAI
    const summaryResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes Reddit threads. Provide a concise summary of the main points and key discussions. If there are multiple points or comments to highlight, format them as bullet points. Start with a brief overview, then list key points and important comments with bullet points."
        },
        {
          role: "user",
          content: `Summarize this Reddit thread:\n\nTitle: ${title}\n\nPost: ${selftext}\n\nComments: ${comments}`
        }
      ],
      max_tokens: 500
    });

    const summaryContent = summaryResponse.choices?.[0]?.message?.content;
    if (!summaryContent) {
      throw new Error("Failed to generate a summary");
    }

    return NextResponse.json({ summary: summaryContent });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'An error occurred while summarizing the thread. Please try again.' }, { status: 500 });
  }
}
