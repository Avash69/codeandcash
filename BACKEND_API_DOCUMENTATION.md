# Backend API Documentation

## Overview

This document provides comprehensive information about the backend API endpoints, data fetching methods, and integration details for the Codexa frontend application.

## Backend Configuration

### Base URL

- **Production**: `process.env.VITE_API_URL`
- **Development**: `http://localhost:5002`
- **Port**: 5001

### Authentication

- **Type**: JWT Bearer Token
- **Header**: `Authorization: Bearer <token>`
- **Storage**: localStorage with key `token`

---

## API Client Architecture

### Base Service (`/src/api/baseService.jsx`)

The core HTTP client that handles all API communication.

```javascript
export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002";
```

#### Key Features:

- **Singleton Pattern**: Single instance for all API calls
- **Token Management**: Automatic token injection in headers
- **Error Handling**: Centralized error processing
- **Request Methods**: GET, POST, PUT, PATCH, DELETE
- **FormData Support**: Automatic content-type handling for file uploads

#### Authentication Headers:

```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

---

## Authentication Service (`/src/api/authService.jsx`)

### Login Endpoint

- **URL**: `POST /api/auth/login`
- **Purpose**: User authentication and token generation

#### Request Body:

```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

#### Response Format:

```json
{
  "status": "success",
  "token": "jwt_token_here",
  "data": {
    "user": {
      "id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "admin" // Note: Backend may not send this field
    }
  }
}
```

#### Special Handling:

- **Admin Role Fix**: Frontend patches missing role field for `admin@codeandcash.com`
- **Token Storage**: Automatic localStorage storage
- **Error Handling**: Comprehensive error message extraction

### Signup Endpoint

- **URL**: `POST /api/auth/register`
- **Purpose**: User registration

#### Request Body:

```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "securepassword"
}
```

