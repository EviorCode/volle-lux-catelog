"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";
import * as pixel from "@/lib/meta/fpixel";

const FacebookPixel = () => {
  const [loaded, setLoaded] = useState(false);
  const pathname = usePathname();

  // Don't render pixel in development
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  // Skip if no pixel ID configured
  if (!pixel.FB_PIXEL_ID) {
    return null;
  }

  useEffect(() => {
    if (!loaded) return;
    pixel.pageview();
  }, [pathname, loaded]);

  return (
    <>
      <Script
        id="fb-pixel"
        src="/scripts/pixel.js"
        strategy="afterInteractive"
        onLoad={() => setLoaded(true)}
        data-pixel-id={pixel.FB_PIXEL_ID}
      />
      {/* noscript fallback for users with JavaScript disabled */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixel.FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
};

export default FacebookPixel;