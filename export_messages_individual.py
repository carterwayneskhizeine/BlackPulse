import sqlite3
import os

# Configuration
# Path to the database file relative to this script
DB_PATH = os.path.join('data', 'messages.db')
# Output directory for the exported files
OUTPUT_DIR = 'exported_messages_individual'

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
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # 4. Query All Messages
        print(f"Reading data from {DB_PATH}...")
        cursor.execute("""
            SELECT id, content, private_key, is_private, timestamp, user_id, comment_count
            FROM messages
            ORDER BY id ASC
        """)
        messages = cursor.fetchall()

        if not messages:
            print("No messages found in the database.")
            return

        print(f"Exporting {len(messages)} messages with their comments...")

        exported_count = 0

        # 5. Export Each Message with Its Comments
        for msg in messages:
            msg_id = msg['id']
            content = msg['content'] if msg['content'] else "(No Content)"
            private_key = msg['private_key']
            is_private = msg['is_private']
            timestamp = msg['timestamp']
            comment_count = msg['comment_count']

            # Create filename with message ID (zero-padded to 6 digits)
            filename = os.path.join(OUTPUT_DIR, f'message_{msg_id:06d}.md')

            # Write message and its comments to file
            with open(filename, 'w', encoding='utf-8') as f:
                # Message header
                f.write(f"# Message ID: {msg_id}\n\n")
                f.write(f"**Timestamp:** {timestamp}\n\n")
                f.write(f"**Is Private:** {'Yes' if is_private else 'No'}\n\n")

                # Write Private Key if exists
                if private_key:
                    f.write(f"**Private Key:** `{private_key}`\n\n")

                f.write(f"**Comment Count:** {comment_count}\n\n")
                f.write("---\n\n")

                # Message content
                f.write(f"## Content\n\n")
                f.write(f"{content}\n\n")
                f.write("---\n\n")

                # Query and write comments
                if comment_count > 0:
                    cursor.execute("""
                        SELECT id, username, text, likes, time, pid
                        FROM comments
                        WHERE message_id = ?
                        ORDER BY id ASC
                    """, (msg_id,))
                    comments = cursor.fetchall()

                    if comments:
                        f.write(f"## Comments ({len(comments)})\n\n")

                        for comment in comments:
                            comment_id = comment['id']
                            username = comment['username']
                            text = comment['text']
                            likes = comment['likes']
                            time = comment['time']
                            pid = comment['pid']

                            f.write(f"### Comment ID: {comment_id}\n\n")
                            f.write(f"**User:** {username}\n\n")
                            f.write(f"**Time:** {time}\n\n")
                            f.write(f"**Likes:** {likes}\n\n")
                            if pid:
                                f.write(f"**Reply to:** Comment ID {pid}\n\n")
                            f.write(f"{text}\n\n")
                            f.write("---\n\n")

            exported_count += 1
            if exported_count % 100 == 0:
                print(f"  - Progress: {exported_count}/{len(messages)} messages exported")

        print(f"\n[Success] All messages exported to: {os.path.abspath(OUTPUT_DIR)}")
        print(f"  - Total messages exported: {exported_count}")
        print(f"  - Each message is in a separate file: message_XXXXXX.md")

    except sqlite3.Error as e:
        print(f"[SQLite Error] {e}")
    except Exception as e:
        print(f"[Error] {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    export_data()
