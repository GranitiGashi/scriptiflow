# Environment Setup Guide

## Frontend (.env.local)

Create a file named `.env.local` in the `scriptiflow` directory with the following content:

```env
# Backend API URL (REQUIRED)
NEXT_PUBLIC_BASE_DOMAIN=https://scriptiflow-server.onrender.com

# For local development, use:
# NEXT_PUBLIC_BASE_DOMAIN=http://localhost:8081

# Supabase (if using on frontend)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe (if needed on frontend)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

## Backend (.env)

Create a file named `.env` in the `scriptiflow_server` directory with the following content:

```env
# Server Configuration
PORT=8081
NODE_ENV=production

# Frontend URL (for CORS and redirects)
FRONTEND_URL=https://app.scriptiflow.com

# Supabase Configuration (REQUIRED)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret

# Email Configuration (if using email features)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@scriptiflow.com

# Stripe Configuration (if using payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# OpenAI Configuration (if using AI features)
OPENAI_API_KEY=your_openai_api_key

# State Token Secret (for secure links)
STATE_TOKEN_SECRET=your_random_secret_string

# Worker Configuration (optional)
RUN_INLINE_WORKER=false
INLINE_WORKER_INTERVAL_MS=4000
IMAGE_WORKER_BATCH=3
SOCIAL_WORKER_BATCH=5
```

## Important Notes

1. **Never commit `.env` or `.env.local` files to git**
2. Replace all `your_*` placeholders with actual values
3. For Render.com deployment, add these environment variables in the Render dashboard
4. After creating these files, restart both frontend and backend servers

## Troubleshooting

If you're still getting login errors:

1. Check browser console for the actual error message
2. Verify the backend URL is correct and accessible
3. Ensure Supabase credentials are valid
4. Check CORS settings if requests are being blocked
5. Verify the backend server is running and responding





