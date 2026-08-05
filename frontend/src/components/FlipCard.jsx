import { useState } from 'react'
import './FlipCard.css'

/** Click/tap (or Enter/Space) flips the card between `front` and `back`. */
export default function FlipCard({ front, back, accentClass = '' }) {
  const [flipped, setFlipped] = useState(false)

  const toggle = () => setFlipped((f) => !f)

  return (
    <div
      className={`flip-card ${accentClass} ${flipped ? 'is-flipped' : ''}`}
      onClick={toggle}
      role="button"
      tabIndex={0}
      aria-label="Click to flip for details"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          toggle()
        }
      }}
    >
      <div className="flip-card-inner">
        <div className="flip-card-face flip-card-front">{front}</div>
        <div className="flip-card-face flip-card-back">{back}</div>
      </div>
    </div>
  )
}
