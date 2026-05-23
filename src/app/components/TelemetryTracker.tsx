"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { telemetry } from "../../lib/telemetry";

export default function TelemetryTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      telemetry.track('page_view');
    } catch (e) {}
  }, [pathname, searchParams]);

  return null;
}
