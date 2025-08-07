# EBM Quick Hits - Backend Setup and Usage

## 🗄️ Database and API Implementation

This document describes the complete backend implementation with SQL database, user management, and presentation CRUD operations.

## 📋 Database Schema

### Users Table
```sql
- id: string (primary key)
- email: string (unique)
- username: string (unique)
- password: string (hashed)
- userType: enum('ADMIN', 'END_USER')
- firstName: string (optional)
- lastName: string (optional)
- createdAt: datetime
- updatedAt: datetime
```

### Presentations Table
```sql
- id: string (primary key)
- title: string
- specialty: string
- summary: string
- authors: string (optional)
- journal: string (optional)
- year: string (optional)
- thumbnail: string (optional)
- viewerCount: number (default: 0)
- presentationFileUrl: string (optional)
- originalArticleUrl: string (optional)
- createdAt: datetime
- updatedAt: datetime
- createdBy: string (foreign key to users.id)
```

## 🚀 Setup Instructions

### 1. Install Dependencies (Already Done)
```bash
npm install prisma @prisma/client bcryptjs jsonwebtoken @types/bcryptjs @types/jsonwebtoken
```

### 2. Database Initialization (Already Done)
```bash
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
```

### 3. Environment Variables
The following environment variables are configured in `.env`:
- `DATABASE_URL="file:./dev.db"`
- `JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"`

## 🔗 API Endpoints

### Authentication Endpoints
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile

### User Management (Admin Only)
- `GET /api/users` - Get all users (paginated)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user by ID
- `DELETE /api/users/:id` - Delete user by ID

### Presentations
- `GET /api/presentations` - Get all presentations (public, paginated)
- `GET /api/presentations/:id` - Get presentation by ID
- `POST /api/presentations` - Create presentation (Admin only)
- `PUT /api/presentations/:id` - Update presentation (Admin only)
- `DELETE /api/presentations/:id` - Delete presentation (Admin only)
- `POST /api/presentations/:id/view` - Increment view count
- `GET /api/presentations/specialties` - Get unique specialties
- `GET /api/presentations/stats/overview` - Get statistics (Admin only)

### Health Check
- `GET /api/health` - Server health status

## 👤 Demo Credentials

### Admin User
- **Email:** admin@ebmquickhits.com
- **Password:** admin123
- **Type:** ADMIN

### Sample End User
- **Email:** user@example.com
- **Password:** user123
- **Type:** END_USER

## 💻 Frontend Integration

### Authentication
- Login modal appears when clicking "Admin Login" button
- JWT tokens are stored in localStorage
- Auto-refresh of user profile on app load
- Logout functionality clears tokens and user data

### Presentation Management
- Admin users can create, edit, and delete presentations via API
- Non-admin users fall back to localStorage for local changes
- View counts are tracked via API calls
- Real-time presentation loading from database

### API Service Layer
The frontend includes a comprehensive API service (`client/lib/api.ts`) with:
- Automatic JWT token handling
- Type-safe request/response interfaces
- Error handling and network retry logic
- Pagination support

## 🔧 Development Workflow

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Database Changes
When making schema changes:
```bash
# Update prisma/schema.prisma
npx prisma generate
npx prisma db push
```

### 3. Reseed Database
```bash
npx tsx prisma/seed.ts
```

## 🔒 Security Features

- **Password Hashing:** bcrypt with salt rounds
- **JWT Authentication:** Secure token-based auth
- **Admin Protection:** Route-level admin access control
- **Input Validation:** Zod schema validation
- **SQL Injection Prevention:** Prisma ORM protections

## 📊 Backend Features

- **User Types:** Admin and End User roles
- **CRUD Operations:** Full Create, Read, Update, Delete for both users and presentations
- **Pagination:** Efficient data loading with page/limit controls
- **Search & Filter:** Specialty filtering and text search
- **Statistics:** Admin dashboard with presentation analytics
- **View Tracking:** Automatic view count incrementing
- **Relationship Management:** User-presentation associations

## 🧪 Testing

You can test the API endpoints using:
- Frontend admin interface (login as admin)
- API testing tools (Postman, curl, etc.)
- Browser developer tools (Network tab)

## 📈 Production Considerations

For production deployment:
1. Change JWT_SECRET to a secure random string
2. Use PostgreSQL instead of SQLite for better performance
3. Add rate limiting and CORS configuration
4. Set up SSL/TLS encryption
5. Configure proper error logging and monitoring
