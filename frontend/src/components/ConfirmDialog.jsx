import { AnimatePresence, motion } from 'framer-motion'
import './ConfirmDialog.css'

export default function ConfirmDialog({ state, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {state && (
        <motion.div
          className="confirm-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="confirm-box"
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`confirm-icon ${state.danger ? 'confirm-icon-danger' : ''}`}>
              {state.danger ? (
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 16.5v.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M10.3 3.9L2.7 17.4A1.8 1.8 0 004.3 20h15.4a1.8 1.8 0 001.6-2.6L13.7 3.9a1.8 1.8 0 00-3.4 0z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /><path d="M12 11v5.2M12 8v.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              )}
            </div>
            <h3>{state.title}</h3>
            <p>{state.message}</p>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={onCancel}>Cancel</button>
              <button className={state.danger ? 'confirm-danger' : 'confirm-primary'} onClick={onConfirm}>
                {state.confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
