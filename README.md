# Sentinel Guard 

Sentinel Guard is a middleware-first API firewall and security layer built with Next.js.  
It intercepts incoming requests, enforces security rules, detects attacks, and provides admin-level security insights.

---

##  Features
- Global API request interception (Edge Middleware)
- Firewall rule engine (IP, method, route)
- IP-based rate limiting
- Attack detection & threat scoring
- Automatic temporary IP blocking
- Security analytics using MongoDB aggregations
- Secure admin authentication (JWT)

---

##  Architecture Overview

Client Request  
→ Next.js Middleware (Edge)  
→ Firewall Rules  
→ Rate Limiter  
→ API Route (Node.js)  
→ Logging & Threat Analysis (MongoDB)

Admin access is handled separately using JWT-protected APIs.

---

##  Tech Stack
- Next.js (App Router)
- JavaScript (Node.js runtime)
- MongoDB (Mongoose)
- JWT Authentication
- Edge Middleware (Vercel-compatible)

---

##  Security Design Decisions
- No public admin signup (one-time provisioning)
- Middleware-first request interception
- Separation of public traffic security and admin control plane
- Edge-safe logic for rate limiting and blocking

---

##  Local Setup

```bash
npm install
npm run dev
```

Environment variables:
```
MONGODB_URI=...
JWT_SECRET=...
```
