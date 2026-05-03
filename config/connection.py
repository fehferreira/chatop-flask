import sqlite3
from pathlib import Path


DB_PATH = Path(__file__).resolve().parents[1] / "chatbot-database.db"


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    with get_connection() as connection:
        cursor = connection.cursor()

        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                document TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL,
                admin INTEGER NOT NULL DEFAULT 0,
                card_number TEXT NOT NULL,
                card_type TEXT NOT NULL,
                card_status INTEGER NOT NULL,
                credit_limit REAL NOT NULL,
                invoice_total REAL NOT NULL,
                due_date TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        cursor.execute("SELECT COUNT(1) AS total FROM users")
        if cursor.fetchone()["total"] == 0:
            cursor.execute(
                """
                INSERT INTO users (
                    name, document, email, admin,
                    card_number, card_type, card_status,
                    credit_limit, invoice_total, due_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    "Cliente Demo",
                    "12345678901",
                    "cliente@demo.com",
                    1,
                    "1234",
                    "fisico",
                    1,
                    5000.0,
                    500.0,
                    "2026-12-10",
                ),
            )
            connection.commit()