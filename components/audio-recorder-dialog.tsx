'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { AudioRecorder } from '@/components/audio-recorder'

import { Download, Mic } from 'lucide-react'

export function AudioRecorderDialog({
  onLoad
}: {
  onLoad: (blob: Blob) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [audioData, setAudioData] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const handleAudioRecorded = (blob: Blob) => {
    setAudioData(blob)
    const url = URL.createObjectURL(blob)
    setAudioUrl(url)
  }

  const handleLoad = () => {
    if (audioData && audioUrl) {
      onLoad(audioData)
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
      setAudioData(null)
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>
          <Mic className='size-4' />
          <span>Record</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Audio Recorder</DialogTitle>
        </DialogHeader>

        <div className='flex flex-col items-start'>
          <AudioRecorder onRecordingComplete={handleAudioRecorded} />

          {audioData && audioUrl && (
            <div className='mt-4 w-full'>
              <h3 className='mb-2 text-sm font-medium'>Recorded Audio</h3>
              <audio className='w-full' controls>
                <source src={audioUrl} type={audioData.type} />
              </audio>
            </div>
          )}
        </div>

        <DialogFooter className='mt-4'>
          <Button
            type='button'
            size='sm'
            disabled={!audioData}
            onClick={handleLoad}
          >
            <Download className='size-4 text-white/75' />
            <span>Load</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
