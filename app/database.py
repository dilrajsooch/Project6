"""
Database module for the Library application.
Handles SQLite database connections and schema creation.
"""

import sqlite3
import os
from datetime import datetime, timedelta

DATABASE_PATH = os.environ.get('DATABASE_PATH', 'data/library.db')


def get_db_connection():
    """
    Create and return a database connection.
    Uses Row factory for dictionary-like access to rows.
    """
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """
    Initialize the database with all required tables.
    Called once when the application starts.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Books table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS books (
            book_id INTEGER PRIMARY KEY AUTOINCREMENT,
            isbn TEXT UNIQUE,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            year_published INTEGER,
            genre TEXT,
            image_url TEXT,
            is_booked INTEGER DEFAULT 0,
            booked_by_user_id INTEGER,
            due_date TIMESTAMP,
            FOREIGN KEY (booked_by_user_id) REFERENCES users(user_id)
        )
    ''')
    
    # Checkouts table (history of all checkouts for trending/recommendations)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS checkouts (
            checkout_id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            checkout_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            return_date TIMESTAMP,
            due_date TIMESTAMP NOT NULL,
            is_returned INTEGER DEFAULT 0,
            FOREIGN KEY (book_id) REFERENCES books(book_id),
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    ''')
    
    # Create indexes for better query performance (can be removed to test slow queries)
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_books_author ON books(author)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_books_year ON books(year_published)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_books_genre ON books(genre)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_checkouts_user ON checkouts(user_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_checkouts_book ON checkouts(book_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_checkouts_date ON checkouts(checkout_date)')
    
    conn.commit()
    conn.close()
    print("Database initialized successfully!")


def drop_all_tables():
    """
    Drop all tables - useful for resetting the database during development.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('DROP TABLE IF EXISTS checkouts')
    cursor.execute('DROP TABLE IF EXISTS books')
    cursor.execute('DROP TABLE IF EXISTS users')
    
    conn.commit()
    conn.close()
    print("All tables dropped!")


if __name__ == '__main__':
    # If run directly, initialize the database
    init_db()
