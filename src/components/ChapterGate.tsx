import type { Category } from '../data/categories'

type Props = {
  category: Category
  index: number
  total: number
}

/** Full-viewport title card so each chapter (incl. Webseries) is impossible to miss */
export function ChapterGate({ category, index, total }: Props) {
  return (
    <section className="chapter-gate" id={`${category.id}-intro`} aria-label={`${category.title} intro`}>
      <p className="chapter-gate-index">
        {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </p>
      <h2>{category.title}</h2>
      <p className="chapter-gate-tag">{category.tagline}</p>
      <p className="chapter-gate-cue">Scroll to explore</p>
    </section>
  )
}
