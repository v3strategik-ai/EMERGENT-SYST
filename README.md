# SystemIX AI Ultimate - Revolutionary Business Intelligence Suite

A comprehensive, production-ready business intelligence platform with 8 integrated suites, AI Copilot, and advanced analytics. Built with FastAPI, React, MongoDB, and powered by AI.

## 🚀 Features

### For Employees
- Submit status checks with priority levels, categories, and detailed descriptions
- View personal status history
- Edit and delete own submissions
- Quick stats dashboard
- Real-time updates

### For Admins
- Comprehensive analytics dashboard
- View all status checks from all users
- Advanced filtering by category, priority, and status type
- User management
- Visual data representations with charts
- Real-time activity monitoring

### Core Features
- JWT-based authentication
- Role-based access control (Employee/Admin)
- Secure password hashing with bcrypt
- Protected API routes
- Modern, responsive UI with Tailwind CSS
- Real-time toast notifications
- Production-ready MongoDB integration

## 🛠️ Tech Stack

**Backend:**
- FastAPI (Python 3.11)
- MongoDB with Motor (async driver)
- JWT authentication
- Pydantic for data validation
- bcrypt for password hashing

**Frontend:**
- React 19
- React Router DOM v7
- shadcn/ui components
- Tailwind CSS
- Axios for API calls
- date-fns for date formatting

**Database:**
- MongoDB 7.0.24

## 📦 Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 20+
- MongoDB 7.0+
- Yarn 1.22+

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

### Frontend Setup
```bash
cd frontend
yarn install
```

## 🚀 Running the Application

All services are managed by supervisor:

```bash
# Restart all services
sudo supervisorctl restart all

# Check status
sudo supervisorctl status

# Individual service control
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
```

Services will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8001
- **API Docs:** http://localhost:8001/docs

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Status Checks
- `POST /api/status` - Create status check
- `GET /api/status` - Get all status checks (filtered by role)
- `GET /api/status/my` - Get user's own status checks
- `GET /api/status/{id}` - Get specific status check
- `PUT /api/status/{id}` - Update status check
- `DELETE /api/status/{id}` - Delete status check

### Admin Only
- `GET /api/admin/users` - Get all users
- `GET /api/admin/analytics` - Get analytics data

## 🎨 User Roles

1. **Employee**
   - Can submit, edit, and delete their own status checks
   - View personal dashboard with stats
   - Limited to viewing only their own submissions

2. **Admin**
   - Full access to all status checks
   - Advanced analytics dashboard
   - User management capabilities
   - System-wide visibility

## 🔐 Environment Variables

**Backend (.env):**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
CORS_ORIGINS=*
JWT_SECRET_KEY=your-secret-key-change-in-production
```

**Frontend (.env):**
```env
REACT_APP_BACKEND_URL=https://your-domain.com
WDS_SOCKET_PORT=443
```

## 📊 Database Schema

### Users Collection
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "role": "employee|admin",
  "password": "hashed_password",
  "created_at": "ISO timestamp"
}
```

### Status Checks Collection
```json
{
  "id": "uuid",
  "title": "Status Check Title",
  "description": "Detailed description",
  "category": "System|Application|Database|Network|Security|Other",
  "priority": "Low|Medium|High|Critical",
  "status_type": "Operational|Degraded|Down",
  "user_id": "uuid",
  "user_name": "User Name",
  "user_email": "user@example.com",
  "timestamp": "ISO timestamp"
}
```

## 🧪 Testing

Test users created for development:
- **Admin:** admin@test.com / admin123
- **Employee:** employee@test.com / emp123

## 🎯 Key Features Implementation

- **Authentication Flow:** JWT tokens stored in localStorage with automatic API interceptor
- **Protected Routes:** React Router guards based on user role
- **Role-Based Filtering:** Backend automatically filters data based on user role
- **Real-time Updates:** Hot reload enabled for both frontend and backend
- **Error Handling:** Comprehensive error handling with user-friendly toast notifications
- **Responsive Design:** Mobile-friendly UI with Tailwind CSS
- **Data Validation:** Pydantic models ensure data integrity
- **Security:** Password hashing, JWT expiration, role-based access control

## 🚢 Deployment on Emergent Platform

This application is ready for deployment on the Emergent platform:

1. All services are configured with supervisor
2. Backend runs on port 8001 with `/api` prefix (Kubernetes ingress compatible)
3. Frontend uses environment variable for backend URL
4. MongoDB connection is environment-based
5. CORS properly configured
6. All routes follow Kubernetes ingress rules

## 📝 License

Built with ❤️ on Emergent Platform

---

**Ready for Production** ✅
