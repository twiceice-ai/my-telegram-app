"use client"

import type React from "react"
import { useEffect, useState } from "react"
import "./globals.css"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [deviceType, setDeviceType] = useState<"android" | "iphone" | "unknown">("unknown")

  useEffect(() => {
    // Определяем тип устройства
    const width = window.innerWidth
    const height = window.innerHeight

    if (width <= 360 && height <= 640) {
      setDeviceType("android")
    } else if (width <= 375 && height >= 812) {
      setDeviceType("iphone")
    }
  }, [])

  return (
    <html lang="ru">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
        <style jsx global>{`
          @font-face {
            font-family: 'Avenir';
            src: url('/fonts/avenir-light.woff2') format('woff2');
            font-weight: 300;
            font-style: normal;
            font-display: swap;
          }
          
          @font-face {
            font-family: 'Avenir';
            src: url('/fonts/avenir-regular.woff2') format('woff2');
            font-weight: 400;
            font-style: normal;
            font-display: swap;
          }
          
          @font-face {
            font-family: 'Avenir';
            src: url('/fonts/avenir-bold.woff2') format('woff2');
            font-weight: 700;
            font-style: normal;
            font-display: swap;
          }
          
          .font-avenir {
            font-family: 'Avenir', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }

          * {
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
          }

          input, textarea {
            -webkit-user-select: text;
            user-select: text;
          }
        `}</style>
      </head>
      <body
        className={`font-avenir mobile-container ${deviceType === "android" ? "mobile-android" : deviceType === "iphone" ? "mobile-iphone" : ""}`}
      >
        {children}
      </body>
    </html>
  )
}
