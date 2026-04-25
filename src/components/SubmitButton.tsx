'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

type Props = {
  label: string
  loadingLabel: string
  className?: string
}

export default function SubmitButton({ label, loadingLabel, className }: Props) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center gap-1.5 disabled:opacity-50 ${className ?? ''}`}
    >
      {pending ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </button>
  )
}
