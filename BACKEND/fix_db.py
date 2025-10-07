import sqlite3

# Connect to the database
conn = sqlite3.connect('app.db')
cursor = conn.cursor()

# Check if the qualifications column exists
cursor.execute("PRAGMA table_info(doctor)")
columns = cursor.fetchall()
column_names = [col[1] for col in columns]

if 'qualifications' in column_names:
    print("Dropping qualifications column from doctor table...")
    cursor.execute("ALTER TABLE doctor DROP COLUMN qualifications")
    conn.commit()
    print("Column dropped successfully.")
else:
    print("Qualifications column not found in doctor table.")

# Close the connection
conn.close()
