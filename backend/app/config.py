import os
from dotenv import load_dotenv
from pydantic import BaseModel

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))
DB_PATH = os.path.join(BASE_DIR, "agropulse.db").replace("\\", "/")

class Settings(BaseModel):
    PROJECT_NAME: str = "AgroPulse API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "agropulse-super-secret-key-sih-2026-secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # SQLite default with robust absolute path
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")
    
    # Twilio WhatsApp Configuration
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_WHATSAPP_NUMBER: str = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")
    TWILIO_PHONE_NUMBER: str = os.getenv("TWILIO_PHONE_NUMBER", "")
    
    # Fast2SMS Indian SMS Gateway (Direct Real Phone Dispatch)
    FAST2SMS_API_KEY: str = os.getenv("FAST2SMS_API_KEY", "")
    
    # Coordinates for Mandis and Centers (Nashik, Khanna, Guntur, Rajkot, etc.)
    DEFAULT_MANDI_LOCATIONS: dict = {
        "Nashik APMC, Maharashtra": {"lat": 19.9975, "lon": 73.7898},
        "Lasalgaon APMC, Maharashtra": {"lat": 20.1472, "lon": 74.2257},
        "Khanna Grain Market, Punjab": {"lat": 30.7073, "lon": 76.2163},
        "Guntur Chilli Yard, Andhra Pradesh": {"lat": 16.3067, "lon": 80.4365},
        "Rajkot Market Yard, Gujarat": {"lat": 22.3039, "lon": 70.8022},
        "Indore Krishi Upaj Mandi, Madhya Pradesh": {"lat": 22.7196, "lon": 75.8577},
        "Azadpur Mandi, Delhi": {"lat": 28.7107, "lon": 77.1764},
    }

settings = Settings()
