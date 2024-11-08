'use server'

import OpenAI from 'openai'
import { z } from 'zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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
    // Fetch Reddit thread data
    const response = await fetch(`${url}.json`)
    const data = await response.json()

    // Extract relevant information
    const title = data[0].data.children[0].data.title
    const selftext = data[0].data.children[0].data.selftext
    const comments = data[1].data.children.map((child: any) => child.data.body).join('\n')

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
      max_tokens: 500
    })

    return { summary: summary.choices[0].message.content }
  } catch (error) {
    console.error('Error:', error)
    return { error: 'An error occurred while summarizing the thread. Please try again.' }
  }
}
