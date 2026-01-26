"""
Flask application factory for the Library application.
"""

from flask import Flask
from flask_cors import CORS
from app.database import init_db
import os


def create_app():
    """
    Application factory function.
    Creates and configures the Flask application.
    """
    app = Flask(__name__, 
                template_folder='../templates',
                static_folder='../static')
    
    # Configuration
    app.config['SECRET_KEY'] = 'dev-secret-key-change-in-production'
    app.config['DATABASE_PATH'] = os.environ.get('DATABASE_PATH', 'data/library.db')
    
    # Enable CORS for API routes
    CORS(app)
    
    # Initialize database
    with app.app_context():
        # Ensure data directory exists
        os.makedirs('data', exist_ok=True)
        init_db()
    
    # Register blueprints (routes)
    from app.routes.users import users_bp
    from app.routes.books import books_bp
    from app.routes.checkouts import checkouts_bp
    from app.routes.homepage import homepage_bp
    
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(books_bp, url_prefix='/api/books')
    app.register_blueprint(checkouts_bp, url_prefix='/api/checkouts')
    app.register_blueprint(homepage_bp)
    
    return app
