# Deployment Guide for Math Learning Platform

## Quick Deploy Links
- **Frontend (Vercel):** https://vercel.com/new
- **Backend (Railway):** https://railway.app/new

## Option 1: One-Click Deploy (Recommended)

### Frontend to Vercel:
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/YOUR_REPO&root-directory=apps/web)

### Backend to Railway:
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new?template=https://github.com/YOUR_USERNAME/YOUR_REPO&plugins=postgresql&envs=PORT,CORS_ORIGIN&PORT.default=3001&CORS_ORIGIN.default=https://your-frontend.vercel.app)

## Option 2: Manual Deployment

### Step 1: Prepare Your Repository
1. Push your code to GitHub
2. Make sure `apps/web` and `apps/api` folders exist

### Step 2: Deploy Backend (Railway)

1. **Go to** [railway.app](https://railway.app)
2. **Sign up** with GitHub
3. Click **New Project**
4. Select **Deploy from GitHub repo**
5. Choose your repository
6. Configure:
   - **Root Directory:** `apps/api`
   - **Build Command:** (leave empty)
   - **Start Command:** `npm start`
7. Add Environment Variables:
   ```
   PORT=3001
   CORS_ORIGIN=https://your-frontend.vercel.app
   NODE_ENV=production
   ```
8. Click **Deploy**
9. Copy your API URL: `https://your-project.up.railway.app`

### Step 3: Deploy Frontend (Vercel)

1. **Go to** [vercel.com](https://vercel.com)
2. **Sign up** with GitHub
3. Click **New Project**
4. Import your GitHub repository
5. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `apps/web`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Add Environment Variable:
   ```
   VITE_API_URL=https://your-api.up.railway.app
   ```
7. Click **Deploy**
8. Copy your frontend URL: `https://your-project.vercel.app`

### Step 4: Update CORS

1. Go back to Railway dashboard
2. Find your API project
3. Go to **Variables**
4. Update `CORS_ORIGIN` to your Vercel URL
5. Redeploy if needed

## Environment Variables

### Backend (Railway):
```
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.vercel.app
KBZPAY_API_KEY=your_key_here
KBZPAY_MERCHANT_ID=your_merchant_id
KBZPAY_WEBHOOK_SECRET=your_secret
```

### Frontend (Vercel):
```
VITE_API_URL=https://your-api.up.railway.app
```

## Testing Your Deployment

1. **Test API:** `https://your-api.up.railway.app/health`
   - Should return: `{"status":"healthy"}`

2. **Test Frontend:** `https://your-frontend.vercel.app`
   - Should load the math learning platform

3. **Test Integration:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Refresh page
   - Should see API calls to your Railway backend

## Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Check `CORS_ORIGIN` matches your frontend URL exactly
   - Include protocol: `https://your-frontend.vercel.app`

2. **API Not Found:**
   - Check Railway logs
   - Verify PORT is set correctly
   - Check if `npm start` works locally

3. **Frontend Build Fails:**
   - Check Vercel build logs
   - Ensure all dependencies in package.json
   - Check Node.js version compatibility

4. **Environment Variables Missing:**
   - Add in Railway/Vercel dashboard
   - Redeploy after adding variables

## Monitoring

### Railway:
- Go to Project → Metrics
- View logs, CPU usage, memory

### Vercel:
- Go to Project → Analytics
- View traffic, performance

## Custom Domain (Optional)

1. **Buy domain** from Namecheap/GoDaddy
2. **Vercel:** Add domain in Project → Domains
3. **Railway:** Add domain in Project → Settings → Custom Domains
4. **Update CORS_ORIGIN** to new domain

## Cost
- **Vercel:** Free forever (static sites)
- **Railway:** $5/month free credits (enough for small API)
- **Total:** $0 if within free tiers

## Support
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- GitHub Issues: For code problems