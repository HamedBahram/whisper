import { Transcriber } from '@/lib/types'

interface Props {
  transcriber: Transcriber
}

export default function Transcript({ transcriber }: Props) {
  const output = transcriber.output
  const isProcessing = transcriber.isProcessing

  return (
    <section className='w-full max-w-2xl rounded-lg border p-6 shadow-md'>
      <h2 className='text-2xl font-bold'>Transcription</h2>
      <div className='mt-4 h-36 overflow-auto'>
        {isProcessing ? (
          <div className='flex flex-col space-y-2'>
            <div className='h-4 animate-pulse rounded bg-gray-200'></div>
            <div className='h-4 animate-pulse rounded bg-gray-200'></div>
            <div className='h-4 animate-pulse rounded bg-gray-200'></div>
            <div className='h-4 animate-pulse rounded bg-gray-200'></div>
          </div>
        ) : output ? (
          <pre className='whitespace-pre-wrap'>{output.text}</pre>
        ) : (
          <p>No transcription available</p>
        )}
      </div>
    </section>
  )
}
