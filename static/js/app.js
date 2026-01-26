/**
 * Library Management System - Frontend JavaScript
 * Handles user interactions, API calls, and UI updates
 */

const API_BASE = '/api';

// State management
let currentUser = null;
let currentPage = 0;
let pageSize = 20;
let totalBooks = 0;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadFilters();
    loadTrendingBooks();
    loadBooks();
    
    // Check if user was previously logged in (simple session)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showLoggedInState();
    }
    
    // Add enter key support for search
    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBooks();
        }
    });
});

// User Authentication
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        alert('Please enter username and password');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data;
            localStorage.setItem('currentUser', JSON.stringify(data));
            showLoggedInState();
            alert(`Welcome back, ${data.username}!`);
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
}

async function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        alert('Please enter username and password');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(`Registration successful! You can now login as ${username}`);
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLoggedOutState();
}

function showLoggedInState() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('user-info').style.display = 'block';
    document.getElementById('welcome-msg').textContent = `Welcome, ${currentUser.username}!`;
    document.getElementById('recommendations-section').style.display = 'block';
    document.getElementById('my-checkouts-section').style.display = 'block';
    
    loadRecommendations();
    loadMyCheckouts();
}

function showLoggedOutState() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('recommendations-section').style.display = 'none';
    document.getElementById('my-checkouts-section').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Load filter options
async function loadFilters() {
    try {
        const response = await fetch(`${API_BASE}/books/filters`);
        const data = await response.json();
        
        // Populate author filter (limit to first 50)
        const authorSelect = document.getElementById('filter-author');
        data.authors.slice(0, 50).forEach(author => {
            const option = document.createElement('option');
            option.value = author;
            option.textContent = author.length > 30 ? author.substring(0, 30) + '...' : author;
            authorSelect.appendChild(option);
        });
        
        // Populate year filter
        const yearSelect = document.getElementById('filter-year');
        data.years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });
        
        // Populate genre filter
        const genreSelect = document.getElementById('filter-genre');
        data.genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre;
            option.textContent = genre;
            genreSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading filters:', error);
    }
}

// Load trending books
async function loadTrendingBooks() {
    const container = document.getElementById('trending-books');
    container.innerHTML = '<p>Loading trending books...</p>';
    
    try {
        const startTime = performance.now();
        const response = await fetch(`${API_BASE}/homepage/trending`);
        const data = await response.json();
        const endTime = performance.now();
        
        if (data.trending && data.trending.length > 0) {
            container.innerHTML = data.trending.map(book => createBookCard(book)).join('');
        } else {
            container.innerHTML = '<p>No trending books found</p>';
        }
        
        console.log(`Trending books loaded in ${(endTime - startTime).toFixed(2)}ms`);
    } catch (error) {
        console.error('Error loading trending books:', error);
        container.innerHTML = '<p class="error-message">Error loading trending books</p>';
    }
}

