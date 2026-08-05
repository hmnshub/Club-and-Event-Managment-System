import { useEffect, useState } from 'react'

/** Types `text` out character by character once on mount (or whenever `text` changes). */
export default function TypewriterText({ text, speed = 38, className = '', showCursor = true }) {
  const [shown, setShown] = useState('')

  useEffect(() => {
    setShown('')
    let i = 0
    const id = setInterval(() => {
      i += 1
      setShown(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])

  return (
    <span className={className}>
      {shown}
      {showCursor && <span className="typewriter-cursor" aria-hidden="true" />}
    </span>
  )
}
