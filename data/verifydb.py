import sqlite3

conn = sqlite3.connect(r"data\library.db")
cursor = conn.cursor()

# Check total count
cursor.execute("SELECT COUNT(*) FROM books")
print(f"Total books: {cursor.fetchone()[0]}")

# Check sample records
cursor.execute("SELECT isbn, title, author, year_published FROM books LIMIT 5")
for row in cursor.fetchall():
    print(row)

conn.close()