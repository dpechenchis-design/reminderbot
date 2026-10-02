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
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const kyivHour = getKyivHour();

  if (kyivHour !== 11) {
    return res.status(200).json({ skipped: true, kyivHour });
  }

  const message = `Ребята, всем привет! 😊
Напоминаю, пожалуйста, что в вечерних репортах сегодня нужно написать свой win за неделю 🏆
Это может быть что угодно — любой результат, достижение или момент, которым вы довольны. Выделите его в репорте и отправьте вместе с остальной информацией.
Жду ваши wins! 🔥`;

  await sendTelegramMessage(message);
  return res.status(200).json({ sent: true, kyivHour
