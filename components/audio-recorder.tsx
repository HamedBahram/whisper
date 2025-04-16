'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, Square, Play, Pause } from 'lucide-react'

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void
}

export function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Start recording function
  const startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/wav'
        })
        onRecordingComplete(audioBlob)
      }

      // Start recording
      mediaRecorder.start()
      setIsRecording(true)
      setIsPaused(false)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  // Pause recording function
  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        // Resume recording
        mediaRecorderRef.current.resume()
        setIsPaused(false)

        // Restart timer
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1)
        }, 1000)
      } else {
        // Pause recording
        mediaRecorderRef.current.pause()
        setIsPaused(true)

        // Stop timer
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
      }
    }
  }

  // Stop recording function
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // Stop recording
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)

      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      // Stop all tracks on the stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }

  // Format time function
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }, [])

  return (
    <div className='flex w-full flex-col items-center space-y-2'>
      <div className='flex w-full items-center justify-center'>
        <div className='font-mono text-lg'>{formatTime(recordingTime)}</div>
        {isRecording && !isPaused && (
          <div className='ml-3 h-3 w-3 animate-pulse rounded-full bg-red-500' />
        )}
      </div>

      <div className='flex space-x-4'>
        {!isRecording ? (
          <Button onClick={startRecording} size='icon' variant='default'>
            <Mic className='h-5 w-5' />
          </Button>
        ) : (
          <>
            <Button onClick={pauseRecording} size='icon' variant='outline'>
              {isPaused ? (
                <Play className='h-5 w-5' />
              ) : (
                <Pause className='h-5 w-5' />
              )}
            </Button>

            <Button onClick={stopRecording} size='icon' variant='destructive'>
              <Square className='h-5 w-5' />
            </Button>
          </>
        )}
      </div>

      {isRecording && (
        <div className='text-muted-foreground text-sm'>
          {isPaused ? 'Recording paused' : 'Recording...'}
        </div>
      )}
    </div>
  )
}
