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