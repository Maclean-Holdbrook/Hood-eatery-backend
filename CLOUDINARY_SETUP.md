# Cloudinary Setup Guide for Hood Eatery

## Why Cloudinary?

Vercel's serverless environment doesn't support persistent file storage. Cloudinary provides:
- ✅ Cloud-based image storage
- ✅ Free tier (25 credits/month, 25GB storage)
- ✅ Automatic image optimization
- ✅ CDN delivery for fast loading
- ✅ Works perfectly with Vercel

## Step 1: Create Cloudinary Account

1. Go to: https://cloudinary.com/users/register_free
2. Sign up for a free account
3. After signing in, you'll be on the **Dashboard**

## Step 2: Get Your Credentials

From the Cloudinary Dashboard, copy these three values:

- **Cloud Name**: (Example: `dxxxxxx`)
- **API Key**: (Example: `123456789012345`)
- **API Secret**: (Example: `AbCdEfGhIjKlMnOpQrStUvWxYz`)

## Step 3: Update Backend .env File

Add these three lines to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

Replace the values with your actual Cloudinary credentials from Step 2.

## Step 4: Update server.js to Use Cloudinary Routes

In `src/server.js`, replace:

```javascript
import menuRoutes from './routes/menuRoutes.js';
```

With:

```javascript
import menuRoutes from './routes/menuRoutesCloudinary.js';
```

That's it! The routes variable stays the same (`menuRoutes`).

## Step 5: Set Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **Hood Eatery Backend** project
3. Go to **Settings** → **Environment Variables**
4. Add these three variables:

| Name | Value | Environment |
|------|-------|-------------|
| `CLOUDINARY_CLOUD_NAME` | Your cloud name | Production |
| `CLOUDINARY_API_KEY` | Your API key | Production |
| `CLOUDINARY_API_SECRET` | Your API secret | Production |

5. Click **Save** for each one
6. **Redeploy** your backend from the Deployments tab

## Step 6: Test Upload

1. Log in to your admin panel: `https://hood-eatery.vercel.app/admin`
2. Go to Menu Management
3. Try adding a new menu item with an image
4. The image should upload to Cloudinary
5. Check your Cloudinary dashboard to see the uploaded image

## Files Created

The following files have been created for Cloudinary integration:

- `src/config/cloudinary.js` - Cloudinary configuration
- `src/middleware/cloudinaryUpload.js` - Upload middleware
- `src/controllers/menuControllerCloudinary.js` - Menu controller with Cloudinary
- `src/routes/menuRoutesCloudinary.js` - Routes using Cloudinary

## How It Works

### Before (Local Storage):
```
Upload → Saves to /uploads/menu/ → Lost on Vercel redeploy ❌
```

### After (Cloudinary):
```
Upload → Cloudinary Cloud → Permanent URL → Stored in database ✅
```

## Benefits

1. **Images persist** across deployments
2. **Automatic optimization** - images are compressed and optimized
3. **CDN delivery** - fast loading worldwide
4. **Transformations** - automatic resizing to 800x800
5. **No git bloat** - images not stored in repository

## Cleanup (Optional)

After confirming Cloudinary works, you can:

1. Remove uploaded images from git:
   ```bash
   git restore .gitignore
   git rm -r --cached uploads/
   git commit -m "Remove uploaded images, now using Cloudinary"
   git push
   ```

2. Delete local `uploads/` folder (backend will use Cloudinary only)

## Troubleshooting

### Images not uploading?
- Check that all three Cloudinary env vars are set correctly
- Check Vercel environment variables are saved
- Redeploy backend after adding env vars

### Old images still showing local URLs?
- This is normal - existing database records have local URLs
- New uploads will use Cloudinary URLs
- You can update old records through the admin panel

### Want to migrate existing images to Cloudinary?
- Re-upload images through the admin panel
- The new uploads will go to Cloudinary automatically

## Support

- Cloudinary Docs: https://cloudinary.com/documentation
- Cloudinary Free Tier: 25 GB storage, 25 credits/month
- Upgrade options available if you need more
