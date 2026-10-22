# Project 11: Spring REST Health Care Domain Capstone – WeCARE

## 1. Domain & Project Overview
**WeCARE** is a healthcare appointment scheduling system developed using Spring Boot RESTful web services and Spring Data JPA with MySQL. It enables users (patients) to register, view profiles, and book appointments with specialized health coaches and doctors. Coaches can register, view profiles, and manage their schedule. The application prevents double bookings and supports appointment rescheduling and cancellation.

### Layered Architecture
```
Controller (REST Endpoints)
     ↓
Service (Business Logic & Validation)
     ↓
Repository (Spring Data JPA)
     ↓
MySQL Database (wecare_db)
```

---

## 2. Technology Stack
- **Framework:** Spring Boot 3.3.4
- **Language:** Java 21 (JDK 21)
- **Database:** MySQL 8 / MariaDB (Port: 3306)
- **ORM / Persistence:** Spring Data JPA / Hibernate
- **Validation:** Bean Validation (`jakarta.validation`)
- **Server Port:** 8081

---

## 3. Database Configuration
Configured in `src/main/resources/application.properties`:
```properties
server.port=8081

spring.datasource.url=jdbc:mysql://localhost:3306/wecare_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

---

## 4. Preloaded Sample Data
On application startup, `DataInitializer` seeds:
- **Coaches:**
  1. `Dr. Priya Sharma` - Specialty: `Cardiology`, Mobile: `9876543210`, Password: `Priya@123`
  2. `Dr. Rajesh Kumar` - Specialty: `Physiotherapy`, Mobile: `9876543211`, Password: `Rajesh@123`
  3. `Dr. Ananya Reddy` - Specialty: `Diet & Nutrition`, Mobile: `9876543212`, Password: `Ananya@123`
- **Users:**
  1. `Rahul Verma` - Mobile: `9123456780`, Email: `rahul.verma@example.com`, Password: `Rahul@123`

---

## 5. REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/users` | Register a new patient/user |
| `POST` | `/api/users/login` | User login validation |
| `GET` | `/api/users/{userId}` | Get user profile details |
| `GET` | `/api/users/{userId}/bookings` | Get all appointments booked by user |
| `POST` | `/api/coaches` | Register a new coach |
| `POST` | `/api/coaches/login` | Coach login validation |
| `GET` | `/api/coaches` | Get all coaches (optional query `?specialty=...`) |
| `GET` | `/api/coaches/{coachId}` | Get coach profile details |
| `GET` | `/api/coaches/{coachId}/bookings` | Get all appointments for a coach |
| `POST` | `/api/bookings` | Book a coach appointment |
| `PUT` | `/api/bookings/{bookingId}` | Reschedule an appointment date/slot |
| `DELETE` | `/api/bookings/{bookingId}` | Cancel an appointment |
| `GET` | `/api/bookings/{bookingId}` | Get appointment details by ID |

---

## 6. Sample JSON Requests and Responses

### 6.1 Register User (`POST /api/users`)
**Request:**
```json
{
  "name": "Kavitha Raman",
  "password": "Kavitha@123",
  "gender": "F",
  "dateOfBirth": "1997-07-22",
  "mobileNumber": "9840112233",
  "email": "kavitha.raman@example.com",
  "pincode": "600028",
  "city": "Chennai",
  "state": "Tamil Nadu",
  "country": "India"
}
```
**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "userId": 2
}
```

### 6.2 User Login (`POST /api/users/login`)
**Request:**
```json
{
  "id": "9123456780",
  "password": "Rahul@123"
}
```
**Response (200 OK):**
```json
{
  "status": true,
  "message": "Login successful"
}
```

### 6.3 Book Appointment (`POST /api/bookings`)
**Request:**
```json
{
  "userId": 1,
  "coachId": 1,
  "appointmentDate": "2026-11-20",
  "slot": "9 AM to 10 AM"
}
```
**Response (201 Created):**
```json
{
  "message": "Appointment booked successfully",
  "bookingId": 1
}
```

### 6.4 Reschedule Appointment (`PUT /api/bookings/1`)
**Request:**
```json
{
  "userId": 1,
  "coachId": 1,
  "appointmentDate": "2026-11-25",
  "slot": "10 AM to 11 AM"
}
```
**Response (200 OK):**
```json
{
  "status": true,
  "message": "Appointment rescheduled successfully"
}
```

### 6.5 Cancel Appointment (`DELETE /api/bookings/1`)
**Response (200 OK):**
```json
{
  "status": true,
  "message": "Appointment cancelled successfully"
}
```

---

## 7. Instructions to Run the Application
1. Make sure MySQL service is running on `localhost:3306`.
2. Open terminal in `naan-mudhalvan-projects/project-11-wecare`.
3. Compile the project:
   ```bash
   mvn clean compile
   ```
4. Run the project:
   ```bash
   mvn spring-boot:run
   ```
5. Application will run on `http://localhost:8081`.

