import { useState, useRef } from "react";

interface LeafScanProps {
  leafImage: string | null;
  onImageUpload: (image: string) => void;
}

const LeafScan = ({ leafImage, onImageUpload }: LeafScanProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        onImageUpload(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
    }, 2000);
  };

  return (
    <div className="mx-4 mt-4 bg-card rounded-xl p-4">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">📷</span>
        <div>
          <h3 className="font-bold text-base">② Leaf Scan (Optional)</h3>
          <p className="text-sm text-muted-foreground">AI-powered disease detection</p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {!leafImage ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-primary/40 rounded-xl p-8 flex flex-col items-center gap-2 hover:bg-soil-green-light transition-colors"
        >
          <p className="font-semibold text-primary">Drop leaf image or click to browse</p>
          <p className="text-xs text-muted-foreground">JPG, PNG, HEIC, WebP · or skip to analyse soil only</p>
        </button>
      ) : (
        <div className="space-y-3">
          <img
            src={leafImage}
            alt="Uploaded leaf"
            className="w-full h-48 object-cover rounded-xl"
          />
          <div className="bg-soil-cream border border-soil-olive rounded-lg p-3 text-sm">
            <p>📸 Image ready — click below to run AI scan</p>
          </div>
          <button
            onClick={handleScan}
            disabled={scanning || scanned}
            className="w-full border-2 border-primary text-primary rounded-xl py-3 font-semibold hover:bg-soil-green-light transition-colors disabled:opacity-50"
          >
            {scanning ? "🔍 Scanning..." : scanned ? "✅ Scan Complete" : "🔍 Run Leaf Scan"}
          </button>
        </div>
      )}
    </div>
  );
};

export default LeafScan;
