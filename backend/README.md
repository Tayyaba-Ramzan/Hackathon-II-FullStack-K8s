---
title: Todo AI Chatbot Backend
emoji: 🤖
colorFrom: purple
colorTo: violet
sdk: docker
pinned: false
license: mit
---

# Todo AI Chatbot Backend API

AI-powered conversational task management backend built with FastAPI and OpenAI.

## Features

- 🤖 **AI Chatbot**: Natural language task management using OpenAI
- 🔐 **JWT Authentication**: Secure user authentication with bcrypt
- 💾 **PostgreSQL Database**: Powered by Neon serverless PostgreSQL
- 🛠️ **MCP Tools**: AI agent can create, update, and delete tasks
- 📝 **Conversation History**: Maintains context across sessions
- ⚡ **Rate Limiting**: 60 requests per minute per user
- 🔒 **CORS Protection**: Configurable allowed origins

## Quick Start (Hugging Face Spaces)

This backend is designed to run on Hugging Face Spaces. See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

### Required Environment Secrets

Configure these in your Space settings under **Settings → Repository secrets**:

| Secret Name | Description | Required |
|------------|-------------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string with `?sslmode=require` | ✅ Yes |
| `JWT_SECRET` | Secret key for JWT tokens (min 32 characters) | ✅ Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI chatbot | ✅ Yes |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | ⚠️ Recommended |
| `JWT_EXPIRATION_HOURS` | JWT token expiration (default: 1) | ❌ Optional |
| `LOG_LEVEL` | Logging level (default: INFO) | ❌ Optional |

## API Documentation

Once deployed, access the interactive API documentation at:
- **Swagger UI**: `/docs`
- **ReDoc**: `/redoc`
- **OpenAPI Schema**: `/openapi.json`
- **Health Check**: `/health`

## API Endpoints

### Health & Root
- `GET /` - API information
- `GET /health` - Health check endpoint

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/signin` - Login and receive JWT token

### Chat (Protected)
- `POST /api/chat` - Send message to AI chatbot

### Tasks (Protected)
- `GET /api/tasks` - Get all tasks for authenticated user
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/{task_id}` - Update a task
- `DELETE /api/tasks/{task_id}` - Delete a task
- `PATCH /api/tasks/{task_id}/complete` - Mark task as complete

### Conversations (Protected)
- `GET /api/conversations` - Get all conversations
- `GET /api/conversations/{conversation_id}` - Get specific conversation
- `DELETE /api/conversations/{conversation_id}` - Delete conversation

All protected endpoints require JWT authentication via `Authorization: Bearer <token>` header.

## Local Development

### Prerequisites
- Python 3.11+
- PostgreSQL database (Neon recommended)
- OpenAI API key

### Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Run the server
uvicorn src.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## Tech Stack

- **Framework**: FastAPI 0.115.0
- **Database**: PostgreSQL (Neon) with asyncpg and SQLModel
- **AI**: OpenAI API 1.57.4
- **Authentication**: JWT with bcrypt password hashing
- **Server**: Uvicorn with async support
- **Deployment**: Docker on Hugging Face Spaces (port 7860)

## Security Features

- **Password Hashing**: Bcrypt with secure salt rounds
- **JWT Tokens**: Stateless authentication with configurable expiration
- **User Isolation**: Users can only access their own tasks and conversations
- **Input Validation**: Pydantic schemas validate all inputs
- **CORS**: Configurable allowed origins with credentials support
- **Rate Limiting**: 60 requests per minute per user
- **SSL/TLS**: Enforced database connections with `sslmode=require`

## Project Structure

```
backend/
├── src/
│   ├── main.py              # FastAPI application entry point
│   ├── api/                 # API route handlers
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── chat.py          # AI chatbot endpoints
│   │   ├── tasks.py         # Task management endpoints
│   │   ├── conversations.py # Conversation endpoints
│   │   └── rate_limiter.py  # Rate limiting middleware
│   ├── services/            # Business logic
│   │   ├── agent_service.py # OpenAI agent integration
│   │   ├── conversation_service.py
│   │   ├── openai_client.py
│   │   └── logger.py
│   ├── mcp/                 # MCP tools for AI agent
│   │   ├── add_task.py
│   │   ├── update_task.py
│   │   ├── delete_task.py
│   │   ├── list_tasks.py
│   │   └── complete_task.py
│   ├── models/              # Database models
│   │   ├── user.py
│   │   ├── conversation.py
│   │   └── message.py
│   ├── auth/                # Authentication utilities
│   │   ├── middleware.py
│   │   └── utils.py
│   └── db/                  # Database connection
│       └── connection.py
├── app/
│   ├── config.py            # Configuration settings
│   └── models/              # Additional models
│       ├── task.py
│       └── user.py
├── Dockerfile               # Docker configuration for HF Spaces
├── requirements.txt         # Python dependencies
├── .env.example             # Environment variables template
├── DEPLOYMENT.md            # Deployment guide
└── README.md                # This file
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete Hugging Face Spaces deployment instructions.

## Error Responses

All errors follow a consistent JSON format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "details": {}  // Optional additional details
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `422` - Unprocessable Entity (validation error)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` includes `?sslmode=require`
- Check Neon database is active (not suspended)
- Ensure connection string format is correct

### JWT Token Errors
- **"Token expired"**: Token exceeded expiration time. Login again.
- **"Invalid token"**: Token is malformed or signature invalid.
- **"Not authenticated"**: Missing Authorization header.

### OpenAI API Errors
- Verify `OPENAI_API_KEY` is correct
- Check OpenAI account has available credits
- Review rate limits and usage

### CORS Errors
- Add your frontend URL to `ALLOWED_ORIGINS`
- Format: `https://your-app.vercel.app,https://another-domain.com`
- No trailing slashes

## License

MIT License - see LICENSE file for details

## Support

For deployment issues, see [DEPLOYMENT.md](./DEPLOYMENT.md) or open an issue in the repository.
