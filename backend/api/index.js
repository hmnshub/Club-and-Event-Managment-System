// Vercel serverless function entry point
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import authRoutes from '../src/routes/auth.js'
import clubRoutes from '../src/routes/clubs.js'
import eventRoutes from '../src/routes/events.js'

// Load environment variables (Vercel handles this automatically)
dotenv.config()

const app = express()

// Trust proxy for Vercel
app.set('trust proxy', 1)

// CORS configuration - Allow all origins for Vercel deployment
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}))

// Handle preflight requests
app.options('*', cors())

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Connect to MongoDB (only if not already connected)
const MONGODB_URI = process.env.MONGODB_URI

// Debug logging
console.log('Environment check:')
console.log('- MONGODB_URI exists:', !!MONGODB_URI)
console.log('- MONGODB_URI length:', MONGODB_URI ? MONGODB_URI.length : 0)
console.log('- MONGODB_URI prefix:', MONGODB_URI ? MONGODB_URI.substring(0, 30) : 'none')

let isConnected = false
let isConnecting = false

const connectToDatabase = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return true
  }

  if (isConnecting) {
    // Wait for ongoing connection
    let attempts = 0
    while (isConnecting && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
    return mongoose.connection.readyState === 1
  }

  isConnecting = true

  try {
    if (MONGODB_URI) {
      console.log('Attempting MongoDB connection...')
      
      // Close existing connection if any
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect()
      }
      
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      })
      isConnected = true
      isConnecting = false
      console.log('✅ Connected to MongoDB')
      return true
    } else {
      console.log('⚠️ No MONGODB_URI provided')
      isConnecting = false
      return false
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    console.error('Error details:', error)
    isConnecting = false
    isConnected = false
    return false
  }
}

// Middleware to ensure DB connection before handling requests
app.use(async (req, res, next) => {
  await connectToDatabase()
  next()
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/clubs', clubRoutes)
app.use('/api/events', eventRoutes)

// Root route for basic check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Student Clubs & Events API v1.0', 
    status: 'Running',
    timestamp: new Date().toISOString(),
    endpoints: ['/api/auth', '/api/clubs', '/api/events', '/api/health']
  })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  })
})

// DB Health check
app.get('/api/health/db', (req, res) => {
  const state = mongoose.connection.readyState
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting']
  res.json({
    status: states[state] || String(state),
    readyState: state,
    hasUri: Boolean(process.env.MONGODB_URI),
    uriPrefix: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'none'
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' })
})

export default app