"use client"

import { useEffect } from "react"

export function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register service worker after window load for optimal page load speed
      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            // Check for updates periodically
            registration.onupdatefound = () => {
              const installingWorker = registration.installing
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === "installed") {
                    if (navigator.serviceWorker.controller) {
                      console.log("New content is available; please refresh.")
                    } else {
                      console.log("Content is cached for offline use.")
                    }
                  }
                }
              }
            }
          })
          .catch((error) => {
            console.warn("ServiceWorker registration failed:", error)
          })
      }

      if (document.readyState === "complete") {
        registerSW()
      } else {
        window.addEventListener("load", registerSW)
        return () => window.removeEventListener("load", registerSW)
      }
    }
  }, [])

  return <>{children}</>
}
