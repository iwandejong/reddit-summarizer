'use server'

import { z } from 'zod'

const schema = z.object({
  url: z.string().url().includes('reddit.com')
})

export async function summarizeRedditThread(formData: FormData) {
  const result = schema.safeParse({
    url: formData.get('url')
  })

  if (!result.success) {
    return { error: 'Invalid URL. Please provide a valid Reddit thread URL.' }
  }

  const { url } = result.data

  try {
    const response = await fetch(`${process.env.VERCEL_URL}/api/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_SECRET_KEY}`
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();

    if (data.error) {
      return { error: data.error };
    }

    return { summary: data.summary };
  } catch (error) {
    console.error('Error:', error);
    return { error: 'An error occurred while summarizing the thread. Please try again.' };
  }
}