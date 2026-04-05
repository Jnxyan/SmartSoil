async function scanLeafImage(imageFile) {
  try {
    const arrayBuffer = await imageFile.arrayBuffer();
    const response = await fetch('http://localhost:8001/predict', {
      method: 'POST',
      body: arrayBuffer, 
    });

    const data = await response.json();
    
    // Check if we got ANY prediction
    if (data.predictions && data.predictions.length > 0) {
      const topResult = data.predictions[0];

      // HACK: If the AI says 'healthy' but with low confidence, 
      // and 'yellow leaves' is the second choice, you could flip it.
      // For now, let's just display what it found.
      return {
        disease: topResult.class.replace("_", " "), // Clean up "yellow_leaves" to "yellow leaves"
        confidence: (topResult.confidence * 100).toFixed(1) + "%",
        severity: topResult.confidence > 0.8 ? "High" : "Monitoring Required",
        affected_area: "Visible on leaf surface"
      };
    }
    
    // If the array is empty, the AI is totally blind to the leaf.
    return { 
      disease: "Scanning issue: Try moving closer", 
      confidence: 0,
      severity: "N/A"
    };

  } catch (error) {
    return { disease: "Server Offline", confidence: 0 };
  }
}

export default scanLeafImage;

