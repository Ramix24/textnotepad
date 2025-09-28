# TextNotepad Waitlist API Documentation

## Base URL
```
https://textnotepad.vercel.app/api
```

## Authentication
- **Public endpoints:** No authentication required for joining waitlist
- **Admin endpoints:** Bearer token authentication required

---

## 📝 Waitlist API

### Join Waitlist
Add an email to the waitlist for launch notifications.

**Endpoint:** `POST /waitlist`

**Request Body:**
```json
{
  "email": "user@example.com",          // Required: Valid email address
  "name": "John Doe",                   // Optional: User's name
  "source": "waitlist"                  // Optional: "waitlist" or "beta" (default: "waitlist")
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "You're on the list! We'll notify you when TextNotepad launches.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "created_at": "2025-09-28T13:45:30.123Z"
  }
}
```

**Error Responses:**

**400 - Invalid Input:**
```json
{
  "success": false,
  "message": "Invalid email address"
}
```

**409 - Duplicate Email:**
```json
{
  "success": false,
  "message": "You are already on the waitlist!"
}
```

**503 - Service Unavailable:**
```json
{
  "success": false,
  "message": "Waitlist feature not available - please try again later"
}
```

---

### Get Waitlist Stats
Retrieve basic waitlist statistics (public endpoint).

**Endpoint:** `GET /waitlist`

**Success Response (200):**
```json
{
  "success": true,
  "stats": {
    "total": 42,
    "waitlist": 35,
    "beta": 7,
    "recent": [
      {
        "source": "waitlist",
        "created_at": "2025-09-28T13:45:30.123Z"
      }
    ]
  }
}
```

---

## 🔐 Admin API

### Admin Authentication
All admin endpoints require Bearer token authentication.

**Header Required:**
```
Authorization: Bearer YOUR_ADMIN_PASSWORD
```

---

### Get Full Waitlist Data
Retrieve detailed waitlist entries with pagination.

**Endpoint:** `GET /admin/waitlist`

**Query Parameters:**
- `limit` (optional): Number of entries to return (default: 50, max: 100)
- `offset` (optional): Number of entries to skip (default: 0)

**Example Request:**
```
GET /admin/waitlist?limit=10&offset=0
Authorization: Bearer waitlist2024
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "user@example.com",
        "name": "John Doe",
        "source": "waitlist",
        "created_at": "2025-09-28T13:45:30.123Z",
        "updated_at": "2025-09-28T13:45:30.123Z",
        "metadata": {
          "user_agent": "Mozilla/5.0...",
          "ip": "192.168.1.1",
          "timestamp": "2025-09-28T13:45:30.123Z"
        }
      }
    ],
    "stats": {
      "total": 42,
      "waitlist": 35,
      "beta": 7
    },
    "pagination": {
      "total": 42,
      "limit": 10,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

### Export Email Lists
Export email addresses for marketing campaigns.

**Endpoint:** `POST /admin/waitlist`

**Request Body:**
```json
{
  "source": "waitlist"  // Optional: "waitlist", "beta", or omit for all
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "count": 35,
    "emails": "user1@example.com, user2@example.com, user3@example.com",
    "csv": [
      {
        "email": "user1@example.com",
        "name": "John Doe",
        "created_at": "9/28/2025"
      },
      {
        "email": "user2@example.com",
        "name": "",
        "created_at": "9/27/2025"
      }
    ]
  }
}
```

---

## 🚨 Error Responses

### Authentication Errors

**401 - Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**503 - Service Unavailable:**
```json
{
  "error": "Admin features not available - missing configuration"
}
```

---

## 📊 Database Schema

### Waitlist Table
```sql
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  source TEXT DEFAULT 'waitlist' CHECK (source IN ('waitlist', 'beta')),
  metadata JSONB DEFAULT '{}'
);
```

### Indexes
- `waitlist_email_idx` - Fast email lookups
- `waitlist_created_at_idx` - Sorted by creation date
- `waitlist_source_idx` - Filter by source type

---

## 🔧 Rate Limiting
- **Public endpoints:** No rate limiting currently applied
- **Admin endpoints:** Protected by authentication only

---

## 🚀 Usage Examples

### JavaScript/Fetch
```javascript
// Join waitlist
const response = await fetch('https://textnotepad.vercel.app/api/waitlist', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'John Doe',
    source: 'waitlist'
  })
});

const result = await response.json();
console.log(result);
```

### cURL
```bash
# Join waitlist
curl -X POST https://textnotepad.vercel.app/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"John Doe"}'

# Get admin data
curl -H "Authorization: Bearer waitlist2024" \
  https://textnotepad.vercel.app/api/admin/waitlist
```

### Python
```python
import requests

# Join waitlist
response = requests.post(
    'https://textnotepad.vercel.app/api/waitlist',
    json={
        'email': 'user@example.com',
        'name': 'John Doe',
        'source': 'waitlist'
    }
)

print(response.json())
```

---

## 🔍 Web Interface

### Admin Dashboard
- **URL:** `https://textnotepad.vercel.app/admin`
- **Password:** `waitlist2024`
- **Features:**
  - View signup statistics
  - Browse recent entries
  - Export email lists
  - Copy emails to clipboard

---

## 📝 Notes

1. **Email Validation:** Emails are validated using Zod schema validation
2. **Duplicate Prevention:** The database enforces email uniqueness
3. **GDPR Compliance:** Metadata is stored for consent tracking
4. **Data Retention:** No automatic cleanup policy currently implemented
5. **Security:** Row Level Security (RLS) is enabled on the database

---

## 🐛 Troubleshooting

### Common Issues

**503 Service Unavailable:**
- Check if environment variables are set in production
- Verify Supabase connection

**401 Unauthorized:**
- Verify admin password in Authorization header
- Check if `ADMIN_PASSWORD` environment variable is set

**Validation Errors:**
- Ensure email format is valid
- Check required fields are provided

---

*Last Updated: September 28, 2025*