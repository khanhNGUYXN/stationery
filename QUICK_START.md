# 🚀 Quick Start Guide

## Prerequisites

- **Java 17+** (for backend)
- **Node.js 18+** (for frontend)
- **Docker & Docker Compose** (for database and mail services)
- **Git**

## 🏃‍♂️ Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd stationery

# Initial setup (this will take a few minutes)
make setup
```

### 2. Start Development Environment

```bash
# Start all services
make dev
```

This will start:

- **Backend**: http://localhost:8080
- **Frontend**: http://localhost:3000
- **Database**: http://localhost:5432
- **MailHog**: http://localhost:8025

### 3. Access the Application

1. Open http://localhost:3000 in your browser
2. Login with one of the demo accounts:

| Role              | Username   | Password      |
| ----------------- | ---------- | ------------- |
| Engineer          | `engineer` | `password123` |
| Manager           | `manager`  | `password123` |
| Business Manager  | `bm`       | `password123` |
| Managing Director | `md`       | `password123` |

## 🛠️ Manual Setup (Alternative)

If you prefer to set up manually:

### Backend Setup

```bash
cd backend-java

# Start database
docker compose up -d db mailhog

# Build and run
./gradlew bootRun
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📁 Project Structure

```
stationery/
├── backend-java/          # Spring Boot 3 Backend
│   ├── src/main/java/     # Java source code
│   ├── src/main/resources/ # Configuration & migrations
│   └── build.gradle       # Build configuration
├── frontend/              # Next.js 14 Frontend
│   ├── app/               # App Router pages
│   ├── components/        # React components
│   └── package.json       # Dependencies
├── docker-compose.yml     # Database & services
└── Makefile              # Development commands
```

## 🔧 Available Commands

```bash
make help          # Show all available commands
make setup         # Initial setup
make dev           # Start development environment
make start-db      # Start database only
make start-backend # Start backend only
make start-frontend # Start frontend only
make stop          # Stop all services
make clean         # Clean up everything
make logs          # Show service logs
make reset-db      # Reset database
```

## 🧪 Testing the System

### 1. Login Flow

- Visit http://localhost:3000
- Login with any demo account
- You'll be redirected to the dashboard

### 2. Stationery Management

- Browse stationery items
- Create requests for items
- View request status

### 3. Approval Workflow

- Login as a manager/approver
- Check approval inbox
- Approve/reject requests

### 4. Email Testing

- Visit http://localhost:8025 (MailHog)
- View all sent emails
- Test email notifications

## 🔍 API Documentation

Once the backend is running:

- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **OpenAPI Spec**: http://localhost:8080/api/api-docs

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Reset database
make reset-db

# Check database logs
docker compose logs db
```

### Backend Issues

```bash
# Clean and rebuild
cd backend-java
./gradlew clean build
```

### Frontend Issues

```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules .next
npm install
```

### Port Conflicts

If ports are already in use:

- Backend: Change port in `backend-java/src/main/resources/application.yml`
- Frontend: Change port in `frontend/package.json` scripts
- Database: Change port in `docker-compose.yml`

## 📚 Next Steps

1. **Explore the Codebase**: Check out the well-documented source code
2. **Add Features**: Extend the system with new functionality
3. **Customize UI**: Modify the frontend components and styling
4. **Deploy**: Set up production deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
