'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { summarizeRedditThread } from './actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ReloadIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { useTheme } from './theme-provider'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
          Summarizing...
        </>
      ) : (
        'Summarize'
      )}
    </Button>
  )
}

export default function RedditSummarizer() {
  const [summary, setSummary] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()
  const [copied, setCopied] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSummary(null)

    const result = await summarizeRedditThread(formData)

    if (result.error) {
      setError(result.error)
    } else if (result.summary) {
      setSummary(result.summary)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Reddit Thread Summarizer</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </Button>
              <a
                href="https://buymeacoffee.com/iwandejong"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline">Buy Me a Coffee</Button>
              </a>
            </div>
          </div>
          <CardDescription>Enter a Reddit thread URL to get an AI-generated summary.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <Input
              type="url"
              name="url"
              placeholder="https://www.reddit.com/r/AskReddit/comments/..."
              required
            />
            <SubmitButton />
          </form>
          {error && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-100 rounded">
              {error}
            </div>
          )}
          {summary && (
            <div className="mt-4 p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-100 rounded relative">
              <div className="absolute top-2 right-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(summary);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className={`text-green-700 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-800 border border-green-400 dark:border-green-600 transition-colors ${
                    copied ? 'bg-green-200 dark:bg-green-800' : ''
                  }`}
                >
                  {copied ? (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                        />
                      </svg>
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <h3 className="font-bold mb-2">Summary:</h3>
              <div className="prose dark:prose-invert max-w-none whitespace-pre-line">
                {summary
                  .split('\n')
                  .map(line => {
                    const cleanedLine = line.trim();
                    if (cleanedLine === '-') return '';
                    const indentMatch = line.match(/^[\s\t]*/);
                    const indentLevel = indentMatch ? Math.floor(indentMatch[0].length / 2) : 0;
                    if (cleanedLine.startsWith('-') || cleanedLine.startsWith('•')) {
                      return '  '.repeat(indentLevel) + cleanedLine;
                    }
                    return cleanedLine.replace(/\*\*/g, '');
                  })
                  .filter(line => line)
                  .join('\n')
                }
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-sm text-gray-500 dark:text-gray-400">
          Powered by OpenAI GPT-3.5
        </CardFooter>
      </Card>
    </div>
  )
}
