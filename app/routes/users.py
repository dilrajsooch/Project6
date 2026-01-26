"""
User routes for the Library application.
Handles user registration, login, and CRUD operations.
"""

from flask import Blueprint, request, jsonify
from app.database import get_db_connection

users_bp = Blueprint('users', __name__)


@users_bp.route('', methods=['POST'])
def register_user():
    """
    Register a new user.
    POST /api/users
    Body: {"username": "string", "password": "string"}
    """
    data = request.get_json()
    
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'error': 'Username and password are required'}), 400
    
    username = data['username']
    password = data['password']
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            (username, password)
        )
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        
        return jsonify({
            'message': 'User registered successfully',
            'user_id': user_id,
            'username': username
        }), 201
        
    except Exception as e:
        conn.close()
        if 'UNIQUE constraint failed' in str(e):
            return jsonify({'error': 'Username already exists'}), 409
        return jsonify({'error': str(e)}), 500


@users_bp.route('/login', methods=['POST'])
def login_user():
    """
    Login a user.
    POST /api/users/login
    Body: {"username": "string", "password": "string"}
    """
    data = request.get_json()
    
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'error': 'Username and password are required'}), 400
    
    username = data['username']
    password = data['password']
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        'SELECT user_id, username FROM users WHERE username = ? AND password = ?',
        (username, password)
    )
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return jsonify({
            'message': 'Login successful',
            'user_id': user['user_id'],
            'username': user['username']
        }), 200
    else:
        return jsonify({'error': 'Invalid username or password'}), 401


@users_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """
    Get a specific user by ID.
    GET /api/users/<user_id>
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        'SELECT user_id, username, created_at FROM users WHERE user_id = ?',
        (user_id,)
    )
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return jsonify({
            'user_id': user['user_id'],
            'username': user['username'],
            'created_at': user['created_at']
        }), 200
    else:
        return jsonify({'error': 'User not found'}), 404


@users_bp.route('/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """
    Update a user (full replacement).
    PUT /api/users/<user_id>
    Body: {"username": "string", "password": "string"}
    """
    data = request.get_json()
    
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'error': 'Username and password are required'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if user exists
    cursor.execute('SELECT user_id FROM users WHERE user_id = ?', (user_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({'error': 'User not found'}), 404
    
    try:
        cursor.execute(
            'UPDATE users SET username = ?, password = ? WHERE user_id = ?',
            (data['username'], data['password'], user_id)
        )
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': 'User updated successfully',
            'user_id': user_id,
            'username': data['username']
        }), 200
        
    except Exception as e:
        conn.close()
        if 'UNIQUE constraint failed' in str(e):
            return jsonify({'error': 'Username already exists'}), 409
        return jsonify({'error': str(e)}), 500


@users_bp.route('/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """
    Delete a user.
    DELETE /api/users/<user_id>
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if user exists
    cursor.execute('SELECT user_id FROM users WHERE user_id = ?', (user_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({'error': 'User not found'}), 404
    
    cursor.execute('DELETE FROM users WHERE user_id = ?', (user_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'User deleted successfully'}), 200
