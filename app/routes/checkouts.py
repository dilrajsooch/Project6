"""
Checkout routes for the Library application.
Handles book checkout and return operations.
"""

from flask import Blueprint, request, jsonify
from app.database import get_db_connection
from datetime import datetime, timedelta

checkouts_bp = Blueprint('checkouts', __name__)


@checkouts_bp.route('', methods=['POST'])
def checkout_book():
    """
    Checkout a book for a user.
    POST /api/checkouts
    Body: {"book_id": int, "user_id": int}
    """
    data = request.get_json()
    
    if not data or 'book_id' not in data or 'user_id' not in data:
        return jsonify({'error': 'book_id and user_id are required'}), 400
    
    book_id = data['book_id']
    user_id = data['user_id']
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if user exists
    cursor.execute('SELECT user_id FROM users WHERE user_id = ?', (user_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({'error': 'User not found'}), 404
    
    # Check if book exists and is available
    cursor.execute('SELECT * FROM books WHERE book_id = ?', (book_id,))
    book = cursor.fetchone()
    
    if not book:
        conn.close()
        return jsonify({'error': 'Book not found'}), 404
    
    if book['is_booked'] == 1:
        conn.close()
        return jsonify({
            'error': 'Book is not available',
            'message': 'This book is currently checked out by another user',
            'due_date': book['due_date']
        }), 409
    
    # Calculate due date (7 days from now)
    due_date = datetime.now() + timedelta(days=7)
    due_date_str = due_date.strftime('%Y-%m-%d %H:%M:%S')
    
    # Update book availability
    cursor.execute(
        '''UPDATE books 
           SET is_booked = 1, booked_by_user_id = ?, due_date = ?
           WHERE book_id = ?''',
        (user_id, due_date_str, book_id)
    )
    
    # Create checkout record
    cursor.execute(
        '''INSERT INTO checkouts (book_id, user_id, due_date)
           VALUES (?, ?, ?)''',
        (book_id, user_id, due_date_str)
    )
    checkout_id = cursor.lastrowid
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'message': 'Book checked out successfully',
        'checkout_id': checkout_id,
        'book_id': book_id,
        'user_id': user_id,
        'due_date': due_date_str
    }), 201


@checkouts_bp.route('/<int:checkout_id>', methods=['DELETE'])
def return_book(checkout_id):
    """
    Return a book (complete a checkout).
    DELETE /api/checkouts/<checkout_id>
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get checkout record
    cursor.execute(
        'SELECT * FROM checkouts WHERE checkout_id = ?',
        (checkout_id,)
    )
    checkout = cursor.fetchone()
    
    if not checkout:
        conn.close()
        return jsonify({'error': 'Checkout not found'}), 404
    
    if checkout['is_returned'] == 1:
        conn.close()
        return jsonify({'error': 'Book has already been returned'}), 400
    
    book_id = checkout['book_id']
    return_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    # Update checkout record
    cursor.execute(
        '''UPDATE checkouts 
           SET is_returned = 1, return_date = ?
           WHERE checkout_id = ?''',
        (return_date, checkout_id)
    )
    
    # Update book availability
    cursor.execute(
        '''UPDATE books 
           SET is_booked = 0, booked_by_user_id = NULL, due_date = NULL
           WHERE book_id = ?''',
        (book_id,)
    )
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'message': 'Book returned successfully',
        'checkout_id': checkout_id,
        'book_id': book_id,
        'return_date': return_date
    }), 200


@checkouts_bp.route('', methods=['GET'])
def get_checkouts():
    """
    Get all checkouts or filter by user.
    GET /api/checkouts?user_id=<int>&active=<true/false>
    """
    user_id = request.args.get('user_id', type=int)
    active = request.args.get('active', '')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = '''
        SELECT c.*, b.title, b.author, b.image_url
        FROM checkouts c
        JOIN books b ON c.book_id = b.book_id
        WHERE 1=1
    '''
    params = []
    
    if user_id:
        query += ' AND c.user_id = ?'
        params.append(user_id)
    
    if active.lower() == 'true':
        query += ' AND c.is_returned = 0'
    elif active.lower() == 'false':
        query += ' AND c.is_returned = 1'
    
    query += ' ORDER BY c.checkout_date DESC'
    
    cursor.execute(query, params)
    checkouts = cursor.fetchall()
    conn.close()
    
    return jsonify({
        'checkouts': [dict(checkout) for checkout in checkouts],
        'count': len(checkouts)
    }), 200


@checkouts_bp.route('/<int:checkout_id>', methods=['GET'])
def get_checkout(checkout_id):
    """
    Get a specific checkout by ID.
    GET /api/checkouts/<checkout_id>
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        '''SELECT c.*, b.title, b.author, b.image_url
           FROM checkouts c
           JOIN books b ON c.book_id = b.book_id
           WHERE c.checkout_id = ?''',
        (checkout_id,)
    )
    checkout = cursor.fetchone()
    conn.close()
    
    if checkout:
        return jsonify(dict(checkout)), 200
    else:
        return jsonify({'error': 'Checkout not found'}), 404


@checkouts_bp.route('/user/<int:user_id>/history', methods=['GET'])
def get_user_checkout_history(user_id):
    """
    Get checkout history for a specific user.
    GET /api/checkouts/user/<user_id>/history
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        '''SELECT c.*, b.title, b.author, b.year_published, b.genre, b.image_url
           FROM checkouts c
           JOIN books b ON c.book_id = b.book_id
           WHERE c.user_id = ?
           ORDER BY c.checkout_date DESC''',
        (user_id,)
    )
    checkouts = cursor.fetchall()
    conn.close()
    
    return jsonify({
        'user_id': user_id,
        'checkouts': [dict(checkout) for checkout in checkouts],
        'total': len(checkouts)
    }), 200
