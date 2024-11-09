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
            <CardTitle className="text-xl sm:text-2xl">Reddit Thread Summarizer</CardTitle>
            <div className="flex items-center gap-1 sm:gap-2">
              <a
                href="https://github.com/iwandejong/reddit-summarizer"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View source on GitHub"
              >
                <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                  <svg
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </Button>
              </a>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle theme"
                className="h-8 w-8 sm:h-10 sm:w-10"
              >
                {theme === 'dark' ? (
                  <SunIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <MoonIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>
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
                    return cleanedLine.replace(/\*\*(.*?)\*\*/g, '$1');
                  })
                  .filter(line => line)
                  .join('\n')
                }
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <p>
            Powered by OpenAI GPT-3.5
          </p>
          <a
            href="https://buymeacoffee.com/iwandejong"
            target="_blank"
            rel="noopener noreferrer"
            className=""
            >
            <Button variant="outline">Buy Me a Coffee</Button>
        </a>
        </CardFooter>
      </Card>
    </div>
  )
}