#### Response Format:

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "new_user_id",
      "name": "New User",
      "email": "newuser@example.com"
    }
  },
  "token": "jwt_token_here"
}
```

#### Registration Flow:

1. User submits signup form
2. Backend creates account
3. Frontend shows success message
4. User redirected to login (no auto-login)

---

## Admin API Service (`/src/api/adminAPI.js` & `/src/api/adminService.js`)

### Admin Authentication

- **URL**: `GET /api/admin/check-access`
- **Purpose**: Verify admin privileges

### Dashboard Statistics

- **URL**: `GET /api/admin/stats`
- **Purpose**: Get dashboard overview data

#### Response Format:

```json
{
  "totalUsers": 150,
  "totalTasks": 45,
  "totalApplications": 89,
  "pendingApplications": 12,
  "activeUsers": 87,
  "completedTasks": 23
}
```

### Analytics Data

- **URL**: `GET /api/admin/analytics?period=30d`
- **Purpose**: Get platform analytics

#### Supported Periods:

- `7d` - Last 7 days
- `30d` - Last 30 days
- `90d` - Last 90 days
- `1y` - Last year

---

## User Management Endpoints

### Get Users

- **URL**: `GET /api/admin/users`
- **Purpose**: Fetch paginated user list

#### Query Parameters:

```
?page=1&limit=10&search=user@example.com&role=admin
```

#### Response Format:

```json
{
  "users": [
    {
      "id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "user",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00Z",
      "lastLogin": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalUsers": 150,
    "limit": 10
  }
}
```

### Get User by ID

- **URL**: `GET /api/admin/users/:id`
- **Purpose**: Get detailed user information

### Update User

- **URL**: `PUT /api/admin/users/:id`
- **Purpose**: Update user information

#### Request Body:

```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "admin",
  "status": "active"
}
```

### Delete User

- **URL**: `DELETE /api/admin/users/:id`
- **Purpose**: Remove user account

---

## Task Management Endpoints

### Get Tasks

- **URL**: `GET /api/admin/tasks`
- **Purpose**: Fetch paginated task list

#### Query Parameters:

```
?page=1&limit=10&search=task+title&status=active&category=development&difficulty=intermediate
```

#### Response Format:

```json
{
  "tasks": [
    {
      "id": "task_id",
      "title": "Task Title",
      "description": "Task description",
      "category": "development",
      "difficulty": "intermediate",
      "price": 500,
      "status": "active",
      "requirements": "Task requirements",
      "deliverables": "Expected deliverables",
      "timeframe": "1-2 weeks",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-02T00:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalTasks": 45,
    "limit": 10
  }
}
```

### Create Task

- **URL**: `POST /api/admin/tasks`
- **Purpose**: Create new task

#### Request Body:

```json
{
  "title": "New Task",
  "description": "Task description",
  "category": "development",
  "difficulty": "intermediate",
  "price": 500,
  "requirements": "Task requirements",
  "deliverables": "Expected deliverables",
  "timeframe": "1-2 weeks"
}
```

### Update Task

- **URL**: `PUT /api/admin/tasks/:id`
- **Purpose**: Update existing task

### Delete Task

- **URL**: `DELETE /api/admin/tasks/:id`
- **Purpose**: Remove task

### Bulk Operations

- **URL**: `POST /api/admin/tasks/bulk`
- **Purpose**: Bulk update/delete tasks

#### Request Body:

```json
{
  "action": "delete",
  "taskIds": ["task_id_1", "task_id_2"]
}
```

---

## Application Management Endpoints

### Get Applications

- **URL**: `GET /api/admin/applications`
- **Purpose**: Fetch task applications

#### Query Parameters:

```
?page=1&limit=10&status=pending&taskId=task_id
```

#### Response Format:

```json
{
  "applications": [
    {
      "id": "application_id",
      "taskId": "task_id",
      "userId": "user_id",
      "status": "pending",
      "proposal": "Application proposal",
      "estimatedCompletion": "2024-02-01T00:00:00Z",
      "createdAt": "2024-01-15T00:00:00Z",
      "user": {
        "id": "user_id",
        "name": "User Name",
        "email": "user@example.com"
      },
      "task": {
        "id": "task_id",
        "title": "Task Title",
        "price": 500
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalApplications": 25,
    "limit": 10
  }
}
```

### Update Application Status

- **URL**: `PUT /api/admin/applications/:id`
- **Purpose**: Approve/reject applications

#### Request Body:

```json
{
  "status": "accepted", // or "rejected"
  "feedback": "Application approved"
}
```

### Bulk Update Applications

- **URL**: `POST /api/admin/applications/bulk`
- **Purpose**: Bulk approve/reject applications

---

## Data Fetching Patterns

### 1. Service Layer Architecture

```javascript
// High-level service (adminService.js)
class AdminService {
  async getUsers(page, limit, filters) {
    // Business logic
    return await this.api.getUsers(page, limit, filters);
  }
}

// Low-level API client (adminAPI.js)
class AdminAPI {
  async getUsers(page, limit, search) {
    // HTTP request logic
    return await this.request(
      `/admin/users?page=${page}&limit=${limit}&search=${search}`
    );
  }
}
```

### 2. Error Handling Pattern

```javascript
// Centralized error handling
try {
  const response = await adminService.getUsers(1, 10, filters);
  setUsers(response.users);
} catch (error) {
  setError(error.message);
  console.error("Failed to fetch users:", error);
}
```

### 3. Token Management

```javascript
// Automatic token injection
const token = localStorage.getItem("token");
if (token) {
  adminService.updateToken(token);
}
```

### 4. Response Format Handling

```javascript
// Handle different response formats
if (response?.data?.users) {
  // Format: { data: { users: [...] } }
  setUsers(response.data.users);
} else if (response?.users) {
  // Format: { users: [...] }
  setUsers(response.users);
} else if (Array.isArray(response)) {
  // Format: [...]
  setUsers(response);
}
```

---

## Frontend Integration Points

### 1. Admin Layout (`/src/layouts/AdminLayout.jsx`)

- **Purpose**: Admin authentication and navigation
- **Key Features**:
  - Admin role verification
  - Token validation
  - Special handling for `admin@codeandcash.com`
  - Automatic role patching

### 2. Admin Dashboard (`/src/pages/admin/AdminDashboard.jsx`)

- **Data Sources**:
  - Dashboard statistics
  - Recent activity
  - System health metrics

### 3. Users Management (`/src/pages/admin/UsersManagement.jsx`)

- **Features**:
  - Paginated user list
  - Search and filters
  - User role management
  - Bulk operations

### 4. Tasks Management (`/src/pages/admin/TasksManagement.jsx`)

- **Features**:
  - Task CRUD operations
  - Status management
  - Category/difficulty filters
  - Bulk operations

### 5. Applications Management (`/src/pages/admin/ApplicationsManagement.jsx`)

- **Features**:
  - Application review
  - Status updates
  - Bulk approvals/rejections

---

## Error Handling Strategy

### 1. Network Errors

- Connection timeouts
- Server unavailability
- DNS resolution failures

### 2. HTTP Errors

- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 500 Internal Server Error

### 3. Data Validation Errors

- Invalid input formats
- Missing required fields
- Business rule violations

### 4. Authentication Errors

- Expired tokens
- Invalid credentials
- Insufficient permissions

---

## Environment Configuration

### Environment Variables

```bash
# Backend API URL
VITE_API_URL=http://localhost:5002

# Optional: API timeout
VITE_API_TIMEOUT=30000

# Optional: Enable debug mode
VITE_DEBUG=true
```

### Development Setup

1. Backend server runs on port 5001
2. Frontend dev server runs on port 5177
3. CORS must be configured for cross-origin requests

---

## Security Considerations

### 1. Token Security

- JWT tokens stored in localStorage
- Automatic token cleanup on logout
- Token expiration handling

### 2. Admin Access Control

- Role-based access control
- Admin email verification
- Fallback admin role assignment

### 3. Input Validation

- Client-side validation
- Server-side validation
- XSS protection

### 4. API Security

- HTTPS in production
- CORS configuration
- Rate limiting

---

## Performance Optimizations

### 1. Pagination

- Server-side pagination for large datasets
- Configurable page sizes
- Efficient data loading

### 2. Caching

- Client-side caching where appropriate
- Cache invalidation strategies
- Optimistic updates

### 3. Request Optimization

- Debounced search queries
- Bulk operations for efficiency
- Minimal data transfers

---

## Debugging and Monitoring

### 1. Logging

- Comprehensive console logging
- Error tracking
- Performance monitoring

### 2. Debug Tools

- `clear-storage.js` - Clear localStorage
- `admin-api-test.html` - API testing page
- `makeAdmin.js` - Admin role utility

### 3. Health Checks

- System status indicators
- API connectivity tests
- Real-time status updates

---

## Common Issues and Solutions

### 1. Admin Access Issues

- **Problem**: Admin role not recognized
- **Solution**: Use special handling for `admin@codeandcash.com`
- **Fallback**: Manual role assignment in frontend

### 2. Token Expiration

- **Problem**: 401 Unauthorized errors
- **Solution**: Implement token refresh mechanism
- **Fallback**: Redirect to login page

### 3. Data Format Inconsistencies

- **Problem**: Different response formats from backend
- **Solution**: Flexible response handling in frontend
- **Fallback**: Default values and error boundaries

### 4. CORS Issues

- **Problem**: Cross-origin request blocked
- **Solution**: Configure CORS in backend
- **Fallback**: Proxy configuration in development

---

## Future Enhancements

### 1. Real-time Updates

- WebSocket integration
- Live data synchronization
- Push notifications

### 2. Advanced Analytics

- Custom date ranges
- Export capabilities
- Visualization improvements

### 3. Enhanced Security

- Two-factor authentication
- Session management
- Audit logging

### 4. Performance Improvements

- GraphQL integration
- Advanced caching strategies
- CDN integration

---

## API Testing

### Manual Testing

- Use `admin-api-test.html` for endpoint testing
- Postman collection for comprehensive testing
- Browser developer tools for network inspection

### Automated Testing

- Jest for unit tests
- Cypress for integration tests
- Mock API for development

---

This documentation provides a comprehensive overview of the backend integration for the Codexa frontend application. It covers all aspects of API communication, data fetching, error handling, and security considerations.
