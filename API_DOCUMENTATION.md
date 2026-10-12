# REST API Documentation - Campus Complaint & Issue Tracking System

Base URL: `http://localhost:5000/api`

---

## 1. Authentication APIs

### 1.1 Register User
* **Endpoint:** `POST /auth/register`
* **Access:** Public
* **Request Body:**
  ```json
  {
    "name": "Aarav Sharma",
    "email": "student@campus.com",
    "password": "Student@123",
    "studentId": "STU-2023-CS-042",
    "phone": "+91 9876543210",
    "department": "665a123...",
    "role": "student"
  }
  ```
* **Success Response (201):**
  ```json
  {
    "success": true,
    "message": "Registration successful!",
    "data": {
      "_id": "665a...",
      "name": "Aarav Sharma",
      "email": "student@campus.com",
      "role": "student",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
    }
  }
  ```

---

### 1.2 User Login
* **Endpoint:** `POST /auth/login`
* **Access:** Public
* **Request Body:**
  ```json
  {
    "email": "student@campus.com",
    "password": "Student@123"
  }
  ```
* **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Login successful!",
    "data": {
      "_id": "665a...",
      "name": "Aarav Sharma",
      "email": "student@campus.com",
      "role": "student",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
    }
  }
  ```

---

### 1.3 Get Current User Profile
* **Endpoint:** `GET /auth/me`
* **Access:** Private (Bearer Token)
* **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "665a...",
      "name": "Aarav Sharma",
      "email": "student@campus.com",
      "role": "student",
      "department": { "name": "IT Infrastructure" },
      "isActive": true
    }
  }
  ```

---

### 1.4 Update User Profile
* **Endpoint:** `PUT /auth/profile`
* **Access:** Private (Bearer Token)
* **Request Body:**
  ```json
  {
    "name": "Aarav Sharma",
    "phone": "+91 9876543210",
    "studentId": "STU-2023-CS-042"
  }
  ```

---

## 2. Complaint Management APIs

### 2.1 Submit New Complaint
* **Endpoint:** `POST /complaints`
* **Access:** Private (Student, Staff, Admin)
* **Content-Type:** `multipart/form-data`
* **Form Fields:**
  * `title`: "Water leakage in Room 204"
  * `description`: "Tap valve broken and dripping constantly."
  * `category`: "Water Supply"
  * `location`: "Hostel A, 2nd Floor"
  * `priority`: "High"
  * `department`: "(optional Department ObjectId)"
  * `attachment`: "(optional image file: JPG/PNG)"
* **Success Response (201):**
  ```json
  {
    "success": true,
    "message": "Complaint submitted successfully!",
    "data": {
      "_id": "665b...",
      "complaintId": "CMP-2026-0004",
      "title": "Water leakage in Room 204",
      "status": "Submitted",
      "priority": "High"
    }
  }
  ```

---

### 2.2 Get My Complaints
* **Endpoint:** `GET /complaints/my`
* **Access:** Private (Student)
* **Query Params:** `status`, `priority`, `category`, `search`, `page`, `limit`
* **Success Response (200):**
  ```json
  {
    "success": true,
    "data": [ ... ],
    "pagination": { "total": 5, "page": 1, "pages": 1, "limit": 10 }
  }
  ```

---

### 2.3 Get All Complaints
* **Endpoint:** `GET /complaints`
* **Access:** Private (Staff, Admin)
* **Query Params:** `status`, `priority`, `category`, `department`, `search`, `sortBy`, `sortOrder`, `page`, `limit`

---

### 2.4 Get Assigned Complaints
* **Endpoint:** `GET /complaints/assigned`
* **Access:** Private (Staff, Admin)
* **Description:** Retrieves complaints assigned directly to the authenticated staff officer or their department.

---

### 2.5 Get Complaint by ID
* **Endpoint:** `GET /complaints/:id`
* **Access:** Private (Owner student, or Staff, or Admin)

---

### 2.6 Update Complaint Details
* **Endpoint:** `PUT /complaints/:id`
* **Access:** Private (Owner student if status === 'Submitted', or Admin)
* **Content-Type:** `multipart/form-data` or `application/json`

---

### 2.7 Update Complaint Status
* **Endpoint:** `PUT /complaints/:id/status`
* **Access:** Private (Staff, Admin)
* **Request Body:**
  ```json
  {
    "status": "In Progress",
    "comment": "Parts ordered for replacement",
    "priority": "High"
  }
  ```

---

### 2.8 Assign Complaint
* **Endpoint:** `PUT /complaints/:id/assign`
* **Access:** Private (Staff, Admin)
* **Request Body:**
  ```json
  {
    "assignedTo": "665a123...",
    "department": "665b456...",
    "comment": "Assigned to Er. Rajesh Kumar"
  }
  ```

---

### 2.9 Add Threaded Comment
* **Endpoint:** `POST /complaints/:id/comments`
* **Access:** Private (All authenticated participants)
* **Request Body:**
  ```json
  {
    "comment": "Technician has visited and checked the valve."
  }
  ```

---

### 2.10 Get Lifecycle Audit History
* **Endpoint:** `GET /complaints/:id/history`
* **Access:** Private

---

### 2.11 Delete Complaint
* **Endpoint:** `DELETE /complaints/:id`
* **Access:** Private (Admin, or Student if status === 'Submitted')

---

## 3. Dashboard Analytics APIs

### 3.1 Student Dashboard
* **Endpoint:** `GET /dashboard/student`
* **Access:** Private (Student)
* **Returns:** Total, pending, in-progress, resolved counts, status breakdown, and recent complaints.

### 3.2 Staff Dashboard
* **Endpoint:** `GET /dashboard/staff`
* **Access:** Private (Staff, Admin)
* **Returns:** Total assigned, pending, high priority, resolved counts, and recent complaints.

### 3.3 Admin System Dashboard
* **Endpoint:** `GET /dashboard/stats`
* **Access:** Private (Admin)
* **Returns:** Institutional KPIs, category breakdown, department breakdown, status distribution, and recent complaints.

---

## 4. Administrative Management APIs

### 4.1 Get All Users
* **Endpoint:** `GET /users`
* **Access:** Private (Admin)
* **Query Params:** `role`, `department`, `search`, `page`, `limit`

### 4.2 Update User
* **Endpoint:** `PUT /users/:id`
* **Access:** Private (Admin)

### 4.3 Delete User
* **Endpoint:** `DELETE /users/:id`
* **Access:** Private (Admin)

### 4.4 Get Staff List
* **Endpoint:** `GET /users/staff/list`
* **Access:** Private (Staff, Admin)

---

## 5. Department & Category APIs

### 5.1 Get Departments
* **Endpoint:** `GET /departments`
* **Access:** Public

### 5.2 Create Department
* **Endpoint:** `POST /departments`
* **Access:** Private (Admin)

### 5.3 Delete Department
* **Endpoint:** `DELETE /departments/:id`
* **Access:** Private (Admin)

### 5.4 Get Categories
* **Endpoint:** `GET /departments/categories/all`
* **Access:** Public

### 5.5 Create Category
* **Endpoint:** `POST /departments/categories/new`
* **Access:** Private (Admin)
