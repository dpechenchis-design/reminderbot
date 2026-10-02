// api/friday.js — fires every Friday, checks if it's 11:00 in Kyiv before sending

function getKyivHour() {
  return parseInt(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Kyiv',
      hour: 'numeric',
      hour12: false,
    }).format(new Date())
  );
}

async function sendTelegramMessage(text) {
  const res = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML',
      }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telegram error: ${err}`);
  }
  return res.json();
}

export default async function handler(req, res) {
  // Security: Vercel sends CRON_SECRET in Authorization header
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const kyivHour = getKyivHour();

  // Only send at 11:00 Kyiv time (cron runs at 08:00 + 09:00 UTC to cover DST)
  if (kyivHour !== 11) {
    return res.status(200).json({ skipped: true, kyivHour });
  }

  const message = `🔔 <b>Friday Reminder</b>

✅ <b>Wins this week:</b>
—

👀 <b>Observations:</b>
—

📋 Log your wins + lessons before the week closes!`;

  await sendTelegramMessage(message);
  return res.status(200).json({ sent: true, kyivHour });
}
