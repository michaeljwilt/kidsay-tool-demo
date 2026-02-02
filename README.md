# KidSay Analytics AI - Interactive Demo

Fully interactive React demo with **automatic GitHub deployment** - no local setup required!

## 🚀 Deploy in 4 Steps (GitHub Only - No Local Setup!)

### Step 1: Create GitHub Repository
1. Go to https://github.com/new
2. Name it: `kidsay-analytics-demo`
3. Make it **Public**
4. **DO NOT** check "Add a README"
5. Click **Create repository**

### Step 2: Upload All Files
1. Download and unzip `kidsay-demo-react.zip`
2. On GitHub, click **uploading an existing file**
3. Drag **ALL files you see** in the unzipped folder
4. Make sure you see these files being uploaded:
   - `deploy.yml` ✅ (Important!)
   - `package.json`
   - `public/` folder
   - `src/` folder
   - `.gitignore`
   - `README.md`
5. Click **Commit changes**

### Step 3: Move deploy.yml to Correct Location
1. On GitHub, click **Add file** → **Create new file**
2. In the filename field, type: `.github/workflows/deploy.yml`
   - This creates the folders and file at once!
3. Open the `deploy.yml` file you just uploaded (in the root)
4. Copy all its contents
5. Paste into the new `.github/workflows/deploy.yml` file
6. Click **Commit changes**
7. Delete the old `deploy.yml` from the root (click it → trash icon)

### Step 4: Enable GitHub Pages
1. Go to **Settings** → **Pages**
2. Under "Source", select **GitHub Actions**
3. Done!

### Step 5: Wait & Your Site is Live! 🎉
- Go to **Actions** tab to see the build progress (takes 2-3 minutes)
- Once the green checkmark appears, your site is live at:
```
https://YOUR-USERNAME.github.io/kidsay-analytics-demo/
```

---

## ✨ What Happens Automatically

When you commit the workflow file:
1. ✅ GitHub Actions detects it
2. ✅ Installs React and dependencies
3. ✅ Builds your app
4. ✅ Deploys to GitHub Pages
5. ✅ Your interactive site is live!

**No npm, no Node.js, no terminal needed!**

---

## 🎯 What's Interactive

✅ **Fully working chat** - Type questions, get AI responses  
✅ **Suggested questions** - Click to auto-fill input  
✅ **Expandable Future Work** - Click to show/hide features  
✅ **Send button** - Actually processes messages  
✅ **Real-time updates** - Messages appear instantly  

---

## 📝 What's in deploy.yml

This file tells GitHub how to build and deploy your app:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build
      run: npm run build
      
    - name: Upload artifact
      uses: actions/upload-pages-artifact@v2
      with:
        path: './build'
        
    - name: Deploy to GitHub Pages
      uses: actions/deploy-pages@v2
```

---

## 🔧 Troubleshooting

**If you don't see deploy.yml after unzipping:**
- It's included in the zip but may be hidden
- Don't worry! Just follow Step 3 above to create it manually

**If deployment fails:**
1. Check **Actions** tab for error messages
2. Make sure repo is **Public**
3. Make sure `.github/workflows/deploy.yml` exists (not just `deploy.yml` in root)
4. Make sure you selected **GitHub Actions** in Pages settings

**If you see blank page:**
1. Wait 2-3 minutes after deployment completes
2. Hard refresh (Ctrl+F5 or Cmd+Shift+R)
3. Check browser console for errors

---

## 🔄 Making Updates

After initial deployment, any changes you make on GitHub automatically trigger a rebuild and redeploy!

---

## 🤝 Credits

Built for KidSay - Youth Market Research & Insights
