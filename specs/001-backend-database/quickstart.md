# Quickstart Guide: Backend & Database Setup

**Feature**: 001-backend-database
**Date**: 2026-02-23
**Purpose**: Step-by-step guide to set up and run the Todo App backend API

## Prerequisites

- Python 3.9 or higher
- pip (Python package manager)
- Neon PostgreSQL database account (or any PostgreSQL database)
- Git (for cloning the repository)
- Text editor or IDE (VS Code, PyCharm, etc.)

## Step 1: Clone Repository

```bash
git clone <repository-url>
cd phase_II_todo_fullstack_webapplication
git checkout 001-backend-database
```

## Step 2: Set Up Python Environment

### Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**Expected dependencies** (requirements.txt):
```
fastapi==0.109.0
sqlmodel==0.0.14
uvicorn[standard]==0.27.0
psycopg2-binary==2.9.9
pydantic==2.5.3
pydantic-settings==2.1.0
python-dotenv==1.0.0
```

## Step 3: Configure Environment Variables

### Create .env File

```bash
# In the backend/ directory
cp .env.example .env
```

### Edit .env File

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Example for Neon:
# DATABASE_URL=postgresql://user:pass@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb

# Server Configuration (optional)
HOST=0.0.0.0
PORT=8000
```

**Getting Neon Database URL**:
1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string from the dashboard
4. Paste it as DATABASE_URL in .env

## Step 4: Initialize Database

### Option A: Using SQLModel (Recommended for Development)

The application will automatically create tables on first run using SQLModel's `create_all()` method.

### Option B: Using SQL Script (Manual)

If you prefer to create tables manually:

```bash
# Connect to your database using psql or a GUI tool
psql $DATABASE_URL

# Run the SQL from data-model.md
# (Copy the CREATE TABLE statements from specs/001-backend-database/data-model.md)
```

## Step 5: Run the Application

### Start the Development Server

```bash
# From the backend/ directory
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected output**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using StatReload
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Verify Server is Running

Open your browser and navigate to:
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **Alternative Docs**: http://localhost:8000/redoc (ReDoc)
- **Health Check**: http://localhost:8000/health (if implemented)

## Step 6: Test the API

### Using Swagger UI (Recommended)

1. Open http://localhost:8000/docs
2. Expand any endpoint (e.g., POST /users)
3. Click "Try it out"
4. Fill in the request body
5. Click "Execute"
6. View the response

### Using cURL

**Create a User**:
```bash
curl -X POST "http://localhost:8000/users" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "username": "john_doe"
  }'
```

**Expected Response** (201 Created):
```json
{
  "id": 1,
  "email": "john@example.com",
  "username": "john_doe",
  "created_at": "2026-02-23T10:00:00Z"
}
```

**Create a Task**:
```bash
curl -X POST "http://localhost:8000/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete documentation",
    "description": "Write API documentation",
    "user_id": 1
  }'
```

**Expected Response** (201 Created):
```json
{
  "id": 1,
  "title": "Complete documentation",
  "description": "Write API documentation",
  "is_completed": false,
  "user_id": 1,
  "created_at": "2026-02-23T10:05:00Z",
  "updated_at": "2026-02-23T10:05:00Z"
}
```

**Get All Tasks**:
```bash
curl -X GET "http://localhost:8000/tasks"
```

**Toggle Task Completion**:
```bash
curl -X PATCH "http://localhost:8000/tasks/1/toggle"
```

**Update a Task**:
```bash
curl -X PUT "http://localhost:8000/tasks/1" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated title",
    "is_completed": true
  }'
```

**Delete a Task**:
```bash
curl -X DELETE "http://localhost:8000/tasks/1"
```

### Using Postman

1. Import the OpenAPI spec from `specs/001-backend-database/contracts/openapi.yaml`
2. Set base URL to `http://localhost:8000`
3. Execute requests from the collection

## Step 7: Run Tests (Optional)

If tests are implemented:

