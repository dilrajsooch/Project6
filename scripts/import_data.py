"""
Data import script for the Library application.
Imports book data from Kaggle dataset CSV files.

Dataset: https://www.kaggle.com/datasets/arashnic/book-recommendation-dataset
Expected files:
- Books.csv (contains book information)

Usage:
    python scripts/import_data.py [--limit N]
"""

import csv
import sqlite3
import os
import sys
import argparse
import random

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

DATABASE_PATH = os.environ.get('DATABASE_PATH', 'data/library.db')
DATA_DIR = 'data'


def get_db_connection():
    """Create database connection."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def import_books(csv_path, limit=10000):
    """
    Import books from CSV file.
    
    Expected CSV columns (from Kaggle dataset):
    - ISBN
    - Book-Title
    - Book-Author
    - Year-Of-Publication
    - Publisher
    - Image-URL-S (small)
    - Image-URL-M (medium)
    - Image-URL-L (large)
    """
    if not os.path.exists(csv_path):
        print(f"Error: CSV file not found at {csv_path}")
        print("Please download the dataset from:")
        print("https://www.kaggle.com/datasets/arashnic/book-recommendation-dataset")
        print(f"And place Books.csv in the {DATA_DIR}/ directory")
        return False
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Clear existing books
    cursor.execute('DELETE FROM books')
    conn.commit()
    
    # Sample genres for random assignment (dataset doesn't have genres)
    genres = [
        'Fiction', 'Non-Fiction', 'Mystery', 'Science Fiction', 
        'Fantasy', 'Romance', 'Thriller', 'Biography', 
        'History', 'Self-Help', 'Science', 'Children'
    ]
    
    count = 0
    errors = 0
    
    print(f"Importing books from {csv_path}...")
    print(f"Limit: {limit} books")
    
    with open(csv_path, 'r', encoding='latin-1') as file:
        reader = csv.DictReader(file, delimiter=';')
        
        for row in reader:
            if count >= limit:
                break
            
            try:
                # Extract data from CSV
                isbn = row.get('ISBN', '').strip()
                title = row.get('Book-Title', '').strip()
                author = row.get('Book-Author', '').strip()
                year_str = row.get('Year-Of-Publication', '').strip()
                image_url = row.get('Image-URL-M', '').strip()  # Use medium size
                
                # Skip if missing essential data
                if not title or not author:
                    continue
                
                # Parse year (handle invalid years)
                try:
                    year = int(year_str) if year_str else None
                    # Filter out unrealistic years
                    if year and (year < 1800 or year > 2024):
                        year = None
                except ValueError:
                    year = None
                
                # Assign random genre (since dataset doesn't have genres)
                genre = random.choice(genres)
                
                # Insert into database
                cursor.execute('''
                    INSERT INTO books (isbn, title, author, year_published, genre, image_url)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (isbn, title, author, year, genre, image_url))
                
                count += 1
                
                if count % 1000 == 0:
                    print(f"  Imported {count} books...")
                    conn.commit()
                    
            except Exception as e:
                errors += 1
                if errors < 10:
                    print(f"  Error importing row: {e}")
    
    conn.commit()
    conn.close()
    
    print(f"\nImport complete!")
    print(f"  Total books imported: {count}")
    print(f"  Errors: {errors}")
    
    return True


def create_sample_users(num_users=100):
    """
    Create sample users for testing.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Clear existing users
    cursor.execute('DELETE FROM users')
    conn.commit()
    
    print(f"Creating {num_users} sample users...")
    
    for i in range(1, num_users + 1):
        username = f"user{i}"
        password = f"pass{i}"
        
        cursor.execute(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            (username, password)
        )
    
    conn.commit()
    conn.close()
    
    print(f"Created {num_users} users (user1/pass1 through user{num_users}/pass{num_users})")


def create_sample_checkouts(num_checkouts=500):
    """
    Create sample checkout history for testing trending and recommendations.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Clear existing checkouts
    cursor.execute('DELETE FROM checkouts')
    cursor.execute('UPDATE books SET is_booked = 0, booked_by_user_id = NULL, due_date = NULL')
    conn.commit()
    
    # Get all users and books
    cursor.execute('SELECT user_id FROM users')
    users = [row['user_id'] for row in cursor.fetchall()]
    
    cursor.execute('SELECT book_id FROM books')
    books = [row['book_id'] for row in cursor.fetchall()]
    
    if not users or not books:
        print("Error: Need users and books before creating checkouts")
        conn.close()
        return
    
    print(f"Creating {num_checkouts} sample checkouts...")
    
    from datetime import datetime, timedelta
    
    for i in range(num_checkouts):
        user_id = random.choice(users)
        book_id = random.choice(books)
        
        # Random date in the last 30 days
        days_ago = random.randint(0, 30)
        checkout_date = datetime.now() - timedelta(days=days_ago)
        due_date = checkout_date + timedelta(days=7)
        
        # 80% are returned, 20% still active
        is_returned = 1 if random.random() < 0.8 else 0
        return_date = checkout_date + timedelta(days=random.randint(1, 7)) if is_returned else None
        
        cursor.execute('''
            INSERT INTO checkouts (book_id, user_id, checkout_date, due_date, is_returned, return_date)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            book_id, 
            user_id, 
            checkout_date.strftime('%Y-%m-%d %H:%M:%S'),
            due_date.strftime('%Y-%m-%d %H:%M:%S'),
            is_returned,
            return_date.strftime('%Y-%m-%d %H:%M:%S') if return_date else None
        ))
    
    conn.commit()
    conn.close()
    
    print(f"Created {num_checkouts} sample checkouts")


def main():
    parser = argparse.ArgumentParser(description='Import book data for Library application')
    parser.add_argument('--limit', type=int, default=10000, help='Maximum number of books to import')
    parser.add_argument('--users', type=int, default=100, help='Number of sample users to create')
    parser.add_argument('--checkouts', type=int, default=500, help='Number of sample checkouts to create')
    parser.add_argument('--books-only', action='store_true', help='Only import books, skip users and checkouts')
    args = parser.parse_args()
    
    csv_path = os.path.join(DATA_DIR, 'Books.csv')
    
    # Import books
    success = import_books(csv_path, limit=args.limit)
    
    if success and not args.books_only:
        # Create sample users
        create_sample_users(args.users)
        
        # Create sample checkouts
        create_sample_checkouts(args.checkouts)
    
    print("\nData import complete!")
    print("\nTo run the application:")
    print("  docker-compose up --build")
    print("  OR")
    print("  python run.py")


if __name__ == '__main__':
    main()
