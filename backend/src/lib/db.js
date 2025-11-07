import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  // Do not crash in Vercel build step; throw on first connect
  console.warn('[DB] MONGODB_URI is not set in environment')
}

let cached = global._mongoose
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null }
}

export default async function dbConnect() {
  if (cached.conn) return cached.conn
  if (!MONGODB_URI) throw new Error('MONGODB_URI is missing')
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      })
      .then((m) => m)
  }
  cached.conn = await cached.promise
  return cached.conn
}

export function dbReadyState() {
  return mongoose.connection.readyState // 0:disconnected,1:connected,2:connecting,3:disconnecting
}
