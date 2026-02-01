"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";
import * as pixel from "@/lib/meta/fpixel";

const FacebookPixel = () => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Don't render pixel in development
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  // Skip if no pixel ID configured
  if (!pixel.FB_PIXEL_ID) {
    return null;
  }

  // PERFORMANCE: Delay Facebook Pixel loading to improve LCP
  useEffect(() => {
    // Load after 3 seconds OR on first user interaction
    const timer = setTimeout(() => setShouldLoad(true), 3000);

    const handleInteraction = () => {
      setShouldLoad(true);
      clearTimeout(timer);
    };

    // Load on first scroll, click, or touch
    window.addEventListener("scroll", handleInteraction, { once: true });
    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("touchstart", handleInteraction, { once: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleInteraction);
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  // Track pageviews on route change
  useEffect(() => {
    if (!loaded) return;
    pixel.pageview();
  }, [pathname, searchParams, loaded]);

  // Don't render until we should load
  if (!shouldLoad) return null;

  return (
    <>
      <Script
        id="fb-pixel"
        strategy="lazyOnload" // Changed from afterInteractive
        onLoad={() => setLoaded(true)}
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixel.FB_PIXEL_ID}');
          `,
        }}
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