from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware 
import uvicorn
import cv2
import numpy as np
from ultralytics import YOLO

app = FastAPI()

# IMPORTANT: This allows your frontend (React/Vue/Plain JS) to talk to this Python server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model globally so it's fast
try:
    model = YOLO("muhveran_chili_best.pt")
    print("✅ Model Loaded Successfully!")
    print(f"Classes found: {model.names}")
except Exception as e:
    print(f"❌ ERROR LOADING MODEL: {e}")

@app.post("/predict")
async def predict(request: Request):
    try:
        # 1. Read the image bytes from the request
        contents = await request.body()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return {"predictions": [], "error": "Invalid image format"}

        # 2. Run Inference
        # conf=0.1 is very low - perfect for a hackathon demo to ensure SOMETHING shows up
        results = model(img, conf=0.1) 
        
        clean_predictions = []
        
        for r in results:
            # Sort by confidence so the most likely disease is at the top
            boxes = sorted(r.boxes, key=lambda x: x.conf[0], reverse=True)
            
            for box in boxes:
                coords = box.xywh[0].tolist() # [center_x, center_y, width, height]
                
                clean_predictions.append({
                    "class": model.names[int(box.cls[0])],
                    "confidence": float(box.conf[0]),
                    "x": coords[0],
                    "y": coords[1],
                    "width": coords[2],
                    "height": coords[3]
                })
        
        # 3. Return the list of found diseases
        return {"predictions": clean_predictions}

    except Exception as e:
        print(f"🔥 SERVER ERROR: {e}")
        return {"predictions": [], "error": str(e)}

if __name__ == "__main__":
    # Use port 8001 as per your frontend fetch request
    print("🚀 Starting Chili Disease AI Server on http://localhost:8001")
    uvicorn.run(app, host="0.0.0.0", port=8001)