import { pipeline, env } from '@xenova/transformers'

env.allowLocalModels = false

class PipelineFactory {
  static task = null
  static model = null
  static instance = null

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback })
    }

    return this.instance
  }
}

self.addEventListener('message', async event => {
  const message = event.data

  let transcript = await transcribe(message.audio)

  console.log('Transcription complete:', transcript)

  if (transcript === null) return

  self.postMessage({
    status: 'complete',
    task: 'automatic-speech-recognition',
    data: transcript
  })
})

class AutomaticSpeechRecognitionPipelineFactory extends PipelineFactory {
  static task = 'automatic-speech-recognition'
  static model = 'Xenova/whisper-tiny.en'
}

const transcribe = async audio => {
  const p = AutomaticSpeechRecognitionPipelineFactory
  let transcriber = await p.getInstance(data => self.postMessage(data))

  let options = {
    chunk_length_s: 30, // adjust chunk size in seconds as needed
    stride_length_s: 5 // adjust overlap between chunks as needed
  }

  let output = await transcriber(audio, options).catch(error => {
    self.postMessage({
      status: 'error',
      task: 'automatic-speech-recognition',
      data: error
    })
    return null
  })

  return output
}
