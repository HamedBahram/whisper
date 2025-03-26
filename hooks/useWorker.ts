import { useState } from 'react'

export interface MessageEventHandler {
  (event: MessageEvent): void
}

export function useWorker(
  messageEventHandler: MessageEventHandler
): Worker | null {
  // Create new worker once and never again
  const [worker] = useState(() => createWorker(messageEventHandler))
  return worker
}

function createWorker(messageEventHandler: MessageEventHandler): Worker | null {
  if (typeof window === 'undefined') return null

  const worker = new Worker(new URL('../lib/worker.js', import.meta.url), {
    type: 'module'
  })
  // Listen for messages from the Web Worker
  worker.addEventListener('message', messageEventHandler)
  return worker
}
