import { Transcriber } from '@/lib/types'

export default function AudioManager({
  transcriber
}: {
  transcriber: Transcriber
}) {
  console.log(transcriber)
  return <div>AudioManager</div>
}
