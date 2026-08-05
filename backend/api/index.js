import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dbConnect, { dbReadyState } from '../src/lib/db.js'
import authRoutes from '../src/routes/auth.js'
import clubRoutes from '../src/routes/clubs.js'
import eventRoutes from '../src/routes/events.js'
import registrationRoutes from '../src/routes/registrations.js'
import simpleRegister from './simple-register.js'

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

// Do not eagerly connect at module load (serverless cold starts shouldn't
// block on it), but do make sure a connection exists before any route
// handler runs. clubs.js/events.js query MongoDB directly without calling
// dbConnect() themselves — unlike the local dev server (src/server.js),
// this serverless entrypoint never connects eagerly, so without this the
// first request to hit /api/clubs or /api/events before /api/auth would
// just hang against an unconnected Mongoose default connection.
app.use(async (req, res, next) => {
  try {
    if (process.env.MONGODB_URI) await dbConnect()
  } catch (err) {
    console.error('DB connect middleware error:', err.message)
  }
  next()
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/clubs', clubRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/registrations', registrationRoutes)

// Simple serverless-native registration endpoint also exposed via Express
app.options('/api/simple-register', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return res.status(200).end()
})

app.post('/api/simple-register', async (req, res) => {
  return simpleRegister(req, res)
})

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