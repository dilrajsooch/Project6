"""
Homepage routes for the Library application.
Contains the main page and recommendation logic.
INTENTIONALLY INEFFICIENT for performance testing purposes.
"""

from flask import Blueprint, request, jsonify, render_template
from app.database import get_db_connection
from datetime import datetime, timedelta
import time

_trending_cache = {'data': None, 'timestamp': 0}
TRENDING_CACHE_TTL = 60  # seconds

homepage_bp = Blueprint('homepage', __name__)


@homepage_bp.route('/')
def index():
    """
    Render the homepage.
    """
    return render_template('index.html')


@homepage_bp.route('/api/homepage', methods=['GET'])
def get_homepage_data():
    """
    Get all homepage data including trending and recommendations.
    This endpoint is INTENTIONALLY INEFFICIENT - it recalculates
    everything on every request without caching.
    
    GET /api/homepage?user_id=<int>
    """
    user_id = request.args.get('user_id', type=int)
    
    # Get trending books (most checkouts in last 7 days)
    trending = get_trending_books()
    
    # Get recommendations if user is logged in
    recommendations = {}
    if user_id:
        recommendations = get_user_recommendations(user_id)
    
    return jsonify({
        'trending': trending,
        'recommendations': recommendations
    }), 200


def get_trending_books():
    """
    Get top 5 trending books based on checkouts in the last 7 days.
    Cached for TRENDING_CACHE_TTL seconds to reduce repeated DB hits.
    """
    now = time.time()
    if _trending_cache['data'] is not None and (now - _trending_cache['timestamp']) < TRENDING_CACHE_TTL:
        return _trending_cache['data']

    conn = get_db_connection()
    cursor = conn.cursor()

    seven_days_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d %H:%M:%S')

    cursor.execute('''
        SELECT b.*, COUNT(c.checkout_id) as checkout_count
        FROM books b
        LEFT JOIN checkouts c ON b.book_id = c.book_id AND c.checkout_date >= ?
        GROUP BY b.book_id
        ORDER BY checkout_count DESC
        LIMIT 5
    ''', (seven_days_ago,))

    trending = cursor.fetchall()
    conn.close()

    result = [dict(book) for book in trending]
    _trending_cache['data'] = result
    _trending_cache['timestamp'] = now
    return result


def get_user_recommendations(user_id):
    """
    Get personalized recommendations for a user.
    Uses batch queries instead of per-author/per-year/per-user loops.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Get user's last 3 checkouts
    cursor.execute('''
        SELECT c.book_id, b.author, b.year_published, b.genre
        FROM checkouts c
        JOIN books b ON c.book_id = b.book_id
        WHERE c.user_id = ?
        ORDER BY c.checkout_date DESC
        LIMIT 3
    ''', (user_id,))

    recent_checkouts = cursor.fetchall()

    if not recent_checkouts:
        conn.close()
        return {
            'by_author': [],
            'by_year': [],
            'similar_users': [],
            'message': 'No checkout history found. Check out some books to get recommendations!'
        }

    # Extract authors, years from recent checkouts
    recent_authors = list(set([c['author'] for c in recent_checkouts if c['author']]))
    recent_years = list(set([c['year_published'] for c in recent_checkouts if c['year_published']]))
    recent_book_ids = [c['book_id'] for c in recent_checkouts]
    exclude_placeholders = ','.join('?' * len(recent_book_ids))

    # 1. Books by same author(s) — single batch query with IN clause
    author_placeholders = ','.join('?' * len(recent_authors))
    cursor.execute('''
        SELECT * FROM books
        WHERE author IN ({}) AND book_id NOT IN ({})
        LIMIT 10
    '''.format(author_placeholders, exclude_placeholders),
    recent_authors + recent_book_ids)
    by_author = [dict(b) for b in cursor.fetchall()]

    # 2. Books from same year(s) — single batch query with IN clause
    year_placeholders = ','.join('?' * len(recent_years))
    cursor.execute('''
        SELECT * FROM books
        WHERE year_published IN ({}) AND book_id NOT IN ({})
        LIMIT 10
    '''.format(year_placeholders, exclude_placeholders),
    recent_years + recent_book_ids)
    by_year = [dict(b) for b in cursor.fetchall()]

    # 3. Books checked out by similar users — single JOIN query instead of nested loop
    cursor.execute('''
        SELECT DISTINCT b.*
        FROM checkouts c1
        JOIN checkouts c2 ON c1.book_id = c2.book_id AND c2.user_id != ?
        JOIN books b ON b.book_id = c2.book_id
        WHERE c1.user_id = ?
        AND b.book_id NOT IN ({})
        LIMIT 10
    '''.format(exclude_placeholders),
    [user_id, user_id] + recent_book_ids)
    similar_users_books = [dict(b) for b in cursor.fetchall()]

    conn.close()

    # Deduplicate
    seen_ids = set()
    unique_by_author = []
    for book in by_author:
        if book['book_id'] not in seen_ids:
            seen_ids.add(book['book_id'])
            unique_by_author.append(book)

    seen_ids_year = set()
    unique_by_year = []
    for book in by_year:
        if book['book_id'] not in seen_ids_year:
            seen_ids_year.add(book['book_id'])
            unique_by_year.append(book)

    seen_ids_similar = set()
    unique_similar = []
    for book in similar_users_books:
        if book['book_id'] not in seen_ids_similar:
            seen_ids_similar.add(book['book_id'])
            unique_similar.append(book)
    
    return {
        'by_author': unique_by_author[:10],
        'by_year': unique_by_year[:10],
        'similar_users': unique_similar[:10],
        'based_on_books': [c['book_id'] for c in recent_checkouts]
    }


@homepage_bp.route('/api/homepage/trending', methods=['GET'])
def get_trending_endpoint():
    """
    Get only trending books.
    GET /api/homepage/trending
    """
    return jsonify({
        'trending': get_trending_books()
    }), 200


@homepage_bp.route('/api/homepage/recommendations/<int:user_id>', methods=['GET'])
def get_recommendations_endpoint(user_id):
    """
    Get only recommendations for a user.
    GET /api/homepage/recommendations/<user_id>
    """
    return jsonify({
        'user_id': user_id,
        'recommendations': get_user_recommendations(user_id)
    }), 200
