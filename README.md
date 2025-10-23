<div align="center">

# 🍽️ CosyPOS - Modern Restaurant Management System

![CosyPOS Demo Dashboard](https://raw.githubusercontent.com/Brainstorm-collab/cosyposy-duplicate/main/frontend-deploy/public/demo-cosypos.png)

**A comprehensive, full-stack restaurant Point of Sale (POS) system with real-time synchronization, role-based access control, and modern UI/UX**

[![Node.js](https://img.shields.io/badge/Node.js-22.16.0-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Demo](#-demo)
- [Installation](#-installation)
- [Project Structure](#-project-structure)
- [User Roles](#-user-roles)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

CosyPOS is a modern, feature-rich restaurant management system designed to streamline operations for restaurants, cafes, and food service businesses. Built with cutting-edge technologies, it offers real-time order management, inventory tracking, staff management, and comprehensive analytics.

### Why CosyPOS?

- ✨ **Modern UI/UX** - Sleek, intuitive interface with responsive design
- ⚡ **Real-time Sync** - Live data updates across all devices
- 🔐 **Secure** - JWT authentication with role-based access control
- 📱 **Mobile Ready** - Fully responsive design for tablets and phones
- 🚀 **Performance** - Optimized with caching and performance monitoring
- 🎨 **Customizable** - Easy to extend and customize for your needs

---

## ✨ Features

### 📊 **Dashboard**
- Real-time business metrics and KPIs
- Sales overview and trends
- Quick access to critical functions
- Performance analytics

### 🍔 **Menu Management**
- Dynamic menu with categories
- Image upload for menu items
- Price management
- Availability tracking
- Menu item search and filtering

### 🛒 **Order Management**
- Complete order workflow (Pending → Preparing → Ready → Completed)
- Table management system
- Order history and tracking
- Real-time order updates
- Order status notifications

### 📅 **Reservation System**
- Table booking and management
- Customer information tracking
- Reservation status (Pending, Confirmed, Cancelled)
- Date and time slot management
- Capacity management

### 👥 **Staff Management**
- Employee profiles and roles
- Attendance tracking
- Staff status management (Present, Absent, Half-day, Leave)
- Performance monitoring
- Access control per staff member

### 📦 **Inventory Management**
- Stock level tracking
- Low stock alerts
- Inventory categories
- Batch management
- Supplier information
- Auto-reorder suggestions

### 📈 **Reports & Analytics**
- Sales reports
- Revenue analytics
- Popular items tracking
- Staff performance reports
- Inventory reports
- Custom date range filtering

### 👤 **User Management**
- Role-based access control (ADMIN, STAFF, USER)
- Profile management
- Permission management
- User activity tracking

### 🔔 **Additional Features**
- Real-time data synchronization
- Session management with auto-refresh
- Toast notifications
- Image upload and management
- Data export capabilities
- Performance monitoring
- Mobile-responsive design
- Dark theme UI

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Context API** - State management
- **React Icons** - Icon library
- **Custom CSS** - Styling with animations

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Primary database
- **JWT** - Authentication
- **Multer** - File upload handling
- **bcryptjs** - Password hashing
- **cors** - Cross-origin resource sharing

### DevOps & Tools
- **Git** - Version control
- **ESLint** - Code linting
- **Render.com** - Deployment platform
- **Prisma Studio** - Database GUI

---

## 🎬 Demo

### Live Demo
> 🚀 **Coming Soon** - Deployed on Render.com

### Default Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@cosypos.app | pass123 |
| **Staff** | staff@cosypos.app | staff123 |
| **Customer** | customer@cosypos.app | customer123 |

### Screenshots

<details>
<summary>Click to view screenshots</summary>

#### Dashboard
![Dashboard](https://raw.githubusercontent.com/Brainstorm-collab/cosyposy-duplicate/main/frontend-deploy/public/demo-cosypos.png)

#### Menu Management
*Screenshot coming soon*

#### Order Processing
*Screenshot coming soon*

#### Inventory Tracking
*Screenshot coming soon*

</details>

---

## 🚀 Installation

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v22.16.0 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v14 or higher)
- **Git**

### Local Development Setup

#### 1️⃣ Clone the Repository

   ```bash
git clone https://github.com/yourusername/cosypos.git
cd cosypos/cosypos-clean
   ```

#### 2️⃣ Backend Setup

   ```bash
   cd backend-deploy

# Install dependencies
   npm install

# Create environment file
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL=postgresql://username:password@localhost:5432/cosypos
# JWT_SECRET=your-secret-key-here
# PORT=4000

# Generate Prisma Client
   npx prisma generate

# Push database schema
   npx prisma db push

# Seed the database with initial data
   npm run seed

# Start backend server
   npm run dev
   ```

Backend will run on `http://localhost:4000`

#### 3️⃣ Frontend Setup

Open a new terminal:

   ```bash
   cd frontend-deploy

# Install dependencies
   npm install

# Create environment file
cp .env.example .env

# Edit .env with your backend URL
# VITE_API_URL=http://localhost:4000

# Start frontend dev server
   npm run dev
   ```

Frontend will run on `http://localhost:5173`

#### 4️⃣ Access the Application

Open your browser and navigate to:
- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:4000`

Login with default credentials (see [Demo section](#-demo))

---

## 📁 Project Structure

```
cosypos-clean/
│
├── backend-deploy/              # Backend application
│   ├── src/
│   │   ├── routes/             # API routes
│   │   │   ├── auth.js         # Authentication endpoints
│   │   │   ├── menu.js         # Menu management
│   │   │   ├── orders.js       # Order processing
│   │   │   ├── reservations.js # Reservation system
│   │   │   ├── staff.js        # Staff management
│   │   │   ├── inventory.js    # Inventory tracking
│   │   │   ├── users.js        # User management
│   │   │   └── attendance.js   # Attendance tracking
│   │   │
│   │   ├── middleware/         # Express middlewares
│   │   │   ├── auth.js         # JWT authentication
│   │   │   └── etag-cache.js   # Caching middleware
│   │   │
│   │   ├── lib/                # Utility libraries
│   │   │   └── prisma.js       # Prisma client singleton
│   │   │
│   │   ├── index.js            # Express app entry point
│   │   ├── db.js               # Database utilities
│   │   ├── cache.js            # Caching system
│   │   └── seed.js             # Database seeding script
│   │
│   ├── prisma/
│   │   └── schema.prisma       # Database schema definition
│   │
│   ├── uploads/                # Uploaded files (images)
│   │   ├── categories/
│   │   ├── menu-items/
│   │   └── profiles/
│   │
│   └── package.json
│
├── frontend-deploy/            # Frontend application
│   ├── src/
│   │   ├── pages/             # React components/pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Menu.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Reservation.jsx
│   │   │   ├── Staff.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Layout.jsx
│   │   │   └── UserContext.jsx  # Auth context
│   │   │
│   │   ├── components/        # Reusable components
│   │   │   ├── Toast.jsx
│   │   │   └── LazyComponents.jsx
│   │   │
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useDataSync.js
│   │   │   └── usePerformance.js
│   │   │
│   │   ├── utils/             # Utility functions
│   │   │   ├── api.js
│   │   │   ├── apiClient.js
│   │   │   └── dataSync.js
│   │   │
│   │   └── styles/            # CSS files
│   │       ├── index.css
│   │       ├── animations.css
│   │       └── responsive.css
│   │
│   ├── public/                # Static assets
│   ├── dist/                  # Production build
│   └── package.json
│
├── deployment/                # Deployment configs
│   ├── render-backend.yaml
│   └── render-frontend.yaml
│
└── README.md                  # This file
```

---

## 👥 User Roles

### 🔴 **ADMIN**
Full system access with all privileges:
- ✅ Dashboard
- ✅ Menu Management
- ✅ Order Management
- ✅ Reservation Management
- ✅ Staff Management
- ✅ Inventory Management
- ✅ Reports & Analytics
- ✅ User Management
- ✅ System Settings

### 🟡 **STAFF**
Limited access for restaurant staff:
- ✅ Dashboard (View only)
- ✅ Menu (View & Limited Edit)
- ✅ Orders (Create, Update, View)
- ✅ Reservations (Create, Update, View)
- ✅ Staff (View only)
- ✅ Inventory (View & Update)
- ❌ Reports (No access)
- ❌ User Management

### 🟢 **USER** (Customer)
Customer-facing features:
- ✅ Dashboard (View only)
- ✅ Menu (View only)
- ✅ Orders (Create & View own orders)
- ✅ Reservations (Create & View own reservations)
- ❌ Staff Management
- ❌ Inventory Management
- ❌ Reports
- ❌ User Management

---

## 📡 API Documentation

### Base URL
```
http://localhost:4000/api
```

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "USER"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Menu Management

#### Get All Menu Items
```http
GET /api/menu
```

#### Create Menu Item (Admin/Staff)
```http
POST /api/menu
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "Burger",
  "description": "Delicious burger",
  "price": 9.99,
  "category": "Main Course",
  "image": <file>
}
```

#### Update Menu Item
```http
PUT /api/menu/:id
Authorization: Bearer <token>
```

#### Delete Menu Item
```http
DELETE /api/menu/:id
Authorization: Bearer <token>
```

### Orders

#### Get All Orders
```http
GET /api/orders
Authorization: Bearer <token>
```

#### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    { "menuItemId": 1, "quantity": 2 }
  ],
  "tableNumber": 5,
  "notes": "No onions"
}
```

#### Update Order Status
```http
PATCH /api/orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "PREPARING"
}
```

### Reservations

#### Get All Reservations
```http
GET /api/reservations
Authorization: Bearer <token>
```

#### Create Reservation
```http
POST /api/reservations
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "1234567890",
  "date": "2024-12-25",
  "time": "19:00",
  "guests": 4,
  "notes": "Window seat preferred"
}
```

### Inventory

#### Get All Inventory Items
```http
GET /api/inventory
Authorization: Bearer <token>
```

#### Update Inventory Stock
```http
PATCH /api/inventory/:id/stock
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 50
}
```

> 📝 **Note:** For complete API documentation, refer to the source code in `backend-deploy/src/routes/`

---

## 🌐 Deployment

### Deploy to Render.com

#### Backend Deployment

1. **Create a Web Service** on Render.com
2. **Connect your GitHub repository**
3. **Configure the service:**
   - **Root Directory:** `cosypos-clean/backend-deploy`
   - **Build Command:** 
     ```bash
     npm install && npx prisma generate && npx prisma db push && node src/seed.js
     ```
   - **Start Command:** 
     ```bash
     npm start
     ```
- **Node Version:** 22.16.0

4. **Add Environment Variables:**
```
   DATABASE_URL=<your-postgresql-url>
   JWT_SECRET=<your-secret-key>
NODE_ENV=production
PORT=4000
```

#### Frontend Deployment

1. **Create a Static Site** on Render.com
2. **Connect your GitHub repository**
3. **Configure the service:**
   - **Root Directory:** `cosypos-clean/frontend-deploy`
   - **Build Command:** 
     ```bash
     npm install && npm run build
     ```
   - **Publish Directory:** `dist`
   - **Node Version:** 22.16.0

4. **Add Environment Variables:**
   ```
   VITE_API_URL=<your-backend-url>
   ```

### Deploy to Other Platforms

<details>
<summary>Vercel Deployment</summary>

#### Frontend on Vercel
```bash
cd frontend-deploy
vercel --prod
```

#### Backend on Vercel
```bash
cd backend-deploy
vercel --prod
```

</details>

<details>
<summary>Heroku Deployment</summary>

```bash
# Backend
cd backend-deploy
heroku create cosypos-backend
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main

# Frontend
cd frontend-deploy
heroku create cosypos-frontend
heroku buildpacks:set heroku/nodejs
git push heroku main
```

</details>

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Workflow

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/cosypos.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments where necessary

4. **Test your changes**
   ```bash
   npm run test
   ```

5. **Commit your changes**
   ```bash
   git commit -m "Add: Amazing new feature"
   ```

6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**
   - Provide a clear description
   - Reference any related issues
   - Wait for review

### Coding Standards

- **JavaScript:** ES6+ syntax
- **React:** Functional components with hooks
- **Naming:** camelCase for variables, PascalCase for components
- **Commits:** Follow [Conventional Commits](https://www.conventionalcommits.org/)

### Reporting Issues

Found a bug? Have a feature request?

1. Check existing issues
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Screenshots if applicable

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 CosyPOS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Support & Contact

- **Documentation:** [GitHub Wiki](https://github.com/yourusername/cosypos/wiki)
- **Issues:** [GitHub Issues](https://github.com/yourusername/cosypos/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/cosypos/discussions)

---

## 🙏 Acknowledgments

- React team for the amazing framework
- Prisma team for the excellent ORM
- All contributors who help improve CosyPOS

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Kitchen display system
- [ ] Customer loyalty program
- [ ] Advanced analytics dashboard
- [ ] Multi-location support
- [ ] API rate limiting
- [ ] WebSocket for real-time updates
- [ ] Dark/Light theme toggle

---

<div align="center">

**Made with ❤️ by the CosyPOS Team**

⭐ Star us on GitHub — it motivates us a lot!

[⬆ Back to Top](#-cosypos---modern-restaurant-management-system)

</div>
