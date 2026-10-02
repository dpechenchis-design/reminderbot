# Telegram Reminders Bot

Автоматичні Telegram-нагадування через Vercel Cron Jobs.

## Нагадування

| Тип | Час | Розклад |
|-----|-----|---------|
| 🔔 Friday Reminder (wins + observations) | Кожну п'ятницю 11:00 Київ | `0 8,9 * * 5` UTC |
| 📊 Monthly Report | 28-го числа 11:00 Київ | `0 8,9 28 * *` UTC |

> Cron запускається на 08:00 і 09:00 UTC — код всередині перевіряє чи зараз 11:00 по Києву (враховує зимовий/літній час).

## Структура

```
api/
  friday.js    — Friday reminder handler
  monthly.js   — Monthly report handler
vercel.json    — Cron schedule
package.json
.env.example
```

## Деплой

### 1. Клонувати репо і залогінитись у Vercel

```bash
npm i -g vercel
vercel login
```

### 2. Env змінні у Vercel Dashboard

```
TELEGRAM_BOT_TOKEN=  ← від BotFather
TELEGRAM_CHAT_ID=    ← твій chat ID
CRON_SECRET=         ← будь-який рандомний рядок
```

### 3. Деплой

```bash
vercel --prod
```

## Локальне тестування

```bash
# Тест Friday endpoint
curl -H "Authorization: Bearer your-secret" \
  http://localhost:3000/api/friday

# Тест Monthly endpoint  
curl -H "Authorization: Bearer your-secret" \
  http://localhost:3000/api/monthly
```
