"use client";

import { useEffect } from "react";
import { useCMSStore } from "@/store/useCMSStore";

export default function CMSInitializer() {
  const fetchPublicCMS = useCMSStore((state) => state.fetchPublicCMS);

  useEffect(() => {
    // Launch all 8 CMS GET requests concurrently when user opens/launches the website
    fetchPublicCMS();
  }, [fetchPublicCMS]);

  return null;
}
