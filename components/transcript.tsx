import { TranscriberData } from '@/lib/types'
import React from 'react'

interface Props {
  transcribedData: TranscriberData | undefined
}

export default function Transcript({ transcribedData }: Props) {
  return <div>{transcribedData?.text}</div>
}
