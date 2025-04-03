'use client'

import Transcript from '@/components/transcript'
import AudioManager from '@/components/audio-manager'
import { useTranscriber } from '@/hooks/useTranscriber'

export default function Home() {
  const transcriber = useTranscriber()

  return (
    <section className='flex min-h-screen items-center justify-center'>
      <div className='container flex flex-col items-center justify-center'>
        <h1 className='text-5xl font-extrabold tracking-tight sm:text-7xl'>
          Whisper
        </h1>
        <h2 className='mt-1'>Audio to text transcription</h2>
        <AudioManager transcriber={transcriber} />
        <Transcript transcribedData={transcriber.output} />
      </div>
    </section>
  )
}
