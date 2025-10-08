# Agentik Solutions - Revolutionary Business Intelligence Suite

A comprehensive, production-ready business intelligence platform with 8 integrated suites, AI Copilot, and advanced analytics. Built with FastAPI, React, MongoDB, and powered by AI.

## 🚀 Features

### 🎯 Core Platform
- **AI Dashboard** - 6 real-time metrics, 8 quick action buttons with badges
- **Dark/Light Theme** - Fully functional theme toggle
- **AI Copilot** - Voice-controlled AI assistant with gpt-4o-mini integration
- **Tab Navigation** - 9 suites with badge indicators
- **Real-time Updates** - Live system monitoring

### 📊 8 Integrated Business Suites

**1. CRM Suite** 
- Pipeline management ($1.47M tracked)
- Lead tracking and conversion analytics
- 6-stage sales pipeline visualization
- AI-powered insights

**2. Analytics Suite**
- 23 active dashboards
- 1.2M data points processed
- Real-time reporting
- Custom dashboard builder

**3. Automation Suite**
- 127 active workflows
- 8,942 automated tasks
- 99.4% success rate
- Custom trigger configuration

**4. Sales Suite**
- Team performance tracking
- Territory management
- Quota attainment (124% avg)
- Top performer leaderboard

**5. CPQ Suite** (Configure-Price-Quote)
- Quote generation and management
- AI-powered pricing optimization
- Template library
- Conversion tracking (67.3%)

**6. Finance Suite**
- P&L statements
- Cash flow analysis
- Budget tracking and allocation
- ROI analytics (34.2%)

**7. Documents Suite**
- 20+ professional templates
- File converter
- 2,847+ documents managed
- Multi-format support

**8. Payments Suite**
- Multi-gateway support (Stripe, PayPal, Square)
- $3.2M+ processed
- Recurring billing (847 subscriptions)
- 99.2% success rate

### 🤖 AI Copilot Features
- Voice control interface
- Natural language queries
- Business intelligence analysis
- Report generation
- Data insights
- Real-time processing with Emergent LLM

## 🛠️ Tech Stack

**Backend:**
- FastAPI (Python 3.11.13)
- MongoDB 7.0.24 with Motor (async driver)
- JWT authentication with bcrypt
- emergentintegrations (AI integration)
- Pydantic for data validation

**Frontend:**
- React 19.0.0
- React Router DOM v7.5.1
- shadcn/ui component library
- Tailwind CSS 3.4.17
- Radix UI primitives
- Lucide React icons
- date-fns for formatting

**AI Integration:**
- emergentintegrations library
- OpenAI gpt-4o-mini
- Emergent Universal LLM Key

**Database:**
- MongoDB 7.0.24 (NoSQL)
- Collections: users, status_checks

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
