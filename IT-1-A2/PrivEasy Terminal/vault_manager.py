import sqlite3
import os
import shutil
import uuid
from datetime import datetime

APP_DIR = os.path.expanduser("~/.priveasy")
VAULT_DIR = os.path.join(APP_DIR, "vault")
DB_PATH = os.path.join(APP_DIR, "vault_metadata.db")

class VaultManager:
    def __init__(self):
        if not os.path.exists(APP_DIR):
            os.makedirs(APP_DIR)
        if not os.path.exists(VAULT_DIR):
            os.makedirs(VAULT_DIR)
        
        self.conn = sqlite3.connect(DB_PATH)
        self.cursor = self.conn.cursor()
        self.setup_db()
        self.DB_PATH = DB_PATH

    def setup_db(self):
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS files (
                id TEXT PRIMARY KEY,
                original_filename TEXT NOT NULL,
                encrypted_path TEXT NOT NULL,
                size_bytes INTEGER,
                date_encrypted TEXT,
                file_hash TEXT
            )
        """)
        self.conn.commit()

    def add_file(self, original_path: str, encrypted_path: str, file_size: int, file_hash: str):
        file_id = str(uuid.uuid4())
        original_filename = os.path.basename(original_path)
        date_encrypted = datetime.now().isoformat()
        
        self.cursor.execute("""
            INSERT INTO files VALUES (?, ?, ?, ?, ?, ?)
        """, (file_id, original_filename, encrypted_path, file_size, date_encrypted, file_hash))
        self.conn.commit()
        return file_id

    def delete_file_record(self, file_id: str):
        self.cursor.execute("DELETE FROM files WHERE id=?", (file_id,))
        self.conn.commit()

    def get_all_files(self):
        self.cursor.execute("SELECT id, original_filename, size_bytes, date_encrypted, encrypted_path, file_hash FROM files")
        return self.cursor.fetchall()

    def get_file_by_id(self, file_id: str):
        self.cursor.execute("SELECT original_filename, encrypted_path, file_hash FROM files WHERE id=?", (file_id,))
        return self.cursor.fetchone()

    def move_to_vault(self, source_path: str) -> str:
        file_extension = os.path.splitext(source_path)[1]
        unique_name = str(uuid.uuid4()) + ".enc"
        dest_path = os.path.join(VAULT_DIR, unique_name)
        
        return dest_path

    def secure_delete(self, file_path: str):
        try:
            with open(file_path, "wb") as f:
                f.write(os.urandom(os.path.getsize(file_path)))
        except Exception:
            pass
        
        if os.path.exists(file_path):
            os.remove(file_path)

    def close(self):
        self.conn.close()

MANAGER = VaultManager()

def log_activity(event: str, details: str = ""):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS logs (
            timestamp TEXT,
            event TEXT,
            details TEXT
        )
    """)
    timestamp = datetime.now().isoformat()
    cursor.execute("INSERT INTO logs VALUES (?, ?, ?)", (timestamp, event, details))
    conn.commit()
    conn.close()

def get_activity_logs():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT timestamp, event, details FROM logs ORDER BY timestamp DESC")
    logs = cursor.fetchall()
    conn.close()
    return logs