# SEACM Development Server Guide

## 🚀 Quick Start (Recommended)

### Option 1: Use the Automated Script
```powershell
.\start-clean.ps1
```
This will automatically:
- Kill existing Node.js processes
- Start backend and frontend in separate windows
- Handle port conflicts automatically

### Option 2: Manual Start (If you prefer VS Code terminal)
```powershell
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## 🔧 Troubleshooting

### Problem: "Port already in use" Error
**Solution:**
```powershell
# Kill all Node.js processes
taskkill /F /IM node.exe

# Or use PowerShell
Stop-Process -Name "node" -Force
```

### Problem: "package.json not found" Error
**Root Cause:** PowerShell directory navigation issues

**Solution:**
```powershell
# Always use absolute paths or verify location
pwd  # Check current directory
cd C:\Users\himan\OneDrive\Desktop\SEACM\frontend  # Use full path
npm run dev
```

### Problem: MongoDB Connection Issues
**Check:** 
- MongoDB service is running
- Connection string in `.env` file is correct
- Network connectivity

**Fallback:** Server runs in demo mode without MongoDB

## 📊 Server Status Check

```powershell
# Check if ports are in use
Test-NetConnection -ComputerName localhost -Port 3000  # Frontend
Test-NetConnection -ComputerName localhost -Port 5000  # Backend

# View running Node processes
Get-Process -Name "node"
```

## 🌐 Access URLs

- **Frontend:** http://localhost:3000 (or 3001 if 3000 is busy)
- **Backend API:** http://localhost:5000 (or 5001 if 5000 is busy)

## 🔑 Admin Login

- **Email:** connecthimanshu7@gmail.com
- **Password:** admin123
- **Google OAuth:** Automatic admin access with the same Gmail

## 📁 Project Structure

```
SEACM/
├── backend/          # Node.js/Express API
│   ├── src/
│   │   ├── server.js # Main server file
│   │   ├── models/   # MongoDB models
│   │   └── routes/   # API routes
│   └── package.json
├── frontend/         # React/Vite app
│   ├── src/
│   │   ├── App.jsx   # Main React component
│   │   ├── pages/    # Page components
│   │   └── components/ # Reusable components
│   └── package.json
└── start-clean.ps1   # Reliable startup script
```

## ⚡ Performance Tips

1. **Use the startup script** - It handles cleanup automatically
2. **Check ports** before starting manually
3. **Use separate terminals** for backend/frontend when debugging
4. **Monitor memory usage** with multiple Node processes

## 🛠️ Development Workflow

1. **Start servers:** `.\start-clean.ps1`
2. **Open browser:** http://localhost:3000
3. **Make changes:** Files auto-reload
4. **Test features:** Login, admin functions, theme
5. **Stop servers:** Close PowerShell windows or Ctrl+C

## 🔒 Security Notes

- Admin privileges are email-based
- Google OAuth integration for seamless login
- MongoDB connection with proper error handling
- Port conflict resolution built-in

---

**Last Updated:** October 1, 2025
**Status:** ✅ Fully Operational