import { PLANTS } from "../data/plants";
import { useState, useCallback } from 'react';

async function scanLeafImage(imageFile) {
  await new Promise(r => setTimeout(r, 1800));
  return {
    disease: "Early Blight (Alternaria solani)",
    confidence: 0.87,
    severity: "Moderate",
    affected_area: "~35% leaf coverage",
  };
}

export default scanLeafImage;