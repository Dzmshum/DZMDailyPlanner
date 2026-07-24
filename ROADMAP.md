# План доработок PlanBoard

> Продукт: **PlanBoard**. Пути данных `%APPDATA%\PlanBoard\`; при первом запуске миграция из `%APPDATA%\DoomPlanner\`.

**Текущая версия:** [v0.29.3](#v0293--perf--гигиена) ✅

**В очереди:** [v0.30](#v030--анимации-фона-20) → [v0.30.1](#v0301--черновики-форм-задач) → [v0.30.2](#v0302--прогресс-дня--проценты-и-подписи) → [v0.30.3](#v0303--реструктуризация-настроек) → [v0.31](#v031--оптимизация-меню-навигации) → [v0.31.1](#v0311--скрываемое-меню-режимы-навигации) → [v0.32](#v032--мобильное-приложение) → [v0.33](#v033--дейлик-группировка-похожих-задач) → [v0.34](#v034--локальный-ии-ollama)

> Одна нумерация = порядок релизов. Старые «эпик-ID» (v0.23 / v0.26 / v0.27) не используются в очереди; при необходимости упомянуты одной строкой в [истории](#история-версий).

---

## Что делаем дальше

### Очередь версий

| # | Релиз | Суть |
|---|--------|------|
| **1** | **v0.30** | **Анимации фона 2.0** — эффект на палитру + интенсивность |
| **2** | **v0.30.1** | **Черновики форм** — не терять ввод при закрытии |
| **3** | **v0.30.2** | **Прогресс дня 2.0** — явные % и подписи |
| **4** | **v0.30.3** | **Реструктуризация настроек** — найти опцию ≤2 клика |
| **5** | **v0.31** | **Оптимизация меню** — меньше дублей вкладок |
| **6** | **v0.31.1** | **Скрываемое меню** — peek / rail / палитра |
| **7** | **v0.32** | **Мобильное приложение** |
| **8** | **v0.33** | **Дейлик:** группировка похожих задач |
| **9** | **v0.34** | **Ollama** — заголовок, проект; опционально семантика для дейлика |

*Сделано перед очередью:* [v0.29.2](#v0292--стабилизация-данных-и-безопасности) ✅ · [v0.29.3](#v0293--perf--гигиена) ✅

*К каждой версии — см. [«Каждая новая версия — обязательно»](#каждая-новая-версия--обязательно).*

---

### Аудит (срез 2026-07-24)

Локальный Electron-планировщик (React 19 / Zustand / `plan.json`). Фич и verify-покрытие много; главные риски — **целостность данных**, **секреты Jira**, **гигиена версий/репо**.

| Слой | Оценка |
|------|--------|
| Продукт / UX | Сильный desktop; 8 вкладок и настройки — в очереди фич |
| Архитектура | UI → Zustand → storage/IPC → FS; drift `DEFAULT_PLAN` Electron vs TS |
| Надёжность | Autosave race; Escape без cleanup вложений; тихие ошибки load/save |
| Безопасность | Token в plan/экспорте; SSRF через Jira `baseUrl`; dev `/api/plan` без auth |
| Perf | Month O(days×tasks); inbox reorder = N setState; широкие селекторы; тяжёлые dataURL тем |
| Качество | *(на момент аудита)* нет CI; semver drift; `src-tauri/` — **исправлено в v0.29.2–0.29.3** |

Фиксы P0–P1 → **v0.29.2**; P2 + гигиена → **v0.29.3**. Фичи с v0.30 — после стабилизации.

---

### v0.29.2 — стабилизация данных и безопасности ✅

Реализовано (2026-07-24).

**Цель:** не терять правки и файлы; не утекать Jira-токен; не ходить произвольным URL из Electron main.

#### Сделано

- [x] `persistQueued` — дозапись после in-flight save (`planStore`)
- [x] Escape → `planboard:cancel-*` → cleanup как Cancel
- [x] `redactPlanForExport` — apiToken не в JSON-экспорте; hint в Settings
- [x] `jiraUrl` / `jira-url.cjs` — https + публичный host
- [x] Жёсткий `normalizePlan(unknown)` — без throw на битом JSON
- [x] Баннеры `loadError` / `saveError` в `App`
- [x] Cap вложений 8 МБ (Electron + renderer)
- [x] Electron: `sandbox`, `setWindowOpenHandler`, CSP в `index.html`
- [x] Semver `package.json` = продуктовая версия
- [x] Dev API warn + README про loopback
- [x] `verify-stabilize.mjs`

---

### v0.29.3 — perf + гигиена ✅

Реализовано (2026-07-24). После стабилизации, **до** [v0.30](#v030--анимации-фона-20).

#### Сделано

- [x] Inbox reorder — один `set` (не N×`updateTask`)
- [x] `buildMonthDayTaskIndex` + month grid O(tasks + days)
- [x] Узкие селекторы Header / hotkeys; `aria-current` в Sidebar
- [x] `electron/default-plan.json` + `sync-default-plan.mjs` (один источник с TS)
- [x] Один `normalizeCustomTheme` в `types` (re-export из `customTheme`)
- [x] Cap фонов темы: max 8 images / ~2M chars dataURL в normalize
- [x] ImportModal: warning «мета без файлов»
- [x] Modal: Escape, initial focus, уникальный `titleId`
- [x] Удалён `src-tauri/`
- [x] CI: `.github/workflows/ci.yml` (`pnpm test` + `pnpm build`)

**Голос в Electron** — backlog.

---

### v0.30 — анимации фона 2.0

> После стабилизации. База: canvas v0.24 (`AmbientBackground`), сейчас эффекты слабые и похожи.

**Цели:**
1. У каждой декоративной палитры — **свой** узнаваемый эффект (6 палитр + «Моя тема» по `basedOn`).
2. Уровни интенсивности: `off` | `subtle` | `auto` | `intense` (| `max` опционально).
3. `plain` — без canvas.

| Палитра | Характер эффекта |
|---------|------------------|
| Нордскол | Иней, блеск льда, снег |
| Запределье | Скверна, вспышки, void |
| Пандария | Лепестки, нефрит, золото |
| Звёздные войны | Параллакс, гиперполосы, неон |
| Игра престолов | Снег Севера, пепел, золото |
| Ведьмак | Туман, руны, медные искры |
| Моя тема | Как у `basedOn` + те же уровни |

#### Что сделать

- [ ] Профили в `ambientProfiles.ts` — по одному на палитру; множитель интенсивности
- [ ] Расширить `ambientAnimation` (или `ambientIntensity`) в `plan.json` + `normalizePlan`
- [ ] Live-превью 3–5 с в настройках при смене уровня
- [ ] FPS cap при `document.hidden`; DPR ≤ 2; `prefers-reduced-motion` → статичный фон
- [ ] Crossfade при смене палитры; UI не фризить >100 ms
- [ ] `verify-ambient.mjs` (или расширение `verify-palettes`)

**Критерии:** эффекты различимы на `auto`; `intense` заметно сильнее; Electron = браузер.

---

### v0.30.1 — черновики форм задач

> После [v0.30](#v030--анимации-фона-20). **Зависит от** cleanup Escape из [v0.29.2](#v0292--стабилизация-данных-и-безопасности): cancel/Esc уже не должны оставлять orphan-файлы; здесь — **не терять ввод**.

**Проблема:** overlay / Esc / ✕ закрывают `TaskForm` / `QuickCapture` → ввод пропадает; у новой задачи draft-фото тоже чистятся.

#### Что сделать

- [ ] Автосохранение черновика (debounce ~300 ms) в `sessionStorage` (или APPDATA)
  - new: `planboard-task-draft-new`
  - quick: `planboard-quick-capture-draft`
  - edit existing — опционально по `taskId`
- [ ] Restore при открытии (поля + meta вложений)
- [ ] Clear draft только после успешного Save или явной Отмены с confirm
- [ ] Dirty close: confirm **или** отключить `closeOnBackdrop`
- [ ] Esc при dirty → confirm (после 0.29.2 cleanup согласован с этим потоком)
- [ ] `lib/taskDraft.ts` + `verify-task-draft.mjs`

**Критерии:** закрыл случайно → открыл снова — поля на месте; после Save черновик пуст.

---

### v0.30.2 — прогресс дня: проценты и подписи

> Логика `getDayProgress` уже есть (v0.29); улучшаем **читаемость**.

#### Что сделать

- [ ] Явный `%` (`Math.round(ratio * 100)`; `total === 0` → «Нет задач» / «—»)
- [ ] Форматы: дашборд/повестка `33% · 2 из 6`; compact `33%` + `2/6`
- [ ] `aria-valuenow` / `aria-valuetext`; `role="progressbar"`
- [ ] Опционально в настройках: показать % / дробь / оба (дефолт — оба)
- [ ] Расширить `verify-day-progress` / `verify-settings-ui`

**Критерии:** % читается без оценки длины полоски; согласован с селектором.

---

### v0.30.3 — реструктуризация настроек

> После прогресса % и ambient (уровни интенсивности не должны «потеряться» внизу свалки).

**Проблема:** 4 таба есть, внутри — длинный скролл; нет поиска; всегда открывается «Оформление».

#### Целевая структура

```
Настройки
├── Оформление     ← тема, палитра, своя тема, фон/анимация
├── Планирование   ← календарь, праздники, дейлики, прогресс дня
├── Окно и ввод    ← windowMode, голос, справка hotkeys
├── Экспорт        ← TG/текст
├── Данные         ← путь, бэкап
└── Интеграции     ← Jira (+ позже Ollama)
```

Альтернатива: 4 таба + поднавиг/аккордеоны внутри.

#### Что сделать

- [ ] Перегруппировать секции; sticky поднавиг или аккордеон
- [ ] Поиск по подписи опции *(желательно)*
- [ ] Запоминать последний таб (`sessionStorage` / `settings.lastTab`)
- [ ] Вынести `windowMode` из блока палитр
- [ ] Сжать hints; интенсивность ambient рядом с «Фон»
- [ ] `customPresets[]` — если влезает, иначе backlog
- [ ] Панели (`AppearancePanel`, …) + обновить `verify-settings-ui`

**Критерии:** частые опции ≤2 клика; повторное открытие — тот же таб; нет регрессий в `plan.json`.

---

### v0.31 — оптимизация меню навигации

> **До** mobile: не тащить 8 вкладок на телефон.

Сейчас `NAV_ITEMS` = 8 (`1`–`8`). Подозрения на дубли: дашборд↔повестка, inbox↔задачи, история↔«Выполнено».

#### Цель

- Ориентир **5–6** верхнеуровневых пунктов
- Одна ясная роль на пункт; hotkeys `1`–`N`; миграция `defaultView`

#### Варианты (решить на ревью после аудита)

| Вариант | Идея |
|---------|------|
| **A. Слияние** | Дашборд+повестка → «Сегодня»; inbox → фильтр в «Задачи» |
| **B. Группы** | План / Задачи / Отчёты / Проекты |
| **C. Настраиваемое** | 8 в коде; скрытие редких в настройках |

**Рекомендация:** аудит → **A или B**.

#### Техника

- `Sidebar`, `useHotkeys`, `VIEW_ORDER`, `App.tsx`, `normalizePlan`
- `verify-nav.mjs`; обновить README § вкладки и TESTS.md

---

### v0.31.1 — скрываемое меню: режимы навигации

> После сокращения вкладок. Сайдбар сейчас всегда 240px.

#### MVP

- [ ] «Скрыть меню» / `[`; `settings.navigation.sidebarMode`
- [ ] Hotkeys `1`–`N` работают при скрытом меню
- [ ] Режим **`peek`**: overlay + полоска ~4px, без сдвига main

#### Фазы дальше

2. **Rail** (48px иконки) + радиальное меню на BrandMark  
3. **Ctrl+K** command palette  

Согласовать с Electron `titlebar-drag` и minimal-окном. `verify-nav.mjs` — режимы + persist.

---

### v0.32 — мобильное приложение

Нужна мобильная версия с тем же планом; минимум — надёжный import/export.

| Вариант | Когда |
|---------|--------|
| PWA | Быстрый UX-check |
| **Capacitor** ⭐ | Основной путь (~90% общего кода) |
| RN/Expo | Если Capacitor не устроит |
| Общая облачная папка | Фаза 1 синка параллельно |

**Путь:** Capacitor + файловый обмен → WebDAV/папка → свой бэкенд (опционально).

**MVP:** дашборд, повестка, done, inbox; JSON через Filesystem/Share; упрощённый bottom nav; без DnD календаря / Jira / Ollama / minimal Electron.

**Критерии:** Android (iOS по возможности); round-trip с десктопом; usable на 360px.

---

### v0.33 — дейлик: группировка похожих задач

В отчёте дейлика объединять похожие формулировки (fuzzy / токены / тот же проект). Задачи в плане **не** сливать.

| Фаза | Как |
|------|-----|
| MVP | Нормализация + Levenshtein / общие токены |
| Улучшение | Ollama embeddings / ярлык ([v0.34](#v034--локальный-ии-ollama)) |

- [ ] UI дейлика + текст «Скопировать для дейлика»
- [ ] Порог настраиваемый; учитывать проект
- [ ] `groupSimilarDailyTasks()` + verify; не ломать `verify-daily-meetings`

---

### v0.34 — локальный ИИ (Ollama)

- Заголовок из текста (быстрый захват)
- Подсказка проекта
- Опционально — семантика для группировки дейлика (усиливает v0.33)
- Настройки: URL, модель, вкл/выкл
- Вызов через Electron main (как Jira)

---

### Backlog

Не в очереди релизов (или «если успеем» внутри соседнего патча):

- [ ] **Голосовой ввод в Electron** — UI есть (v0.21); нестабильно; `[Voice]` в F12 / native fallback
- [ ] Vitest для `exportPlanText` / `dailyMeetings` *(частично: verify-скрипты)*
- [ ] Импорт/экспорт JSON **с файлами вложений** (bundle); превью в дейлике / TG
- [ ] Группировка диапазонов `DD/MM - DD/MM` в Telegram-экспорте
- [ ] `customPresets[]` / theme model v2 (остаток v0.28)
- [ ] Google Fonts → self-host (offline Electron)
- [ ] PDF / Markdown экспорт, уведомления Windows, real-time sync — после mobile

---

### Каждая новая версия — обязательно

| Блок | Что делать |
|------|------------|
| **Оптимизация** | Затронутый код: bundle, ре-рендеры, canvas/анимации, дубли CSS, мёртвый код |
| **Тесты** | Добавить/обновить verify под фичу; прогнать [`TESTS.md`](TESTS.md) по изменённым областям |

**Чеклист перед закрытием версии** *(сбрасывать в ☐ в начале релиза)*:

- [ ] `pnpm build` успешен
- [ ] `pnpm electron:build` успешен *(если затронут Electron / упаковка)*
- [ ] `pnpm test` зелёный; число проверок обновлено в README/TESTS при необходимости
- [ ] `pnpm lint` без новых предупреждений
- [ ] Ручной прогон пунктов `TESTS.md` для изменённых областей
- [ ] В `TESTS.md` добавлены строки под новые фичи
- [ ] Краткая заметка в этом ROADMAP (история + статус очереди)

---

### Связь с текущим кодом

| Модуль | Сейчас | Дальше |
|--------|--------|--------|
| `planStore.persist` / autosave | ✅ queue | — |
| Escape + draft cleanup | ✅ | — |
| Jira URL / export token | ✅ allowlist + redact | — |
| `normalizePlan` / load-save UI | ✅ | — |
| Attachments cap / Electron harden | ✅ | — |
| Month index / inbox reorder / selectors | ✅ | — |
| `default-plan.json` sync | ✅ | — |
| `src-tauri/` | ✅ удалён | — |
| CI | ✅ `.github/workflows/ci.yml` | — |
| `AmbientBackground` | Базовые частицы v0.24 | **v0.30** |
| TaskForm / QuickCapture drafts | Нет | **v0.30.1** |
| `DayProgressBar` | Дробь, % в логике | **v0.30.2** UI |
| `SettingsModal` | 4 таба, свалки внутри | **v0.30.3** |
| `Sidebar` (8 пунктов, 240px) | Фикс. ширина | **v0.31** / **v0.31.1** |
| `useSpeechRecognition` | UI ✅, Electron ⚠️ | backlog |
| `dailyMeetings` / export / attachments / palettes | ✅ | — |
| `getTaskCreditDayKey` / late chip | ✅ v0.28.1 | — |
| `MinimalView` / window-layouts | ✅ v0.29.1 | — |

---

## История версий

*От новых к старым. Сжатые итоги; детали спек done не дублируются выше.*

### v0.29.3 — perf + гигиена ✅

- Month day-index; inbox single-set reorder; узкие Zustand-селекторы
- `default-plan.json` sync; theme bg caps; Modal a11y; Import warning
- Удалён `src-tauri/`; GitHub Actions CI

### v0.29.2 — стабилизация ✅

- Persist queue; Escape cleanup; Jira redact/SSRF; normalize harden
- Load/save banners; attachment 8MB; Electron sandbox/CSP; semver sync
- `verify-stabilize.mjs`

### v0.29.1 — компактное минимальное окно ✅

- Токены `--minimal-*`; compact toggle / BrandMark; Electron sizes; `window-layouts.json`
- Шапка режимов; `verify-minimal-window.mjs` (30)

### v0.29 — прогресс дня + UI-полировка ✅

- `getDayProgress`, `DayProgressBar`, настройки `dayProgress`
- Layout tokens; History sticky; hover-фиксы; `verify-day-progress` + settings UI

### v0.28.1 — зачёт просроченных ✅

- Зачёт в день закрытия; чип «не в срок»; hover primary; `verify-task-credit`

### v0.28 — настройки UX 2.0 + дни дейликов ✅

- 4 таба; «Моя тема» в сетке; одна настройка ambient; `DailyDaysPicker`
- *(Ранее эпик дней — v0.25.4, вошёл в этот релиз.)*  
- Backlog: `customPresets[]` / plan v2

### v0.25.3 — v0.25.1 ✅

- Settings modal размер/скролл; повестка «Просрочено»; TG recent done / inbox
- Ребренд PlanBoard (wordmark, productName, appId)

### v0.25 — v0.24 ✅

- Custom theme; палитры SW/GoT/Ведьмак + базовый ambient

### v0.22.x ✅

- Календарь РФ 2027+; завершённые проекты; месяц + дейлик 13:00; фото к задачам
- UI-иконки; бренд RuneBoard→позже PlanBoard; вкладка Проекты

### v0.22 — v0.2 ✅

- Дейлики; голос UI *(Electron — backlog)*; TG-текст; inbox + quick capture
- Праздники/разрезы календаря; WoW-палитры; minimal window; повестка done; TaskCompleteToggle

### v0.11–v0.14 / MVP ✅

- Electron меню/окно, import JSON, `.bak`; удаление; стиль; чипы дедлайна
- MVP: дашборд, повестка, неделя, задачи, история, проекты, DnD, Jira, темы, autosave, .exe

### Исторические метки эпиков (справка)

| Старое имя | Стало в очереди |
|------------|-----------------|
| «v0.27 ambient» | v0.30 |
| «v0.23 mobile» | v0.32 |
| «v0.26 daily groups» | v0.33 |
| «v0.3 Ollama» | **v0.34** (чтобы semver шёл вперёд после v0.33) |
