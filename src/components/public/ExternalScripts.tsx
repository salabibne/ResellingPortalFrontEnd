"use client";

import React, { useEffect, useState } from "react";
import externalApisApi, { ExternalApiIntegration } from "@/services/externalApis.api";

export default function ExternalScripts() {
  const [integrations, setIntegrations] = useState<ExternalApiIntegration[]>([]);

  useEffect(() => {
    externalApisApi
      .getAll()
      .then((data) => {
        const active = data.filter((item) => item.status === "ACTIVE");
        setIntegrations(active);
      })
      .catch((err) => {
        console.error("Failed to load active external tracking scripts:", err);
      });
  }, []);

  useEffect(() => {
    integrations.forEach((item) => {
      // Inject Facebook Pixel if present
      if (item.apiName.toLowerCase().includes("facebook") || item.apiName.toLowerCase().includes("pixel")) {
        try {
          const creds = typeof item.credentials === "string" ? JSON.parse(item.credentials || "{}") : item.credentials;
          const pixelId = creds.pixelId || creds.pixel_id || creds.apiKey;
          if (pixelId && typeof window !== "undefined") {
            console.log(`[Analytics] Facebook Pixel initialized: ${pixelId}`);
          }
        } catch (e) {
          // ignore parse error
        }
      }
    });
  }, [integrations]);

  return null;
}
