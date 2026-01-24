# Mock Backend API Server

A simple Flask-based mock backend that implements all the API endpoints from your documentation.

## Quick Start

### Option 1: Using the startup script (Recommended)

```bash
cd mock/
./start.sh
```

### Option 2: Manual setup

```bash
cd mock/
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

The server will start at `http://localhost:8080`

## API Endpoints

All endpoints match your API documentation:

### Authentication

- `POST /register` - User registration
- `POST /login` - User login
- `GET /user` - Get user info (requires JWT token)

### Password Recovery

- `POST /recover_password` - Request password reset
- `POST /recover_password/confirm` - Confirm password reset

### Admin

- `POST /admin/load_user` - Load predefined users (requires auth)

### Debug/Testing

- `GET /health` - Health check
- `GET /debug/users` - View all registered users (testing only)

## Default Test Data

The server comes with some predefined users for testing:

### Student IDs that can register:

- `2022010001`
- `2022010002`
- `test001`

### Default Registration Password:

```
registration_password_use_learn_2018_to_distribute
```

## Example Usage

### 1. Register a new user:

```bash
curl -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "2022010001",
    "rPassword": "registration_password_use_learn_2018_to_distribute",
    "email": "test@example.com",
    "password": "hashed_password_from_frontend"
  }'
```

### 2. Login:

```bash
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "2022010001",
    "password": "hashed_password_from_frontend"
  }'
```

### 3. Get user info:

```bash
curl -X GET http://localhost:8080/user \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Features

- **Complete API Implementation**: All endpoints from your documentation
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: Compatible with frontend SHA-256 hashing
- **CORS Enabled**: Works with your frontend
- **In-Memory Storage**: No database setup needed
- **Debug Endpoints**: Easy testing and debugging
- **Error Handling**: Proper HTTP status codes and messages

## Testing with Frontend

1. Start the mock backend: `./start.sh`
2. Update your frontend `.env` file if needed:
   ```
   VITE_API_ENDPOINT=http://localhost:8080
   ```
3. Start your frontend development server
4. Test registration and login functionality

## Notes

- This is a **mock backend for development only**
- Data is stored in memory and will be lost when server restarts
- JWT tokens are valid for 24 hours
- All endpoints return JSON responses
- CORS is enabled for all origins (development only)

## Stopping the Server

Press `Ctrl+C` in the terminal where the server is running.
