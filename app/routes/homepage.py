"""
Homepage routes for the Library application.
Contains the main page and recommendation logic.
INTENTIONALLY INEFFICIENT for performance testing purposes.
"""

from flask import Blueprint, request, jsonify, render_template
from app.database import get_db_connection
from datetime import datetime, timedelta

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
    INTENTIONALLY INEFFICIENT: No caching, calculates on every call.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    seven_days_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d %H:%M:%S')
    
    # Inefficient query: joins and aggregation without optimization
    cursor.execute('''
        SELECT b.*, COUNT(c.checkout_id) as checkout_count
        FROM books b
        LEFT JOIN checkouts c ON b.book_id = c.book_id
        WHERE c.checkout_date >= ? OR c.checkout_date IS NULL
        GROUP BY b.book_id
        ORDER BY checkout_count DESC
        LIMIT 5
    ''', (seven_days_ago,))
    
    trending = cursor.fetchall()
    conn.close()
    
    return [dict(book) for book in trending]


def get_user_recommendations(user_id):
    """
    Get personalized recommendations for a user.
    INTENTIONALLY INEFFICIENT: Multiple separate queries, no caching,
    recalculates everything on every page load.
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
    
    # INEFFICIENT: Separate query for each recommendation type
    
    # 1. Books by same author(s)
    by_author = []
    for author in recent_authors:
        # Intentionally inefficient: separate query per author
        cursor.execute('''
            SELECT * FROM books
            WHERE author = ? AND book_id NOT IN ({})
            LIMIT 5
        '''.format(','.join('?' * len(recent_book_ids))),
        [author] + recent_book_ids)
        by_author.extend([dict(b) for b in cursor.fetchall()])
    
    # 2. Books from same year(s)
    by_year = []
    for year in recent_years:
        # Intentionally inefficient: separate query per year
        cursor.execute('''
            SELECT * FROM books
            WHERE year_published = ? AND book_id NOT IN ({})
            LIMIT 5
        '''.format(','.join('?' * len(recent_book_ids))),
        [year] + recent_book_ids)
        by_year.extend([dict(b) for b in cursor.fetchall()])
    
    # 3. Books checked out by similar users
    # VERY INEFFICIENT: Multiple nested queries
    similar_users_books = []
    
    # Find users who checked out the same books
    cursor.execute('''
        SELECT DISTINCT user_id FROM checkouts
        WHERE book_id IN ({}) AND user_id != ?
    '''.format(','.join('?' * len(recent_book_ids))),
    recent_book_ids + [user_id])
    
    similar_users = [row['user_id'] for row in cursor.fetchall()]
    
    # For each similar user, get their other checkouts
    # INTENTIONALLY INEFFICIENT: Loop with individual queries
    for similar_user_id in similar_users[:5]:  # Limit to 5 similar users
        cursor.execute('''
            SELECT DISTINCT b.*
            FROM checkouts c
            JOIN books b ON c.book_id = b.book_id
            WHERE c.user_id = ? 
            AND c.book_id NOT IN ({})
            LIMIT 3
        '''.format(','.join('?' * len(recent_book_ids))),
        [similar_user_id] + recent_book_ids)
        
        similar_users_books.extend([dict(b) for b in cursor.fetchall()])
    
    conn.close()
    
    # Remove duplicates (inefficiently)
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
