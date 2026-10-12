# Campus Complaint & Issue Tracking System

A full-stack web application designed for colleges and universities to centrally manage, track, and resolve campus-related complaints and grievances. Built with **React.js, Node.js, Express.js, and MongoDB (MERN architecture)**.

---

## 1. Project Overview

The **Campus Complaint & Issue Tracking System** bridges the gap between campus residents (students and faculty) and administrative facility managers. It replaces cumbersome physical complaint registers with a digital grievance lifecycle, providing real-time tracking, transparent SLA audits, role-based workflows, and photo evidence attachments.

### User Roles & Capabilities

* **Student:**
  * Register and authenticate using JWT.
  * Lodge complaints with title, description, category, campus location, priority, and optional photo attachment.
  * Receive an automatically generated ticket ID (`CMP-YYYY-XXXX`).
  * Monitor complaint status in real-time through an interactive lifecycle audit trail.
  * Communicate directly with resolution officers via threaded remarks.
  * Edit or cancel issues while they remain in the initial `Submitted` phase.

* **Staff / Department Officer:**
  * Login and view complaints specifically assigned to their department or person.
  * Filter and search issues by priority, status, and location.
  * Triage priorities (`Low`, `Medium`, `High`, `Critical`).
  * Transition ticket status (`Under Review` &rarr; `In Progress` &rarr; `Resolved` &rarr; `Closed`).
  * Add internal diagnostic notes and resolution timestamps.

* **Administrator:**
  * Global view of all institutional complaints and registered users.
  * Assign tickets to specific department staff members.
  * Manage campus departments and complaint category tags.
  * Activate, deactivate, or delete user accounts.
  * View executive dashboards and analytics reports with resolution rates.

---

## 2. Technology Stack

* **Frontend:**
  * React.js (JavaScript, Vite)
  * Bootstrap 5 & React Bootstrap
  * Bootstrap Icons
  * Axios (HTTP client with Bearer Token interceptor)
  * React Router DOM v6
  * Chart.js & React-Chartjs-2 (Data visualizations)
* **Backend:**
  * Node.js & Express.js
  * RESTful API architecture
  * JWT (JSON Web Tokens) for stateless authentication
  * bcryptjs for salted password hashing
  * Multer for secure multipart image uploads
* **Database:**
  * MongoDB (Local or MongoDB Atlas)
  * Mongoose ODM (Object Data Modeling)

---

## 3. System Architecture

```text
+-------------------------------------------------------------------------+
|                           CLIENT (React.js SPA)                         |
|  - Student Dashboard       - Staff Resolution Queue  - Admin Control    |
|  - Issue Submission Form   - Real-time Timeline      - Analytics Charts |
+------------------------------------+------------------------------------+
                                     |
                                HTTP / REST (Axios + JWT)
                                     v
+-------------------------------------------------------------------------+
|                         NODE.JS / EXPRESS.JS BACKEND                    |
|  - Auth Middleware (JWT)   - Upload Middleware (Multer) - Error Handler |
|  - Role Middleware         - Ticket Sequence Generator                  |
+------------------------------------+------------------------------------+
                                     |
                                Mongoose ODM
                                     v
+-------------------------------------------------------------------------+
|                            MONGODB DATABASE                             |
|  - Users Collection        - Complaints Collection                      |
|  - ComplaintHistory        - Departments & Categories                   |
|  - Notifications                                                        |
+-------------------------------------------------------------------------+
```

---

## 4. Complaint Status Lifecycle

Every complaint adheres to a strict audit-logged lifecycle:

```text
[Submitted]  -->  [Under Review]  -->  [Assigned]  -->  [In Progress]  -->  [Resolved]  -->  [Closed]
     |                                                                           ^
     +--------------------------->  [Rejected]  ---------------------------------+
```

Each transition automatically creates a timestamped record in `ComplaintHistory` containing:
* Previous status & New status
* Officer who initiated the change
* Timestamp
* Explanatory remark / resolution note

---

## 5. Folder Structure

