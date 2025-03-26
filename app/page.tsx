'use client'

import Transcript from '@/components/transcript'
import AudioManager from '@/components/audio-manager'
import { useTranscriber } from '@/hooks/useTranscriber'

export default function Home() {
  const transcriber = useTranscriber()

  return (
    <section className='flex min-h-screen items-center justify-center'>
      <div className='container flex flex-col items-center justify-center'>
        <h1 className='text-center text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl'>
          Whisper
        </h1>
        <h2 className='text-1xl mt-3 mb-5 px-4 text-center font-semibold tracking-tight text-slate-900 sm:text-2xl'>
          Speech recognition directly in your browser
        </h2>
        <AudioManager transcriber={transcriber} />
        <Transcript transcribedData={transcriber.output} />
      </div>
    </section>
  )
}
