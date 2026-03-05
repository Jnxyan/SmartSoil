from fastapi import FastAPI, Request
import uvicorn
import cv2
import numpy as np
from roboflow import Roboflow

app = FastAPI()

# Connect to Roboflow
rf = Roboflow(api_key="dRXRP1wrcdRakhwlVXM0")
project = rf.workspace("xinhuis-workspace").project("chili-plant-zr1ck")
model = project.version(7).model

@app.post("/predict")
async def predict(request: Request):
    try:
        contents = await request.body()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return {"error": "Failed to decode image"}

        # Run Roboflow
        prediction_response = model.predict(img, confidence=40).json()
        
        clean_predictions = []
        for p in prediction_response.get("predictions", []):
            clean_predictions.append({
                "class": p["class"],
                "confidence": p["confidence"],
                "x": p["x"],
                "y": p["y"],
                "width": p["width"],  # Added for box size
                "height": p["height"] # Added for box size
            })
            
        return {"predictions": clean_predictions}

    except Exception as e:
        print(f"Error detail: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)