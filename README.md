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
python data/import_data.py

# Verify Import
python data/verifydb.py
