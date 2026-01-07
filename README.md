# Code and Cash - Frontend

A modern React-based frontend application for a task management platform where users can create, manage, and apply for coding tasks.

## 🚀 Features

- **Authentication System**: Login, registration, and profile management
- **Task Management**: Create, explore, and apply for coding tasks
- **Admin Panel**: Task management and user administration
- **Responsive Design**: Modern UI with Tailwind CSS
- **Animation**: Smooth animations with Framer Motion
- **State Management**: Context API for global state

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Routing**: React Router DOM
- **State Management**: React Context API

## 📁 Project Structure

```
src/
├── api/                    # API service layer
│   ├── authService.jsx     # Authentication API calls
│   ├── baseService.jsx     # Base API configuration
│   ├── taskService.js      # Task-related API calls
│   └── userService.js      # User-related API calls
├── components/             # Reusable components
│   ├── animations.jsx      # Animation components
│   ├── AnimatedCubes.jsx   # 3D cube animations
│   ├── ScrollAnimation.jsx # Scroll-based animations
│   ├── common/            # Common components
│   │   ├── Header.jsx     # Navigation header
│   │   └── Footer.jsx     # Page footer
│   ├── modals/            # Modal components
│   │   ├── ApproveTaskModal.jsx
│   │   └── CreateTaskModal.jsx
│   └── ui/                # UI components
│       ├── EmptyState.jsx
│       ├── StatCard.jsx
│       ├── TabButton.jsx
│       ├── TaskCard.jsx
│       └── TaskStatusBadge.jsx
├── constants/             # Application constants
│   ├── animationConstants.js
│   ├── appConstants.js
│   ├── taskConstants.js
│   └── index.js
├── context/               # React Context providers
│   ├── TaskContext.jsx
│   ├── TaskProvider.jsx
│   └── useTaskContext.jsx
├── hooks/                 # Custom React hooks
│   ├── useApi.js
│   ├── useAuth.js
│   ├── useLocalStorage.js
│   └── useTasks.js
├── layouts/               # Layout components
│   ├── AdminLayout.jsx
│   ├── AuthLayout.jsx
│   └── MainLayout.jsx
├── pages/                 # Page components
│   ├── Dashboard.jsx
│   ├── Profile.jsx
│   ├── admin/
│   │   └── TaskManagement.jsx
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   └── tasks/
│       ├── Applytask.jsx
│       ├── Exploretask.jsx
│       └── TaskDetails.jsx
├── routes/                # Route configuration
│   └── index.jsx
├── styles/                # Styling utilities
│   ├── customStyles.jsx
│   └── index.css
└── utils/                 # Utility functions
    ├── taskUtils.jsx
    └── index.js
```

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd code-and-cash
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   VITE_API_URL=http://localhost:5002
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🌐 Backend Integration

This frontend is designed to work with a separate backend service. The API endpoints are configured in `src/constants/appConstants.js` and the base API service is in `src/api/baseService.jsx`.

### API Endpoints

- **Authentication**: `/api/auth/login`, `/api/auth/register`
- **Profile**: `/api/profile`
- **Tasks**: `/api/tasks`
- **Users**: `/api/users`

Configure your backend URL in the environment variable `VITE_API_URL`.

## 🎨 Styling

The application uses Tailwind CSS with custom color schemes defined in `tailwind.config.js`:

- **Primary Colors**: Navy, Purple variations
- **Status Colors**: Success, Warning, Error states
- **Custom Animations**: Smooth transitions and hover effects

## 🔄 State Management

The application uses React Context API for state management:

- **TaskContext**: Manages task-related state
- **AuthContext**: Handles authentication state
- **LocalStorage**: Persists user data and preferences

## 📱 Responsive Design

The application is fully responsive and works on:

- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (below 768px)

## 🚀 Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🧪 Development

```bash
# Start development server
npm run dev

# Run linting
npm run lint
```

## 📄 License

This project is licensed under the MIT License.
