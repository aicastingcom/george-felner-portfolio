import { useEffect, useRef } from 'react'

export function ThankYou() {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add('write')
      },
      { threshold: 0.4 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section className="thankyou" id="thank-you">
      <h2 ref={ref} className="thankyou-script">
        Thank you
      </h2>
      <p className="thankyou-name">George Felner</p>
    </section>
  )
}
