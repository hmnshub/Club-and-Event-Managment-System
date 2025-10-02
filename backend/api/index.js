// Vercel serverless function entry point
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import authRoutes from '../src/routes/auth.js'
import clubRoutes from '../src/routes/clubs.js'
import eventRoutes from '../src/routes/events.js'

dotenv.config()

const app = express()

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
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-clubs'

if (process.env.MONGODB_URI) {
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ Successfully connected to MongoDB')
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message)
  })
}

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/clubs', clubRoutes)
app.use('/api/events', eventRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is working!' })
})

// DB Health check
app.get('/api/health/db', (req, res) => {
  // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
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
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

export default app