"""
Reviews routes for the Library application.
Handles fetching and submitting book reviews.
"""

from flask import Blueprint, request, jsonify
from app.database import get_db_connection
from datetime import datetime

reviews_bp = Blueprint('reviews', __name__)


@reviews_bp.route('', methods=['GET'])
def get_reviews():
    """
    Get reviews filtered by book or user.
    GET /api/reviews?book_id=<int>
    GET /api/reviews?user_id=<int>
    """
    book_id = request.args.get('book_id', type=int)
    user_id = request.args.get('user_id', type=int)

    conn = get_db_connection()
    cursor = conn.cursor()

    query = '''
        SELECT r.*, u.username, b.title, b.author, b.image_url
        FROM reviews r
        JOIN users u ON r.user_id = u.user_id
        JOIN books b ON r.book_id = b.book_id
        WHERE 1=1
    '''
    params = []

    if book_id:
        query += ' AND r.book_id = ?'
        params.append(book_id)

    if user_id:
        query += ' AND r.user_id = ?'
        params.append(user_id)

    query += ' ORDER BY r.created_at DESC'

    cursor.execute(query, params)
    reviews = cursor.fetchall()
    conn.close()

    return jsonify([dict(r) for r in reviews]), 200


@reviews_bp.route('', methods=['POST'])
def submit_review():
    """
    Submit a review for a book.
    POST /api/reviews
    Body: {"book_id": int, "user_id": int, "rating": int, "comment": str, "image": str|null}
    """
    data = request.get_json()

    if not data or 'book_id' not in data or 'user_id' not in data or 'rating' not in data:
        return jsonify({'error': 'book_id, user_id, and rating are required'}), 400

    book_id = data['book_id']
    user_id = data['user_id']
    rating = data['rating']
    comment = data.get('comment', '')
    image = data.get('image', None)

    if not isinstance(rating, int) or rating < 0 or rating > 10:
        return jsonify({'error': 'Rating must be an integer between 0 and 10'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT book_id FROM books WHERE book_id = ?', (book_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({'error': 'Book not found'}), 404

    cursor.execute('SELECT user_id FROM users WHERE user_id = ?', (user_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({'error': 'User not found'}), 404

    created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    cursor.execute(
        '''INSERT INTO reviews (book_id, user_id, rating, comment, image, created_at)
           VALUES (?, ?, ?, ?, ?, ?)''',
        (book_id, user_id, rating, comment, image, created_at)
    )
    review_id = cursor.lastrowid
    conn.commit()

    cursor.execute(
        '''SELECT r.*, u.username, b.title, b.author, b.image_url
           FROM reviews r
           JOIN users u ON r.user_id = u.user_id
           JOIN books b ON r.book_id = b.book_id
           WHERE r.review_id = ?''',
        (review_id,)
    )
    review = cursor.fetchone()
    conn.close()

    return jsonify(dict(review)), 201
