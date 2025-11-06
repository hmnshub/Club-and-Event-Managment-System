// Simple MongoDB connection test for Vercel
import mongoose from 'mongoose'

export default async function handler(req, res) {
  try {
    // Use the exact connection string
    const MONGODB_URI = process.env.MONGODB_URI
    
    if (!MONGODB_URI) {
      return res.status(500).json({ 
        error: 'MONGODB_URI not found',
        env: Object.keys(process.env).filter(key => key.includes('MONGO'))
      })
    }

    console.log('Connecting to MongoDB...')
    console.log('URI exists:', !!MONGODB_URI)
    console.log('URI length:', MONGODB_URI.length)
    
    // Force new connection
    if (mongoose.connections[0].readyState) {
      await mongoose.disconnect()
    }
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    })
    
    console.log('MongoDB connected successfully!')
    
    res.json({
      success: true,
      message: 'MongoDB connected successfully!',
      connectionState: mongoose.connection.readyState,
      dbName: mongoose.connection.db?.databaseName
    })
    
  } catch (error) {
    console.error('MongoDB connection failed:', error)
    res.status(500).json({
      error: 'MongoDB connection failed',
      details: error.message,
      stack: error.stack
    })
  }
}