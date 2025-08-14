# 🧠 Stationery Management System

Hệ thống quản lý văn phòng phẩm cho HMT Technologies - giảm thất thoát, theo dõi tồn kho, tối ưu cung/cầu, báo cáo chi phí.

## 🏗️ Kiến trúc

- **Backend**: Java Spring Boot 3 + ASP.NET Core 8 (cả hai phiên bản)
- **Frontend**: Next.js 14 + TypeScript + TailwindCSS + shadcn/ui
- **Database**: PostgreSQL
- **Authentication**: JWT + RBAC
- **Notifications**: Real-time + Email

## 🚀 Quick Start

### Java Version

```bash
# Backend
cd backend-java
docker compose up -d db mailhog
./gradlew :api:bootRun

# Frontend
cd frontend
npm install
npm run dev
```

### .NET Version

```bash
# Backend
cd backend-dotnet
docker compose up -d db mailhog
dotnet ef database update
dotnet run --project src/Api

# Frontend
cd frontend
npm install
npm run dev
```

## 📋 Features

- ✅ RBAC với hierarchy (Engineer → Manager → Business Manager → MD)
- ✅ Request/Approval workflow
- ✅ Real-time notifications
- ✅ Product detail pages với eligibility check
- ✅ Reports & Analytics
- ✅ Help/FAQ system
- ✅ Audit trail
- ✅ Responsive UI với dark mode

## 🗂️ Project Structure

```
stationery/
├── backend-java/          # Spring Boot 3
├── backend-dotnet/        # ASP.NET Core 8
├── frontend/              # Next.js 14
├── docs/                  # Architecture docs
└── docker-compose.yml     # Shared services
```

## 🔐 Default Users

- **Engineer**: engineer@hmt.com / password123
- **Manager**: manager@hmt.com / password123
- **Business Manager**: bm@hmt.com / password123
- **MD**: md@hmt.com / password123
