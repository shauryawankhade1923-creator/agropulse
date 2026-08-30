import math
from datetime import datetime, timedelta
from typing import Dict, Any
from ..schemas import QueueWaitPredictionResponse

class AIQueuePredictor:
    def __init__(self):
        # Average baseline throughput: minutes per metric ton (1000 kg)
        self.crop_rate_mins_per_ton = {
            "Onion": 7.5,
            "Wheat": 5.0,
            "Rice (Paddy)": 6.0,
            "Soybean": 5.5,
            "Cotton": 9.0,
            "Tomato": 8.0,
            "Potato": 6.5,
            "Mustard": 5.0,
            "Default": 6.0
        }
        self.overhead_per_farmer_mins = 4.0  # Verification, gate pass, moisture probe

    def predict_wait_time(
        self,
        farmers_ahead: int,
        quantity_kg: float,
        active_counters: int = 3,
        crop_name: str = "Onion"
    ) -> QueueWaitPredictionResponse:
        active_counters = max(1, active_counters)
        crop_rate = self.crop_rate_mins_per_ton.get(crop_name, self.crop_rate_mins_per_ton["Default"])

        # Base time for farmers ahead in queue
        # Average weight ahead assumed ~1,500 kg per farmer
        avg_weight_ahead_ton = 1.5
        time_per_farmer_ahead = self.overhead_per_farmer_mins + (crop_rate * avg_weight_ahead_ton)
        
        # Parallelized across active counters
        total_time_ahead = (farmers_ahead * time_per_farmer_ahead) / active_counters

        # Plus immediate inspection time for current lot
        current_lot_ton = quantity_kg / 1000.0
        own_processing_time = self.overhead_per_farmer_mins + (crop_rate * current_lot_ton)

        estimated_total_mins = int(round(total_time_ahead + (own_processing_time * 0.5)))
        estimated_total_mins = max(3, estimated_total_mins)

        # Confidence interval
        min_est = max(2, int(estimated_total_mins * 0.85))
        max_est = int(estimated_total_mins * 1.18) + 2
        conf_str = f"{min_est} - {max_est} mins"

        # Calculate processing speed (kg/hr)
        speed_kg_hr = round((1000.0 / (time_per_farmer_ahead / active_counters)) * 60.0 * 1.5, 0)

        # Workload status
        if farmers_ahead > 15:
            workload = "Peak Rush Hour"
        elif farmers_ahead > 6:
            workload = "Moderate Queue Load"
        else:
            workload = "Fast Track (Low Wait)"

        # Recommended arrival time
        target_arrival = datetime.now() + timedelta(minutes=estimated_total_mins)
        arrival_str = target_arrival.strftime("%I:%M %p")

        return QueueWaitPredictionResponse(
            estimated_wait_minutes=estimated_total_mins,
            confidence_interval=conf_str,
            processing_speed_kg_per_hr=speed_kg_hr,
            current_counter_workload=workload,
            recommended_arrival_time=arrival_str
        )

queue_predictor = AIQueuePredictor()
