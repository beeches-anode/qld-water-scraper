# **Deploying to Vercel - Step-by-Step Guide**

## **Prerequisites**
- A GitHub account (free)
- A Vercel account (free tier available)
- Your project already in a Git repository (✅ You have this)

## **Step 1: Create a Vercel Account**

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** (top right)
3. Choose **"Continue with GitHub"** (recommended - easiest integration)
4. Authorize Vercel to access your GitHub account
5. You're now on the Vercel dashboard

## **Step 2: Prepare Your Repository**

Since your Next.js app is in the `web/` subdirectory, you have two options:

### **Option A: Deploy from Root (Recommended)**
Configure Vercel to use `web/` as the root directory.

### **Option B: Move to Root**
Move Next.js files to the repository root (more complex, not recommended).

**We'll use Option A.**

## **Step 3: Push Your Code to GitHub**

If your code isn't already on GitHub:

```bash
# Make sure you're in the project root
cd /Users/trentjordan/code_projects/water-scraper

# Check if you have a remote
git remote -v

# If no remote exists, create a GitHub repo and add it:
# (Go to github.com, create a new repo, then:)
git remote add origin https://github.com/YOUR_USERNAME/water-scraper.git
git branch -M main
git push -u origin main
```

## **Step 4: Deploy on Vercel**

1. **In Vercel Dashboard:**
   - Click **"Add New..."** → **"Project"**
   - Import your GitHub repository (`water-scraper`)
   - Vercel will auto-detect it's a Next.js project

2. **Configure Project Settings:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `web` ← **IMPORTANT: Set this to `web`**
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

3. **Environment Variables (if needed):**
   - If your app uses any `.env` variables, add them here
   - Click **"Add"** for each variable

4. **Click "Deploy"**
   - First deployment takes ~2-3 minutes
   - Vercel will show you a live build log

## **Step 5: Post-Deployment**

After deployment completes:

- **Your site URL:** `https://water-scraper-xxxxx.vercel.app` (auto-generated)
- **Custom Domain:** You can add your own domain later (free tier supports this)
- **Automatic Deployments:** Every push to `main` branch = new deployment

## **Step 6: Verify Configuration**

After your first deployment, verify:
- Site loads correctly
- All routes work
- No build errors in the Vercel dashboard logs

## **Troubleshooting**

**Build Fails:**
- Check the build logs in Vercel dashboard
- Ensure `web/package.json` has correct dependencies
- Verify Node.js version (Vercel uses Node 18.x by default)

**404 Errors:**
- Ensure `Root Directory` is set to `web` in project settings
- Check that `next.config.ts` is correct

**Environment Variables Missing:**
- Add them in: Project Settings → Environment Variables

## **Vercel Free Tier Limits**

- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Custom domains
- ⚠️ Serverless functions: 100GB-hours/month
- ⚠️ Build minutes: 6,000/month (plenty for personal projects)

## **Next Steps**

1. Test your deployment
2. Set up a custom domain (optional)
3. Configure branch previews (Vercel creates preview URLs for PRs automatically)

