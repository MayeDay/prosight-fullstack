# ProSight DIY — Full Stack (Local Development)

A marketplace connecting DIY homeowners with licensed professionals for project oversight.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 |
| Backend | ASP.NET Core 8 Web API (C#) |
| Database | SQL Server (via Docker) |
| Auth | JWT (JSON Web Tokens) + BCrypt |
| ORM | Entity Framework Core 8 |

---

## Prerequisites

Install these before starting:

1. **[.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8)** — for the ASP.NET backend
2. **[Node.js 18+](https://nodejs.org)** — for the React frontend
3. **[Docker Desktop](https://www.docker.com/products/docker-desktop)** — for SQL Server locally

---

## Local Setup (Step by Step)

### Step 1 — Start SQL Server in Docker

```bash
docker-compose up -d
```

This starts a SQL Server container on port `1433`. Wait about 10 seconds for it to be ready.

Verify it's running:
```bash
docker ps
```

---

### Step 2 — Run the ASP.NET API

```bash
cd ProSight.API

# Restore NuGet packages
dotnet restore

# Install EF Core tools (first time only)
dotnet tool install --global dotnet-ef

# Create the initial database migration
dotnet ef migrations add InitialCreate

# Apply migration + auto-seed demo data
dotnet run
```

The API will start at **http://localhost:5000**

You can browse the full API at **http://localhost:5000/swagger**

---

### Step 3 — Run the React Frontend

Open a **new terminal**:

```bash
cd prosight-client

npm install
npm start
```

The app opens at **http://localhost:3000**

---

## Demo Accounts

Once running, log in with any of these:

| Name | Email | Password | Role |
|---|---|---|---|
| Marcus T. | marcus@example.com | password123 | Homeowner |
| Sandra K. | sandra@example.com | password123 | Homeowner |
| Dave R. | dave@example.com | password123 | Pro (Electrician) |
| Elena M. | elena@example.com | password123 | Pro (Contractor) |

Or click **Sign Up** to create your own real account.

---

## Project Structure

```
prosight-fullstack/
├── docker-compose.yml              ← SQL Server container
│
├── ProSight.API/                   ← ASP.NET C# backend
│   ├── Controllers/
│   │   ├── AuthController.cs       ← POST /api/auth/register & /login
│   │   ├── ProjectsController.cs   ← CRUD + apply + accept
│   │   ├── MessagesController.cs   ← GET & POST messages per project
│   │   ├── ReviewsController.cs    ← Create & fetch pro reviews
│   │   └── UsersController.cs      ← Pro listing + /me profile
│   ├── Models/                     ← EF Core entity classes
│   │   ├── User.cs
│   │   ├── Project.cs
│   │   └── Message.cs              ← Also contains Application, Review
│   ├── DTOs/
│   │   └── Dtos.cs                 ← All request/response records
│   ├── Data/
│   │   ├── AppDbContext.cs         ← EF DbContext + table config
│   │   └── DatabaseSeeder.cs      ← Demo data on first run
│   ├── Services/
│   │   └── TokenService.cs         ← JWT creation
│   ├── Program.cs                  ← App startup + DI + middleware
│   └── appsettings.json            ← Connection string + JWT config
│
└── prosight-client/                ← React frontend
    └── src/
        ├── api/
        │   └── client.js           ← All fetch() calls to the API
        ├── context/
        │   └── AppContext.js       ← Global state + auth
        ├── hooks/
        │   ├── useMessages.js      ← Real-time message fetch + send
        │   └── usePostProject.js   ← Project form state + submit
        ├── pages/
        │   ├── LandingPage.jsx
        │   ├── LoginPage.jsx       ← Real login + registration form
        │   ├── HomeownerDashboard.jsx
        │   ├── ProDashboard.jsx
        │   └── MessagesPage.jsx
        ├── components/
        │   ├── Header.jsx
        │   ├── Toast.jsx
        │   ├── StatusBadge.jsx
        │   ├── PostProjectModal.jsx
        │   └── MessageThread.jsx
        └── styles/
            └── global.css
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Get JWT token |

### Projects
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/projects | ✅ | All projects (filter by ?status=open) |
| GET | /api/projects/mine | ✅ | Current user's projects |
| POST | /api/projects | Homeowner | Create project |
| POST | /api/projects/{id}/apply | Pro | Apply to oversee |
| GET | /api/projects/{id}/applications | Homeowner | View applicants |
| POST | /api/projects/{id}/accept/{proId} | Homeowner | Accept a pro |
| POST | /api/projects/{id}/complete | Homeowner | Mark completed |

### Messages
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/projects/{id}/messages | ✅ | Get all messages |
| POST | /api/projects/{id}/messages | ✅ | Send a message |

### Reviews
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/reviews/pro/{proId} | Public | Get pro's reviews |
| POST | /api/reviews | Homeowner | Submit a review |

### Users
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/users/pros | Public | List all pros |
| GET | /api/users/me | ✅ | Current user profile |

---

## What Would Be Needed for Production

- Change `Jwt:Secret` in appsettings to a long random string stored in environment variables
- Use Azure App Service (backend) + Azure Static Web Apps (frontend) + Azure SQL
- Add HTTPS enforcement
- Add rate limiting on auth endpoints
- Add email verification on registration
- Add real-time messaging with SignalR (WebSockets)
