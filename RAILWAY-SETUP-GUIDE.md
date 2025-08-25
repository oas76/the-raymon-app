# 🚂 Railway Deployment Setup Guide

## 📋 **Environment Variables for Railway**

**Once Railway deploys your backend, you'll need to set these environment variables in the Railway dashboard:**

### **🔧 Required Environment Variables:**

```bash
# Server Configuration
NODE_ENV=production
PORT=8080

# Database (Railway will provide MongoDB)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/raymon_app

# JWT & Sessions (Generate secure secrets)
JWT_SECRET=your_super_secure_jwt_secret_32_chars_min
SESSION_SECRET=your_super_secure_session_secret_32_chars_min

# OAuth Credentials (UPDATE THESE!)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Frontend URL (Your Vercel URL)
FRONTEND_URL=https://the-raymon-5mcb5pjbs-oas76s-projects.vercel.app
CORS_ORIGINS=https://the-raymon-5mcb5pjbs-oas76s-projects.vercel.app
```

## 🔑 **OAuth App Updates Needed**

### **Google OAuth App:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your OAuth app
3. **Add Authorized Redirect URIs:**
   ```
   https://your-railway-app.up.railway.app/api/auth/google/callback
   ```
4. **Add Authorized Origins:**
   ```
   https://your-railway-app.up.railway.app
   https://the-raymon-5mcb5pjbs-oas76s-projects.vercel.app
   ```

### **Facebook OAuth App:**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Navigate to your app settings
3. **Add Valid OAuth Redirect URIs:**
   ```
   https://your-railway-app.up.railway.app/api/auth/facebook/callback
   ```
4. **Add App Domains:**
   ```
   the-raymon-5mcb5pjbs-oas76s-projects.vercel.app
   your-railway-app.up.railway.app
   ```

## 🎯 **After Railway Deployment:**

1. **Copy your Railway URL** (e.g., `https://web-production-abcd.up.railway.app`)
2. **Come back here** - I'll update your Vercel config with the Railway URL
3. **Update OAuth apps** with the Railway callback URLs
4. **Test authentication** - should work perfectly!

## 🔍 **Testing Your Deployment:**

**Backend Health Check:**
```bash
curl https://your-railway-url/api/health
# Should return: {"status":"OK","message":"The Raymon App is running"}
```

**Frontend + Backend Connection:**
- Visit your Vercel app
- Try registering/logging in
- OAuth should now work with the production URLs!

## 🆘 **Common Issues & Solutions:**

**Build Fails?**
- Check the Railway logs for specific errors
- Ensure all environment variables are set

**Database Connection Issues?**
- Railway provides MongoDB - use their connection string
- Check MONGO_URI format

**OAuth Still Not Working?**
- Double-check redirect URIs in OAuth apps
- Ensure FRONTEND_URL matches your Vercel domain exactly
- Check CORS_ORIGINS includes both Railway and Vercel URLs

---

## ✅ **Once Done, You'll Have:**

- 🌐 **Frontend**: https://the-raymon-5mcb5pjbs-oas76s-projects.vercel.app
- 🚀 **Backend**: https://your-railway-app.up.railway.app
- 🔑 **OAuth**: Working with Google & Facebook
- 📱 **Fully Functional**: Production-ready golf app!
