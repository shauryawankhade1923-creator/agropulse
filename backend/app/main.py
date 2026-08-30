from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base, run_migrations
from .routes import auth, produce, ai, matching, procurement, queue, payments, analytics, logistics, notifications, reviews

# Create tables on startup & ensure schema migrations
Base.metadata.create_all(bind=engine)
run_migrations()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AgroPulse - AI Powered Agricultural Supply Chain, Dynamic Procurement Queue, Smart Freight Pooling & WhatsApp/SMS Automation Platform for SIH",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for React/Flutter and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(produce.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(matching.router, prefix=settings.API_V1_STR)
app.include_router(procurement.router, prefix=settings.API_V1_STR)
app.include_router(queue.router, prefix=settings.API_V1_STR)
app.include_router(payments.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(logistics.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(reviews.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "status": "online",
        "system": "AgroPulse AI Agricultural Procurement Engine",
        "version": settings.VERSION,
        "docs": "/docs",
        "modules": [
            "AI Price Recommendation",
            "Multi-Criteria Buyer Matching",
            "Procurement Slot Booking",
            "Digital Token & QR Verification",
            "Live Queue AI Wait Estimation",
            "Quality Grading & Procurement Settlement",
            "Direct Payment Tracking",
            "Live Analytics Dashboard",
            "Smart Freight & Kisan Logistics Pooling",
            "WhatsApp & SMS Automation Engine"
        ]
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "agropulse-api"}
