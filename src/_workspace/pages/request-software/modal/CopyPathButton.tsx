import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function CopyPathButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false)

  const copyPath = async () => {
    await navigator.clipboard.writeText(path)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return <Button type='button' size='sm' variant='outline' onClick={copyPath}>{copied ? <Check /> : <Copy />}{copied ? 'Copied' : 'Copy path'}</Button>
}
