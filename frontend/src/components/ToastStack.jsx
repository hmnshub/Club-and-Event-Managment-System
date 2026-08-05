import { AnimatePresence, motion } from 'framer-motion'
import './ToastStack.css'

const ICONS = {
  success: (
    <svg viewBox="0 0 20 20" fill="none"><path d="M5 10.5l3.2 3.2L15 6.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  error: (
    <svg viewBox="0 0 20 20" fill="none"><path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
  ),
  info: (
    <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.6" /><path d="M10 9v4.2M10 6.8v.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
  ),
}

export default function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="toast-stack" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: -16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className={`toast toast-${t.type}`}
            onClick={() => onDismiss(t.id)}
          >
            <span className="toast-icon">{ICONS[t.type] || ICONS.info}</span>
            <span className="toast-message">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
