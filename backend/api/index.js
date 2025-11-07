import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dbConnect, { dbReadyState } from '../src/lib/db.js'
import authRoutes from '../src/routes/auth.js'
import clubRoutes from '../src/routes/clubs.js'
import eventRoutes from '../src/routes/events.js'

const app = express()

// CORS
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Do not eagerly connect here; use cached connection helper per request

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/clubs', clubRoutes)
app.use('/api/events', eventRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    version: '2.0',
    mongoState: mongoose.connection.readyState,
    timestamp: new Date().toISOString()
  })
})

// DB health check with connect attempt
app.get('/api/health/db', async (req, res) => {
  const hasUri = Boolean(process.env.MONGODB_URI)
  try {
    if (hasUri) {
      await dbConnect()
    }
    const state = dbReadyState()
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting']
    res.json({
      hasUri,
      status: states[state] || String(state),
      readyState: state
    })
  } catch (err) {
    res.status(500).json({ hasUri, error: err.message, readyState: dbReadyState() })
  }
})

// Minimal env debug (safe)
app.get('/api/debug/env', (req, res) => {
  const uri = process.env.MONGODB_URI || ''
  res.json({
    hasUri: Boolean(uri),
    uriPrefix: uri ? uri.substring(0, 25) + '...' : null,
    uriLength: uri.length
  })
})

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Student Clubs API v3.0 - FIXED', 
    status: 'Running',
    timestamp: new Date().toISOString()
  })
})

export default app