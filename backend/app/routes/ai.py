from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import List, Optional
from ..schemas import (
    PriceRecommendationRequest,
    PriceRecommendationResponse,
    QueueWaitPredictionRequest,
    QueueWaitPredictionResponse,
    VisionQualityAnalysisRequest,
    VisionQualityAnalysisResponse,
    SampleSpecimenOut,
    QueueVisionAnalysisRequest,
    QueueVisionAnalysisResponse,
    CCTVQueueSpecimenOut
)
from ..ml.pricing_engine import price_recommender
from ..ml.queue_engine import queue_predictor
from ..ml.vision_quality_engine import vision_engine
from ..ml.queue_vision_engine import queue_vision_engine

router = APIRouter(prefix="/ai", tags=["AI & Machine Learning"])

@router.post("/price-recommendation", response_model=PriceRecommendationResponse)
def get_price_recommendation(req: PriceRecommendationRequest):
    return price_recommender.predict_price_range(
        crop_name=req.crop_name,
        variety=req.variety or "Standard",
        quantity_kg=req.quantity_kg,
        quality_grade=req.quality_grade,
        location=req.location,
        season=req.season or "Kharif",
        moisture_content=req.moisture_content or 12.0
    )

@router.post("/queue-wait-time", response_model=QueueWaitPredictionResponse)
def predict_queue_wait_time(req: QueueWaitPredictionRequest):
    return queue_predictor.predict_wait_time(
        farmers_ahead=req.farmers_ahead,
        quantity_kg=req.quantity_kg,
        active_counters=req.active_counters,
        crop_name=req.crop_name or "Onion"
    )

# --- AI Computer Vision Quality Grading & Fruit Detection Endpoints ---
@router.post("/grade-image", response_model=VisionQualityAnalysisResponse)
def grade_image_json(req: VisionQualityAnalysisRequest):
    """
    Analyzes fruit or crop image from base64 string or sample preset key using Computer Vision.
    Automatically identifies fruit/produce type, variety, ripeness stage, and AGMARK quality grade.
    """
    try:
        return vision_engine.analyze_image(
            image_base64=req.image_base64,
            sample_key=req.sample_key,
            crop_name=req.crop_name,
            auto_detect_produce=req.auto_detect_produce
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image fruit detection and quality assay failed: {str(e)}")

@router.post("/upload-and-grade", response_model=VisionQualityAnalysisResponse)
async def upload_and_grade_image(
    file: UploadFile = File(...),
    crop_name: str = Form("Auto-Detect"),
    auto_detect: bool = Form(True)
):
    """
    Accepts direct image file upload (JPEG, PNG, WebP) and performs Computer Vision fruit detection and quality grading.
    """
    try:
        contents = await file.read()
        return vision_engine.analyze_image(
            image_bytes=contents,
            crop_name=crop_name,
            auto_detect_produce=auto_detect
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process uploaded produce photo: {str(e)}")

@router.get("/sample-specimens", response_model=List[SampleSpecimenOut])
def get_sample_specimens():
    """
    Returns pre-loaded verified fruit and produce specimens with ground truth visual characteristics.
    """
    return vision_engine.get_all_samples()

# --- AI Real-Time Queue Detection & CCTV Vision Endpoints ---
@router.post("/detect-queue-vision", response_model=QueueVisionAnalysisResponse)
def detect_queue_vision_json(req: QueueVisionAnalysisRequest):
    """
    Processes real-time APMC Mandi CCTV camera frames / photos:
    1. Detects vehicle counts (tractors, heavy trucks, tempos) and waiting farmers.
    2. Measures queue congestion level & queue length.
    3. Provides dynamic wait time estimation and intelligent weighbridge counter load balancing.
    """
    try:
        return queue_vision_engine.analyze_queue_feed(
            image_base64=req.image_base64,
            sample_key=req.sample_key,
            center_id=req.center_id or 1,
            active_counters=req.active_counters or 4
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Queue vision detection failed: {str(e)}")

@router.get("/cctv-queue-samples", response_model=List[CCTVQueueSpecimenOut])
def get_cctv_queue_samples():
    """
    Returns verified APMC Mandi live CCTV sample presets (Morning Rush, Moderate Ingress, Critical Bottleneck).
    """
    return queue_vision_engine.get_all_cctv_samples()



