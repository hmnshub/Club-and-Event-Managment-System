#!/bin/bash
echo "Starting Student Clubs & Events System..."

# Start backend
cd C:/SEACM/backend
echo "Starting backend server..."
node src/server.js &

# Wait a moment
sleep 2

# Start frontend  
cd ../frontend
echo "Starting frontend server..."
npm run dev &

echo "Both servers are starting..."
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000 (or next available port)"

# Keep script running
wait
