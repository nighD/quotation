# Deployment Architecture

This document tracks the cloud infrastructure providers used for deploying the Quotation application. 

### Infrastructure Stack

- **Database (DB)**: [Supabase](https://supabase.com/) (PostgreSQL with PgBouncer connection pooling)
- **Backend (BE)**: [Render](https://render.com/) (Go application running in Docker container)
- **Frontend (FE)**: [Vercel](https://vercel.com/) (React/Vite single-page application)
- **Cache/Session**: [Upstash](https://upstash.com/) (Serverless Redis)
