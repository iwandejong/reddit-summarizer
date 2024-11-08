'use server';

import { z } from 'zod';

const schema = z.object({
  url: z.string().url().refine((val) => val.includes('reddit.com'), {
    message: 'URL must be a valid Reddit thread URL.',
  }),
});

export async function summarizeRedditThread(formData: FormData) {
  const result = schema.safeParse({
    url: formData.get('url'),
  });

  if (!result.success) {
    return { error: 'Invalid URL. Please provide a valid Reddit thread URL.' };
  }

  const { url } = result.data;

  console.log(url);

  try {
    const baseURL = process.env.VERCEL_URL ? `https://reddit-recap.vercel.app/` : 'http://localhost:3000';
    console.log(baseURL);
    const response = await fetch(`${baseURL}/api/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_SECRET_KEY}`,
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.summary) {
      return { error: 'Failed to retrieve a summary from the response.' };
    }

    return { summary: data.summary };
  } catch (error) {
    console.error('Error:', error);
    return { error: 'An error occurred while summarizing the thread. Please try again.' };
  }
}
