import sqlite3
import os

# Path to the database file
db_path = os.path.join(os.path.dirname(__file__), 'instance', 'app.db')

# Connect to the database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Add is_online column to doctor table
    cursor.execute("ALTER TABLE doctor ADD COLUMN is_online BOOLEAN DEFAULT 0")

    # Add last_seen column to doctor table
    cursor.execute("ALTER TABLE doctor ADD COLUMN last_seen DATETIME")

    # Commit the changes
    conn.commit()
    print("Successfully added is_online and last_seen columns to doctor table")

except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("Columns already exist")
    else:
        print(f"Error: {e}")

finally:
    conn.close()
