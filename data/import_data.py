import sqlite3
import pandas as pd
from datetime import datetime
import os

def insert_books_to_db(csv_file, db_file):
    """
    Insert cleaned book data into the SQLite database
    """
    print("="*50)
    print("BOOK DATA INSERTION PIPELINE")
    print("="*50)
    
    # Check if files exist
    if not os.path.exists(csv_file):
        print(f"✗ CSV file not found: {csv_file}")
        return False
    
    if not os.path.exists(db_file):
        print(f"✗ Database file not found: {db_file}")
        return False
    
    try:
        # Load cleaned CSV
        print(f"\n--- Loading CSV ---")
        df = pd.read_csv(csv_file, dtype=str)
        print(f"Loaded {len(df)} records from CSV")
        print(f"Columns: {list(df.columns)}")
        
        # Connect to database
        print(f"\n--- Connecting to Database ---")
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()
        print(f"✓ Connected to {db_file}")
        
        # Prepare data for insertion
        print(f"\n--- Preparing Data ---")
        
        # Map CSV columns to database columns
        # We'll use the first (largest) image URL
        books_to_insert = []
        
        for idx, row in df.iterrows():
            try:
                # Extract year as integer or None
                year = None
                if pd.notna(row.get('Year-Of-Publication')):
                    try:
                        year = int(float(row['Year-Of-Publication']))
                    except:
                        year = None
                
                # Get the largest image URL (or medium, or small as fallback)
                image_url = None
                if pd.notna(row.get('Image-URL-L')):
                    image_url = row['Image-URL-L']
                elif pd.notna(row.get('Image-URL-M')):
                    image_url = row['Image-URL-M']
                elif pd.notna(row.get('Image-URL-S')):
                    image_url = row['Image-URL-S']
                
                # Prepare tuple for insertion
                book_data = (
                    row.get('ISBN', ''),                    # isbn
                    row.get('Book-Title', 'Unknown'),       # title
                    row.get('Book-Author', 'Unknown'),      # author
                    year,                                    # year_published
                    None,                                    # genre (not in CSV)
                    image_url,                              # image_url
                    0,                                       # is_booked (default)
                    None,                                    # booked_by_user_id (default)
                    None                                     # due_date (default)
                )
                
                books_to_insert.append(book_data)
                
            except Exception as e:
                print(f"Warning: Skipping row {idx} due to error: {e}")
                continue
        
        print(f"Prepared {len(books_to_insert)} records for insertion")
        
        # Insert data
        print(f"\n--- Inserting Data ---")
        
        insert_query = '''
            INSERT OR IGNORE INTO books 
            (isbn, title, author, year_published, genre, image_url, 
             is_booked, booked_by_user_id, due_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        '''
        
        # Insert in batches for better performance
        batch_size = 1000
        inserted_count = 0
        skipped_count = 0
        
        for i in range(0, len(books_to_insert), batch_size):
            batch = books_to_insert[i:i + batch_size]
            
            try:
                cursor.executemany(insert_query, batch)
                inserted_count += cursor.rowcount
                conn.commit()
                
                # Progress update
                progress = min(i + batch_size, len(books_to_insert))
                print(f"✓ Progress: {progress}/{len(books_to_insert)} records processed")
                
            except sqlite3.IntegrityError as e:
                print(f"Warning: Some records in batch {i//batch_size + 1} skipped (likely duplicates)")
                skipped_count += len(batch)
                conn.rollback()
                
                # Try inserting individually to skip only duplicates
                for book in batch:
                    try:
                        cursor.execute(insert_query, book)
                        inserted_count += cursor.rowcount
                    except sqlite3.IntegrityError:
                        skipped_count += 1
                
                conn.commit()
        
        # Create indexes for better query performance
        print(f"\n--- Creating Indexes ---")
        
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_isbn ON books(isbn)",
            "CREATE INDEX IF NOT EXISTS idx_title ON books(title)",
            "CREATE INDEX IF NOT EXISTS idx_author ON books(author)",
            "CREATE INDEX IF NOT EXISTS idx_year ON books(year_published)",
            "CREATE INDEX IF NOT EXISTS idx_is_booked ON books(is_booked)"
        ]
        
        for index_query in indexes:
            cursor.execute(index_query)
        
        conn.commit()
        print(f"Created performance indexes")
        
        # Get final statistics
        print(f"\n--- Verifying Data ---")
        cursor.execute("SELECT COUNT(*) FROM books")
        total_in_db = cursor.fetchone()[0]
        
        # Close connection
        conn.close()
        
        # Final summary
        print("\n" + "="*50)
        print("INSERTION SUMMARY")
        print("="*50)
        print(f"Records in CSV: {len(books_to_insert)}")
        print(f"Records inserted: {inserted_count}")
        print(f"Records skipped (duplicates): {skipped_count}")
        print(f"Total records in database: {total_in_db}")
        print("="*50)
        
        return True
        
    except Exception as e:
        print(f"\n✗ Error during insertion: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    # File paths
    csv_file = r"data\Books.csv"
    db_file = r"data\library.db"
    
    # Run insertion
    success = insert_books_to_db(csv_file, db_file)
    
    if success:
        print("\nData insertion completed successfully!")
    else:
        print("\nData insertion failed!")