from backend.app import app

# Root-level entrypoint for Vercel Flask detection.
# Vercel scans for 'app' in app.py, api/app.py, api/index.py, etc.
# This ensures compatibility regardless of which path Vercel checks first.

if __name__ == '__main__':
    app.run(debug=False)