```bash
# From the backend/ directory
pytest

# With coverage
pytest --cov=app tests/

# Verbose output
pytest -v
```

## Project Structure Overview

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── database.py          # Database connection
│   ├── config.py            # Environment config
│   ├── models/              # SQLModel database models
│   │   ├── user.py
│   │   └── task.py
│   ├── schemas/             # Pydantic request/response schemas
│   │   ├── user.py
│   │   └── task.py
│   ├── routers/             # API endpoints
│   │   ├── users.py
│   │   └── tasks.py
│   └── utils/               # Utilities
│       └── error_handlers.py
├── tests/                   # Test suite (optional)
├── .env                     # Environment variables (not committed)
├── .env.example             # Example environment variables
├── requirements.txt         # Python dependencies
└── README.md                # Project documentation
```

## Common Issues and Solutions

### Issue: "ModuleNotFoundError: No module named 'app'"

**Solution**: Make sure you're running uvicorn from the `backend/` directory, not from the repository root.

```bash
cd backend
uvicorn app.main:app --reload
```

### Issue: "sqlalchemy.exc.OperationalError: could not connect to server"

**Solution**: Check your DATABASE_URL in .env file. Verify:
- Database server is running
- Credentials are correct
- Network connectivity to database host
- Firewall allows connection

### Issue: "422 Unprocessable Entity" when creating tasks

**Solution**: Ensure the user_id in your request references an existing user. Create a user first:

```bash
# Create user first
curl -X POST "http://localhost:8000/users" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "username": "testuser"}'

# Then create task with the returned user ID
curl -X POST "http://localhost:8000/tasks" \
  -H "Content-Type: application/json" \
  -d '{"title": "My task", "user_id": 1}'
```

### Issue: "400 Bad Request: Email already exists"

**Solution**: Each email and username must be unique. Use a different email/username or delete the existing user.

### Issue: Port 8000 already in use

**Solution**: Either stop the process using port 8000, or run on a different port:

```bash
uvicorn app.main:app --reload --port 8001
```

## Development Workflow

### Making Changes

1. Make code changes in `backend/app/`
2. Server auto-reloads (if using `--reload` flag)
3. Test changes via Swagger UI or cURL
4. Verify in database if needed

### Database Changes

If you modify models:
1. Update model definitions in `app/models/`
2. Drop and recreate tables (development only):
   ```python
   # In Python shell or script
   from app.database import engine
   from sqlmodel import SQLModel
   SQLModel.metadata.drop_all(engine)
   SQLModel.metadata.create_all(engine)
   ```
3. For production, use Alembic migrations

### Adding New Endpoints

1. Define Pydantic schemas in `app/schemas/`
2. Add route handler in `app/routers/`
3. Register router in `app/main.py`
4. Test via Swagger UI
5. Update OpenAPI spec if needed

## Next Steps

After the backend is running:

1. **Test all endpoints** using Swagger UI or Postman
2. **Verify data persistence** by checking the database
3. **Review API documentation** at /docs
4. **Prepare for frontend integration** (Spec 2)
5. **Add authentication** (Spec 2)

## Additional Resources

- **FastAPI Documentation**: https://fastapi.tiangolo.com
- **SQLModel Documentation**: https://sqlmodel.tiangolo.com
- **Neon Documentation**: https://neon.tech/docs
- **Pydantic Documentation**: https://docs.pydantic.dev

## Support

For issues or questions:
- Check the API documentation at /docs
- Review the specification at `specs/001-backend-database/spec.md`
- Review the data model at `specs/001-backend-database/data-model.md`
- Check the OpenAPI contract at `specs/001-backend-database/contracts/openapi.yaml`

## Summary

You should now have:
- ✅ Backend API running on http://localhost:8000
- ✅ Database connected and tables created
- ✅ API documentation accessible at /docs
- ✅ All CRUD endpoints functional and testable

The backend is ready for frontend integration and authentication implementation (Spec 2).
