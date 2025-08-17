#!/bin/bash

# The Raymon App - Git Aliases for Easy Version Control
# Source this file to get convenient Git shortcuts
# Usage: source git-aliases.sh

# Easy commit and push
alias save='./scripts/commit-and-push.sh'
alias commit='./scripts/commit-and-push.sh'

# Quick status and log
alias gs='git status'
alias gl='git log --oneline -10'
alias gll='git log --oneline -20'

# Branch operations
alias gb='git branch'
alias gco='git checkout'
alias gcb='git checkout -b'

# Sync with remote
alias pull='git pull origin main'
alias push='git push origin main'

# View changes
alias gd='git diff'
alias gds='git diff --staged'

# Add files
alias ga='git add .'
alias gap='git add -p'

echo "🎯 Git aliases loaded for The Raymon App!"
echo "Available commands:"
echo "  save 'message'  - Add, commit, and push changes"
echo "  gs             - Git status"
echo "  gl             - Recent commit log"
echo "  gd             - View changes"
echo "  pull           - Pull from GitHub"
echo "  push           - Push to GitHub"
