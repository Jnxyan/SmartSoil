from ultralytics import YOLO

model = YOLO("yolov8n.pt")

model.train(
    data="C:/Users/User/OneDrive/Documents/putrahack/dataset/data.yaml",
    epochs=50,
    imgsz=640
)