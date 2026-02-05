import sqlite3
import pandas as pd
from datetime import datetime
import os

def insert_reviews_to_db(csv_file, db_file):
    # Check if files exist
    if not os.path.exists(csv_file):
        print(f"✗ CSV file not found: {csv_file}")
        return False
    
    if not os.path.exists(db_file):
        print(f"✗ Database file not found: {db_file}")
        return False
    
    try:
        # Load CSV
        print(f"\n--- Loading CSV ---")
        df = pd.read_csv(csv_file, dtype=str)
        print(f"Loaded {len(df)} records from CSV")

        # Connect to database
        print(f"\n--- Connecting to Database ---")
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()
        print(f"✓ Connected to {db_file}")

        # Determine a synthetic user_id that is not used by any real user
        cursor.execute("SELECT MAX(user_id) FROM users")
        row = cursor.fetchone()
        max_user_id = row[0] if row and row[0] is not None else 0
        synthetic_user_id = int(max_user_id) + 1
        print(f"Using synthetic user_id: {synthetic_user_id}")

        insert_query = (
            "INSERT INTO reviews (user_id, book_id, rating) VALUES (?, ?, ?)"
        )

        inserted_count = 0

        for idx, r in df.iterrows():
            try:
                # Only accept ratings > 0
                rating = int(r['Book-Rating']) if pd.notna(r['Book-Rating']) else None
                if rating is None or rating <= 0:
                    continue

                isbn = r['ISBN'] if pd.notna(r['ISBN']) else None
                if not isbn:
                    continue

                # Find matching book_id in books table by ISBN
                cursor.execute("SELECT book_id FROM books WHERE isbn = ?", (isbn,))
                book_row = cursor.fetchone()
                if not book_row:
                    print(f"✗ No book found for ISBN {isbn} (row {idx})")
                    continue

                book_id = book_row[0]

                cursor.execute(insert_query, (synthetic_user_id, book_id, rating))
                inserted_count += 1
            except Exception as e:
                print(f"✗ Error processing row {idx}: {e}")

        conn.commit()
        print(f"Inserted {inserted_count} reviews with user_id {synthetic_user_id}")
        return True
    except Exception as e:
        print(f"\n✗ Error during insertion: {e}")
        import traceback
        traceback.print_exc()
        return False



if __name__ == "__main__":
    # File paths (use script directory so running from any CWD works)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    csv_file = os.path.join(script_dir, "Ratings.csv")
    db_file = os.path.join(script_dir, "library.db")
    
    # Run insertion
    success = insert_reviews_to_db(csv_file, db_file)
    
    if success:
        print("\nData insertion completed successfully!")
    else:
        print("\nData insertion failed!")