```text
TTP/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── authController.js     # User registration, login & profile
│   │   ├── complaintController.js# CRUD, assign, status, comments
│   │   ├── dashboardController.js# Student, Staff & Admin analytics
│   │   ├── departmentController.js# Dept & Category management
│   │   ├── notificationController.js# User notifications
│   │   └── userController.js     # User management & staff listing
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification
│   │   ├── errorMiddleware.js    # Central error handler
│   │   ├── roleMiddleware.js     # Role-based route guard
│   │   └── uploadMiddleware.js   # Multer file validator & storage
│   ├── models/
│   │   ├── Category.js           # Category schema
│   │   ├── Complaint.js          # Main complaint schema
│   │   ├── ComplaintHistory.js   # Lifecycle audit trail schema
│   │   ├── Department.js         # Campus department schema
│   │   ├── Notification.js       # System notifications schema
│   │   └── User.js               # User accounts with bcrypt
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── complaintRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── departmentRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── userRoutes.js
│   ├── uploads/                  # Uploaded photo evidence files
│   ├── utils/
│   │   └── generateComplaintId.js# Unique CMP-YYYY-XXXX generator
│   ├── .env                      # Environment config
│   ├── .env.example
│   ├── package.json
│   ├── seed.js                   # Demo database seeder
│   └── server.js                 # Express server entry point
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── ComplaintCard.jsx # Reusable ticket card
    │   │   ├── Loading.jsx       # Loading indicator
    │   │   ├── Navbar.jsx        # Navigation bar with notifications
    │   │   ├── PriorityBadge.jsx # Color-coded priority pill
    │   │   ├── ProtectedRoute.jsx# Role & Auth router gate
    │   │   ├── Sidebar.jsx       # Responsive role navigation drawer
    │   │   └── StatusBadge.jsx   # Status badges
    │   ├── context/
    │   │   └── AuthContext.jsx   # Global session state & helper methods
    │   ├── pages/
    │   │   ├── AdminDashboard.jsx
    │   │   ├── AllComplaints.jsx
    │   │   ├── AssignedComplaints.jsx
    │   │   ├── ComplaintDetails.jsx
    │   │   ├── Landing.jsx
    │   │   ├── Login.jsx
    │   │   ├── ManageDepartments.jsx
    │   │   ├── ManageUsers.jsx
    │   │   ├── MyComplaints.jsx
    │   │   ├── Profile.jsx
    │   │   ├── Register.jsx
    │   │   ├── Reports.jsx
    │   │   ├── StaffDashboard.jsx
    │   │   ├── StudentDashboard.jsx
    │   │   └── SubmitComplaint.jsx
    │   ├── services/
    │   │   ├── api.js            # Axios client with JWT interceptor
    │   │   ├── authService.js
    │   │   └── complaintService.js
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── .env
    ├── index.html
    └── package.json
```

---

## 6. Installation & Setup

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **MongoDB**: Community Server installed and running locally on port `27017` (or MongoDB Atlas URI)

### Step 1: Clone or Navigate to Project
```powershell
cd "C:\Users\Nitin Reddy\Desktop\TTP"
```

### Step 2: Backend Setup
```powershell
cd backend
npm install
```
Configure `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/campus_complaint_db
JWT_SECRET=super_secret_jwt_key_campus_complaint_2026_ttp
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

### Step 3: Seed Database with Demo Accounts
Run the seed script to automatically create departments, categories, demo users, and sample complaints:
```powershell
npm run seed
```

### Step 4: Frontend Setup
Open a new terminal window:
```powershell
cd "C:\Users\Nitin Reddy\Desktop\TTP\frontend"
npm install
```

Configure `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_IMAGE_BASE_URL=http://localhost:5000
```

---

## 7. Running the Application

### 1. Start Backend Server
```powershell
cd "C:\Users\Nitin Reddy\Desktop\TTP\backend"
npm start
# Or for live restart during development:
npm run dev
```
* Backend will be running at: `http://localhost:5000`
* Health Check URL: `http://localhost:5000/api/health`

### 2. Start Frontend Development Server
In another terminal:
```powershell
cd "C:\Users\Nitin Reddy\Desktop\TTP\frontend"
npm run dev
```
* Frontend will be accessible at: `http://localhost:5173`

---

## 8. Demo Credentials (For Viva / Evaluation)

| Role | Email | Password | Access / Permissions |
|---|---|---|---|
| **Administrator** | `admin@campus.com` | `Admin@123` | Full system access, all complaints, manage users & departments |
| **Staff Officer** | `staff@campus.com` | `Staff@123` | Assigned department tickets, status updates, technician notes |
| **Student** | `student@campus.com` | `Student@123` | Submit issues, track personal tickets, comment & edit draft tickets |

> *Tip: The Login page features 1-click demo credential autofill buttons for immediate viva demonstration.*

---

## 9. Possible Future Enhancements

1. **Email / SMS Alerts:** Integration with Nodemailer or Twilio for instant student SMS notifications upon ticket resolution.
2. **Push Notifications:** WebSockets / Socket.io for live chat during complaint triage.
3. **Geo-tagging & Campus Map:** Leaflet or Google Maps integration to pinpoint exact building coordinates.
4. **AI Duplicate Detection:** Automated natural language similarity checks to prevent multiple students from reporting the same broken water pipe or projector.
5. **Student Feedback / Rating:** 5-star rating system after ticket closure to measure departmental satisfaction.
