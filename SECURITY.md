# 🔐 Security Guidelines

This document outlines security best practices for the Hazard Scout application.

## 🚨 Important Security Notes

### API Keys and Tokens

**NEVER commit sensitive information to GitHub!** This includes:

- ❌ Mapbox API tokens
- ❌ Google Maps API keys
- ❌ Database credentials
- ❌ Secret keys or passwords
- ❌ Private configuration files

### Protected Files

The following files are protected by `.gitignore` and should **NEVER** be committed:

```
.env
.env.local
.env.development
.env.production
*.pem
*.key
secrets.json
```

## ✅ Safe Practices

### 1. Using Environment Variables

Always use environment variables for sensitive data:

```typescript
// ✅ CORRECT - Use environment variables
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// ❌ WRONG - Never hardcode tokens
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZXhhbXBsZSI6...';
```

### 2. Example Configuration File

We provide `.env.example` as a template:
- ✅ Commit `.env.example` (with placeholder values)
- ❌ Never commit `.env` (with real values)

### 3. Setting Up Your Environment

```bash
# 1. Copy the example file
copy .env.example .env

# 2. Edit .env with your actual keys
# 3. Never commit .env to git!
```

## 🛡️ Current Security Measures

### Files Protected by .gitignore

```gitignore
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# API Keys and Secrets
*.pem
*.key
secrets.json
config.local.js
```

### Environment Variables in Use

| Variable | Purpose | Required |
|----------|---------|----------|
| `VITE_MAPBOX_TOKEN` | Mapbox map integration | ✅ Yes |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps (optional) | ❌ No |
| `VITE_V2V_WEBSOCKET_URL` | V2V server endpoint | ❌ No |

## 🔍 Checking for Exposed Secrets

Before committing, check for accidentally exposed secrets:

```bash
# Check what files will be committed
git status

# Verify .env is not listed
git ls-files | Select-String -Pattern "\.env$"

# If .env appears, remove it from tracking
git rm --cached .env
```

## 🚀 Deployment Security

### For Production Deployment:

1. **Never use development tokens in production**
2. **Set environment variables on your hosting platform:**
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Build & Deploy → Environment
   - AWS: Systems Manager Parameter Store
   - Heroku: Settings → Config Vars

3. **Rotate tokens regularly**
4. **Use different tokens for different environments**

### Example: Setting Environment Variables on Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Add environment variable
vercel env add VITE_MAPBOX_TOKEN
```

## 🔒 Token Restrictions

### Mapbox Token Security

Configure your Mapbox token with URL restrictions:

1. Go to https://account.mapbox.com/access-tokens/
2. Click on your token
3. Add URL restrictions:
   ```
   https://yourdomain.com/*
   http://localhost:*
   ```

### Google Maps API Key Security

If using Google Maps:

1. Go to Google Cloud Console
2. Navigate to APIs & Services → Credentials
3. Click on your API key
4. Set Application restrictions:
   - HTTP referrers (websites)
   - Add: `https://yourdomain.com/*`
   - Add: `http://localhost:*`

## ⚠️ What to Do If You Accidentally Commit Secrets

If you accidentally commit API keys or tokens:

1. **Immediately revoke/regenerate the exposed token**
   - Mapbox: https://account.mapbox.com/access-tokens/
   - Google: https://console.cloud.google.com/

2. **Remove from git history:**
   ```bash
   # Remove file from git history (dangerous - use carefully)
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   
   # Force push (only if you're sure)
   git push origin --force --all
   ```

3. **Update .gitignore**
4. **Create new tokens**
5. **Update your local .env**

## 📚 Additional Resources

- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [OWASP: Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Mapbox Token Best Practices](https://docs.mapbox.com/help/troubleshooting/how-to-use-mapbox-securely/)

## ✅ Security Checklist

Before pushing to GitHub:

- [ ] `.env` file is in `.gitignore`
- [ ] No hardcoded API keys in source code
- [ ] `.env.example` has placeholder values only
- [ ] Production tokens are different from development
- [ ] API keys have URL restrictions enabled
- [ ] Ran `git status` to verify no sensitive files

---

**Remember: Security is everyone's responsibility!** 🛡️