// Load recommendations for logged-in user
async function loadRecommendations() {
    if (!currentUser) return;
    
    const authorContainer = document.getElementById('rec-by-author');
    const yearContainer = document.getElementById('rec-by-year');
    const similarContainer = document.getElementById('rec-similar-users');
    
    authorContainer.innerHTML = '<p>Loading...</p>';
    yearContainer.innerHTML = '<p>Loading...</p>';
    similarContainer.innerHTML = '<p>Loading...</p>';
    
    try {
        const startTime = performance.now();
        const response = await fetch(`${API_BASE}/homepage/recommendations/${currentUser.user_id}`);
        const data = await response.json();
        const endTime = performance.now();
        
        const recs = data.recommendations;
        
        if (recs.message) {
            authorContainer.innerHTML = `<p>${recs.message}</p>`;
            yearContainer.innerHTML = '';
            similarContainer.innerHTML = '';
            return;
        }
        
        // By Author
        if (recs.by_author && recs.by_author.length > 0) {
            authorContainer.innerHTML = recs.by_author.slice(0, 5).map(book => createBookCard(book)).join('');
        } else {
            authorContainer.innerHTML = '<p>No recommendations available</p>';
        }
        
        // By Year
        if (recs.by_year && recs.by_year.length > 0) {
            yearContainer.innerHTML = recs.by_year.slice(0, 5).map(book => createBookCard(book)).join('');
        } else {
            yearContainer.innerHTML = '<p>No recommendations available</p>';
        }
        
        // Similar Users
        if (recs.similar_users && recs.similar_users.length > 0) {
            similarContainer.innerHTML = recs.similar_users.slice(0, 5).map(book => createBookCard(book)).join('');
        } else {
            similarContainer.innerHTML = '<p>No recommendations available</p>';
        }
        
        console.log(`Recommendations loaded in ${(endTime - startTime).toFixed(2)}ms`);
        document.getElementById('load-time').textContent = `Recommendations computed in ${(endTime - startTime).toFixed(2)}ms`;
    } catch (error) {
        console.error('Error loading recommendations:', error);
        authorContainer.innerHTML = '<p class="error-message">Error loading recommendations</p>';
    }
}

// Load my checkouts
async function loadMyCheckouts() {
    if (!currentUser) return;
    
    const container = document.getElementById('my-checkouts');
    
    try {
        const response = await fetch(`${API_BASE}/checkouts?user_id=${currentUser.user_id}&active=true`);
        const data = await response.json();
        
        if (data.checkouts && data.checkouts.length > 0) {
            container.innerHTML = data.checkouts.map(checkout => createCheckoutCard(checkout)).join('');
        } else {
            container.innerHTML = '<p>No active checkouts</p>';
        }
    } catch (error) {
        console.error('Error loading checkouts:', error);
        container.innerHTML = '<p class="error-message">Error loading checkouts</p>';
    }
}

// Load books with filters
async function loadBooks() {
    const container = document.getElementById('books-list');
    container.innerHTML = '<p>Loading books...</p>';
    
    const search = document.getElementById('search-input').value;
    const author = document.getElementById('filter-author').value;
    const year = document.getElementById('filter-year').value;
    const genre = document.getElementById('filter-genre').value;
    const available = document.getElementById('filter-available').value;
    const sortBy = document.getElementById('sort-by').value;
    
    const params = new URLSearchParams({
        limit: pageSize,
        offset: currentPage * pageSize,
        sort_by: sortBy,
        order: 'asc'
    });
    
    if (search) params.append('search', search);
    if (author) params.append('author', author);
    if (year) params.append('year', year);
    if (genre) params.append('genre', genre);
    if (available) params.append('available', available);
    
    try {
        const startTime = performance.now();
        const response = await fetch(`${API_BASE}/books?${params}`);
        const data = await response.json();
        const endTime = performance.now();
        
        totalBooks = data.total;
        
        if (data.books && data.books.length > 0) {
            container.innerHTML = data.books.map(book => createBookCard(book)).join('');
        } else {
            container.innerHTML = '<p>No books found</p>';
        }
        
        updatePagination();
        console.log(`Books loaded in ${(endTime - startTime).toFixed(2)}ms`);
    } catch (error) {
        console.error('Error loading books:', error);
        container.innerHTML = '<p class="error-message">Error loading books</p>';
    }
}

// Search books
function searchBooks() {
    currentPage = 0;
    loadBooks();
}

// Apply filters
function applyFilters() {
    currentPage = 0;
    loadBooks();
}

// Pagination
function updatePagination() {
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    const totalPages = Math.ceil(totalBooks / pageSize);
    pageInfo.textContent = `Page ${currentPage + 1} of ${totalPages}`;
    
    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage >= totalPages - 1;
}

function prevPage() {
    if (currentPage > 0) {
        currentPage--;
        loadBooks();
    }
}

function nextPage() {
    const totalPages = Math.ceil(totalBooks / pageSize);
    if (currentPage < totalPages - 1) {
        currentPage++;
        loadBooks();
    }
}

