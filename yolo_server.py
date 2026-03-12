from fastapi import FastAPI, Request
import uvicorn
import cv2
import numpy as np
from roboflow import Roboflow
from ultralytics import YOLO

app = FastAPI()

# Connect to Roboflow
#rf = Roboflow(api_key="dRXRP1wrcdRakhwlVXM0")
#project = rf.workspace("xinhuis-workspace").project("chili-plant-zr1ck")
#model = project.version(7).model

# Load trained model
model = YOLO("runs/detect/train/weights/best.pt")

@app.post("/predict")
async def predict(request: Request):
    try:
        contents = await request.body()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return {"error": "Failed to decode image"}

        # Run local inference
        results = model(img, conf=0.6) # 0.6 is confidence threshold
        
        clean_predictions = []
        for r in results:
            for box in r.boxes:
                # Get coordinates (x, y, w, h)
                # .xywh[0] gives [center_x, center_y, width, height]
                coords = box.xywh[0].tolist() 
                
                clean_predictions.append({
                    "class": model.names[int(box.cls[0])],
                    "confidence": float(box.conf[0]),
                    "x": coords[0],
                    "y": coords[1],
                    "width": coords[2],
                    "height": coords[3]
                })
            
        return {"predictions": clean_predictions}

    except Exception as e:
        print(f"Server Error: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)