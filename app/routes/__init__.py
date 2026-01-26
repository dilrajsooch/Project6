"""
Routes package for the Library application.
"""

from app.routes.users import users_bp
from app.routes.books import books_bp
from app.routes.checkouts import checkouts_bp
from app.routes.homepage import homepage_bp

__all__ = ['users_bp', 'books_bp', 'checkouts_bp', 'homepage_bp']
