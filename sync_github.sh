#!/bin/bash

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Error: git is not installed. Please install git first."
    exit 1
fi

echo "🚀 Starting GitHub Synchronization..."

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing new Git repository..."
    git init
else
    echo "ℹ️  Git repository already initialized."
fi

# Add all files
echo "➕ Adding files to staging..."
git add .

# Ask for commit message
echo "💬 Enter commit message (Press Enter for default: 'Update Nexus User System'):"
read COMMIT_MSG
if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Update Nexus User System"
fi

# Commit
git commit -m "$COMMIT_MSG"

# Branch renaming to main
git branch -M main

# Check if remote exists
REMOTE_URL=$(git remote get-url origin 2>/dev/null)

if [ -z "$REMOTE_URL" ]; then
    echo "🔗 No remote repository found."
    echo "Please enter your GitHub Repository URL (e.g., https://github.com/username/nexus-system.git):"
    read NEW_REMOTE_URL
    
    if [ -z "$NEW_REMOTE_URL" ]; then
        echo "❌ No URL provided. Aborting push."
        exit 1
    fi
    
    git remote add origin "$NEW_REMOTE_URL"
else
    echo "🔗 Using existing remote: $REMOTE_URL"
fi

# Push
echo "⬆️  Pushing to GitHub..."
git push -u origin main

echo "✅ Done! Your code is synced."
