# Deployment Guide - Recipe Generator

## Quick Deployment Steps

### Frontend Deployment (Vercel)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Setup deployment configuration"
   git push
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com/dashboard
   - Click "New Project"
   - Import your GitHub repository
   - Select the `frontend` folder as the root directory
   - Click "Deploy"

3. **Add Environment Variables in Vercel Dashboard**
   - After deployment, go to Project Settings → Environment Variables
   - Add `VITE_API_URL` with your Render backend URL (e.g., `https://your-backend.onrender.com/api`)
   - Redeploy to apply changes

### Backend Deployment (Render)

1. **Prepare Environment Variables**
   - Copy `.env.example` to `.env.local` and fill in all values
   - Ensure you have a PostgreSQL database URL ready

2. **Deploy on Render**
   - Go to https://dashboard.render.com
   - Click "New +"
   - Select "Web Service"
   - Connect your GitHub repository
   - Select the backend repository root
   - Configure the following:
     - **Name:** recipe-generator-api
     - **Environment:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Plan:** Free or Paid (based on needs)

3. **Add Environment Variables in Render**
   - Go to the service Settings → Environment Variables
   - Add all variables from `.env.example`:
     - `DATABASE_URL` (Render PostgreSQL connection string)
     - `JWT_SECRET` (generate a secure random key)
     - `GEMINI_API_KEY` (from Google AI Studio)
     - `FRONTEND_URL` (your Vercel frontend URL)
     - `NODE_ENV=production`
     - `PORT=5000`

4. **Add PostgreSQL Database in Render**
   - Go to Render Dashboard → New + → PostgreSQL
   - Create a new PostgreSQL instance
   - Copy the connection string to `.env` as `DATABASE_URL`
   - Add the connection string in the web service environment variables

5. **Deploy the Backend**
   - Once all environment variables are set, Render will automatically deploy
   - Monitor the deployment logs to ensure everything starts correctly

## Important Considerations

### Security
- Never commit `.env` files (already in `.gitignore`)
- Use strong, randomly generated JWT_SECRET
- Ensure DATABASE_URL uses SSL in production
- Use environment-specific variables for API keys

### CORS Configuration
- Frontend URL is automatically allowed in the backend
- Add any additional allowed origins in `server.js` if needed

### Database Migrations
- Run database migrations on Render before first deployment
- Use the following command in Render console or add to build script:
  ```bash
  node migrate.js
  ```

### Vercel Build Settings
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Render Service Health Checks
- Render checks the root endpoint `/` for health
- Ensure your API responds with a 200 status code at `/`

## Troubleshooting

### CORS Errors
- Verify `FRONTEND_URL` is set correctly in backend environment variables
- Check that the frontend URL matches exactly (including https://)

### Database Connection Issues
- Verify `DATABASE_URL` format is correct
- Ensure PostgreSQL database is running on Render
- Check firewall/security group settings

### Build Failures
- Check that `package.json` has all required scripts
- Verify all dependencies are listed in `package.json`
- Check build logs in Vercel/Render dashboard

## Post-Deployment

1. Test the deployed application
2. Monitor logs for any errors
3. Set up monitoring/alerts in Vercel and Render
4. Keep dependencies updated regularly

## Useful Links

- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- Environment Variables in Vercel: https://vercel.com/docs/environment-variables
- Environment Variables in Render: https://render.com/docs/environment-variables
