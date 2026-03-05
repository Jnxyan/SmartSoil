from ultralytics import YOLO

model = YOLO("yolov8n.pt")
results = model.predict(source=0, show=True, stream=True)
#source=0 = default webcam
#show=True = display the video feed with detections
#stream=True = return a generator that yields results for each frame