---

## 8. Instructions to Test with Postman and SoapUI

### Using Postman:
1. Open Postman.
2. Create a new Collection named `WeCARE Health Capstone`.
3. Add a Request:
   - Method: `GET`
   - URL: `http://localhost:8081/api/coaches`
   - Click **Send**.
4. Test Booking:
   - Method: `POST`
   - URL: `http://localhost:8081/api/bookings`
   - Headers: `Content-Type: application/json`
   - Body -> raw -> JSON:
     ```json
     {
       "userId": 1,
       "coachId": 1,
       "appointmentDate": "2026-11-20",
       "slot": "9 AM to 10 AM"
     }
     ```
   - Click **Send** and inspect `201 Created`.

### Using SoapUI:
1. Open SoapUI.
2. Select **File -> New REST Project**.
3. Enter URI: `http://localhost:8081/api/coaches` and click OK.
4. For POST endpoints:
   - Select Method `POST`.
   - Set Media Type to `application/json`.
   - Enter request payload in the request body editor.
   - Click the green Play button to submit and review the response XML/JSON.

---

## 8. Web Frontend Interface (HTML5, CSS3, JavaScript, Bootstrap 5)

A responsive single-page web portal is integrated into Spring Boot (`src/main/resources/static/`). It connects to all backend REST APIs using the JavaScript Fetch API.

### 8.1 Frontend File Structure
```
src/main/resources/static/
├── index.html          # Main healthcare portal (Patient & Coach views, Booking, Reschedule modals)
├── css/
│   └── style.css       # Custom modern healthcare styling, badge indicators, transitions
└── js/
    ├── api.js          # REST API client connecting to backend endpoints (port 8081)
    └── app.js          # Dynamic UI state, form validation, modals, interactive workflows
```

### 8.2 Supported Views & Features
1. **Explore Coaches (`/`):**
   - Live coach directory with specialty filters and instant search.
   - Doctor profile modal with credentials.
   - Quick "Book Slot" action opening the consultation modal.
2. **Patient Portal:**
   - Patient Profile view (User ID, name, email, mobile, city).
   - "My Scheduled Appointments" table with live status badges (`BOOKED`, `RESCHEDULED`, `CANCELLED`).
   - "Reschedule Appointment" action modal (modifies date & time slot).
   - "Cancel Appointment" action modal with confirmation.
3. **Coach Portal:**
   - Coach Profile view (Coach ID, name, specialty, mobile).
   - "Scheduled Consultations with Patients" dashboard table.
4. **Registration Portals:**
   - **Patient Registration Form:** Name, password, gender, past DOB, 10-digit mobile, email, 6-digit pincode, city, state, country. Displays generated `User ID` with one-click login.
   - **Coach Registration Form:** Name, password, gender, DOB, mobile, specialty selection. Displays generated `Coach ID`.
5. **Real-time Backend Health Indicator:**
   - Header badge indicates live backend connection status with green/red dot indicator.
6. **Demo Accounts Quick-Fill:**
   - Quick one-click login buttons for sample patient (`User ID: 1`, `Rahul@123`) and sample coach (`Coach ID: 1`, `Priya@123`) for effortless evaluation and testing.

### 8.3 How to Access & Test the Web Frontend
1. Start the Spring Boot application:
   ```cmd
   mvn spring-boot:run
   ```
2. Open your web browser and navigate to:
   ```
   http://localhost:8081/
   ```
3. Test all features:
   - Filter coaches by specialty (e.g., Cardiology, Physiotherapy).
   - Click **Quick Demo Login (User #1)** to access Rahul Verma's patient dashboard.
   - Click **Book Appointment** to reserve a future date slot.
   - Click **Reschedule** to update date/slot.
   - Click **Cancel** to cancel the appointment.

