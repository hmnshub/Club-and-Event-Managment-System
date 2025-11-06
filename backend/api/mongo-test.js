// MongoDB connection diagnostic
import mongoose from 'mongoose'

export default async function handler(req, res) {
  try {
    console.log('=== MongoDB Diagnostic ===')
    
    // Check environment variables
    const MONGODB_URI = process.env.MONGODB_URI
    console.log('1. MONGODB_URI exists:', !!MONGODB_URI)
    console.log('2. MONGODB_URI length:', MONGODB_URI ? MONGODB_URI.length : 0)
    console.log('3. MONGODB_URI starts with:', MONGODB_URI ? MONGODB_URI.substring(0, 30) : 'none')
    
    // Check current connection state
    console.log('4. Current connection state:', mongoose.connection.readyState)
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting']
    console.log('5. State meaning:', states[mongoose.connection.readyState] || 'unknown')
    
    if (!MONGODB_URI) {
      return res.status(500).json({
        error: 'MONGODB_URI environment variable not found',
        availableEnvVars: Object.keys(process.env).filter(key => 
          key.toLowerCase().includes('mongo') || key.toLowerCase().includes('db')
        )
      })
    }
    
    // Try to connect
    console.log('6. Attempting connection...')
    
    // Disconnect first if needed
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }
    
    const startTime = Date.now()
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    })
    const connectTime = Date.now() - startTime
    
    console.log('7. Connection successful in', connectTime, 'ms')
    console.log('8. Database name:', mongoose.connection.db?.databaseName)
    
    res.json({
      success: true,
      message: 'MongoDB connected successfully!',
      details: {
        connectionTime: connectTime + 'ms',
        databaseName: mongoose.connection.db?.databaseName,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        readyState: mongoose.connection.readyState
      }
    })
    
  } catch (error) {
    console.error('MongoDB connection failed:', error)
    
    res.status(500).json({
      error: 'MongoDB connection failed',
      message: error.message,
      code: error.code,
      codeName: error.codeName,
      stack: error.stack?.split('\n').slice(0, 5)
    })
  }
}