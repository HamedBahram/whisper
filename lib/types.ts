export interface TranscriberData {
  text: string
}

export interface Transcriber {
  onInputChange: () => void
  isProcessing: boolean
  isModelLoading: boolean
  modelLoadingProgress: number
  start: (audioData: AudioBuffer | undefined) => void
  output?: TranscriberData
}
