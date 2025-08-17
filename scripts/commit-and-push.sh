#!/bin/bash

# The Raymon App - Quick Commit and Push Script
# Usage: ./scripts/commit-and-push.sh "Your commit message"

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 The Raymon App - Git Commit & Push${NC}"
echo "================================================"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Not in a Git repository${NC}"
    exit 1
fi

# Check if remote origin exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: No 'origin' remote configured${NC}"
    echo "Please set up your GitHub remote first:"
    echo "git remote add origin https://github.com/YOUR_USERNAME/the-raymon-app.git"
    exit 1
fi

# Get commit message from parameter or prompt
if [ -z "$1" ]; then
    echo -n "Enter commit message: "
    read -r COMMIT_MESSAGE
else
    COMMIT_MESSAGE="$1"
fi

if [ -z "$COMMIT_MESSAGE" ]; then
    echo -e "${RED}❌ Error: Commit message cannot be empty${NC}"
    exit 1
fi

# Check for changes
echo -e "${BLUE}📋 Checking for changes...${NC}"
if git diff-index --quiet HEAD --; then
    echo -e "${GREEN}✅ No changes to commit${NC}"
else
    echo -e "${BLUE}📝 Changes detected:${NC}"
    git status --short
    
    # Add all changes
    echo -e "${BLUE}➕ Adding changes...${NC}"
    git add .
    
    # Commit
    echo -e "${BLUE}💾 Committing changes...${NC}"
    git commit -m "$COMMIT_MESSAGE"
    
    echo -e "${GREEN}✅ Changes committed successfully${NC}"
fi

# Push to GitHub
echo -e "${BLUE}🚀 Pushing to GitHub...${NC}"
if git push origin main; then
    echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
    echo -e "${GREEN}🌐 Your changes are now live on GitHub${NC}"
else
    echo -e "${RED}❌ Failed to push to GitHub${NC}"
    echo "Please check your internet connection and GitHub credentials"
    exit 1
fi

echo "================================================"
echo -e "${GREEN}🎉 Git operations completed successfully!${NC}"
