// Vercel serverless function entry point
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import authRoutes from '../src/routes/auth.js'
import clubRoutes from '../src/routes/clubs.js'
import eventRoutes from '../src/routes/events.js'

// Load environment variables
dotenv.config({ path: '../.env' })

const app = express()

// Trust proxy for Vercel
app.set('trust proxy', 1)

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:5173',
    'http://localhost:5174',
    // Add Vercel domains
    /^https:\/\/.*\.vercel\.app$/,
    /^https:\/\/club-and-event-management-system.*\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Connect to MongoDB (only if not already connected)
const MONGODB_URI = process.env.MONGODB_URI

let isConnected = false

const connectToDatabase = async () => {
  if (isConnected) {
    return
  }

  try {
    if (MONGODB_URI) {
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        bufferCommands: false,
        maxPoolSize: 10,
      })
      isConnected = true
      console.log('✅ Connected to MongoDB')
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
  }
}

// Connect to database
connectToDatabase()

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/clubs', clubRoutes)
app.use('/api/events', eventRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API is working!',
    timestamp: new Date().toISOString()
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