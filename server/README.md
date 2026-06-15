TemplateHub Server
===================

This folder contains a minimal Express + MongoDB scaffold for TemplateHub, including JWT authentication and project CRUD.

Quick start (requires MongoDB running locally):

1. Copy `.env.example` to `.env` and update values.
2. Install dependencies:

```bash
cd server
npm install
```

3. Start the server:

```bash
npm start
```

API endpoints:
- `POST /auth/signup` — { name, email, password }
- `POST /auth/login` — { email, password }
- `GET /projects` — (requires `Authorization: Bearer <token>`) list user's projects
- `POST /projects` — save or create project (requires auth)
- `DELETE /projects/:id` — delete project (requires auth)
