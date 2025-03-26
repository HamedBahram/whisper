import { useCallback, useMemo, useState } from 'react'
import { useWorker } from '@/hooks/useWorker'
import constants from '@/lib/constants'
import {
  ProgressItem,
  Transcriber,
  TranscriberCompleteData,
  TranscriberData,
  TranscriberUpdateData
} from '@/lib/types'

export function useTranscriber(): Transcriber {
  const [transcript, setTranscript] = useState<TranscriberData | undefined>(
    undefined
  )
  const [isBusy, setIsBusy] = useState(false)
  const [isModelLoading, setIsModelLoading] = useState(false)

  const [progressItems, setProgressItems] = useState<ProgressItem[]>([])

  const webWorker = useWorker(event => {
    const message = event.data
    // Update the state with the result
    switch (message.status) {
      case 'progress':
        // Model file progress: update one of the progress items.
        setProgressItems(prev =>
          prev.map(item => {
            if (item.file === message.file) {
              return { ...item, progress: message.progress }
            }
            return item
          })
        )
        break
      case 'update':
        // Received partial update
        // console.log("update", message);
        const updateMessage = message as TranscriberUpdateData
        setTranscript({
          isBusy: true,
          text: updateMessage.data[0],
          chunks: updateMessage.data[1].chunks
        })
        break
      case 'complete':
        // Received complete transcript
        // console.log("complete", message);
        const completeMessage = message as TranscriberCompleteData
        setTranscript({
          isBusy: false,
          text: completeMessage.data.text,
          chunks: completeMessage.data.chunks
        })
        setIsBusy(false)
        break

      case 'initiate':
        // Model file start load: add a new progress item to the list.
        setIsModelLoading(true)
        setProgressItems(prev => [...prev, message])
        break
      case 'ready':
        setIsModelLoading(false)
        break
      case 'error':
        setIsBusy(false)
        alert(
          `${message.data.message} This is most likely because you are using Safari on an M1/M2 Mac. Please try again from Chrome, Firefox, or Edge.\n\nIf this is not the case, please file a bug report.`
        )
        break
      case 'done':
        // Model file loaded: remove the progress item from the list.
        setProgressItems(prev =>
          prev.filter(item => item.file !== message.file)
        )
        break

      default:
        // initiate/download/done
        break
    }
  })

  const [model, setModel] = useState<string>(constants.DEFAULT_MODEL)
  const [subtask, setSubtask] = useState<string>(constants.DEFAULT_SUBTASK)
  const [quantized, setQuantized] = useState<boolean>(
    constants.DEFAULT_QUANTIZED
  )
  const [multilingual, setMultilingual] = useState<boolean>(
    constants.DEFAULT_MULTILINGUAL
  )
  const [language, setLanguage] = useState<string>(constants.DEFAULT_LANGUAGE)

  const onInputChange = useCallback(() => {
    setTranscript(undefined)
  }, [])

  const postRequest = useCallback(
    async (audioData: AudioBuffer | undefined) => {
      if (audioData) {
        setTranscript(undefined)
        setIsBusy(true)

        let audio
        if (audioData.numberOfChannels === 2) {
          const SCALING_FACTOR = Math.sqrt(2)

          const left = audioData.getChannelData(0)
          const right = audioData.getChannelData(1)

          audio = new Float32Array(left.length)
          for (let i = 0; i < audioData.length; ++i) {
            audio[i] = (SCALING_FACTOR * (left[i] + right[i])) / 2
          }
        } else {
          // If the audio is not stereo, we can just use the first channel:
          audio = audioData.getChannelData(0)
        }

        webWorker?.postMessage({
          audio,
          model,
          multilingual,
          quantized,
          subtask: multilingual ? subtask : null,
          language: multilingual && language !== 'auto' ? language : null
        })
      }
    },
    [webWorker, model, multilingual, quantized, subtask, language]
  )

  const transcriber = useMemo(() => {
    return {
      onInputChange,
      isBusy,
      isModelLoading,
      progressItems,
      start: postRequest,
      output: transcript,
      model,
      setModel,
      multilingual,
      setMultilingual,
      quantized,
      setQuantized,
      subtask,
      setSubtask,
      language,
      setLanguage
    }
  }, [
    onInputChange,
    isBusy,
    isModelLoading,
    progressItems,
    postRequest,
    transcript,
    model,
    multilingual,
    quantized,
    subtask,
    language
  ])

  return transcriber
}
