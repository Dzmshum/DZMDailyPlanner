# RuneBoard

Рунный планировщик задач (ранее DoomPlanner). Electron + React.

Локальный планировщик с дедлайнами, проектами, календарём и дейликами.  
Данные — один JSON-файл на компьютере. Интерфейс на русском.

**Стек:** React 19 + TypeScript + Vite + Zustand + **Electron**

> **История:** изначально Tauri (Rust). Сейчас — **Electron**. Папку `src-tauri/` можно игнорировать.

**Текущая версия:** v0.22.6 — см. [ROADMAP.md](./ROADMAP.md)

---

## Быстрый старт

### Уже есть собранный .exe

Двойной клик по **`DoomPlanner.cmd`** (ищет `RuneBoard.exe`) или:

```
dist-electron\RuneBoard 0.1.0.exe              ← portable
dist-electron\win-unpacked\RuneBoard.exe       ← распакованная версия
dist-electron\RuneBoard Setup 0.1.0.exe        ← установщик
```

### Разработка (окно приложения)

```powershell
cd C:\Users\User\Desktop\Projects\Ideas\DoomPlanner
pnpm install
pnpm rebuild electron          # первый раз или после обновления electron
pnpm electron:dev
```

Данные: `%APPDATA%\DoomPlanner\plan.json`

### Только браузер (быстрая проверка UI)

```powershell
pnpm dev
```

→ http://127.0.0.1:5173/  
При `pnpm dev` данные тоже в `%APPDATA%\DoomPlanner\plan.json` (через dev API).

---

## Команды

