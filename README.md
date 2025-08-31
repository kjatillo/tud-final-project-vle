# Virtual Learning Environment (VLE)

Welcome to the Virtual Learning Environment (VLE) final year project for the Computing with Software Development Course! 
This repository contains a full-stack VLE application designed to enhance online learning experiences with features such as module management, assignments, and data analytics.

Built using **Angular** for the frontend and **ASP.NET Core** for the backend, this project aims to deliver an efficient and user-friendly learning platform.

**Deployed Application**: https://wonderful-pond-0ca60ab03.6.azurestaticapps.net
<br />
**Deployment Repository**: https://github.com/kjatillo/deployment-year4-project
<br />
**Azure DevOps Pipeline**: https://dev.azure.com/X00190944/FinalYearProject/_build

---

## Table of Contents

* [Project Overview](#project-overview)
* [Project Structure](#project-structure)
* [Technologies Used](#technologies-used)
* [Installation Guide](#installation-guide)
* [Stripe Local Setup](#stripe-cli-setup)
* [CI/CD Pipeline](#cicd-pipeline)
* [Database](#database)
* [Developer](#developer)
* [Documentation](#documentation)

---

## Project Overview

The **Virtual Learning Environment (VLE) Project** is built for academic and professional use. It includes:
- **User Management** such as registration and Login
- **Module and Assignment Management** for instructors
- **Real-Time Notifications** for in-app live reminders
- **Data Analytics Dashboard** for admins to get insights and reporting
- **Background Jobs** for automated reminders such as assignment deadlines via email

---

## Project Structure

The repository is organized as follows:

**/frontend** <br />
&nbsp;&nbsp;&nbsp;├── **vle-project-ui** &nbsp;# Angular frontend for user interaction

**/backend** <br />
&nbsp;&nbsp;&nbsp;├── **VleProjectApi**  &nbsp;# .NET Core API for core application logic <br />
&nbsp;&nbsp;&nbsp;├── **VleProjectBackgroundJob** &nbsp;# Background jobs for reminders

**/docs** <br />
&nbsp;&nbsp;&nbsp;├── **Research Document.docx** &nbsp;# Research and analysis of the project <br />
&nbsp;&nbsp;&nbsp;├── **Use Case and Logical Architecture.docx** &nbsp;# Detailed use cases and architecture <br />
&nbsp;&nbsp;&nbsp;├── **Features Log.docx** &nbsp;# Features log 

**/meetings** <br />
&nbsp;&nbsp;&nbsp;├── **Meeting Logs.docx** &nbsp;# Log of project meetings and discussions

---

## Technologies Used

| Technology               | Role                                                  |
|--------------------------|-------------------------------------------------------|
| **Angular**              | Frontend framework for building the UI                |
| **ASP.NET Core (C#)**    | Backend API for application logic and data processing |
| **SQL Server**           | Database management for persistent storage            |
| **Microsoft Azure**      | Hosting and database services                         |
| **Entity Framework Core**| ORM for database interactions in .NET                 |
| **Hangfire**             | Background job management for scheduled tasks         |
| **SignalR**              | Real-time notifications for live user updates         |
| **Playwright**           | End-to-end testing                                    |

---

## Installation Guide

### Prerequisites

- **Node.js** and **Angular CLI** for frontend development
- **.NET Core SDK** for backend API and background job development
- **SQL Server** (local or Azure SQL)
- **Visual Studio Code** or **Visual Studio** (recommended for backend)
- **SSMS** (SQL Server Management Studio) for managing the database

### Steps to Run the Project

1. **Clone the Repository**
   ```bash
   git clone https://github.com/kjatillo/tud-final-project-vle.git
   cd tud-final-project-vle
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
   - Update the database connection string in user secrets or `appsettings.json` to point to the local or Azure SQL Server.
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

## Stripe Local Setup

The Stripe CLI is required for handling webhooks locally. Follow these steps to set it up:

1. Download the Stripe CLI from the official website: [Stripe CLI](https://stripe.com/docs/stripe-cli).
2. Place the executable (`stripe.exe`) in the `tools/stripe-cli/` directory (or any directory of your choice).
3. Add the directory to your system's PATH environment variable for easy access.
4. Start the webhook listener, run the following command:
```bash
stripe listen --forward-to https://localhost:{port}/api/payment/webhook
```

Note: The webhook must be running along with the API and UI.

---

## CI/CD Pipeline
The CI/CD pipeline is implemented in [Azure DevOps](https://dev.azure.com/X00190944/FinalYearProject/_build) and the pipeline is triggered on changes to the `main` branch and executes the following stages:

**Build**
```yml
- stage: Build
  displayName: 'Build Angular Project'
  jobs:
  - job: BuildAngular
    displayName: 'Build Angular Frontend'
    steps:
    # Setup Node.js environment
    - task: NodeTool@0
      inputs:
        versionSpec: '18.x'
      displayName: 'Install Node.js'
    
    # Install dependencies
    - script: |
        cd $(angularProjectRoot)
        npm ci
      displayName: 'Install Dependencies'
      
    # Build Angular project
    - script: |
        cd $(angularProjectRoot)
        npm run build -- --configuration production
      displayName: 'Build Angular App'
      
    # Archive the Angular build
    - task: CopyFiles@2
      inputs:
        sourceFolder: '$(angularProjectRoot)/dist'
        contents: '**'
        targetFolder: '$(Build.ArtifactStagingDirectory)/angular-build'
      displayName: 'Copy Angular Build Files'
      continueOnError: true
      
    - task: PublishBuildArtifacts@1
      inputs:
        pathtoPublish: '$(Build.ArtifactStagingDirectory)/angular-build'
        artifactName: 'angular-build'
      displayName: 'Publish Angular Build Artifacts'
      continueOnError: true
```

**Unit Testing**
```yml
- stage: UnitTesting
  displayName: 'Unit Testing'
  dependsOn: Build
  condition: succeeded()
  jobs:
  - job: ComponentTests
    displayName: 'Run Component Tests'
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '18.x'
      displayName: 'Install Node.js'
    
    # Install dependencies
    - script: |
        cd $(angularProjectRoot)
        npm ci
      displayName: 'Install Dependencies'
    
    # Install Chrome for headless testing
    - script: |
        wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
        sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
        sudo apt-get update
        sudo apt-get install -y google-chrome-stable
      displayName: 'Install Chrome'
    
    # Run auth.interceptor tests
    - script: |
        cd $(angularProjectRoot)
        echo "Running auth.interceptor tests"
        npx ng test --include="**/auth.interceptor.spec.ts" --browsers=ChromeHeadless --watch=false --code-coverage
      displayName: 'Test Auth Interceptor'
      continueOnError: true
    
    # Run register component tests
    - script: |
        cd $(angularProjectRoot)
        echo "Running register component tests"
        npx ng test --include="**/register.component.spec.ts" --browsers=ChromeHeadless --watch=false --code-coverage
      displayName: 'Test Register Component'
      continueOnError: true
    
    # Run login component tests
    - script: |
        cd $(angularProjectRoot)
        echo "Running login component tests"
        npx ng test --include="**/login.component.spec.ts" --browsers=ChromeHeadless --watch=false --code-coverage
      displayName: 'Test Login Component'
      continueOnError: true
      
    # Archive code coverage results
    - task: CopyFiles@2
      inputs:
        sourceFolder: '$(angularProjectRoot)/coverage'
        contents: '**'
        targetFolder: '$(Build.ArtifactStagingDirectory)/coverage'
      displayName: 'Copy Coverage Results'
      continueOnError: true
      
    - task: PublishBuildArtifacts@1
      inputs:
        pathtoPublish: '$(Build.ArtifactStagingDirectory)/coverage'
        artifactName: 'coverage'
      displayName: 'Publish Coverage Results'
      continueOnError: true
```

**User Acceptance Testing**
```yml
- stage: UATTesting
  displayName: 'User Acceptance Testing'
  dependsOn: Build
  condition: succeeded()
  jobs:
  - job: PlaywrightTests
    displayName: 'Run Playwright E2E Tests'
    steps:
    # Setup Node.js environment
    - task: NodeTool@0
      inputs:
        versionSpec: '18.x'
      displayName: 'Install Node.js'
    
    # Install dependencies
    - script: |
        cd $(angularProjectRoot)
        npm ci
      displayName: 'Install Dependencies'
    
    # Install Playwright browsers
    - script: |
        cd $(angularProjectRoot)
        npx playwright install --with-deps chromium
      displayName: 'Install Playwright Browsers'
      
    # Run Playwright tests for register component with HTML reporter
    - script: |
        cd $(angularProjectRoot)
        npx playwright test e2e/register.spec.ts --reporter=html
      displayName: 'Run Register Component E2E Tests'
      continueOnError: true
      
    # Verify report directory exists
    - script: |
        cd $(angularProjectRoot)
        mkdir -p playwright-report
        if [ -d "playwright-report" ]; then
          echo "Playwright report directory exists"
          ls -la playwright-report
        else
          echo "Creating empty report directory"
          mkdir -p playwright-report
          echo "<html><body><h1>Playwright Test Report</h1><p>Tests were executed but no report was generated.</p></body></html>" > playwright-report/index.html
        fi
      displayName: 'Verify Playwright Report Directory'
      continueOnError: true
      
    # Publish Playwright report as artifact
    - task: PublishBuildArtifacts@1
      inputs:
        pathtoPublish: '$(angularProjectRoot)/playwright-report'
        artifactName: 'playwright-report'
      displayName: 'Publish Playwright Report'
      continueOnError: true
      
    # Publish Playwright test results if JUnit format is available
    - task: PublishTestResults@2
      inputs:
        testResultsFormat: 'JUnit'
        testResultsFiles: '$(angularProjectRoot)/playwright-results/*.xml'
        mergeTestResults: true
        testRunTitle: 'Playwright E2E Tests'
      condition: succeededOrFailed()
      displayName: 'Publish Playwright Test Results'
      continueOnError: true
```

**Code Analysis**
```yml
- stage: SonarCloudAnalysis
  displayName: 'SonarCloud Analysis'
  dependsOn: [UnitTesting, UATTesting]
  condition: succeeded()
  jobs:
  - job: RunSonarCloudAnalysis
    displayName: 'Run Code Quality Analysis'
    steps:
    - checkout: self
      fetchDepth: 0
      displayName: 'Checkout Repository'
      
    # Download coverage artifacts from unit tests job
    - task: DownloadBuildArtifacts@0
      inputs:
        buildType: 'current'
        downloadType: 'single'
        artifactName: 'coverage'
        downloadPath: '$(System.DefaultWorkingDirectory)/$(angularProjectRoot)'
      displayName: 'Download Coverage Results'
      continueOnError: true
      
    # Using the SonarCloud service connection
    - task: SonarCloudPrepare@3
      inputs:
        SonarCloud: 'SonarCloudConnection'
        organization: '$(sonarCloudOrganization)'
        scannerMode: 'CLI'
        configMode: 'manual'
        cliProjectKey: '$(sonarCloudProjectKey)'
        cliProjectName: '$(sonarCloudProjectName)'
        cliSources: '$(angularProjectRoot)/src'
        extraProperties: |
          # Sources
          sonar.sources=$(angularProjectRoot)/src
          sonar.exclusions=$(angularProjectRoot)/src/**/*.spec.ts,$(angularProjectRoot)/src/test.ts,$(angularProjectRoot)/src/environments/**,$(angularProjectRoot)/src/assets/**,$(angularProjectRoot)/src/polyfills.ts
          
          # Tests
          sonar.tests=$(angularProjectRoot)/src
          sonar.test.inclusions=$(angularProjectRoot)/src/**/*.spec.ts
          
          # Coverage
          sonar.javascript.lcov.reportPaths=$(angularProjectRoot)/coverage/lcov.info
          sonar.typescript.tsconfigPath=$(angularProjectRoot)/tsconfig.json
          sonar.coverage.exclusions=$(angularProjectRoot)/src/test.ts,$(angularProjectRoot)/src/environments/**,$(angularProjectRoot)/src/polyfills.ts,$(angularProjectRoot)/src/main.ts
      displayName: 'Prepare SonarCloud Analysis'
      
    - task: SonarCloudAnalyze@3
      displayName: 'Run SonarCloud Analysis'
      
    - task: SonarCloudPublish@3
      inputs:
        pollingTimeoutSec: '300'
      displayName: 'Publish SonarCloud Results'
```

---

## Database
Alternatively, the database tables can manually be created using the following SQL queries:

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

**Notifications Table**
```sql
CREATE TABLE Notifications (
    NotificationId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Message NVARCHAR(MAX) NOT NULL DEFAULT '',
    ModuleId UNIQUEIDENTIFIER NOT NULL,
    ModuleTitle NVARCHAR(255) NOT NULL DEFAULT '',
    UserId NVARCHAR(450) NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETUTCDATE(),
    IsRead BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id)
);
```

---

## Developer
**Name**: Keneith June Atillo <br />
**Student ID**: X00190944 <br />
**Course/Year**: Computing with Software Development / Year 4 <br />
**College Email**: X00190944@mytudublin.ie <br />
**LinkedIn**: [Linkedin Profile](https://www.linkedin.com/in/keneithatillo/) <br />
**Portfolio**: [Portfolio Webpage](https://kjatillo.github.io/my-portfolio)

---

## Documentation
Documentation can be found in the `/docs` folder. Files included are:

- **Research Document**: Background research on VLE requirements and technologies.
- **Use Case and Logical Architecture**: Detailed documentation of core application use cases and architectural diagrams.
- **Features Log**: Comprehensive log of features, development milestones, and iteration summaries.
