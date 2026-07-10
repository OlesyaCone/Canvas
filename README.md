# Canvas — Платформа для создания и прохождения тестов

**Canvas** — полнофункциональное веб-приложение для создания образовательных тестов, их прохождения и управления группами. Поддерживает аутентификацию (включая Google), загрузку изображений, публичные/приватные тесты.

##  Основные возможности

### Для пользователей
- **Создание тестов**
  - Название, описание, обложка
  - Вопросы с несколькими вариантами ответов
  - Изображения к вопросам и тесту
  - Публичные и приватные тесты

- **Прохождение тестов** в режиме Play
- **Группы** — создание, управление участниками
- **Личный кабинет** и профиль
- **Публичная галерея** тестов

### Технические возможности
- Полная аутентификация (JWT + Refresh tokens + Google OAuth)
- Загрузка и хранение файлов
- Реал-тайм через Socket.io
- Адаптивный дизайн

##  Технологический стек

**Frontend** (`/client`)
- Vue 3 + TypeScript + Vite
- Pinia (state management)
- Vue Router
- Socket.io-client
- Axios
- SCSS

**Backend** (`/server`)
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT, Passport (Google)
- Multer (файлы)
- Socket.io
- Nodemailer

**DevOps**
- Docker + docker-compose
- Nginx (frontend)
- MongoDB

##  Быстрый старт

### Через Docker (рекомендуется)

```bash
docker-compose up --build
```

Приложение будет доступно по адресу **http://localhost**

### Локальная разработка

1. **Клонируйте репозиторий**
   ```bash
   git clone https://github.com/OlesyaCone/Canvas.git
   cd Canvas
   ```

2. **Установите зависимости**
   ```bash
   pnpm install
   ```

3. **Настройте backend**
   ```bash
   cd server
   cp .env.example .env
   # Отредактируйте .env (секреты, почта, Google OAuth)
   pnpm dev
   ```

4. **Запустите frontend** (в новом терминале)
   ```bash
   cd client
   pnpm dev
   ```

## Структура проекта

```
Canvas/
├── client/          # Vue 3 приложение
├── server/          # Express + TS сервер
├── docker-compose.yml
├── .env.example (в server)
└── README.md
```

## Основные скрипты

**Client:**
- `pnpm dev` — разработка
- `pnpm build` — сборка
- `pnpm test` — тесты

**Server:**
- `pnpm dev` — разработка (nodemon)
- `pnpm start` — запуск
- `pnpm test` — Jest тесты

## Переменные окружения (server/.env)

Ключевые:
- `MONGODB_URI`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `MAIL_*` — настройки почты
- `CLIENT_URL`


**Разработчик:** [OlesyaCone](https://github.com/OlesyaCone)
