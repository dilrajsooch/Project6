/**
 * @file app.js
 * @description Frontend application for the LibraryHub Library Management System.
 *              Handles SPA navigation, API communication with mock data fallback,
 *              book browsing, search/filter, checkout/return, reviews, and recommendations.
 *
 * Architecture: Single-page application communicating with Flask REST API.
 * Endpoints defined in SDD Controller Module (sections 2.1 - 2.4).
 */

/* ============================================
   MOCK DATA (fallback when API is unavailable)
   ============================================ */

const MOCK_BOOKS = [
  { book_id: 1, isbn: "0195153448", title: "Classical Mythology", author: "Mark P. O. Morford", year_published: 2002, genre: "Education", image_url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop", is_booked: 0, booked_by_user_id: null, due_date: null },
  { book_id: 2, isbn: "0002005018", title: "Clara Callan", author: "Richard Bruce Wright", year_published: 2001, genre: "Fiction", image_url: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=450&fit=crop", is_booked: 0, booked_by_user_id: null, due_date: null },
  { book_id: 3, isbn: "0060973129", title: "Decision in Normandy", author: "Carlo D'Este", year_published: 1991, genre: "History", image_url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=450&fit=crop", is_booked: 1, booked_by_user_id: 1, due_date: "2026-02-25" },
  { book_id: 4, isbn: "0374157065", title: "Flu: The Story of the Great Influenza Pandemic", author: "Gina Bari Kolata", year_published: 1999, genre: "Science", image_url: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=450&fit=crop", is_booked: 0, booked_by_user_id: null, due_date: null },
  { book_id: 5, isbn: "0393045218", title: "The Mismeasure of Man", author: "Stephen Jay Gould", year_published: 1996, genre: "Science", image_url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&h=450&fit=crop", is_booked: 0, booked_by_user_id: null, due_date: null },
  { book_id: 6, isbn: "0399135782", title: "The Kitchen God's Wife", author: "Amy Tan", year_published: 1991, genre: "Fiction", image_url: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&h=450&fit=crop", is_booked: 0, booked_by_user_id: null, due_date: null },
  { book_id: 7, isbn: "0425176428", title: "What If?", author: "Robert Cowley", year_published: 2000, genre: "History", image_url: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=300&h=450&fit=crop", is_booked: 0, booked_by_user_id: null, due_date: null },
  { book_id: 8, isbn: "0671870432", title: "PLEADING GUILTY", author: "Scott Turow", year_published: 1993, genre: "Mystery", image_url: "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=300&h=450&fit=crop", is_booked: 1, booked_by_user_id: 1, due_date: "2026-02-20" },
  { book_id: 9, isbn: "0679425608", title: "Under the Black Flag", author: "David Cordingly", year_published: 1996, genre: "History", image_url: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=300&h=450&fit=crop", is_booked: 0, booked_by_user_id: null, due_date: null },
  { book_id: 10, isbn: "074aborze322", title: "Where You'll Find Me", author: "Ann Beattie", year_published: 2002, genre: "Fiction", image_url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop", is_booked: 0, booked_by_user_id: null, due_date: null },
  { book_id: 11, isbn: "0771074670", title: "935 Lies", author: "Charles Lewis", year_published: 2014, genre: "Politics", image_url: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=300&h=450&fit=crop", is_booked: 0, booked_by_user_id: null, due_date: null },
  { book_id: 12, isbn: "080652121X", title: "Surveying the Avant-Garde", author: "Liam Gillick", year_published: 1999, genre: "Art", image_url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&h=450&fit=crop", is_booked: 0, booked_by_user_id: null, due_date: null },
  { book_id: 13, isbn: "0312195516", title: "The Survey", author: "Anna Karenina", year_published: 2003, genre: "Fiction", image_url: "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=300&h=450&fit=crop", is_booked: 0, booked_by_user_id: null, due_date: null },
  { book_id: 14, isbn: "0060915544", title: "To Kill a Mockingbird", author: "Harper Lee", year_published: 1960, genre: "Fiction", image_url: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=450&fit=crop", is_booked: 1, booked_by_user_id: 1, due_date: "2026-02-22" },
  { book_id: 15, isbn: "0451524935", title: "1984", author: "George Orwell", year_published: 1949, genre: "Science Fiction", image_url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop", is_booked: 0, booked_by_user_id: null, due_date: null },
  { book_id: 16, isbn: "0141439518", title: "Great Expectations", author: "Charles Dickens", year_published: 1861, genre: "Fiction", image_url: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=450&fit=crop", is_booked: 0, booked_by_user_id: null, due_date: null },
  { book_id: 17, isbn: "0486282112", title: "The Art of War", author: "Sun Tzu", year_published: -500, genre: "Philosophy", image_url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=450&fit=crop", is_booked: 0, booked_by_user_id: null, due_date: null },
  { book_id: 18, isbn: "0140449132", title: "The Odyssey", author: "Homer", year_published: -700, genre: "Classics", image_url: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=450&fit=crop", is_booked: 0, booked_by_user_id: null, due_date: null },
  { book_id: 19, isbn: "0062315007", title: "The Alchemist", author: "Paulo Coelho", year_published: 1988, genre: "Fiction", image_url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&h=450&fit=crop", is_booked: 0, booked_by_user_id: null, due_date: null },
  { book_id: 20, isbn: "0446310786", title: "To Kill a Mockingbird", author: "Harper Lee", year_published: 1960, genre: "Fiction", image_url: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&h=450&fit=crop", is_booked: 0, booked_by_user_id: null, due_date: null },
];

const MOCK_USERS = [
  { user_id: 1, username: "user1", password: "pass1", created_at: "2025-01-15" },
  { user_id: 2, username: "user2", password: "pass2", created_at: "2025-06-20" },
];

const MOCK_CHECKOUTS = [
  { checkout_id: 1, book_id: 3, user_id: 1, checkout_date: "2026-02-18", return_date: null, due_date: "2026-02-25", is_returned: 0 },
  { checkout_id: 2, book_id: 8, user_id: 1, checkout_date: "2026-02-13", return_date: null, due_date: "2026-02-20", is_returned: 0 },
  { checkout_id: 3, book_id: 14, user_id: 1, checkout_date: "2026-02-15", return_date: null, due_date: "2026-02-22", is_returned: 0 },
  { checkout_id: 4, book_id: 15, user_id: 1, checkout_date: "2026-01-10", return_date: "2026-01-17", due_date: "2026-01-17", is_returned: 1 },
  { checkout_id: 5, book_id: 19, user_id: 1, checkout_date: "2026-01-01", return_date: "2026-01-08", due_date: "2026-01-08", is_returned: 1 },
  { checkout_id: 6, book_id: 3, user_id: 2, checkout_date: "2025-12-01", return_date: "2025-12-08", due_date: "2025-12-08", is_returned: 1 },
  { checkout_id: 7, book_id: 14, user_id: 2, checkout_date: "2025-11-15", return_date: "2025-11-22", due_date: "2025-11-22", is_returned: 1 },
];

const MOCK_REVIEWS = [
  { review_id: 1, book_id: 14, user_id: 1, rating: 9, comment: "A powerful novel that addresses serious themes of justice and morality. Highly recommended.", image: null },
  { review_id: 2, book_id: 15, user_id: 1, rating: 10, comment: "Prescient and unsettling. The themes feel increasingly relevant.", image: null },
  { review_id: 3, book_id: 3, user_id: 2, rating: 8, comment: "Fascinating account of military strategy. Well-researched and engaging.", image: null },
];


/* ============================================
   API SERVICE LAYER
   ============================================ */

const API_BASE = "/api";

/**
 * Makes a fetch request to the API. Falls back to mock data on failure.
 * @param {string} endpoint - API endpoint path
 * @param {object} options - fetch options (method, body, headers)
 * @returns {Promise<object>} Response JSON or mock response
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaultHeaders = { "Content-Type": "application/json" };

  try {
    const response = await fetch(url, {
      headers: { ...defaultHeaders, ...options.headers },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn(`API request failed for ${endpoint}:`, error.message);
    return null; // Return null so callers know to use mock data
  }
}


/* ============================================
   APPLICATION STATE & CLASS
   ============================================ */

const app = {
  /** @type {string} */
  API_BASE: "/api",

  /** @type {object|null} Current logged-in user */
  currentUser: null,

  /** @type {number} Current page for book pagination */
  currentPage: 1,

  /** @type {number} Books per page */
  pageSize: 20,

  /** @type {number} Total books matching current filter */
  totalBooks: 0,

  /** @type {Array} All books cache */
  allBooks: [],

  /** @type {Array} Filtered/sorted books for display */
  filteredBooks: [],

  /** @type {number} Selected review rating */
  selectedRating: 5,

  /** @type {string} Current review image (base64) */
  reviewImageData: "",

  /** @type {string} Current view name */
  currentView: "home",

  /** @type {number|null} Currently displayed book ID */
  currentBookId: null,

  /* ------------------------------------------
     INITIALIZATION
     ------------------------------------------ */

  /**
   * Initialize the application on DOMContentLoaded.
   * Checks for saved user session and loads initial data.
   */
  async init() {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem("savedUser");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        // Validate the session by checking if user still exists
        const userCheck = await apiRequest(`/users/${parsed.user_id}`);
        if (userCheck && userCheck.user_id) {
          this.currentUser = { user_id: userCheck.user_id, username: userCheck.username, created_at: userCheck.created_at };
          localStorage.setItem("savedUser", JSON.stringify(this.currentUser));
        } else {
          localStorage.removeItem("savedUser");
        }
      } catch (e) {
        localStorage.removeItem("savedUser");
      }
    }

    this.updateLoginState();
    this.loadBooks();
    this.loadFilters();
    this.loadTrendingBooks();
    this.loadRecommendations();

    // Set initial history state so the back button can return to home
    history.replaceState({ viewName: "home", params: {} }, "", window.location.pathname);

    // Handle browser back/forward buttons
    window.addEventListener("popstate", (event) => {
      if (event.state) {
        this.navigateTo(event.state.viewName, event.state.params || {}, true);
      } else {
        this.navigateTo("home", {}, true);
      }
    });

    // Bind Enter key for search
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") this.searchBooks();
      });
    }

    // Bind Enter key for login/register
    document.getElementById("login-password")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.logIn();
    });
    document.getElementById("register-password")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.register();
    });
  },

  /* ------------------------------------------
     NAVIGATION
     ------------------------------------------ */

  /**
   * Navigate between SPA views.
   * @param {string} viewName - "home", "book", "auth", "dashboard"
   * @param {object} params - Optional parameters (e.g., bookId)
   */
  navigateTo(viewName, params = {}, fromPopState = false) {
    // Hide all views
    document.querySelectorAll(".view").forEach((v) => (v.style.display = "none"));
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));

    // Update nav links
    document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));

    this.currentView = viewName;

    switch (viewName) {
      case "home":
        document.getElementById("homepage-view").style.display = "block";
        document.getElementById("homepage-view").classList.add("active");
        document.getElementById("nav-home")?.classList.add("active");
        break;

      case "book":
        document.getElementById("book-view").style.display = "block";
        document.getElementById("book-view").classList.add("active");
        if (params.bookId) {
          this.currentBookId = params.bookId;
          this.loadBookDetail(params.bookId);
        }
        break;

      case "auth":
        if (this.currentUser) {
          this.navigateTo("dashboard", {}, fromPopState);
          return;
        }
        document.getElementById("auth-view").style.display = "block";
        document.getElementById("auth-view").classList.add("active");
        document.getElementById("nav-login")?.classList.add("active");
        break;

      case "dashboard":
        if (!this.currentUser) {
          this.navigateTo("auth", {}, fromPopState);
          return;
        }
        document.getElementById("dashboard-view").style.display = "block";
        document.getElementById("dashboard-view").classList.add("active");
        document.getElementById("nav-account")?.classList.add("active");
        this.loadDashboard();
        break;
    }

    // Push browser history state (skip when triggered by popstate itself)
    if (!fromPopState) {
      let url = window.location.pathname;
      if (viewName === "book" && params.bookId) url = `#book-${params.bookId}`;
      else if (viewName === "auth") url = "#auth";
      else if (viewName === "dashboard") url = "#dashboard";
      history.pushState({ viewName, params }, "", url);
    }

    // Scroll to top
    window.scrollTo(0, 0);
  },

  /* ------------------------------------------
     AUTHENTICATION
     ------------------------------------------ */

  /**
   * Log in a user with username and password.
   * POST /api/users/login
   * @returns {Promise<void>}
   */
  async logIn() {
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!username || !password) {
      this.showToast("Please enter both username and password.", "error");
      return;
    }

    const result = await apiRequest("/users/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    if (result && result.user_id) {
      // Fetch full user details (includes created_at)
      const userDetails = await apiRequest(`/users/${result.user_id}`);
      this.currentUser = {
        user_id: result.user_id,
        username: result.username,
        created_at: userDetails ? userDetails.created_at : ""
      };
      localStorage.setItem("savedUser", JSON.stringify(this.currentUser));
      this.updateLoginState();
      this.showToast(`Welcome back, ${result.username}!`, "success");
      this.navigateTo("home");
      this.loadBooks();
      this.loadTrendingBooks();
      this.loadRecommendations();
    } else {
      this.showToast("Invalid username or password.", "error");
    }
  },

  /**
   * Register a new user.
   * POST /api/users/register
   * @returns {Promise<void>}
   */
  async register() {
    const username = document.getElementById("register-username").value.trim();
    const password = document.getElementById("register-password").value.trim();

    if (!username || !password) {
      this.showToast("Please fill in all fields.", "error");
      return;
    }

    const result = await apiRequest("/users", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    if (result && result.user_id) {
      // Fetch full user details (includes created_at)
      const userDetails = await apiRequest(`/users/${result.user_id}`);
      this.currentUser = {
        user_id: result.user_id,
        username: result.username,
        created_at: userDetails ? userDetails.created_at : new Date().toISOString()
      };
      localStorage.setItem("savedUser", JSON.stringify(this.currentUser));
      this.updateLoginState();
      this.showToast(`Account created! Welcome, ${result.username}!`, "success");
      this.navigateTo("home");
      this.loadBooks();
      this.loadTrendingBooks();
      this.loadRecommendations();
    } else {
      this.showToast("Username already exists or registration failed.", "error");
    }
  },

  /**
   * Log out the current user.
   */
  logout() {
    this.currentUser = null;
    localStorage.removeItem("savedUser");
    this.updateLoginState();
    this.showToast("You have been logged out.", "info");
    this.navigateTo("home");
    this.loadBooks();
    this.loadTrendingBooks();
    document.getElementById("recommendations-section").style.display = "none";
  },

  /**
   * Update the header UI based on login state.
   */
  updateLoginState() {
    const loggedIn = document.getElementById("nav-logged-in");
    const loggedOut = document.getElementById("nav-logged-out");
    const usernameSpan = document.getElementById("nav-username");

    if (this.currentUser) {
      loggedIn.style.display = "flex";
      loggedOut.style.display = "none";
      usernameSpan.textContent = this.currentUser.username;
    } else {
      this.showLoggedOutState();
    }
  },

  /**
   * Show the logged-out header state.
   */
  showLoggedOutState() {
    document.getElementById("nav-logged-in").style.display = "none";
    document.getElementById("nav-logged-out").style.display = "inline";
  },

  /* ------------------------------------------
     AUTH & DASHBOARD TABS
     ------------------------------------------ */

  switchAuthTab(tabName) {
    document.querySelectorAll("#auth-view .tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tabName);
      btn.setAttribute("aria-selected", btn.dataset.tab === tabName ? "true" : "false");
    });
    document.getElementById("login-panel").classList.toggle("active", tabName === "login");
    document.getElementById("register-panel").classList.toggle("active", tabName === "register");
  },

  switchDashboardTab(tabName) {
    document.querySelectorAll(".dashboard-tabs .tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tabName);
    });
    document.querySelectorAll(".dashboard-tabs .tab-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === `tab-${tabName}`);
    });
  },

  /* ------------------------------------------
     LOAD BOOKS
     ------------------------------------------ */

  /**
   * Load all books from the API or mock data.
   * GET /api/books
   * @returns {Promise<void>}
   */
  async loadBooks() {
    await this.fetchBooksFromServer();
  },

  /**
   * Load filter options (authors, years) from the API.
   * GET /api/books/filter
   * @returns {Promise<void>}
   */
  async loadFilters() {
    const result = await apiRequest("/books/filters");

    let authors = [];
    let years = [];
    let genres = [];

    if (result && result.authors) {
      authors = result.authors;
      years = result.years;
      genres = result.genres || [];
    } else {
      // Build from mock data
      const authorSet = new Set(MOCK_BOOKS.map((b) => b.author));
      const yearSet = new Set(MOCK_BOOKS.map((b) => b.year_published));
      const genreSet = new Set(MOCK_BOOKS.map((b) => b.genre).filter(Boolean));

      authors = Array.from(authorSet).sort();
      years = Array.from(yearSet).sort((a, b) => b - a);
      genres = Array.from(genreSet).sort();
    }

    // Populate author filter
    const authorSelect = document.getElementById("author-filter");
    authorSelect.innerHTML = '<option value="all">All Authors</option>';
    authors.forEach((author) => {
      const opt = document.createElement("option");
      opt.value = author;
      opt.textContent = author;
      authorSelect.appendChild(opt);
    });

    // Populate year filter
    const yearSelect = document.getElementById("year-filter");
    yearSelect.innerHTML = '<option value="all">All Years</option>';
    years.forEach((year) => {
      const opt = document.createElement("option");
      opt.value = year;
      opt.textContent = year;
      yearSelect.appendChild(opt);
    });

    // Populate genre filter
    const genreSelect = document.getElementById("genre-filter");
    genreSelect.innerHTML = '<option value="all">All Genres</option>';
    genres.forEach((genre) => {
      const opt = document.createElement("option");
      opt.value = genre;
      opt.textContent = genre;
      genreSelect.appendChild(opt);
    });
  },

  /* ------------------------------------------
     TRENDING BOOKS
     ------------------------------------------ */

  /**
   * Load top 5 trending books.
   * GET /api/homepage/trending
   * @returns {Promise<void>}
   */
  async loadTrendingBooks() {
    const result = await apiRequest("/homepage/trending");

    let trending = [];
    if (result && result.trending) {
      trending = result.trending;
    } else {
      // Mock: count checkouts per book, take top 5
      const counts = {};
      MOCK_CHECKOUTS.forEach((c) => {
        counts[c.book_id] = (counts[c.book_id] || 0) + 1;
      });
      trending = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([bookId]) => MOCK_BOOKS.find((b) => b.book_id === parseInt(bookId)))
        .filter(Boolean);
    }

    const section = document.getElementById("trending-section");
    const grid = document.getElementById("trending-grid");

    if (trending.length > 0) {
      section.style.display = "block";
      grid.innerHTML = trending.map((book) => this.createBookCard(book)).join("");
    } else {
      section.style.display = "none";
    }
  },

  /* ------------------------------------------
     RECOMMENDATIONS
     ------------------------------------------ */

  /**
   * Load personalized recommendations for the current user.
   * GET /api/homepage/recommendations/{user_id}
   * @returns {Promise<void>}
   */
  async loadRecommendations() {
    const section = document.getElementById("recommendations-section");
    const grid = document.getElementById("recommendations-grid");

    if (!this.currentUser) {
      section.style.display = "none";
      return;
    }

    const result = await apiRequest(`/homepage/recommendations/${this.currentUser.user_id}`);

    let recommendations = [];
    if (result && result.recommendations) {
      // Flatten all recommendation categories
      const recs = result.recommendations;
      if (recs.by_author) recommendations.push(...recs.by_author.map((b) => ({ ...b, _reason: "By a favorite author" })));
      if (recs.by_year) recommendations.push(...recs.by_year.map((b) => ({ ...b, _reason: "From a similar era" })));
      if (recs.similar_users) recommendations.push(...recs.similar_users.map((b) => ({ ...b, _reason: "Popular with similar readers" })));
    } else {
      // Mock recommendation logic
      const userCheckouts = MOCK_CHECKOUTS.filter((c) => c.user_id === this.currentUser.user_id);
      const checkedBookIds = userCheckouts.map((c) => c.book_id);
      const checkedBooks = checkedBookIds
        .map((id) => MOCK_BOOKS.find((b) => b.book_id === id))
        .filter(Boolean);

      const last3 = checkedBooks.slice(0, 3);
      const recIds = new Set(checkedBookIds);

      last3.forEach((book) => {
        // By same author
        MOCK_BOOKS.filter((b) => b.author === book.author && !recIds.has(b.book_id)).forEach((b) => {
          recommendations.push({ ...b, _reason: `By ${book.author}` });
          recIds.add(b.book_id);
        });
        // By similar year
        MOCK_BOOKS.filter((b) => Math.abs(b.year_published - book.year_published) <= 5 && !recIds.has(b.book_id))
          .slice(0, 2)
          .forEach((b) => {
            recommendations.push({ ...b, _reason: `From the same era (${book.year_published})` });
            recIds.add(b.book_id);
          });
      });
    }

    // Deduplicate by book_id
    const seen = new Set();
    recommendations = recommendations.filter((b) => {
      if (seen.has(b.book_id)) return false;
      seen.add(b.book_id);
      return true;
    });

    if (recommendations.length > 0) {
      section.style.display = "block";
      grid.innerHTML = recommendations
        .slice(0, 5)
        .map((book) => this.createBookCard(book, book._reason))
        .join("");
    } else {
      section.style.display = "none";
    }
  },

  /* ------------------------------------------
     SEARCH & FILTER
     ------------------------------------------ */

  /**
   * Execute a search and refresh the book list.
   */
  searchBooks() {
    this.currentPage = 1;
    this.fetchBooksFromServer();
  },

  /**
   * Apply filters and refresh (triggered by dropdown changes).
   */
  applyFilters() {
    this.currentPage = 1;
    this.fetchBooksFromServer();
  },

  /**
   * Build query parameters from current filter state and fetch books from the API.
   * Uses server-side search, filtering, sorting, and pagination.
   * @returns {Promise<void>}
   */
  async fetchBooksFromServer() {
    const searchVal = document.getElementById("search-input").value.trim();
    const sortBy = document.getElementById("sort-select").value;
    const authorFilter = document.getElementById("author-filter").value;
    const yearFilter = document.getElementById("year-filter").value;
    const genreFilter = document.getElementById("genre-filter").value;
    const availFilter = document.getElementById("availability-filter").value;

    // Build query string for the backend
    const params = new URLSearchParams();
    params.set("limit", this.pageSize);
    params.set("offset", (this.currentPage - 1) * this.pageSize);

    // Search
    if (searchVal) {
      params.set("search", searchVal);
    }

    // Author filter
    if (authorFilter !== "all") {
      params.set("author", authorFilter);
    }

    // Year filter
    if (yearFilter !== "all") {
      params.set("year", yearFilter);
    }

    // Genre filter
    if (genreFilter !== "all") {
      params.set("genre", genreFilter);
    }

    // Availability filter
    if (availFilter === "available") {
      params.set("available", "true");
    } else if (availFilter === "checked-out") {
      params.set("available", "false");
    }

    // Sorting — map frontend values to backend params
    switch (sortBy) {
      case "title":
        params.set("sort_by", "title");
        params.set("order", "asc");
        break;
      case "author":
        params.set("sort_by", "author");
        params.set("order", "asc");
        break;
      case "year-desc":
        params.set("sort_by", "year");
        params.set("order", "desc");
        break;
      case "year-asc":
        params.set("sort_by", "year");
        params.set("order", "asc");
        break;
    }

    const result = await apiRequest(`/books?${params.toString()}`);

    if (result && result.books) {
      this.filteredBooks = result.books;
      this.totalBooks = result.total;
    } else {
      // Mock fallback: basic client-side filter on mock data
      let books = [...MOCK_BOOKS];
      if (searchVal) {
        const q = searchVal.toLowerCase();
        books = books.filter(
          (b) => (b.title || "").toLowerCase().includes(q) || (b.author || "").toLowerCase().includes(q)
        );
      }
      this.filteredBooks = books;
      this.totalBooks = books.length;
    }

    this.renderBooks();
  },

  /**
   * Clear all search and filter inputs, reset to defaults.
   */
  clearFilters() {
    document.getElementById("search-input").value = "";
    document.getElementById("sort-select").value = "title";
    document.getElementById("author-filter").value = "all";
    document.getElementById("year-filter").value = "all";
    document.getElementById("genre-filter").value = "all";
    document.getElementById("availability-filter").value = "all";
    this.currentPage = 1;
    this.fetchBooksFromServer();
  },

  /* ------------------------------------------
     RENDER BOOKS & PAGINATION
     ------------------------------------------ */

  /**
   * Render the current page of filtered books into the grid.
   */
  renderBooks() {
    const grid = document.getElementById("books-grid");
    const countSpan = document.getElementById("book-count");
    const emptyState = document.getElementById("empty-state");
    const pagination = document.getElementById("pagination");

    countSpan.textContent = this.totalBooks;

    if (this.totalBooks === 0) {
      grid.innerHTML = "";
      emptyState.style.display = "block";
      pagination.style.display = "none";
      return;
    }

    emptyState.style.display = "none";

    // Render the books (already paginated by the server)
    grid.innerHTML = this.filteredBooks.map((book) => this.createBookCard(book)).join("");

    // Update pagination controls
    const totalPages = Math.ceil(this.totalBooks / this.pageSize);
    if (totalPages > 1) {
      pagination.style.display = "flex";
      document.getElementById("btn-prev").disabled = this.currentPage <= 1;
      document.getElementById("btn-next").disabled = this.currentPage >= totalPages;
      document.getElementById("page-info").textContent = `Page ${this.currentPage} of ${totalPages}`;
    } else {
      pagination.style.display = "none";
    }
  },

  /**
   * Go to the previous page.
   */
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchBooksFromServer();
      window.scrollTo(0, document.getElementById("books-grid").offsetTop - 100);
    }
  },

  /**
   * Go to the next page.
   */
  nextPage() {
    const totalPages = Math.ceil(this.totalBooks / this.pageSize);
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.fetchBooksFromServer();
      window.scrollTo(0, document.getElementById("books-grid").offsetTop - 100);
    }
  },

  /* ------------------------------------------
     BOOK CARD CREATION
     ------------------------------------------ */

  /**
   * Create HTML for a book card.
   * @param {object} book - Book object
   * @param {string} reason - Optional recommendation reason
   * @returns {string} HTML string
   */
  createBookCard(book, reason) {
    const isCheckedOut = book.is_booked == 1;
    const isMyBook = isCheckedOut && this.currentUser && book.booked_by_user_id === this.currentUser.user_id;
    const statusBadge = isMyBook
      ? '<span class="badge badge-my-book">Your Book</span>'
      : isCheckedOut
      ? '<span class="badge badge-checked-out">Checked Out</span>'
      : "";
    const reasonHtml = reason
      ? `<p class="book-card-reason">${this.escapeHtml(reason)}</p>`
      : "";

    const coverUrl = book.image_url || "";
    const imgSrc = coverUrl || "/static/images/no-cover.svg";
    const fallbackCover = `<img src="${this.escapeHtml(imgSrc)}" alt="Cover of ${this.escapeHtml(book.title)}" onerror="this.src='/static/images/no-cover.svg'">`;

    return `
      <div class="book-card" tabindex="0" role="button"
           aria-label="${this.escapeHtml(book.title)} by ${this.escapeHtml(book.author)}"
           onclick="app.navigateTo('book', { bookId: ${book.book_id} })"
           onkeydown="if(event.key==='Enter') app.navigateTo('book', { bookId: ${book.book_id} })">
        <div class="book-card-cover">
          ${fallbackCover}
          ${statusBadge}
        </div>
        <div class="book-card-body">
          <h3 class="book-card-title">${this.escapeHtml(book.title)}</h3>
          <p class="book-card-author">${this.escapeHtml(book.author)}</p>
          <p class="book-card-year">${book.year_published || ""}</p>
          ${reasonHtml}
        </div>
      </div>
    `;
  },

  /**
   * Create HTML for a checkout card (dashboard).
   * @param {object} checkout - Checkout object with book data
   * @returns {string} HTML string
   */
  createCheckoutCard(checkout) {
    // The checkout history API JOINs book data, so title/author/image_url are flat fields
    const title = checkout.title || "";
    const author = checkout.author || "";
    const imageUrl = checkout.image_url || "/static/images/no-cover.svg";
    const bookId = checkout.book_id;
    const checkoutDate = checkout.checkout_date ? checkout.checkout_date.split(' ')[0] : "";
    const dueDate = checkout.due_date ? checkout.due_date.split(' ')[0] : "";
    return `
      <div class="checkout-card">
        <div class="checkout-card-cover" onclick="app.navigateTo('book', { bookId: ${bookId} })" style="cursor:pointer;">
          <img src="${this.escapeHtml(imageUrl)}" alt="Cover of ${this.escapeHtml(title)}" onerror="this.src='/static/images/no-cover.svg'">
        </div>
        <div class="checkout-card-body">
          <h3 class="checkout-card-title" onclick="app.navigateTo('book', { bookId: ${bookId} })" style="cursor:pointer;">${this.escapeHtml(title)}</h3>
          <p class="checkout-card-author">${this.escapeHtml(author)}</p>
          <p class="checkout-card-date">Checked out: ${checkoutDate}</p>
          ${dueDate ? `<p class="checkout-card-date">Due: ${dueDate}</p>` : ""}
          <button class="btn btn-outline btn-sm" style="margin-top:0.5rem;width:100%;" onclick="app.returnBookFromDashboard(${bookId})">Return Book</button>
        </div>
      </div>
    `;
  },

  /* ------------------------------------------
     BOOK DETAIL
     ------------------------------------------ */

  /**
   * Load and display a single book's details.
   * GET /api/books/{book_id}
   * @param {number} bookId
   * @returns {Promise<void>}
   */
  async loadBookDetail(bookId) {
    let book = null;

    const result = await apiRequest(`/books/${bookId}`);
    if (result && result.book_id) {
      book = result;
    } else {
      book = MOCK_BOOKS.find((b) => b.book_id === bookId) || null;
    }

    if (!book) {
      this.showToast("Book not found.", "error");
      this.navigateTo("home");
      return;
    }

    // Populate book detail UI
    const coverImg = document.getElementById("book-cover-img");
    coverImg.src = book.image_url || "/static/images/no-cover.svg";
    coverImg.alt = `Cover of ${book.title}`;
    coverImg.onerror = function() { this.src = "/static/images/no-cover.svg"; };
    document.getElementById("book-title").textContent = book.title;
    document.getElementById("book-author").textContent = book.author;
    document.getElementById("book-year").textContent = book.year_published || "";

    // Only show genre badge if genre exists
    const genreBadge = document.getElementById("book-genre-badge");
    if (book.genre) {
      genreBadge.textContent = book.genre;
      genreBadge.style.display = "";
    } else {
      genreBadge.style.display = "none";
    }

    document.getElementById("book-isbn").textContent = book.isbn ? `ISBN: ${book.isbn}` : "";

    // Status badge
    const statusBadge = document.getElementById("book-status-badge");
    if (book.is_booked) {
      statusBadge.className = "badge badge-checked-out";
      statusBadge.textContent = "Checked Out";
    } else {
      statusBadge.className = "badge badge-available";
      statusBadge.textContent = "Available";
    }

    // Checkout info
    const checkoutInfo = document.getElementById("book-checkout-info");
    if (book.is_booked && book.due_date) {
      checkoutInfo.style.display = "block";
      checkoutInfo.textContent = `Due date: ${book.due_date}`;
    } else {
      checkoutInfo.style.display = "none";
    }

    // Action buttons
    const actionDiv = document.getElementById("book-action-buttons");
    if (this.currentUser) {
      if (book.is_booked && book.booked_by_user_id === this.currentUser.user_id) {
        actionDiv.innerHTML = `<button class="btn btn-outline btn-full" onclick="app.returnBook(${book.book_id})">Return Book</button>`;
      } else if (!book.is_booked) {
        actionDiv.innerHTML = `<button class="btn btn-primary btn-full" onclick="app.checkoutBook(${book.book_id})">Check Out</button>`;
      } else {
        actionDiv.innerHTML = `<button class="btn btn-primary btn-full" disabled>Unavailable</button>`;
      }
    } else {
      actionDiv.innerHTML = `<button class="btn btn-primary btn-full" onclick="app.navigateTo('auth')">Login to Check Out</button>`;
    }

    // Load reviews
    this.loadBookReviews(bookId);

    // Show review form if logged in
    const reviewForm = document.getElementById("review-form");
    reviewForm.style.display = this.currentUser ? "block" : "none";
    this.initRatingButtons();
  },

  /* ------------------------------------------
     CHECKOUT / RETURN
     ------------------------------------------ */

  /**
   * Check out a book for the current user.
   * POST /api/checkouts
   * @param {number} bookId
   * @returns {Promise<void>}
   */
  async checkoutBook(bookId) {
    if (!this.currentUser) {
      this.showToast("Please login to checkout books.", "error");
      return;
    }

    const result = await apiRequest("/checkouts", {
      method: "POST",
      body: JSON.stringify({
        book_id: bookId,
        user_id: this.currentUser.user_id,
      }),
    });

    if (result && (result.checkout_id || result.message)) {
      this.showToast("Book checked out successfully!", "success");
    } else {
      // Mock fallback
      const book = MOCK_BOOKS.find((b) => b.book_id === bookId);
      if (book && !book.is_booked) {
        book.is_booked = 1;
        book.booked_by_user_id = this.currentUser.user_id;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7);
        book.due_date = dueDate.toISOString().split("T")[0];

        MOCK_CHECKOUTS.push({
          checkout_id: Date.now(),
          book_id: bookId,
          user_id: this.currentUser.user_id,
          checkout_date: new Date().toISOString().split("T")[0],
          return_date: null,
          due_date: book.due_date,
          is_returned: 0,
        });

        this.showToast("Book checked out successfully!", "success");
      } else {
        this.showToast("Unable to checkout this book.", "error");
        return;
      }
    }

    // Refresh views
    this.loadBookDetail(bookId);
    this.loadBooks();
    this.loadTrendingBooks();
    this.loadRecommendations();
  },

  /**
   * Return a book from the book detail view.
   * DELETE /api/checkouts/{checkout_id}
   * @param {number} bookId
   * @returns {Promise<void>}
   */
  async returnBook(bookId) {
    if (!this.currentUser) return;

    const success = await this._doReturn(bookId);
    if (success) {
      this.loadBookDetail(bookId);
      this.loadBooks();
      this.loadTrendingBooks();
      this.loadRecommendations();
    }
  },

  /**
   * Return a book from the dashboard Currently Reading tab.
   * @param {number} bookId
   * @returns {Promise<void>}
   */
  async returnBookFromDashboard(bookId) {
    if (!this.currentUser) return;

    const success = await this._doReturn(bookId);
    if (success) {
      this.loadDashboard();
      this.loadBooks();
      this.loadTrendingBooks();
    }
  },

  /**
   * Core return logic shared by returnBook and returnBookFromDashboard.
   * @param {number} bookId
   * @returns {Promise<boolean>} true if return succeeded
   */
  async _doReturn(bookId) {
    let checkoutId = null;

    const checkoutsResult = await apiRequest(`/checkouts?user_id=${this.currentUser.user_id}&active=true`);
    if (checkoutsResult && checkoutsResult.checkouts) {
      const checkout = checkoutsResult.checkouts.find((c) => c.book_id === bookId);
      if (checkout) checkoutId = checkout.checkout_id;
    }

    if (checkoutId) {
      const result = await apiRequest(`/checkouts/${checkoutId}`, { method: "DELETE" });
      if (result && result.message) {
        this.showToast("Book returned successfully!", "success");
        return true;
      } else {
        this.showToast("Failed to return the book. Please try again.", "error");
        return false;
      }
    } else {
      // Mock fallback
      const book = MOCK_BOOKS.find((b) => b.book_id === bookId);
      if (book) {
        book.is_booked = 0;
        book.booked_by_user_id = null;
        book.due_date = null;
      }
      const checkout = MOCK_CHECKOUTS.find(
        (c) => c.book_id === bookId && c.user_id === this.currentUser.user_id && !c.is_returned
      );
      if (checkout) {
        checkout.is_returned = 1;
        checkout.return_date = new Date().toISOString().split("T")[0];
      }
      this.showToast("Book returned successfully!", "success");
      return true;
    }
  },

  /* ------------------------------------------
     REVIEWS
     ------------------------------------------ */

  /**
   * Load reviews for a specific book.
   * @param {number} bookId
   * @returns {Promise<void>}
   */
  async loadBookReviews(bookId) {
    let reviews = [];

    const result = await apiRequest(`/reviews?book_id=${bookId}`);
    if (result && Array.isArray(result)) {
      reviews = result;
    } else {
      reviews = MOCK_REVIEWS.filter((r) => r.book_id === bookId);
    }

    // Update heading
    document.getElementById("reviews-heading").textContent = `Reviews (${reviews.length})`;

    // Average rating
    const ratingDisplay = document.getElementById("book-rating-display");
    if (reviews.length > 0) {
      const avg = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
      ratingDisplay.textContent = `${avg}/10 (${reviews.length})`;
    } else {
      ratingDisplay.textContent = "No ratings";
    }

    // Render reviews
    const list = document.getElementById("reviews-list");
    if (reviews.length === 0) {
      list.innerHTML = '<div class="empty-state"><p>No reviews yet. Be the first to review this book!</p></div>';
    } else {
      list.innerHTML = reviews
        .map((review) => {
          const initial = (review.username || "U").charAt(0).toUpperCase();
          const imageHtml = review.image
            ? `<img src="${this.escapeHtml(review.image)}" alt="Review image" class="review-image">`
            : "";

          return `
            <div class="review-item">
              <div class="review-header">
                <div class="review-user">
                  <div class="review-avatar">${initial}</div>
                  <div>
                    <p class="review-username">${this.escapeHtml(review.username || "Anonymous")}</p>
                    <p class="review-date">${review.created_at || ""}</p>
                  </div>
                </div>
                <span class="badge badge-accent">${review.rating}/10</span>
              </div>
              <p class="review-comment">${this.escapeHtml(review.comment || "")}</p>
              ${imageHtml}
            </div>
          `;
        })
        .join("");
    }
  },

  /**
   * Initialize the rating button selector.
   */
  initRatingButtons() {
    const container = document.getElementById("rating-buttons");
    container.innerHTML = "";
    this.selectedRating = 5;

    for (let i = 1; i <= 10; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `rating-btn${i === 5 ? " selected" : ""}`;
      btn.textContent = i;
      btn.setAttribute("role", "radio");
      btn.setAttribute("aria-checked", i === 5 ? "true" : "false");
      btn.setAttribute("aria-label", `Rating ${i} out of 10`);
      btn.addEventListener("click", () => {
        this.selectedRating = i;
        container.querySelectorAll(".rating-btn").forEach((b) => {
          b.classList.remove("selected");
          b.setAttribute("aria-checked", "false");
        });
        btn.classList.add("selected");
        btn.setAttribute("aria-checked", "true");
      });
      container.appendChild(btn);
    }
  },

  /**
   * Handle review image file selection.
   */
  handleReviewImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      this.reviewImageData = reader.result;
      const area = document.getElementById("review-image-area");
      area.innerHTML = `
        <div class="review-image-preview">
          <img src="${reader.result}" alt="Review image preview">
          <button class="remove-image-btn" onclick="app.removeReviewImage()" aria-label="Remove image">&times;</button>
        </div>
      `;
    };
    reader.readAsDataURL(file);
  },

  /**
   * Remove the selected review image.
   */
  removeReviewImage() {
    this.reviewImageData = "";
    const area = document.getElementById("review-image-area");
    area.innerHTML = `
      <label class="image-upload-label" for="review-image-input">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <span>Upload</span>
      </label>
      <input type="file" id="review-image-input" accept="image/*" class="visually-hidden" onchange="app.handleReviewImage(event)">
    `;
  },

  /**
   * Submit a review for the current book.
   * POST /api/books/{book_id}/reviews (or similar endpoint)
   * @returns {Promise<void>}
   */
  async submitReview() {
    if (!this.currentUser || !this.currentBookId) {
      this.showToast("Please login to submit a review.", "error");
      return;
    }

    const comment = document.getElementById("review-comment").value.trim();
    if (!comment) {
      this.showToast("Please write a comment.", "error");
      return;
    }

    const reviewData = {
      book_id: this.currentBookId,
      user_id: this.currentUser.user_id,
      rating: this.selectedRating,
      comment: comment,
      image: this.reviewImageData || null,
    };

    const result = await apiRequest(`/reviews`, {
      method: "POST",
      body: JSON.stringify(reviewData),
    });

    if (result && result.review_id) {
      this.showToast("Review submitted successfully!", "success");
    } else {
      this.showToast("Failed to submit review.", "error");
      return;
    }

    // Reset form
    document.getElementById("review-comment").value = "";
    this.selectedRating = 5;
    this.reviewImageData = "";
    this.removeReviewImage();
    this.initRatingButtons();

    // Reload reviews
    this.loadBookReviews(this.currentBookId);
  },

  /* ------------------------------------------
     DASHBOARD
     ------------------------------------------ */

  /**
   * Load user dashboard data (current checkouts, history, reviews).
   */
  async loadDashboard() {
    if (!this.currentUser) return;

    // Clear stale content immediately so previous user's data never shows
    document.getElementById("current-books-grid").innerHTML = "";
    document.getElementById("history-list").innerHTML = "";
    document.getElementById("my-reviews-list").innerHTML = "";
    document.getElementById("stat-reading").textContent = "0";
    document.getElementById("stat-total").textContent = "0";
    document.getElementById("stat-reviews").textContent = "0";

    const userId = this.currentUser.user_id;

    // Profile header
    document.getElementById("profile-avatar").textContent = (this.currentUser.username || "U").charAt(0).toUpperCase();
    document.getElementById("profile-username").textContent = this.currentUser.username;
    document.getElementById("profile-joined").textContent = this.currentUser.created_at
      ? `Member since ${this.currentUser.created_at.split(" ")[0]}`
      : "";

    // Load checkout history (API returns book data as flat fields via JOIN)
    let checkouts = [];
    const historyResult = await apiRequest(`/checkouts/user/${userId}/history`);
    if (historyResult && historyResult.checkouts) {
      checkouts = historyResult.checkouts;
    } else {
      checkouts = MOCK_CHECKOUTS.filter((c) => c.user_id === userId);
    }

    const currentCheckouts = checkouts.filter((c) => !c.is_returned);
    const pastCheckouts = checkouts.filter((c) => c.is_returned);

    // Load user reviews
    let userReviews = [];
    const reviewsResult = await apiRequest(`/reviews?user_id=${userId}`);
    if (reviewsResult && Array.isArray(reviewsResult)) {
      userReviews = reviewsResult;
    } else {
      userReviews = MOCK_REVIEWS.filter((r) => r.user_id === userId);
    }

    // Stats
    document.getElementById("stat-reading").textContent = currentCheckouts.length;
    document.getElementById("stat-total").textContent = pastCheckouts.length;
    document.getElementById("stat-reviews").textContent = userReviews.length;

    // Current reading
    const currentGrid = document.getElementById("current-books-grid");
    const currentEmpty = document.getElementById("current-empty");
    if (currentCheckouts.length > 0) {
      currentGrid.innerHTML = currentCheckouts.map((c) => this.createCheckoutCard(c)).join("");
      currentEmpty.style.display = "none";
    } else {
      currentGrid.innerHTML = "";
      currentEmpty.style.display = "block";
    }

    // History
    const historyList = document.getElementById("history-list");
    const historyEmpty = document.getElementById("history-empty");
    if (pastCheckouts.length > 0) {
      historyList.innerHTML = pastCheckouts
        .map((c) => {
          const imgUrl = c.image_url || "/static/images/no-cover.svg";
          return `
            <div class="history-item" onclick="app.navigateTo('book', { bookId: ${c.book_id} })">
              <div class="history-cover">
                <img src="${this.escapeHtml(imgUrl)}" alt="${this.escapeHtml(c.title || "")}" onerror="this.src='/static/images/no-cover.svg'">
              </div>
              <div class="history-info">
                <h3 class="history-title">${this.escapeHtml(c.title || "Unknown")}</h3>
                <p class="history-author">${this.escapeHtml(c.author || "")}</p>
                <div class="history-dates">
                  <span>Checked out: ${c.checkout_date || ""}</span>
                  ${c.return_date ? `<span>Returned: ${c.return_date}</span>` : ""}
                </div>
              </div>
              ${c.genre ? `<span class="badge badge-outline">${this.escapeHtml(c.genre)}</span>` : ""}
            </div>
          `;
        })
        .join("");
      historyEmpty.style.display = "none";
    } else {
      historyList.innerHTML = "";
      historyEmpty.style.display = "block";
    }

    // User reviews
    const myReviewsList = document.getElementById("my-reviews-list");
    const myReviewsEmpty = document.getElementById("my-reviews-empty");
    if (userReviews.length > 0) {
      myReviewsList.innerHTML = userReviews
        .map((review) => {
          const bookTitle = review.title || (review._book && review._book.title) || "Unknown";
          const bookAuthor = review.author || (review._book && review._book.author) || "";
          const bookImageUrl = review.image_url || (review._book && review._book.image_url) || "/static/images/no-cover.svg";
          const bookId = review.book_id;
          const imageHtml = review.image
            ? `<img src="${this.escapeHtml(review.image)}" alt="Review image" class="review-image">`
            : "";
          return `
            <div class="review-item">
              <div class="review-header">
                <div class="review-user" style="cursor:pointer" onclick="app.navigateTo('book', { bookId: ${bookId} })">
                  <div class="history-cover" style="width:50px;height:70px;">
                    <img src="${this.escapeHtml(bookImageUrl)}" alt="${this.escapeHtml(bookTitle)}" onerror="this.src='/static/images/no-cover.svg'">
                  </div>
                  <div>
                    <p class="review-username">${this.escapeHtml(bookTitle)}</p>
                    <p class="review-date">${this.escapeHtml(bookAuthor)}</p>
                  </div>
                </div>
                <span class="badge badge-accent">${review.rating}/10</span>
              </div>
              <p class="review-comment">${this.escapeHtml(review.comment || "")}</p>
              ${imageHtml}
            </div>
          `;
        })
        .join("");
      myReviewsEmpty.style.display = "none";
    } else {
      myReviewsList.innerHTML = "";
      myReviewsEmpty.style.display = "block";
    }
  },

  /* ------------------------------------------
     UTILITIES
     ------------------------------------------ */

  /**
   * Show a toast notification.
   * @param {string} message
   * @param {string} type - "success", "error", or "info"
   */
  showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.setAttribute("role", "alert");
    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3000);
  },

  /**
   * Escape HTML special characters to prevent XSS.
   * @param {string} str
   * @returns {string}
   */
  escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  },
};

/* ============================================
   INITIALIZATION
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  app.init();
});
