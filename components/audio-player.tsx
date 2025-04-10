import { useEffect, useRef } from 'react'

export default function AudioPlayer(props: {
  audioUrl: string
  mimeType: string
}) {
  const audioPlayer = useRef<HTMLAudioElement>(null)
  const audioSource = useRef<HTMLSourceElement>(null)

  useEffect(() => {
    if (audioPlayer.current && audioSource.current) {
      audioSource.current.src = props.audioUrl
      audioPlayer.current.load()
    }
  }, [props.audioUrl])

  return (
    <div className='w-full'>
      <audio ref={audioPlayer} controls className='h-14 w-full rounded-lg'>
        <source ref={audioSource} type={props.mimeType}></source>
      </audio>
    </div>
  )
}
