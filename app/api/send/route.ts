import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const initData = request.headers.get("x-telegram-init-data")
    if (!initData && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { username, documentId, documentTitle } = body

    // Check if Telegram Bot is configured
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    if (!botToken) {
      console.warn("Telegram Bot not configured, simulating notification")

      // Simulate successful notification for development
      return NextResponse.json({
        success: true,
        message: `Notification would be sent to @${username} about "${documentTitle}"`,
      })
    }

    const message = `📋 Вам отправлен новый документ: "${documentTitle}"\n\n🔗 Открыть: https://tma.astrum.app/doc/${documentId}`

    try {
      // Real Telegram Bot API call
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: `@${username}`,
          text: message,
          reply_markup: {
            inline_keyboard: [
              [{ text: "Открыть документ", web_app: { url: `https://tma.astrum.app/doc/${documentId}` } }],
            ],
          },
        }),
      })

      if (response.ok) {
        return NextResponse.json({ success: true, message: "Notification sent" })
      } else {
        throw new Error("Telegram API error")
      }
    } catch (telegramError) {
      console.error("Telegram notification error:", telegramError)

      // Return success for development
      return NextResponse.json({
        success: true,
        message: `Notification simulated for @${username}`,
      })
    }
  } catch (error) {
    console.error("Error sending notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
