# Data Export Guide

This guide explains how to export all message content from the BlackPulse SQLite database (`data/messages.db`) into a single readable Markdown file.

## Prerequisites

*   **Python 3**: You must have Python installed on your system.
    *   Verify installation: `python --version` or `python3 --version`

## Instructions

1.  **Prepare the Script**:
    Ensure the `export_messages.py` file is located in the **root directory** of the project (the same folder as `package.json` and `README.md`).

2.  **Run the Script**:
    Open your terminal or command prompt in the project root and run:

    ```bash
    python export_messages.py
    ```

    *(Note: On some systems, you may need to use `python3 export_messages.py`)*

3.  **View Results**:
    A new file named `exported_messages.md` will be created in the same directory. Open this file to view all messages ordered by their ID.

## Troubleshooting

*   **"Database file not found"**:
    *   Ensure the `data` folder exists and contains `messages.db`.
    *   If you are using Docker, the data might be inside a Docker volume. You may need to copy the database out of the container first:
        `docker cp <container_id>:/app/data/messages.db ./data/messages.db`
*   **"no such table: messages"**:
    *   This error implies the database schema might be different. Check `doc/database-management.md` for the correct table names.