// Create book card HTML
function createBookCard(book) {
    const imageUrl = book.image_url || '/static/images/no-cover.png';
    const isAvailable = book.is_booked === 0;
    const statusClass = isAvailable ? 'available' : 'unavailable';
    const statusText = isAvailable ? 'Available' : `Due: ${book.due_date ? book.due_date.split(' ')[0] : 'N/A'}`;
    
    let buttonHtml = '';
    if (currentUser) {
        if (isAvailable) {
            buttonHtml = `<button class="checkout-btn" onclick="checkoutBook(${book.book_id})">Checkout</button>`;
        } else if (book.booked_by_user_id === currentUser.user_id) {
            buttonHtml = `<button class="return-btn" onclick="returnBookByBookId(${book.book_id})">Return</button>`;
        } else {
            buttonHtml = `<button disabled>Unavailable</button>`;
        }
    }
    
    return `
        <div class="book-card">
            <img src="${imageUrl}" alt="${book.title}" onerror="this.src='/static/images/no-cover.png'">
            <div class="book-info">
                <div class="book-title" title="${book.title}">${book.title}</div>
                <div class="book-author">${book.author}</div>
                <div class="book-year">${book.year_published || 'Unknown'}</div>
                <span class="book-genre">${book.genre || 'Unknown'}</span>
                <div class="book-status ${statusClass}">${statusText}</div>
                ${buttonHtml}
            </div>
        </div>
    `;
}

// Create checkout card HTML
function createCheckoutCard(checkout) {
    const imageUrl = checkout.image_url || '/static/images/no-cover.png';
    
    return `
        <div class="book-card">
            <img src="${imageUrl}" alt="${checkout.title}" onerror="this.src='/static/images/no-cover.png'">
            <div class="book-info">
                <div class="book-title" title="${checkout.title}">${checkout.title}</div>
                <div class="book-author">${checkout.author}</div>
                <div class="book-status unavailable">Due: ${checkout.due_date ? checkout.due_date.split(' ')[0] : 'N/A'}</div>
                <button class="return-btn" onclick="returnBook(${checkout.checkout_id})">Return</button>
            </div>
        </div>
    `;
}

// Checkout a book
async function checkoutBook(bookId) {
    if (!currentUser) {
        alert('Please login to checkout books');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/checkouts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ book_id: bookId, user_id: currentUser.user_id })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(`Book checked out successfully! Due date: ${data.due_date}`);
            // Refresh all sections
            loadBooks();
            loadTrendingBooks();
            loadRecommendations();
            loadMyCheckouts();
        } else {
            alert(data.error || 'Checkout failed');
        }
    } catch (error) {
        console.error('Checkout error:', error);
        alert('Checkout failed. Please try again.');
    }
}

// Return a book by checkout ID
async function returnBook(checkoutId) {
    try {
        const response = await fetch(`${API_BASE}/checkouts/${checkoutId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Book returned successfully!');
            // Refresh all sections
            loadBooks();
            loadTrendingBooks();
            loadRecommendations();
            loadMyCheckouts();
        } else {
            alert(data.error || 'Return failed');
        }
    } catch (error) {
        console.error('Return error:', error);
        alert('Return failed. Please try again.');
    }
}

// Return a book by book ID (finds checkout first)
async function returnBookByBookId(bookId) {
    if (!currentUser) return;
    
    try {
        // Find the active checkout for this book and user
        const response = await fetch(`${API_BASE}/checkouts?user_id=${currentUser.user_id}&active=true`);
        const data = await response.json();
        
        const checkout = data.checkouts.find(c => c.book_id === bookId);
        
        if (checkout) {
            await returnBook(checkout.checkout_id);
        } else {
            alert('Checkout not found');
        }
    } catch (error) {
        console.error('Error finding checkout:', error);
        alert('Return failed. Please try again.');
    }
}
