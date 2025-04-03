import axios from 'axios'
import { Transcriber } from '@/lib/types'
import { useCallback, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import AudioPlayer from '@/components/audio-player'
import { Progress } from '@/components/ui/progress'
import { UrlDialog } from '@/components/url-dialog'

import { Loader } from 'lucide-react'

export enum AudioSource {
  URL = 'URL',
  FILE = 'FILE',
  RECORDING = 'RECORDING'
}

interface AudioData {
  buffer: AudioBuffer
  url: string
  source: AudioSource
  mimeType: string
}

export default function AudioManager({
  transcriber
}: {
  transcriber: Transcriber
}) {
  const [progress, setProgress] = useState<number | undefined>(undefined)
  const [audioData, setAudioData] = useState<AudioData | undefined>(undefined)
  const [url, setUrl] = useState<string | undefined>(undefined)

  // const isAudioLoading = progress !== undefined

  const onUrlChange = (url: string) => {
    transcriber.onInputChange()
    setAudioData(undefined)
    setUrl(url)
  }

  // const resetAudio = () => {
  //   setAudioData(undefined)
  //   setUrl(undefined)
  // }

  // const setAudioFromRecording = async (data: Blob) => {
  //   resetAudio()
  //   setProgress(0)
  //   const blobUrl = URL.createObjectURL(data)
  //   const fileReader = new FileReader()
  //   fileReader.onprogress = event => {
  //     setProgress(event.loaded / event.total || 0)
  //   }
  //   fileReader.onloadend = async () => {
  //     const audioCTX = new AudioContext({ sampleRate: 16000 })
  //     const arrayBuffer = fileReader.result as ArrayBuffer
  //     const decoded = await audioCTX.decodeAudioData(arrayBuffer)
  //     setProgress(undefined)
  //     setAudioData({
  //       buffer: decoded,
  //       url: blobUrl,
  //       source: AudioSource.RECORDING,
  //       mimeType: data.type
  //     })
  //   }
  //   fileReader.readAsArrayBuffer(data)
  // }

  const downloadAudioFromUrl = useCallback(
    async (
      url: string | undefined,
      requestAbortController: AbortController
    ) => {
      if (url) {
        try {
          setAudioData(undefined)
          setProgress(0)
          const { data, headers } = (await axios.get(url, {
            signal: requestAbortController.signal,
            responseType: 'arraybuffer',
            onDownloadProgress(progressEvent) {
              setProgress(progressEvent.progress || 0)
            }
          })) as {
            data: ArrayBuffer
            headers: { 'content-type': string }
          }

          let mimeType = headers['content-type']
          if (!mimeType || mimeType === 'audio/wave') {
            mimeType = 'audio/wav'
          }

          const audioCTX = new AudioContext({ sampleRate: 16000 })
          const blobUrl = URL.createObjectURL(
            new Blob([data], { type: 'audio/*' })
          )

          const decoded = await audioCTX.decodeAudioData(data)

          setAudioData({
            buffer: decoded,
            url: blobUrl,
            source: AudioSource.URL,
            mimeType: mimeType
          })
        } catch (error) {
          console.log('Request failed or aborted', error)
        } finally {
          setProgress(undefined)
        }
      }
    },
    []
  )

  useEffect(() => {
    if (url) {
      const requestAbortController = new AbortController()
      downloadAudioFromUrl(url, requestAbortController)
      return () => {
        requestAbortController.abort()
      }
    }
  }, [downloadAudioFromUrl, url])

  return (
    <section className='py-12'>
      <div className='flex flex-col items-center gap-4'>
        <UrlDialog onUrlChange={onUrlChange} />

        {audioData && (
          <>
            <AudioPlayer
              audioUrl={audioData.url}
              mimeType={audioData.mimeType}
            />

            <Button onClick={() => transcriber.start(audioData.buffer)}>
              {transcriber.isModelLoading ? (
                <>
                  <Loader className='animate-spin' />
                  <span>Loading model</span>
                </>
              ) : transcriber.isProcessing ? (
                <>
                  <Loader className='animate-spin' />
                  <span>Transcribing</span>
                </>
              ) : (
                <span>Transcribe</span>
              )}
            </Button>

            {transcriber.modelLoadingProgress > 0 && (
              <div className='relative z-10 w-full p-4'>
                <label>Loading model files... (only run once)</label>
                <Progress value={progress} className='w-[60%]' />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
