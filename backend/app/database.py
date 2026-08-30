from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# Configure engine with SQLite connect_args for multithreading
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL, 
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def run_migrations():
    """Ensure newly added columns exist in sqlite tables."""
    try:
        with engine.connect() as conn:
            # Check produce table columns
            result = conn.exec_driver_sql("PRAGMA table_info(produces)")
            existing_cols = {row[1] for row in result.fetchall()}
            
            new_cols = [
                ("ai_vision_verified", "BOOLEAN DEFAULT 0"),
                ("ai_quality_score", "REAL"),
                ("ai_ripeness_stage", "VARCHAR(100)"),
                ("ai_inspection_notes", "TEXT"),
                ("expected_price_per_kg", "REAL DEFAULT 20.0"),
                ("lat", "REAL DEFAULT 19.9975"),
                ("lon", "REAL DEFAULT 73.7898"),
            ]
            for col_name, col_type in new_cols:
                if col_name not in existing_cols:
                    try:
                        conn.exec_driver_sql(f"ALTER TABLE produces ADD COLUMN {col_name} {col_type}")
                        conn.commit()
                    except Exception:
                        pass

            # Check notification_logs table columns
            result_notif = conn.exec_driver_sql("PRAGMA table_info(notification_logs)")
            existing_notif_cols = {row[1] for row in result_notif.fetchall()}
            if "is_read" not in existing_notif_cols:
                try:
                    conn.exec_driver_sql("ALTER TABLE notification_logs ADD COLUMN is_read BOOLEAN DEFAULT 0")
                    conn.commit()
                except Exception:
                    pass
    except Exception:
        pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
