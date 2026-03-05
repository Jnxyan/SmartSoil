from roboflow import Roboflow
import cv2

# Connect to your Roboflow project
rf = Roboflow(api_key="dRXRP1wrcdRakhwlVXM0")
project = rf.workspace("xinhuis-workspace").project("chili-plant-zr1ck")
version = project.version(7)
dataset = version.download("yolov8")
                

# Load your image
img = cv2.imread("test_image.jpg")  # Make sure this image is inside your project folder

# Predict
predictions = model.predict(img, confidence=40, overlap=30).json()

# Print results
print(predictions)