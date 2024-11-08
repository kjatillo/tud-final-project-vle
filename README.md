
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
&nbsp;&nbsp;&nbsp;├── **BackgroundJobs** &nbsp;# Background jobs for notifications and reports

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
   ng serve
   ```
3. **Backend Setup**
   - Open the backend solution in **Visual Studio**.
   - Update the database connection string in connected services or `appsettings.json` to point to your local or Azure SQL Server.
   - Navigate to the backend directory:
   ```bash
   cd backend/VleProjectApi
   ```
   - Run migrations to set up the database schema:
   ```bash
   dotnet ef database update
   ```
   - Start the API project:
   ```bash
   dotnet run
   ```
   - The API will be available at http://localhost:1234/api (port number will vary per machine).

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