| Команда | Что делает |
|---------|------------|
| `pnpm install` | Установить зависимости |
| `pnpm rebuild electron` | Скачать бинарник Electron |
| `pnpm electron:dev` | Окно приложения + hot reload |
| `pnpm dev` | Только Vite в браузере |
| `pnpm electron:build` | Собрать .exe в `dist-electron\` |
| `pnpm build` | Фронтенд в `build\` (+ иконки, календарь РФ) |
| `pnpm icons` | Пересобрать PNG из `*-source.png` |
| `pnpm calendar` | Обновить производственный календарь РФ |
| `pnpm test` | Автотесты: календарь РФ + дейлики (41) + вложения (12) + месяц (9) + праздники (23) + проекты (5) |
| `pnpm lint` | oxlint |

**Файлы для двойного клика (Windows):**

| Файл | Назначение |
|------|------------|
| `DoomPlanner.cmd` | Запуск готового .exe |
| `Build-Electron.cmd` | Сборка .exe |

**Терминал:** PowerShell или cmd. Для `electron:build` **не Git Bash** — иначе возможны сбои.

---

## Возможности

### Вкладки (`1`–`8`)

| Клавиша | Вкладка |
|---------|---------|
| `1` | Дашборд — просроченные, сегодня, 7 дней |
| `2` | Повестка дня — задачи на дату, «Выполнено» |
| `3` | Календарь — неделя / месяц / квартал / год, DnD дедлайнов; в месяце — мини-полоски задач |
| `4` | Входящие — задачи без даты, быстрый захват |
| `5` | Дейлик — отчёт между созвонами (пн/чт), отсечка 13:00, прошлые дейлики |
| `6` | Задачи — список, фильтры |
| `7` | Проекты — цвета, названия; **Завершить** / секция «Завершённые» |
| `8` | История — выполненные, группировка по дате |

### Прочее

- **Быстрый захват** — `Q` / `Й`, задача без даты во входящие (можно только фото)
- **Фото к задачам** — вложения в форме и быстром захвате: `Ctrl+V`, drag-and-drop, файл; лайтбокс из списка
- **Минимальное окно** — компактный режим Electron (⚙ → Режим окна)
- **Jira** — экспорт задачи в Jira Cloud (только Electron)
- **Текст TG** — выгрузка плана для Telegram (`Ctrl+Shift+C`)
- **Голосовой ввод** — микрофон в полях текста (`Ctrl+Shift+V`, ⚙ → включить)
- **Темы** — светлая / тёмная / системная
- **Палитры WoW** — Нордскол, Запределье, Пандария (⚙ → Оформление)
- **Праздники РФ** — производственный календарь **2025–2027** (переносы ПП); **2028+** — приблизительно по ст. 112 ТК РФ (без переносов, пока нет официального ПП)
- **Завершённые проекты** — кнопка «Завершить» на вкладке «Проекты»; в форме задачи активные по умолчанию, поиск находит архивные
- **Импорт / экспорт JSON**, резервная копия `.bak`
- **Счётчики** в меню — актуальные задачи на вкладке

### Горячие клавиши

| Клавиша | Действие |
|---------|----------|
| `N` | Новая задача |
| `1`–`8` | Вкладки |
| `Q` / `Й` | Быстрый захват |
| `Ctrl+S` | Сохранить |
| `Ctrl+E` | Экспорт JSON |
| `Ctrl+F` | Поиск |
| `Ctrl+Shift+C` | Текст для Telegram |
| `Ctrl+V` | Вставить фото в форму задачи / быстрый захват (если в буфере изображение) |
| `Ctrl+Shift+V` | Голосовой ввод (если включён) |
| `Пробел` | Отметить выбранную задачу |
| `Esc` | Закрыть форму / быстрый захват |

---

## Сборка .exe

```powershell
pnpm electron:build
```

Перед упаковкой автоматически:
1. `pnpm build` — фронтенд, иконки, календарь РФ
2. `strip-icon-sources` — исходники `*-source.png` (~80 МБ) не попадают в `build/`
3. `verify-icons` — проверка 50 PNG + `resources/icon.png`
4. `electron-builder` — во временную папку (обход EPERM), копия в `dist-electron\`

**Если `EPERM: operation not permitted`:**
1. Закройте RuneBoard, если запущен
2. Удалите `dist-electron`
3. Запустите из **PowerShell**
4. При необходимости — исключите папку проекта из антивируса

**Visual Studio / Rust не нужны.**

### Иконки

| Путь | Назначение |
|------|------------|
| `public/icons/*-source.png` | Исходники AI (не в .exe) |
| `public/icons/views/{palette}/` | Иконки вкладок (96px) |
| `public/icons/ui/{palette}/` | UI: окно, закрыть, шевроны (64px) |
| `resources/icon.png` | Иконка приложения для Electron (512px) |

Заменить иконку: положить PNG в `*-source.png` → `pnpm icons` → `pnpm electron:build`.

---

## Данные

| Режим | Путь |
|-------|------|
| Electron | `%APPDATA%\DoomPlanner\plan.json` |
| `pnpm dev` (с API) | тот же файл |
| Статический preview | `localStorage` → `doomplanner-plan` |

**Вложения (фото):** `%APPDATA%\DoomPlanner\attachments\{taskId}\` — файлы JPEG на диске; метаданные в `plan.json`. При импорте JSON только метаданные (файлы нужно копировать вручную или оставить на том же ПК).

Резервная копия: `%APPDATA%\DoomPlanner\plan.json.bak`

Данные **не стираются** при пересборке .exe — они вне папки программы.

### Формат `plan.json` (сокращённо)

```json
{
  "version": 1,
  "settings": {
    "theme": "system",
    "colorPalette": "northrend",
    "defaultView": "dashboard",
    "windowMode": "standard",
    "voiceInputEnabled": false,
    "calendar": { "showHolidays": true, "calendarView": "week" },
    "daily": { "enabled": true, "days": [1, 4] },
    "jira": { "enabled": false, "baseUrl": "", "email": "", "apiToken": "", "projectKey": "", "issueType": "Task" }
  },
  "projects": [{ "id": "uuid", "name": "Работа", "color": "#4fc3f7", "completed": false, "completedAt": null }],
  "tasks": [{
    "id": "uuid",
    "title": "Задача",
    "deadline": "2026-07-05",
    "projectId": null,
    "priority": "medium",
    "status": "todo",
    "notes": "",
    "attachments": [{ "id": "uuid", "name": "screenshot.png", "mimeType": "image/jpeg", "fileName": "uuid.jpg" }],
    "jiraKey": null,
    "createdAt": "...",
    "completedAt": null
  }]
}
```

---

## Jira (опционально)

1. ⚙ **Настройки** → Интеграции → Jira
2. URL, email, [API Token](https://id.atlassian.com/manage-profile/security/api-tokens), ключ проекта
3. В форме задачи — **→ Создать в Jira**

Только Electron (CORS в браузере).

---

## Структура проекта

```
DoomPlanner/
├── electron/              # main.cjs, preload.cjs, IPC
├── src/
│   ├── components/        # views, tasks, layout, ui, settings
│   ├── store/             # Zustand
│   ├── lib/               # dates, selectors, holidays, holidayFallback, attachments, exportPlanText
│   ├── data/              # holidays-ru-2025.json … 2027.json
│   └── types/
├── scripts/
│   ├── electron-build.mjs       # сборка .exe
│   ├── generate-icon.mjs        # PNG из source
│   ├── strip-icon-sources.mjs   # убрать source из build/
│   ├── verify-icons.mjs         # проверка перед electron-builder
│   ├── build-production-calendar.mjs
│   ├── verify-daily-meetings.mjs
│   ├── verify-attachments.mjs
│   ├── verify-month-calendar.mjs
│   ├── verify-holiday-labels.mjs
│   └── verify-projects.mjs
├── public/icons/          # иконки (views + ui + палитры)
├── resources/icon.png     # иконка .exe
├── build/                 # собранный фронтенд
└── dist-electron/         # готовые .exe
```

---

## Требования

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) 10+

---

## Частые проблемы

| Проблема | Решение |
|----------|---------|
| `cargo` / `tauri:build` | Tauri не используется → `pnpm electron:build` |
| Git Bash / EPERM | PowerShell + закрыть приложение |
| Порт 5173 занят | Закройте старый `pnpm dev` |
| Electron не стартует | `pnpm rebuild electron` |
| Голос не работает | F12 → `[Voice]`, разрешите микрофон; в Electron нестабильно (см. ROADMAP) |
| Иконки не в .exe | `pnpm icons` → `pnpm electron:build` |

---

## Качество и план

- **Тесты:** `pnpm test` — ~90 проверок в 5 скриптах + генератор календаря (2025–2027)
- **Чеклист:** [`TESTS.md`](TESTS.md)
- **Backlog:** [`ROADMAP.md`](ROADMAP.md) — v0.24 палитры, v0.25 темы (тёмная по умолчанию), v0.23 мобилка, v0.3 Ollama

---

## Лицензия

MIT
