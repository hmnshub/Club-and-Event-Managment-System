import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import authRoutes from './routes/auth.js'
import clubRoutes from './routes/clubs.js'
import eventRoutes from './routes/events.js'
// import registrationRoutes from './routes/registrations.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/clubs', clubRoutes)
app.use('/api/events', eventRoutes)
// app.use('/api/registrations', registrationRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
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

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-clubs'

if (process.env.MONGODB_URI) {
  console.log('Attempting to connect to MongoDB...')
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ Successfully connected to MongoDB')
    startServer()
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message)
    console.log('Starting server in demo mode without MongoDB...')
    startServer()
  })
} else {
  console.log('No MONGODB_URI provided - starting server in demo mode')
  startServer()
}

function startServer() {
  const server = app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`)
    console.log(`🌐 API available at: http://localhost:${PORT}`)
  })

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use!`)
      console.log('🔄 Trying to find an alternative port...')
      
      // Try alternative ports
      const altPort = PORT + 1
      const altServer = app.listen(altPort, () => {
        console.log(`✅ Server running on alternative port ${altPort}`)
        console.log(`🌐 API available at: http://localhost:${altPort}`)
      })
      
      altServer.on('error', (altError) => {
        console.error('❌ Failed to start server on alternative port:', altError.message)
        process.exit(1)
      })
    } else {
      console.error('❌ Server error:', error.message)
      process.exit(1)
    }
  })
}
