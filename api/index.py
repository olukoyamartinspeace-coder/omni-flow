from backend.app import app

# Export the app for Vercel/Netlify serverless
# Vercel looks for 'app' or 'application' by default
# For Flask architecture in this project, we import app directly.

# Ensure the app is served correctly as a serverless function
# This file serves as the entry point for /api/* routes.
