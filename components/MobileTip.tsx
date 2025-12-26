"use client";

import { useState, useEffect } from "react";

export default function MobileTip() {
  const [isMobile, setIsMobile] = useState(false);
  const [shouldShow, setShouldShow] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check all conditions at once to avoid multiple state updates
    const userAgent = navigator.userAgent.toLowerCase();
    const isFirefoxBrowser = userAgent.includes("firefox");
    const hidden = localStorage.getItem("mobile-tip-hidden") === "true";
    
    // Set all state in a single update
    setShouldShow(!isFirefoxBrowser && !hidden);
    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleHidePermanently = () => {
    localStorage.setItem("mobile-tip-hidden", "true");
    setShouldShow(false);
  };

  // Don't show if not mobile or should be hidden
  if (!isMobile || !shouldShow) {
    return null;
  }

  return (
    <div className="mb-6 rounded-lg border border-blue-500/50 bg-blue-900/20 p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-blue-400"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-300">
            <span className="font-semibold text-blue-400">Tip:</span> For the best experience, use{" "}
            Firefox on mobile and install the Ublock Origin Firefox addon.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-2xl flex items-center p-4 border-2 border-gray-600 space-x-3">
              <img src="/firefoxlogo.png" width={24} alt="Firefox" />
              <div>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.firefox.com/en-US/browsers/mobile/android/"
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Download Firefox
                </a>
              </div>
            </div>
            <div className="rounded-2xl flex items-center p-4 border-2 border-gray-600 space-x-3">
              <img src="/ublock.svg" width={24} alt="uBlock Origin" />
              <div>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://addons.mozilla.org/en-US/android/addon/ublock-origin/"
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Download Ublock
                </a>
              </div>
            </div>
          </div>
          <button
            onClick={handleHidePermanently}
            className="mt-3 text-xs text-gray-400 hover:text-gray-300 underline"
          >
            Hide this permanently
          </button>
        </div>
      </div>
    </div>
  );
}

