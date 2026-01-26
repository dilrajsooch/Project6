"""
Book routes for the Library application.
Handles book listing, searching, filtering, and availability updates.
"""

from flask import Blueprint, request, jsonify
from app.database import get_db_connection

books_bp = Blueprint('books', __name__)


@books_bp.route('', methods=['GET'])
def get_books():
    """
    Get all books with optional filtering and sorting.
    GET /api/books?search=&author=&year=&genre=&available=&sort_by=&order=&limit=&offset=
    
    Query Parameters:
    - search: Search in title (string)
    - author: Filter by author (string)
    - year: Filter by year published (integer)
    - genre: Filter by genre (string)
    - available: Filter by availability (true/false)
    - sort_by: Field to sort by (title, author, year, popularity)
    - order: Sort order (asc, desc)
    - limit: Number of results (default 20)
    - offset: Pagination offset (default 0)
    """
    # Get query parameters
    search = request.args.get('search', '')
    author = request.args.get('author', '')
    year = request.args.get('year', '')
    genre = request.args.get('genre', '')
    available = request.args.get('available', '')
    sort_by = request.args.get('sort_by', 'title')
    order = request.args.get('order', 'asc')
    limit = request.args.get('limit', 20, type=int)
    offset = request.args.get('offset', 0, type=int)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Build query dynamically
    query = 'SELECT * FROM books WHERE 1=1'
    params = []
    
    if search:
        query += ' AND title LIKE ?'
        params.append(f'%{search}%')
    
    if author:
        query += ' AND author LIKE ?'
        params.append(f'%{author}%')
    
    if year:
        query += ' AND year_published = ?'
        params.append(int(year))
    
    if genre:
        query += ' AND genre LIKE ?'
        params.append(f'%{genre}%')
    
    if available.lower() == 'true':
        query += ' AND is_booked = 0'
    elif available.lower() == 'false':
        query += ' AND is_booked = 1'
    
    # Sorting
    valid_sort_fields = ['title', 'author', 'year_published', 'book_id']
    if sort_by == 'year':
        sort_by = 'year_published'
    if sort_by not in valid_sort_fields:
        sort_by = 'title'
    
    order = 'DESC' if order.lower() == 'desc' else 'ASC'
    query += f' ORDER BY {sort_by} {order}'
    
    # Pagination
    query += ' LIMIT ? OFFSET ?'
    params.extend([limit, offset])
    
    cursor.execute(query, params)
    books = cursor.fetchall()
    
    # Get total count for pagination
    count_query = 'SELECT COUNT(*) as total FROM books WHERE 1=1'
    count_params = []
    
    if search:
        count_query += ' AND title LIKE ?'
        count_params.append(f'%{search}%')
    if author:
        count_query += ' AND author LIKE ?'
        count_params.append(f'%{author}%')
    if year:
        count_query += ' AND year_published = ?'
        count_params.append(int(year))
    if genre:
        count_query += ' AND genre LIKE ?'
        count_params.append(f'%{genre}%')
    if available.lower() == 'true':
        count_query += ' AND is_booked = 0'
    elif available.lower() == 'false':
        count_query += ' AND is_booked = 1'
    
    cursor.execute(count_query, count_params)
    total = cursor.fetchone()['total']
    
    conn.close()
    
    return jsonify({
        'books': [dict(book) for book in books],
        'total': total,
        'limit': limit,
        'offset': offset
    }), 200


@books_bp.route('/<int:book_id>', methods=['GET'])
def get_book(book_id):
    """
    Get a specific book by ID.
    GET /api/books/<book_id>
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM books WHERE book_id = ?', (book_id,))
    book = cursor.fetchone()
    conn.close()
    
    if book:
        return jsonify(dict(book)), 200
    else:
        return jsonify({'error': 'Book not found'}), 404


@books_bp.route('/<int:book_id>', methods=['PATCH'])
def update_book(book_id):
    """
    Partially update a book (e.g., availability status).
    PATCH /api/books/<book_id>
    Body: {"is_booked": 0/1, "booked_by_user_id": int, "due_date": "timestamp"}
    """
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if book exists
    cursor.execute('SELECT * FROM books WHERE book_id = ?', (book_id,))
    book = cursor.fetchone()
    
    if not book:
        conn.close()
        return jsonify({'error': 'Book not found'}), 404
    
    # Build update query dynamically
    update_fields = []
    params = []
    
    allowed_fields = ['is_booked', 'booked_by_user_id', 'due_date']
    
    for field in allowed_fields:
        if field in data:
            update_fields.append(f'{field} = ?')
            params.append(data[field])
    
    if not update_fields:
        conn.close()
        return jsonify({'error': 'No valid fields to update'}), 400
    
    params.append(book_id)
    query = f"UPDATE books SET {', '.join(update_fields)} WHERE book_id = ?"
    
    cursor.execute(query, params)
    conn.commit()
    
    # Fetch updated book
    cursor.execute('SELECT * FROM books WHERE book_id = ?', (book_id,))
    updated_book = cursor.fetchone()
    conn.close()
    
    return jsonify({
        'message': 'Book updated successfully',
        'book': dict(updated_book)
    }), 200


@books_bp.route('', methods=['OPTIONS'])
@books_bp.route('/<int:book_id>', methods=['OPTIONS'])
def options_books(book_id=None):
    """
    Return allowed HTTP methods for the books resource.
    OPTIONS /api/books
    OPTIONS /api/books/<book_id>
    """
    if book_id:
        allowed_methods = ['GET', 'PATCH', 'OPTIONS']
    else:
        allowed_methods = ['GET', 'OPTIONS']
    
    response = jsonify({
        'allowed_methods': allowed_methods,
        'resource': 'books'
    })
    response.headers['Allow'] = ', '.join(allowed_methods)
    return response, 200


@books_bp.route('/search', methods=['GET'])
def search_books():
    """
    Search books by title (convenience endpoint).
    GET /api/books/search?q=<query>
    """
    query = request.args.get('q', '')
    limit = request.args.get('limit', 20, type=int)
    
    if not query:
        return jsonify({'error': 'Search query is required'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Intentionally inefficient search for performance testing
    # This does a full table scan with LIKE
    cursor.execute(
        '''SELECT * FROM books 
           WHERE title LIKE ? OR author LIKE ?
           LIMIT ?''',
        (f'%{query}%', f'%{query}%', limit)
    )
    books = cursor.fetchall()
    conn.close()
    
    return jsonify({
        'query': query,
        'results': [dict(book) for book in books],
        'count': len(books)
    }), 200


@books_bp.route('/filters', methods=['GET'])
def get_filter_options():
    """
    Get available filter options (unique authors, years, genres).
    GET /api/books/filters
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get unique authors
    cursor.execute('SELECT DISTINCT author FROM books ORDER BY author LIMIT 100')
    authors = [row['author'] for row in cursor.fetchall()]
    
    # Get unique years
    cursor.execute('SELECT DISTINCT year_published FROM books WHERE year_published IS NOT NULL ORDER BY year_published DESC')
    years = [row['year_published'] for row in cursor.fetchall()]
    
    # Get unique genres
    cursor.execute('SELECT DISTINCT genre FROM books WHERE genre IS NOT NULL ORDER BY genre')
    genres = [row['genre'] for row in cursor.fetchall()]
    
    conn.close()
    
    return jsonify({
        'authors': authors,
        'years': years,
        'genres': genres
    }), 200
