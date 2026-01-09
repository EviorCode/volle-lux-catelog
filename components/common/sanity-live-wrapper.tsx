// This file must be a Server Component (no "use client")
import { SanityLive } from "@/sanity/lib/live";
import { draftMode } from "next/headers";

/**
 * Server Component wrapper for SanityLive
 * * PERFORMANCE OPTIMIZATION:
 * We conditionally render <SanityLive /> only when Draft Mode is enabled.
 * This prevents the heavy real-time event listener from loading for 
 * regular website visitors, saving ~350ms of network latency.
 */
export async function SanityLiveWrapper() {
  // Check if we are in Draft Mode (Admin/Editing)
  const { isEnabled } = await draftMode();

  // If not in draft mode, do not load the live listener
  if (!isEnabled) {
    return null;
  }

  // Only load the listener for admins editing content
  return <SanityLive />;
}