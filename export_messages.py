import sqlite3
import os

# Configuration
# Path to the database file relative to this script
DB_PATH = os.path.join('data', 'messages.db')
# Output file name
OUTPUT_FILE = 'exported_messages.md'

def export_data():
    # 1. Verify Database Exists
    if not os.path.exists(DB_PATH):
        print(f"[Error] Database file not found at: {os.path.abspath(DB_PATH)}")
        print("Please ensure you are running this script from the project root directory.")
        return

    conn = None
    try:
        # 2. Connect to Database
        conn = sqlite3.connect(DB_PATH)
        # Use Row factory to access columns by name if needed
        conn.row_factory = sqlite3.Row 
        cursor = conn.cursor()
        
        # 3. Query Data
        # We assume the table is named 'messages' and has 'id' and 'content' columns.
        print(f"Reading data from {DB_PATH}...")
        cursor.execute("SELECT id, content FROM messages ORDER BY id ASC")
        rows = cursor.fetchall()
        
        if not rows:
            print("No messages found in the database.")
            return

        # 4. Write to Markdown File
        print(f"Exporting {len(rows)} messages...")
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            f.write(f"# BlackPulse Messages Export\n\n")
            f.write(f"**Total Messages:** {len(rows)}\n\n")
            f.write("---\n\n")
            
            for row in rows:
                msg_id = row['id']
                content = row['content'] if row['content'] else "(No Content)"
                
                f.write(f"## Message ID: {msg_id}\n\n")
                f.write(f"{content}\n\n")
                f.write("---\n\n")
                
        print(f"[Success] Data exported to: {os.path.abspath(OUTPUT_FILE)}")
        
    except sqlite3.Error as e:
        print(f"[SQLite Error] {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    export_data()