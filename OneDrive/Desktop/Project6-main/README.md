# Library Management System

A RESTful web application for managing a library, built with Python/Flask and SQLite. This project is designed for performance testing with JMeter.

## Project Overview

This library system allows users to:
- Search and browse books
- Filter by author, year, and genre
- Checkout and return books
- View personalized recommendations based on checkout history
- See trending books (most checked out in the last 7 days)

## Tech Stack

- **Backend**: Python 3.11 + Flask
- **Database**: SQLite
- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Container**: Docker

## Project Structure

```
library-project/
├── app/
│   ├── __init__.py          # Flask app factory
│   ├── database.py          # Database schema and connection
│   └── routes/
│       ├── __init__.py
│       ├── users.py         # User CRUD routes
│       ├── books.py         # Book routes with search/filter
│       ├── checkouts.py     # Checkout/return routes
│       └── homepage.py      # Homepage with recommendations
├── templates/
│   └── index.html           # Main HTML template
├── static/
│   ├── css/style.css        # Styles
│   ├── js/app.js            # Frontend JavaScript
│   └── images/              # Static images
├── scripts/
│   └── import_data.py       # Data import script
├── data/                    # Database and CSV files
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── run.py                   # Application entry point
```

## REST API Routes

| Method  | Route                              | Description                    |
|---------|------------------------------------|---------------------------------|
| GET     | /api/books                         | List books with filters        |
| GET     | /api/books/<id>                    | Get single book                |
| GET     | /api/books/search?q=              | Search books                   |
| GET     | /api/books/filters                 | Get filter options             |
| PATCH   | /api/books/<id>                    | Update book availability       |
| OPTIONS | /api/books                         | Get allowed methods            |
| POST    | /api/users                         | Register user                  |
| POST    | /api/users/login                   | Login user                     |
| GET     | /api/users/<id>                    | Get user                       |
| PUT     | /api/users/<id>                    | Update user                    |
| DELETE  | /api/users/<id>                    | Delete user                    |
| POST    | /api/checkouts                     | Checkout a book                |
| GET     | /api/checkouts                     | List checkouts                 |
| GET     | /api/checkouts/<id>                | Get checkout details           |
| DELETE  | /api/checkouts/<id>                | Return a book                  |
| GET     | /api/homepage                      | Get homepage data              |
| GET     | /api/homepage/trending             | Get trending books             |
| GET     | /api/homepage/recommendations/<id> | Get user recommendations       |

## Setup Instructions

### 1. Download the Dataset

Download the Book Recommendation Dataset from Kaggle:
https://www.kaggle.com/datasets/arashnic/book-recommendation-dataset

Place `Books.csv` in the `data/` directory.

### 2. Run with Docker (Recommended)

```bash
# Build and run
docker-compose up --build

# Access the application at http://localhost:5000
```

### 3. Run Locally (Alternative)

```bash
# Install dependencies
pip install -r requirements.txt

# Import data
python scripts/import_data.py --limit 10000

# Run the application
python run.py
```

### 4. Import Data

```bash
# Import 10,000 books (default)
python scripts/import_data.py

# Import custom number of books
python scripts/import_data.py --limit 5000

# Create sample users and checkouts
python scripts/import_data.py --users 100 --checkouts 500
```

## Performance Testing Notes

This application includes **intentional inefficiencies** for performance testing:

1. **No Caching**: Recommendations are recalculated on every page load
2. **Multiple Queries**: Separate database queries for each recommendation type
3. **N+1 Query Pattern**: Similar users recommendations use nested loops
4. **Full Table Scans**: Search uses LIKE queries without optimized indexes
5. **Image Loading**: External images loaded on every request

### Areas to Optimize

After baseline JMeter testing, consider optimizing:
- Add caching for trending books and recommendations
- Combine recommendation queries into single optimized query
- Add database indexes for frequent search patterns
- Implement lazy loading for images
- Add pagination to recommendations
- Use connection pooling

## Test Users

After running `import_data.py`, sample users are created:
- Username: `user1` to `user100`
- Password: `pass1` to `pass100`

Example: Login with `user1` / `pass1`

## JMeter Testing

Key endpoints to test:
1. `GET /api/homepage?user_id=1` - Full homepage with recommendations
2. `GET /api/books?search=python` - Book search
3. `POST /api/checkouts` - Book checkout
4. `GET /api/homepage/recommendations/1` - Recommendations only

## Team Members

- [Team Member 1]
- [Team Member 2]
- [Team Member 3]
- [Team Member 4]

## Documentation

This project uses **Doxygen** to generate API documentation from Python docstrings.

### Generate Documentation with Docker

```bash
# Using Make (recommended)
make docs

# Or using docker-compose directly
docker-compose run --rm docs
```

### Generate and Serve Documentation

```bash
# Using Make - serves on http://localhost:8080
make docs-serve

# Or manually
docker-compose run --rm docs
docker-compose --profile docs-server up -d docs-server
```

### Generate Documentation Locally

If you have Doxygen installed locally:

```bash
# Install Doxygen (Ubuntu/Debian)
sudo apt-get install doxygen graphviz

# Generate documentation
doxygen Doxyfile
# Or use Make
make docs-local
```

### View Documentation

After generation, open `docs/html/index.html` in your browser, or access `http://localhost:8080` if using the docs-server.

### Documentation Structure

- `Doxyfile` - Doxygen configuration file
- `docs/html/` - Generated HTML documentation (gitignored)
- `docs/doxygen_warnings.log` - Build warnings log

## Course

CSCN73060 - Web Project
