<p align="center">
  <img src="./assets/readme/hero.png" width="100%" alt="PlanBoard — локальный планировщик с дедлайнами, проектами, календарём и дейликами в одном JSON на диске">
</p>

<p align="center">
  <img src="./assets/readme/icon.png" width="96" height="96" alt="Иконка PlanBoard — чеклист на планшете">
</p>

**PlanBoard** — локальный планировщик для Windows. Дедлайны, проекты, календарь и дейлики живут в одном `plan.json` на вашем компьютере. Интерфейс на русском. Облако не требуется.

**Стек:** React 19 · TypeScript · Vite · Zustand · **Electron**  
**Версия:** v0.31.1 — см. [ROADMAP.md](./ROADMAP.md)
**Следующий релиз:** [импорт задачи из Jira по ссылке](./ROADMAP.md#v0312--импорт-задачи-из-jira-по-ссылке) (v0.31.2), затем [Ctrl+K](./ROADMAP.md#v0313--ctrlk) (v0.31.3), [упрощение ввода](./ROADMAP.md#v0314--упрощение-ввода-задачи) (v0.31.4), [список задач проекта](./ROADMAP.md#v0315--список-задач-проекта) (v0.31.5) и [читаемость дейлика](./ROADMAP.md#v0316--читаемость-текста-на-дейлике) (v0.31.6).

> Десктоп на **Electron**. Legacy Tauri (`src-tauri/`) удалён в v0.29.3.

<p align="center">
  <img src="./assets/readme/workflow.png" width="100%" alt="Поток: захват → план по календарю → дейлик → выгрузка в TG или Jira через plan.json">
</p>

---

<p align="center">
  <img src="./assets/readme/section-start.png" width="100%" alt="Быстрый старт">
</p>

### Уже есть собранный .exe

Двойной клик по **`PlanBoard.cmd`** или:

```
dist-electron\PlanBoard 0.31.1.exe              ← portable
dist-electron\win-unpacked\PlanBoard.exe       ← распакованная версия
dist-electron\PlanBoard Setup 0.31.1.exe        ← установщик
```

### Разработка (окно приложения)

```powershell
cd путь\к\PlanBoard
pnpm install          # обязательно после clone / смены ветки
pnpm rebuild electron # первый раз или после обновления electron
pnpm electron:dev
```

Данные: `%APPDATA%\PlanBoard\plan.json`

### Только браузер (быстрая проверка UI)

```powershell
pnpm dev
```

→ http://127.0.0.1:5173/  
При `pnpm dev` данные тоже в `%APPDATA%\PlanBoard\plan.json` (через dev API на `127.0.0.1`).  
Любой локальный процесс может читать/писать план, пока крутится Vite — не оставляйте `pnpm dev` на чужой машине.

### Команды

| Команда | Что делает |
|---------|------------|
| `pnpm install` | Зависимости (после clone) |
| `pnpm rebuild electron` | Бинарник Electron |
| `pnpm electron:dev` | Окно приложения + hot reload |
| `pnpm dev` | Только Vite в браузере |
| `pnpm electron:build` | Собрать .exe → `dist-electron\` |
| `pnpm build` | Фронтенд в `build\` |
| `pnpm test` | Автотесты — **433** проверки, 14 verify-скриптов |
| `pnpm lint` | oxlint |

**Двойной клик (Windows):** `PlanBoard.cmd` · `Build-Electron.cmd`  
**Терминал:** PowerShell или cmd. Для `electron:build` **не Git Bash**.

---

<p align="center">
  <img src="./assets/readme/section-features.png" width="100%" alt="Возможности">
</p>

### Меню `1`–`6`

| Клавиша | Пункт |
|---------|--------|
| `1` | **Сегодня** — обзор (просроченные, сегодня, 7 дней) или день |
| `2` | **Календарь** — неделя / месяц / квартал / год, DnD |
| `3` | **Задачи** — список или входящие без даты |
| `4` | **Дейлик** — отчёт к созвону (дни настраиваются) |
| `5` | **Проекты** — цвета, «Завершить» / архив |
| `6` | **История** — выполненные по датам |

### Рядом с доской

- **Меню** — полное (колонка с логотипом) или круговое (логотип в шапке, пункты от него). `[` / `х` переключает
- **Быстрый захват** — `Q` / `Й` (можно только фото)
- **Черновики** — случайное закрытие формы или захвата не стирает ввод (`sessionStorage`)
- **Фото** — `Ctrl+V` в форме и в быстром захвате, drag-and-drop, лайтбокс
- **Окно** — обычный / развёрнутый / минимальный (только Electron); раскладка запоминается
- **Настройки** — 7 разделов и поиск. «Дальше» — очередь релизов, без переключателей
- **Текст TG** — `Ctrl+Shift+C` (период, сделанное, inbox)
- **Jira** — создать задачу в Jira Cloud (только Electron). Импорт по ссылке — ещё нет
- **Голос** — `Ctrl+Shift+V` (включается в настройках; в Electron нестабилен)
- **Темы** — светлая / тёмная / системная; 7 палитр + «Моя тема»
- **Праздники РФ** — производственный календарь 2025–2027; с 2028 — праздники ТК без переносов
- **Прогресс дня** — процент и счётчик на дашборде, в повестке и в шапке

### Горячие клавиши

| Клавиша | Действие |
|---------|----------|
| `N` | Новая задача |
| `1`–`6` | Пункты меню |
| `[` / `х` | Полное меню или круговое |
| `Q` / `Й` | Быстрый захват |
| `Ctrl+S` | Сохранить |
| `Ctrl+E` | Экспорт JSON |
| `Ctrl+F` | Поиск |
| `Ctrl+Shift+C` | Текст для Telegram |
| `Ctrl+V` | Вставить фото |
| `Ctrl+Shift+V` | Голосовой ввод |
| `Пробел` | Отметить выбранную задачу |
| `Esc` | Закрыть форму |

---

<p align="center">
  <img src="./assets/readme/section-build.png" width="100%" alt="Сборка и данные">
</p>

### Сборка .exe

```powershell
pnpm electron:build
```

Перед упаковкой: `pnpm build` (календарь, иконки, tsc, vite, strip sources) → `verify-icons` → electron-builder во временную папку → копия в `dist-electron\`.

**Если `EPERM`:** закройте PlanBoard → удалите `dist-electron` → PowerShell → при необходимости исключение в антивирусе.

**Visual Studio / Rust не нужны.**

<details>
<summary>Иконки и пути данных</summary>

| Путь | Назначение |
|------|------------|
| `public/icons/wordmark/{palette}.png` | Логотип сайдбара |
| `public/icons/views/{palette}/` | Иконки вкладок |
| `public/icons/ui/{palette}/` | UI-иконки |
| `resources/icon.png` | Иконка .exe (512px) |

Замена логотипа: `wordmark/{palette}-source.png` → `pnpm icons` → `pnpm electron:build`.

| Режим | Данные |
|-------|--------|
| Electron / `pnpm dev` | `%APPDATA%\PlanBoard\plan.json` |
| Первый запуск | если плана нет, копируется `%APPDATA%\DoomPlanner\` |
| Статический preview | `localStorage` → `planboard-plan` (старый ключ `doomplanner-plan` тоже читается) |
| Фото | `%APPDATA%\PlanBoard\attachments\{taskId}\` |
| Бэкап | `plan.json.bak` |
| Окна | `window-layouts.json` |

Данные **не стираются** при пересборке .exe.

</details>

<details>
<summary>Формат plan.json (сокращённо)</summary>

```json
{
  "version": 1,
  "settings": {
    "theme": "system",
    "colorPalette": "plain",
    "defaultView": "dashboard",
    "windowMode": "standard",
    "navigation": { "sidebarMode": "expanded" },
    "daily": { "enabled": true, "days": [1, 4] },
    "jira": { "enabled": false }
  },
  "projects": [{ "id": "uuid", "name": "Работа", "color": "#4fc3f7", "completed": false }],
  "tasks": [{
    "id": "uuid",
    "title": "Задача",
    "deadline": "2026-07-05",
    "priority": "medium",
    "status": "todo",
    "attachments": []
  }]
}
```

</details>

### Jira (опционально)

1. ⚙ **Настройки** → Интеграции → Jira  
2. URL, email, [API Token](https://id.atlassian.com/manage-profile/security/api-tokens), ключ проекта  
3. В форме задачи — **→ Создать в Jira**

Только Electron (CORS в браузере).  
API token хранится в `plan.json` локально; в JSON-экспорт токен **не попадает** (redact с v0.29.2).

---

## Структура проекта

```
PlanBoard/
├── electron/          # main, preload, IPC
├── src/               # React UI, Zustand, lib
├── scripts/           # build, icons, verify-*
├── public/icons/      # палитры, views, ui
├── resources/         # icon.png для .exe
├── assets/readme/     # SVG для этой страницы
├── build/             # фронтенд после сборки
└── dist-electron/     # готовые .exe
```

## Требования

- [Node.js](https://nodejs.org/) 20.19+ или 22.12+ (Vite 8)
- [pnpm](https://pnpm.io/) 10+

## Частые проблемы

| Проблема | Решение |
|----------|---------|
| `cargo` / `tauri:build` | Tauri удалён → `pnpm electron:build` |
| Git Bash / EPERM | PowerShell + закрыть приложение |
| Порт 5173 занят | Закройте старый `pnpm dev` |
| `Cannot find package 'rolldown'` / `sharp` | `pnpm install` |
| Electron не стартует | `pnpm rebuild electron` |
| Голос не работает | F12 → `[Voice]`, разрешите микрофон |
| Иконки не в .exe | `pnpm icons` → `pnpm electron:build` |

## Качество и план

| | |
|--|--|
| **Версия** | **v0.31.1** — меню: полное и круговое |
| **Дальше** | Импорт задачи из Jira по ссылке (v0.31.2), затем Ctrl+K (v0.31.3), упрощение ввода (v0.31.4), список задач проекта с выполненными (v0.31.5) и читаемость текста на дейлике (v0.31.6). Анимации фона — **v0.35**, в конце очереди |
| **Тесты** | `pnpm test` — 14 verify-скриптов + календарь РФ (**433**) |
| **Чеклист** | [`TESTS.md`](TESTS.md) |
| **План** | [`ROADMAP.md`](ROADMAP.md) |

<details>
<summary>Очередь релизов и покрытие тестов</summary>

| Релиз | Суть |
|--------|------|
| **v0.29.2** ✅ | Стабилизация (данные, Jira, normalize, Electron) |
| **v0.29.3** ✅ | Perf + гигиена (`src-tauri/` удалён, CI) |
| **v0.30.1** ✅ | Черновики форм |
| **v0.30.2** ✅ | Прогресс дня — явные % |
| **v0.30.3** ✅ | Реструктуризация настроек |
| **v0.31** ✅ | Меню: 6 пунктов, режимы внутри |
| **v0.31.1** ✅ | Меню: полное и круговое, одинаково в веб и Electron |
| **v0.31.2** | Импорт задачи из Jira по ссылке |
| **v0.31.3** | Ctrl+K — палитра команд |
| **v0.31.4** | Упрощение ввода задачи |
| **v0.31.5** | Список задач проекта, включая выполненные |
| **v0.31.6** | Дейлик: текст читается на светлом фоне |
| **v0.32** | Мобильное приложение |
| **v0.33** | Группировка в дейлике |
| **v0.34** | Ollama |
| **v0.35** | Анимации фона 2.0 (конец очереди) |

| Скрипт | Проверок |
|--------|----------|
| `verify-daily-meetings.mjs` | 49 |
| `verify-attachments.mjs` | 12 |
| `verify-month-calendar.mjs` | 9 |
| `verify-holiday-labels.mjs` | 22 |
| `verify-projects.mjs` | 5 |
| `verify-palettes.mjs` | 92 |
| `verify-export-text.mjs` | 3 |
| `verify-settings-ui.mjs` | 95 |
| `verify-nav.mjs` | 54 |
| `verify-task-credit.mjs` | 12 |
| `verify-day-progress.mjs` | 12 |
| `verify-minimal-window.mjs` | 32 |
| `verify-stabilize.mjs` | 26 |
| `verify-task-draft.mjs` | 10 |

</details>

## Лицензия

MIT
