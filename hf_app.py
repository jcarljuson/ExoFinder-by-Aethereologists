#!/usr/bin/env python3
"""
Hugging Face Spaces wrapper for ExoFinder Flask App
This file imports your existing Flask app and runs it on HF infrastructure
NO CHANGES to your original app.py required!
"""

import os
import sys

# Set environment variables for Hugging Face
os.environ['FLASK_ENV'] = 'production'

# Import your existing Flask app (unchanged!)
from app import app

if __name__ == "__main__":
    # Hugging Face Spaces uses port 7860 by default
    port = int(os.environ.get("PORT", 7860))
    
    print("🚀 Starting ExoFinder on Hugging Face Spaces...")
    print(f"🌐 Running on port {port}")
    
    # Run your Flask app exactly as it is
    app.run(
        host="0.0.0.0",
        port=port,
        debug=False,
        threaded=True
    )