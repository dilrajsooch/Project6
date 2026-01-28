#Tests for database functions
import os
import sqlite3
import pytest

DB_PATH = 'data/library.db'

#fixture to set up and tear down a test database
@pytest.fixture(scope='module')
def db_connection():
    if not os.path.exists(DB_PATH):
        pytest.fail(f"Database file not found: {DB_PATH}")

    conn = sqlite3.connect(DB_PATH)
    yield conn
    conn.close()

@pytest.fixture(scope='module')
def cursor(db_connection):
    return db_connection.cursor()

@pytest.fixture(scope='module')
def record_count(cursor):
    cursor.execute("SELECT COUNT(*) FROM books")
    return cursor.fetchone()[0]

#Book table tests
def test_books_table_exists(cursor):
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='books'")
    assert cursor.fetchone() is not None, "Books table does not exist"
def test_books_table_columns(cursor):
    cursor.execute("PRAGMA table_info(books)")
    columns = [col[1] for col in cursor.fetchall()]
    expected_columns = ['book_id', 'isbn', 'title', 'author', 'year_published', 'genre', 'image_url', 'is_booked', 'booked_by_user_id', 'due_date']
    for col in expected_columns:
        assert col in columns, f"Missing column in books table: {col}"
def test_books_record_count(record_count):
    assert record_count > 0, "No records found in books table"
def test_sample_book_record(cursor):
    cursor.execute("SELECT isbn, title, author FROM books LIMIT 1")
    record = cursor.fetchone()
    assert record is not None, "No sample record found in books table"
    isbn, title, author = record
    assert isinstance(isbn, str) and len(isbn) > 0, "Invalid ISBN in sample record"
    assert isinstance(title, str) and len(title) > 0, "Invalid title in sample record"
    assert isinstance(author, str) and len(author) > 0, "Invalid author in sample record"