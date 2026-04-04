import { useState, useEffect } from "react";

const Header = () => {
  const [location, setLocation] = useState<string>("Locating...");
  const [located, setLocated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocation("George Town, Malaysia");
      setLocated(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="bg-header text-header-foreground px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🌱</span>
        <h1 className="text-xl font-bold">
          Smart <span className="font-display italic">Soil</span>
        </h1>
      </div>
      <div className="flex items-center gap-2 bg-soil-brown/50 rounded-full px-3 py-1.5 text-sm">
        <span className={`w-2 h-2 rounded-full ${located ? 'bg-soil-success' : 'bg-soil-warning'}`} />
        <span className="text-header-foreground/90">{location}</span>
      </div>
    </header>
  );
};

export default Header;
