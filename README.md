# Smart School Attendance & Automated Parent Notification Portal

A full-stack, beginner-friendly school management portal built with **Java 17, Spring Boot 3, Spring Data JPA, MySQL, Meta WhatsApp Cloud API, and React (Vite + Tailwind CSS)**.

---

## 1. System Architecture

```text
React Frontend (Vite + Tailwind CSS on Port 5173)
      │
      ▼ (Axios HTTP calls on http://localhost:8080/api)
Spring Boot REST API (Port 8080)
      │
      ├── Controller Layer (REST Endpoints)
      │     └── StudentController, AttendanceController, FeeController,
      │         VendorController, ExpenseController, ReportController
      ├── Service Layer (Business Logic & WhatsApp Cloud API Gateway)
      │     └── StudentService, AttendanceService, WhatsAppService, FeeService, etc.
      ├── Repository Layer (Spring Data JPA)
      │     └── StudentRepository, AttendanceRepository, FeeRepository, etc.
      └── Database (MySQL - `school_management`)

Meta WhatsApp Cloud API Flow:
      Student marked ABSENT
               │
               ▼
      AttendanceService ──► WhatsAppService ──► Meta WhatsApp Cloud API (Graph API)
                                              │               │
                                              ▼               ▼
                                 Saved in `notifications`   Parent WhatsApp 📱
                                     (SENT / FAILED)
```

---

## 2. Technology Stack

* **Backend**: Java 17, Spring Boot 3.2.5, Spring Web (`RestClient`), Spring Data JPA, MySQL Connector/J, Maven
* **Frontend**: React 19, Vite, Tailwind CSS, Axios, React Router v7, Lucide React Icons
* **Database**: MySQL 8.x (`school_management`)
* **Notification Gateway**: **Official Meta WhatsApp Cloud API** (`graph.facebook.com/v19.0`)

---

## 3. Meta WhatsApp Cloud API Setup Guide

Follow these steps to set up the official Meta WhatsApp Cloud API for your project:

### Step 1: Create a Meta Developer Account & App
1. Go to [https://developers.facebook.com/](https://developers.facebook.com/) and log in with your Facebook account.
2. Click **My Apps** > **Create App**.
3. Select **Other** > click **Next**.
4. Select App Type: **Business** > click **Next**.
5. Enter your App Name (e.g. `SchoolAttendancePortal`) and your email > click **Create app**.

### Step 2: Set Up WhatsApp in Your Meta App
1. On your App Dashboard, scroll to **WhatsApp** and click **Set up**.
2. Go to **WhatsApp** > **API Setup** in the left sidebar.
3. You will immediately see:
   - **Temporary Access Token** (or create a permanent System User Token under Business Settings)
   - **Phone number ID** (e.g., `103498239482938`)
   - **WhatsApp Business Account ID**

### Step 3: Add Recipient Test Number
1. Under **"To" (Step 1 on API Setup page)**, click the recipient dropdown > **Manage phone number list**.
2. Add your parent mobile phone number (e.g. `919025953166`).
3. Enter the 5-digit verification code sent to your phone's WhatsApp.

### Step 4: Create the WhatsApp Message Template
1. Go to **WhatsApp** > **Message Templates** in the Meta Business Manager.
2. Click **Create Template**:
   - **Category**: `Utility`
   - **Name**: `school_attendance_absent`
   - **Language**: `English (US)` or `en_US`
3. In the Template Body, paste:
   ```text
   Dear Parent, your ward {{1}} was absent on {{2}}. Please contact the school for further information.
   ```
4. Add sample values for preview:
   - `{{1}}` = `Surya`
   - `{{2}}` = `2026-09-24`
5. Click **Submit** (Utility templates are usually auto-approved in minutes).

---

## 4. Environment Variables Configuration

Set these environment variables in your operating system or PowerShell before running the backend:

```powershell
# Meta WhatsApp Cloud API
$env:WHATSAPP_API_URL="https://graph.facebook.com/v19.0"
$env:WHATSAPP_PHONE_NUMBER_ID="your_phone_number_id_here"
$env:WHATSAPP_ACCESS_TOKEN="your_meta_access_token_here"
$env:WHATSAPP_TEMPLATE_NAME="school_attendance_absent"
$env:WHATSAPP_TEMPLATE_LANGUAGE="en_US"

# MySQL Database
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_mysql_password"
```

Or configure them in [`backend/src/main/resources/application.properties`](file:///c:/Users/surya/Documents/project/AttendenceManagementSystem/backend/src/main/resources/application.properties):

```properties
whatsapp.api-url=${WHATSAPP_API_URL:https://graph.facebook.com/v19.0}
whatsapp.phone-number-id=${WHATSAPP_PHONE_NUMBER_ID:}
whatsapp.access-token=${WHATSAPP_ACCESS_TOKEN:}
whatsapp.template-name=${WHATSAPP_TEMPLATE_NAME:school_attendance_absent}
whatsapp.template-language=${WHATSAPP_TEMPLATE_LANGUAGE:en_US}
```

---

## 5. Meta WhatsApp Cloud API Request Specification

When attendance is marked as `ABSENT`, `WhatsAppService.java` constructs and executes this exact HTTP POST request using Spring's `RestClient`:

* **Endpoint**: `POST https://graph.facebook.com/v19.0/{PHONE_NUMBER_ID}/messages`
* **Headers**:
  - `Authorization: Bearer <WHATSAPP_ACCESS_TOKEN>`
  - `Content-Type: application/json`
* **JSON Body**:
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "919025953166",
  "type": "template",
  "template": {
    "name": "school_attendance_absent",
    "language": {
      "code": "en_US"
    },
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "Surya"
          },
          {
            "type": "text",
            "text": "2026-09-24"
          }
        ]
      }
    ]
  }
}
```

---

## 6. How to Run the Application

### 1. Start Spring Boot Backend
```powershell
cd backend
mvn spring-boot:run
```
> REST API runs at: **`http://localhost:8080`**

