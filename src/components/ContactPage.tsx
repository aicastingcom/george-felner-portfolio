import { useState, type FormEvent } from 'react'

type Props = {
  open: boolean
  onClose: () => void
}

/** Full-page Contact — opened from nav button */
export function ContactPage({ open, onClose }: Props) {
  const [status, setStatus] = useState<'idle' | 'sent'>('idle')

  if (!open) return null

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') || '')
    const email = String(data.get('email') || '')
    const message = String(data.get('message') || '')
    const subject = encodeURIComponent(`Portfolio contact from ${name}`)
    const body = encodeURIComponent(`From: ${name} <${email}>\n\n${message}`)
    window.location.href = `mailto:georgefelner@gmail.com?subject=${subject}&body=${body}`
    setStatus('sent')
    form.reset()
  }

  return (
    <div className="page-overlay" role="dialog" aria-modal="true" aria-labelledby="contact-title">
      <button type="button" className="page-close" onClick={onClose} aria-label="Close">
        ×
      </button>
      <div className="page-overlay-inner contact-page">
        <h2 id="contact-title">Contact Me</h2>
        <p className="page-lead">Send a message to georgefelner@gmail.com</p>
        <form onSubmit={onSubmit} className="contact-form">
          <label>
            Name
            <input name="name" required autoComplete="name" />
          </label>
          <label>
            Email
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label>
            Message
            <textarea name="message" rows={6} required />
          </label>
          <button type="submit" className="btn-primary">
            Send message
          </button>
        </form>
        {status === 'sent' && <p className="form-status">Email draft opened — send when ready.</p>}
      </div>
    </div>
  )
}
