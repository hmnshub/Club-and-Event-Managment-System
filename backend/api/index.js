import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
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

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI).catch(console.error)
}

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

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Student Clubs API', status: 'Running' })
})

export default app