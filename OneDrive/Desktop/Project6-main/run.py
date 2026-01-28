"""
Main entry point for the Library application.
Run this file to start the Flask development server.
"""

from app import create_app

app = create_app()

if __name__ == '__main__':
    print("Starting Library Web Server...")
    print("Access the application at: http://localhost:5000")
    print("API endpoints available at: http://localhost:5000/api/")
    app.run(host='0.0.0.0', port=5000, debug=True)
