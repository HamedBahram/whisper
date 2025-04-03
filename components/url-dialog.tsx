'use client'

import { useState } from 'react'
import constants from '@/lib/constants'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

import { Download, Link } from 'lucide-react'

export function UrlDialog({
  onUrlChange
}: {
  onUrlChange: (url: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [url, setUrl] = useState<string>(constants.DEFAULT_AUDIO_URL)

  const onLoad = () => {
    if (url) {
      onUrlChange(url)
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>
          <Link className='size-4' />
          <span>From URL</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>From URL</DialogTitle>
          <DialogDescription>
            Enter the URL of the audio file you want to load.
          </DialogDescription>
        </DialogHeader>
        <div className='flex items-center space-x-2'>
          <div className='grid flex-1 gap-2'>
            <Label htmlFor='link' className='sr-only'>
              Link
            </Label>
            <Input
              id='link'
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
          </div>
          <Button type='button' size='sm' onClick={onLoad}>
            <Download className='size-4 text-white/75' />
            <span>Load</span>
          </Button>
        </div>
        <DialogFooter className='sm:justify-start'>
          <DialogClose asChild>
            <Button type='button' variant='secondary'>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