### 2. Start React Frontend
```powershell
cd frontend
npm run dev
```
> Web Portal runs at: **`http://localhost:5173`**

---

## 7. Complete Postman API Testing Sequence

### Step 1: Add a Student
* **Method**: `POST`
* **URL**: `http://localhost:8080/api/students`
* **Request Body**:
```json
{
    "name": "Surya",
    "email": "surya@gmail.com",
    "parentName": "Kumar",
    "parentPhone": "+919025953166",
    "className": "10-A"
}
```
* **Response Status**: `201 Created`

---

### Step 2: Mark Student Attendance as ABSENT (Triggers WhatsApp)
* **Method**: `POST`
* **URL**: `http://localhost:8080/api/attendance`
* **Request Body**:
```json
{
    "studentId": 1,
    "date": "2026-09-24",
    "status": "ABSENT"
}
```
* **Response Status**: `201 Created`
* *Result*: Parent WhatsApp receives:
  `"Dear Parent, your ward Surya was absent on 2026-09-24. Please contact the school for further information."`

---

### Step 3: Check Student Attendance Percentage
* **Method**: `GET`
* **URL**: `http://localhost:8080/api/students/1/attendancepercentage`
* **Response Status**: `200 OK`

---

### Step 4: View WhatsApp Notification Audit Log
* **Method**: `GET`
* **URL**: `http://localhost:8080/api/reports/notifications`
* **Response Status**: `200 OK`

---

## 8. Error Handling & Security Principles

1. **Non-Blocking Fault Tolerance**:
   If the Meta WhatsApp API call fails (e.g. invalid token, expired token, network downtime), the attendance record is **still successfully committed to MySQL**. The error is logged, and a record with status `FAILED` is saved in the `notifications` table.
2. **Credential Security**:
   - `WHATSAPP_ACCESS_TOKEN` is NEVER hard-coded in Java source files.
   - Access tokens are NEVER logged to console or exposed to the React frontend.
   - All external Meta communications are handled securely server-side by Spring Boot.
