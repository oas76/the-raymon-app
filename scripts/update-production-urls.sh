#!/bin/bash

# Update Production URLs Script for The Raymon App
# Usage: ./scripts/update-production-urls.sh <railway-backend-url>

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Railway backend URL required${NC}"
    echo "Usage: $0 <railway-backend-url>"
    echo "Example: $0 https://web-production-abcd.up.railway.app"
    exit 1
fi

RAILWAY_URL="$1"
BACKEND_API_URL="${RAILWAY_URL}/api"
VERCEL_FRONTEND_URL="https://the-raymon-5mcb5pjbs-oas76s-projects.vercel.app"

echo -e "${BLUE}🔄 Updating The Raymon App Production URLs${NC}"
echo "================================================"
echo -e "${YELLOW}Backend URL:${NC} $RAILWAY_URL"
echo -e "${YELLOW}Frontend URL:${NC} $VERCEL_FRONTEND_URL"
echo "================================================"

# Update vercel.json with production backend URL
echo -e "${BLUE}📝 Updating vercel.json...${NC}"
cat > vercel.json << EOF
{
  "buildCommand": "npm run vercel-build",
  "outputDirectory": "frontend/build",
  "installCommand": "npm install",
  "devCommand": "npm run frontend",
  "env": {
    "REACT_APP_API_URL": "$BACKEND_API_URL"
  }
}
EOF

echo -e "${GREEN}✅ vercel.json updated with production backend URL${NC}"

# Show OAuth redirect URLs that need to be configured
echo -e "${BLUE}🔑 OAuth Configuration URLs:${NC}"
echo "================================================"
echo -e "${YELLOW}Google OAuth Redirect URI:${NC}"
echo "  ${RAILWAY_URL}/api/auth/google/callback"
echo ""
echo -e "${YELLOW}Facebook OAuth Redirect URI:${NC}"
echo "  ${RAILWAY_URL}/api/auth/facebook/callback"
echo ""
echo -e "${YELLOW}Authorized Origins:${NC}"
echo "  $RAILWAY_URL"
echo "  $VERCEL_FRONTEND_URL"
echo "================================================"

# Commit changes
echo -e "${BLUE}💾 Committing changes...${NC}"
git add vercel.json
git commit -m "Update Vercel config with Railway backend URL

✅ Connected frontend to production backend: $RAILWAY_URL  
🔗 Updated REACT_APP_API_URL for production
🚀 Ready for OAuth configuration and final testing"

echo -e "${BLUE}🚀 Pushing to GitHub...${NC}"
git push origin main

echo -e "${GREEN}✅ Production URLs updated successfully!${NC}"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "1. Update OAuth apps with the redirect URLs shown above"
echo "2. Set environment variables in Railway dashboard"
echo "3. Redeploy Vercel: vercel --prod"
echo "4. Test authentication on your live app!"
echo ""
echo -e "${GREEN}🎉 Almost done! Your app will be fully functional after OAuth setup.${NC}"
