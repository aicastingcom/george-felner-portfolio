import { aboutCopy } from '../data/categories'

type Props = {
  open: boolean
  onClose: () => void
}

/** Full-page About — opened from nav button, not in the scroll journey */
export function AboutPage({ open, onClose }: Props) {
  if (!open) return null

  return (
    <div className="page-overlay" role="dialog" aria-modal="true" aria-labelledby="about-title">
      <button type="button" className="page-close" onClick={onClose} aria-label="Close">
        ×
      </button>
      <div className="page-overlay-inner about-page">
        <h2 id="about-title">About Me</h2>
        {aboutCopy.map((para) => (
          <p key={para.slice(0, 40)}>{para}</p>
        ))}
      </div>
    </div>
  )
}
