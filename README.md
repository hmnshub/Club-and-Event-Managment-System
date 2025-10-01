# Student Clubs & Event Registration System

A full-stack web application for managing student clubs and events in a university. The system supports two types of users: Admins and Students.

## Features

### Admin Panel
- Admin login with username and password
- Create, edit, and delete clubs and events
- Generate unique registration links
- View registered students for each club/event
- Export student lists as CSV
- Manage registration status (approve/reject)

### Student Portal
- Google OAuth 2.0 authentication
- Browse available clubs and events
- Register for clubs and events via forms
- Personal dashboard showing registered items
- View detailed information about clubs and events

## Tech Stack

### Frontend
- **React.js** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Axios** - HTTP client
- **CSS** - Custom responsive styling

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **Google Auth Library** - OAuth 2.0 integration
- **bcryptjs** - Password hashing

## Prerequisites

Before running this application, make sure you have:

1. **Node.js** (v16 or higher) and **npm** installed
2. **MongoDB** installed and running locally or MongoDB Atlas connection
3. **Google OAuth 2.0** credentials from Google Cloud Console

## Installation & Setup

### 1. Clone and Setup the Project

```bash
# Navigate to the project directory
cd c:\\SEACM

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

#### Backend Environment
1. Copy `backend/.env.example` to `backend/.env`
2. Update the environment variables:
   - Set `MONGODB_URI` to your MongoDB connection string
   - Set `JWT_SECRET` to a secure secret key
   - Set `GOOGLE_CLIENT_ID` to your Google OAuth client ID

#### Frontend Environment  
1. Copy `frontend/.env.example` to `frontend/.env`
2. Update `VITE_GOOGLE_CLIENT_ID` with your Google OAuth client ID

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins:
   - `http://localhost:3000` (frontend)
   - `http://localhost:5000` (backend)
6. Copy the Client ID to your environment files

### 4. Database Setup

The application will automatically create the necessary collections in MongoDB. For initial admin setup, you'll need to create an admin user manually in the database or create a seed script.

#### Create Initial Admin (MongoDB Shell)
```javascript
use student-clubs
db.admins.insertOne({
  username: "admin",
  email: "admin@university.edu",
  password: "$2b$10$hash-your-password-here", // Use bcryptjs to hash
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## Running the Application

### Development Mode

1. **Start the Backend Server:**
```bash
cd backend
npm run dev
```
The backend will run on http://localhost:5000

2. **Start the Frontend Development Server:**
```bash
cd frontend
npm run dev  
```
The frontend will run on http://localhost:3000

3. **Open your browser** and navigate to http://localhost:3000

### Production Mode

1. **Build the Frontend:**
```bash
cd frontend
npm run build
```

2. **Start the Backend:**
```bash
cd backend
npm start
```

## Project Structure

```
c:\\SEACM\\
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── public/             # Static assets
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
│
├── backend/                 # Node.js backend application  
│   ├── src/
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Authentication middleware
│   │   └── server.js       # Main server file
│   ├── package.json        # Backend dependencies
│   └── .env.example        # Environment variables template
│
└── README.md               # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/student/google` - Student Google OAuth login
- `POST /api/auth/student/profile` - Update student profile

### Clubs
- `GET /api/clubs` - Get all active clubs
- `GET /api/clubs/:id` - Get club by ID or registration link
- `POST /api/clubs` - Create new club (admin only)
- `PUT /api/clubs/:id` - Update club (admin only)
- `DELETE /api/clubs/:id` - Delete club (admin only)
- `POST /api/clubs/:id/generate-link` - Generate registration link (admin only)

### Events
- `GET /api/events` - Get all active events
- `GET /api/events/:id` - Get event by ID or registration link
- `POST /api/events` - Create new event (admin only)
- `PUT /api/events/:id` - Update event (admin only)
- `DELETE /api/events/:id` - Delete event (admin only)
- `POST /api/events/:id/generate-link` - Generate registration link (admin only)

### Registrations
- `POST /api/registrations/club/:id` - Register for club (student only)
- `POST /api/registrations/event/:id` - Register for event (student only)
- `GET /api/registrations/my-registrations` - Get student's registrations
- `PUT /api/registrations/:type/:id/status` - Update registration status (admin only)
- `GET /api/registrations/:type/:id/export/csv` - Export registrations (admin only)

## Usage

### For Admins
1. Login with admin credentials at `/admin-login`
2. Navigate to the Admin Dashboard
3. Create clubs and events using the forms
4. Generate registration links to share with students
5. View registered students and export lists
6. Manage registration status (approve/reject)

### For Students
1. Login with Google account at `/student-login`
2. Complete profile if first-time user
3. Browse available clubs and events
4. Click registration links or use the dashboard
5. View registered items in personal dashboard

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Google OAuth 2.0 integration
- CORS protection
- Input validation and sanitization
- Protected API routes with middleware

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running locally
   - Check connection string in `.env` file
   - Verify database permissions

2. **Google OAuth Not Working**
   - Verify Google Client ID in environment files
   - Check authorized origins in Google Cloud Console
   - Ensure Google Sign-In library is loaded

3. **CORS Errors**
   - Check `FRONTEND_URL` in backend `.env`
   - Verify port configurations match

4. **Build Errors**
   - Run `npm install` in both directories
   - Check Node.js version compatibility
   - Clear node_modules and reinstall if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please create an issue in the project repository or contact the development team.
