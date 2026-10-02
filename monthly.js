// api/monthly.js — fires on the 28th of every month at 11:00 Kyiv time

function getKyivTime() {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Kyiv',
    hour: 'numeric',
    day: 'numeric',
    hour12: false,
  });
  const parts = formatter.formatToParts(new Date());
  return {
    hour: parseInt(parts.find(p => p.type === 'hour').value),
    day: parseInt(parts.find(p => p.type === 'day').value),
  };
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
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { hour, day } = getKyivTime();

  // Guard: only send on day 28 at 11:00 Kyiv time
  if (day !== 28 || hour !== 11) {
    return res.status(200).json({ skipped: true, day, hour });
  }

  const now = new Date();
  const monthName = now.toLocaleString('uk-UA', { month: 'long', timeZone: 'Europe/Kyiv' });

  const message = `📊 <b>Monthly Report Reminder</b>

Час підготувати місячний репорт для клієнта за <b>${monthName}</b>!

📋 Що включити:
— Ключові wins за місяць
— Metrics / результати
— Що тестували + що працює
— Plan на наступний місяць

⏰ Дедлайн: до кінця дня!`;

  await sendTelegramMessage(message);
  return res.status(200).json({ sent: true, day, hour });
}
