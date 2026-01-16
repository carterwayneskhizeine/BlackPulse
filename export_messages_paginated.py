import sqlite3
import os

# Configuration
# Path to the database file relative to this script
DB_PATH = os.path.join('data', 'messages.db')
# Output directory for the exported files
OUTPUT_DIR = 'exported_messages'
# Maximum lines per file (including headers and separators)
MAX_LINES_PER_FILE = 1000

def export_data():
    # 1. Verify Database Exists
    if not os.path.exists(DB_PATH):
        print(f"[Error] Database file not found at: {os.path.abspath(DB_PATH)}")
        print("Please ensure you are running this script from the project root directory.")
        return

    # 2. Create Output Directory
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"[Info] Created output directory: {os.path.abspath(OUTPUT_DIR)}")

    conn = None
    try:
        # 3. Connect to Database
        conn = sqlite3.connect(DB_PATH)
        # Use Row factory to access columns by name if needed
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # 4. Query Data
        # We assume the table is named 'messages' and has 'id' and 'content' columns.
        print(f"Reading data from {DB_PATH}...")
        cursor.execute("SELECT id, content FROM messages ORDER BY id ASC")
        rows = cursor.fetchall()

        if not rows:
            print("No messages found in the database.")
            return

        # 5. Write to Multiple Markdown Files
        print(f"Exporting {len(rows)} messages with pagination...")

        file_index = 1
        current_lines = 0
        current_file = None
        messages_in_current_file = 0

        for row in rows:
            msg_id = row['id']
            content = row['content'] if row['content'] else "(No Content)"

            # Calculate lines needed for this message
            # Header (2 lines) + content lines + separator (3 lines)
            content_lines = len(content.split('\n'))
            lines_needed = 2 + content_lines + 3

            # Check if we need to create a new file
            if current_file is None or current_lines + lines_needed > MAX_LINES_PER_FILE:
                # Close previous file if open
                if current_file is not None:
                    current_file.close()
                    print(f"  - Created: {os.path.abspath(current_filename)} ({messages_in_current_file} messages, {current_lines} lines)")

                # Create new file
                current_filename = os.path.join(OUTPUT_DIR, f'exported_messages_{file_index:03d}.md')
                current_file = open(current_filename, 'w', encoding='utf-8')

                # Write file header
                current_file.write(f"# BlackPulse Messages Export (Part {file_index})\n\n")
                current_file.write(f"**File Index:** {file_index}\n\n")
                current_file.write("---\n\n")

                current_lines = 5  # Header lines count
                messages_in_current_file = 0
                file_index += 1

            # Write message
            current_file.write(f"## Message ID: {msg_id}\n\n")
            current_file.write(f"{content}\n\n")
            current_file.write("---\n\n")

            current_lines += lines_needed
            messages_in_current_file += 1

        # Close the last file
        if current_file is not None:
            current_file.close()
            print(f"  - Created: {os.path.abspath(current_filename)} ({messages_in_current_file} messages, {current_lines} lines)")

        total_files = file_index - 1
        print(f"\n[Success] Data exported to {total_files} file(s) in: {os.path.abspath(OUTPUT_DIR)}")
        print(f"  - Total messages: {len(rows)}")
        print(f"  - Total files created: {total_files}")
        print(f"  - Maximum lines per file: {MAX_LINES_PER_FILE}")

    except sqlite3.Error as e:
        print(f"[SQLite Error] {e}")
    except Exception as e:
        print(f"[Error] {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    export_data()
