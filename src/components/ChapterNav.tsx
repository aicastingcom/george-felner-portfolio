import { categories } from '../data/categories'

type Props = {
  onJump?: (id: string) => void
}

/** Always-visible chapter list so no category (incl. Webseries) can be missed */
export function ChapterNav({ onJump }: Props) {
  return (
    <nav className="chapter-nav" aria-label="Work categories">
      {categories.map((cat, i) => (
        <a
          key={cat.id}
          href={`#${cat.id}`}
          className="chapter-nav-item"
          onClick={(e) => {
            e.preventDefault()
            onJump?.(cat.id)
          }}
          title={cat.title}
        >
          <span className="chapter-nav-index">{String(i + 1).padStart(2, '0')}</span>
          <span className="chapter-nav-title">{cat.title}</span>
        </a>
      ))}
    </nav>
  )
}
