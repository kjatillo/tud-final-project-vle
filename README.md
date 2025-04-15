
# Virtual Learning Environment (VLE) Project

Welcome to the Virtual Learning Environment (VLE) final year project for the Computing with Software Development Course! 
This repository contains a full-stack VLE application designed to enhance online learning experiences with features such as course management, assignments, and data analytics. 
Built using **Angular** for the frontend and **.NET Core** for the backend, this project aims to deliver an efficient and user-friendly learning platform.

---

## Table of Contents

* [Project Overview](#project-overview)
* [Project Structure](#project-structure)
* [Technologies Used](#technologies-used)
* [Installation Guide](#installation-guide)
* [Stripe CLI Setup](#stripe-cli-setup)
* [Database](#database)
* [Developer](#developer)
* [Documentation](#documentation)

---

## Project Overview

The **Virtual Learning Environment (VLE) Project** is built for academic and professional use. It includes:
- **User Management** (Registration, Login)
- **Course and Assignment Management** for instructors
- **Real-Time Notifications/Chat** for user interactions
- **Data Analytics Dashboard** for insights and reporting
- **Background Jobs** for automated tasks, such as notifications or report generation

---

## Project Structure

The repository is organized as follows:

**/frontend** <br />
&nbsp;&nbsp;&nbsp;├── **vle-project-ui** &nbsp;# Angular frontend for user interaction

**/backend** <br />
&nbsp;&nbsp;&nbsp;├── **VleProjectApi**  &nbsp;# .NET Core API for core application logic <br />
&nbsp;&nbsp;&nbsp;├── **VleProjectBackgroundJob** &nbsp;# Background jobs for notifications and reports

**/docs** <br />
&nbsp;&nbsp;&nbsp;├── **Research Document.docx** &nbsp;# Research and analysis of the project <br />
&nbsp;&nbsp;&nbsp;├── **Use Case and Logical Architecture.docx** &nbsp;# Detailed use cases and architecture <br />
&nbsp;&nbsp;&nbsp;├── **Feature Logs.docx** &nbsp;# Feature logs 

**/meetings** <br />
&nbsp;&nbsp;&nbsp;├── **Meeting Logs.docx** &nbsp;# Log of project meetings and discussions

---

## Technologies Used

| Technology               | Role                                                  |
|--------------------------|-------------------------------------------------------|
| **Angular**              | Frontend framework for building the UI                |
| **.NET Core (C#)**       | Backend API for application logic and data processing |
| **SQL Server**           | Database management for persistent storage            |
| **Microsoft Azure**      | Hosting and database services                         |
| **Entity Framework Core**| ORM for database interactions in .NET                 |
| **Hangfire**             | Background job management for scheduled tasks         |
| **SignalR**              | Real-time notifications for live user updates         |

---

## Installation Guide

### Prerequisites

- **Node.js** and **Angular CLI** for frontend development
- **.NET Core SDK** for backend API development
- **SQL Server** (local or Azure SQL)
- **Visual Studio Code** or **Visual Studio** (recommended for backend)
- **SSMS** (SQL Server Management Studio) for managing the database

### Steps to Run the Project

1. **Clone the Repository**
   ```bash
   git clone https://github.com/PROJ-24-25/docs-and-code-kjatillo.git
   cd docs-and-code-kjatillo
   ```
2. **Frontend Setup**
   - Navigate to the frontend directory:
   ```bash
   cd frontend/vle-project-ui
   ```
   Install dependencies:
   ```bash
   npm install
   ```
   Run the Angular development server:
   ```bash
   npm start
   ```
3. **Backend Setup**
   - Open the backend solution in **Visual Studio**.
   - Update the database connection string in connected services or `appsettings.json` to point to your local or Azure SQL Server.
   - Navigate to the API and Background Job directory:
   ```bash
   cd backend/VleProjectApi
   ```
   ```bash
   cd VleProjectBackgroundJob
   ```
   - Run migrations to set up the database schema:
   ```bash
   dotnet ef database update
   ```
   - Start the API and Background Job project:
   ```bash
   dotnet run
   ```

---

## Stripe CLI Setup

The Stripe CLI is required for handling webhooks locally. Follow these steps to set it up:

1. Download the Stripe CLI from the official website: [Stripe CLI](https://stripe.com/docs/stripe-cli).
2. Place the executable (`stripe.exe`) in the `tools/stripe-cli/` directory (or any directory of your choice).
3. Add the directory to your system's PATH environment variable for easy access.
4. Start the webhook listener, run the following command:
```bash
stripe listen --forward-to https://localhost:7036/api/payment/webhook
```

Note: The webhook must be running along with the API and UI.

---

## Database

**Modules Table**
```sql
CREATE TABLE Modules (
    ModuleID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ModuleName NVARCHAR(150) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    Price DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    ModuleInstructor NVARCHAR(450) NOT NULL,
    CreatedBy NVARCHAR(450) NOT NULL,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (CreatedBy) REFERENCES AspNetUsers(Id)
);
```

**Enrolments Table**
```sql
CREATE TABLE Enrolments (
    EnrolmentId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId NVARCHAR(450) NOT NULL,
    ModuleId UNIQUEIDENTIFIER NOT NULL,
    EnrolmentDate DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id),
    FOREIGN KEY (ModuleId) REFERENCES Modules(ModuleID),
    CONSTRAINT UC_User_Module UNIQUE (UserId, ModuleId)
);
```

**Module Pages Table**
```sql
CREATE TABLE ModulePages (
    PageId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ModuleId UNIQUEIDENTIFIER NOT NULL,
    Title NVARCHAR(255) NOT NULL,
    FOREIGN KEY (ModuleId) REFERENCES Modules(ModuleID)
);
```

**Module Contents Table**
```sql
CREATE TABLE ModuleContents (
    ContentId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PageId UNIQUEIDENTIFIER NOT NULL,
    Title NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    FileUrl NVARCHAR(MAX) NOT NULL DEFAULT '',
    FileName NVARCHAR(255) NOT NULL DEFAULT '',
    FileType NVARCHAR(255) NULL,
    IsLink BIT NOT NULL DEFAULT 0,
    LinkUrl NVARCHAR(255) NOT NULL DEFAULT '',
    IsUpload BIT NOT NULL DEFAULT 0,
    Deadline DATETIME NULL,
    UploadedDate DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (PageId) REFERENCES ModulePages(PageId)
);
```

**Module Submissions Table**
```sql
CREATE TABLE ModuleSubmissions (
    SubmissionId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ContentId UNIQUEIDENTIFIER NOT NULL,
    UserId NVARCHAR(450) NOT NULL,
    FileName NVARCHAR(255) NOT NULL DEFAULT '',
    FileUrl NVARCHAR(MAX) NOT NULL,
    SubmittedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    Grade FLOAT NULL,
    Feedback NVARCHAR(MAX) NULL,
    FOREIGN KEY (ContentId) REFERENCES ModuleContents(ContentId),
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id)
);
```

---

## Developer
**Name**: Keneith June Atillo <br />
**Student ID**: X00190944 <br />
**Course/Year**: Computing with Software Development / Year 4 <br />
**College Email**: X00190944@mytudublin.ie <br />
**LinkedIn**: [linkedin.com/in/keneithatillo](https://www.linkedin.com/in/keneithatillo/)

---

## Documentation
Documentation can be found in the `/docs` folder. Files included are:

- **Research Document**: Background research on VLE requirements and technologies.
- **Use Case and Logical Architecture**: Detailed documentation of core application use cases and architectural diagrams.
- **Features Log**: Comprehensive log of features, development milestones, and iteration summaries.
