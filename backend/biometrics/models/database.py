import os
import json
import sqlite3
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Fallback to SQLite if psycopg2 is missing or no DB URL is provided
try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    USE_SQLITE = DATABASE_URL is None or not DATABASE_URL.startswith("postgresql")
except ImportError:
    USE_SQLITE = True

def get_db_connection():
    if USE_SQLITE:
        conn = sqlite3.connect("biometric_engine.db")
        conn.execute("PRAGMA foreign_keys = ON;")
        conn.row_factory = sqlite3.Row
        return conn
    else:
        return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def get_placeholder():
    return "?" if USE_SQLITE else "%s"

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    
    # SQLite compatibility: use AUTOINCREMENT instead of SERIAL
    pk_type = "INTEGER PRIMARY KEY AUTOINCREMENT" if USE_SQLITE else "SERIAL PRIMARY KEY"
    json_type = "TEXT" if USE_SQLITE else "JSONB"

    # Create Users table if not exists
    cur.execute(f"""
        CREATE TABLE IF NOT EXISTS users (
            id {pk_type},
            username VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # Create Biometric Samples table
    cur.execute(f"""
        CREATE TABLE IF NOT EXISTS biometric_samples (
            id {pk_type},
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            feature_vector {json_type} NOT NULL,
            sample_type VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # Create Model Versions table
    cur.execute(f"""
        CREATE TABLE IF NOT EXISTS model_versions (
            id {pk_type},
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            version VARCHAR(50) NOT NULL,
            accuracy FLOAT,
            model_path TEXT NOT NULL,
            model_type VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            training_dataset_hash TEXT
        );
    """)
    
    # Rule 8: Identity != Account. Ensure user 1 exists for initial instantiation.
    cur.execute("SELECT id FROM users WHERE id = 1")
    if not cur.fetchone():
        cur.execute("INSERT INTO users (id, username) VALUES (1, 'omni_user_1')")
    
    conn.commit()
    cur.close()
    conn.close()

if __name__ == "__main__":
    init_db()

if __name__ == "__main__":
    init_db()
