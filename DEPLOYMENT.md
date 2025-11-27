# Deploying Vibe Coding Helper API

## Option 1: Azure App Service (Recommended)

### Via Azure Portal

1. **Create Web App**:
   - Go to Azure Portal  Create Resource  Web App
   - Name: `vibe-coding-helper`
   - Runtime: Node 20 LTS
   - Region: Your preferred region
   - Pricing: F1 (Free) or B1 (Basic)

2. **Configure Deployment**:
   - Deployment Center  GitHub
   - Select: `richardichogan/vibe-coding-helper`
   - Branch: `master`
   - Save

3. **Access Your API**:
   ```
   https://vibe-coding-helper.azurewebsites.net/api/patterns
   ```

### Via Azure CLI

```bash
# Login
az login

# Create resource group
az group create --name vibe-coding-helper-rg --location eastus

# Create App Service plan (F1 free tier)
az appservice plan create --name vibe-coding-helper-plan --resource-group vibe-coding-helper-rg --sku F1 --is-linux

# Create Web App
az webapp create --resource-group vibe-coding-helper-rg --plan vibe-coding-helper-plan --name vibe-coding-helper --runtime "NODE:20-lts"

# Configure GitHub deployment
az webapp deployment source config --name vibe-coding-helper --resource-group vibe-coding-helper-rg --repo-url https://github.com/richardichogan/vibe-coding-helper --branch master --manual-integration
```

## Option 2: Railway (Fastest)

1. Go to https://railway.app
2. "New Project"  "Deploy from GitHub repo"
3. Select `vibe-coding-helper`
4. Railway auto-detects Node.js and deploys
5. Access at: `https://vibe-coding-helper.railway.app`

## Option 3: Render (Simple)

1. Go to https://render.com
2. "New"  "Web Service"
3. Connect GitHub: `richardichogan/vibe-coding-helper`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Access at: `https://vibe-coding-helper.onrender.com`

## Testing Locally

```bash
cd vibe-coding-helper
npm install
npm start
```

Access at: http://localhost:3333/api/patterns

## API Endpoints

Once deployed, you can access:

- **List all patterns**: `GET https://your-app.azurewebsites.net/api/patterns`
- **Search patterns**: `GET https://your-app.azurewebsites.net/api/patterns/search?q=auth`
- **Get specific pattern**: `GET https://your-app.azurewebsites.net/api/patterns/auth/azure-ad-msal`
- **List by category**: `GET https://your-app.azurewebsites.net/api/patterns/category/auth`

---

## Using Patterns in Your Projects

### Method 1: Direct API Call

```javascript
// Fetch pattern from web API
const response = await fetch('https://vibe-coding-helper.azurewebsites.net/api/patterns/auth/azure-ad-msal');
const pattern = await response.json();
console.log(pattern.content); // Full markdown content
```

### Method 2: GitHub Raw Content

```javascript
// Fetch directly from GitHub
const url = 'https://raw.githubusercontent.com/richardichogan/vibe-coding-helper/master/patterns/auth/azure-ad-msal.md';
const response = await fetch(url);
const content = await response.text();
```

### Method 3: Clone Repo

```bash
# Clone once on each PC
git clone https://github.com/richardichogan/vibe-coding-helper.git

# Copy pattern to your project
cp vibe-coding-helper/patterns/auth/azure-ad-msal.md docs/patterns/
```

### Method 4: npm Script (For Teams)

Add to your project''s `package.json`:

```json
{
  "scripts": {
    "get-pattern": "curl https://vibe-coding-helper.azurewebsites.net/api/patterns/$CATEGORY/$NAME -o patterns/$NAME.md"
  }
}
```

Usage:
```bash
CATEGORY=auth NAME=azure-ad-msal npm run get-pattern
```

---

## Cost Estimates

- **Azure F1 Free**: $0/month (60 CPU minutes/day, 1GB RAM)
- **Azure B1 Basic**: ~$13/month (always on, 1.75GB RAM)
- **Railway**: Free tier 500 hours/month, then $5/month
- **Render**: Free tier (spins down after 15min idle)

## Recommendation

**Start with Railway or Render (free, fastest)**  
 Deploy to Azure once you need always-on availability
