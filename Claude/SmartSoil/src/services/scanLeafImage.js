async function scanLeafImage(imageFile) {
  try {
    // Convert the image file to raw bytes
    const arrayBuffer = await imageFile.arrayBuffer();

    const response = await fetch('http://localhost:8001/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: arrayBuffer, 
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const data = await response.json();
    
    if (data.predictions && data.predictions.length > 0) {
      // Map the YOLO "class" key to "disease" or "label" to match your UI
      return {
        disease: data.predictions[0].class, // e.g., "Chili Leaf Curl"
        confidence: data.predictions[0].confidence,
        severity: "Calculated by AI", // You can add logic for this later
        affected_area: "N/A"
      };
    }
    
    return { disease: "Healthy/Unknown", confidence: 0 };
  } catch (error) {
    console.error("Scan Error:", error);
    // Return a fallback object so the app doesn't crash
    return { disease: "Error connecting to AI server", confidence: 0 };
  }
}

export default scanLeafImage;