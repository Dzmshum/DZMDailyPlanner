import { SettingsSection } from '../SettingsSection'

const UPCOMING = [
  { version: 'v0.31.2', text: 'Импорт задачи из Jira по ссылке. Тот же Electron и те же настройки.' },
  { version: 'v0.31.3', text: 'Ctrl+K — палитра команд.' },
  { version: 'v0.31.4', text: 'Упрощение ввода задачи: название и дедлайн, остальное по желанию.' },
  { version: 'v0.32', text: 'Мобильное приложение: тот же план, обмен файлом.' },
  { version: 'v0.33', text: 'Дейлик: похожие формулировки рядом. Задачи в плане не сливаются.' },
  { version: 'v0.34', text: 'Ollama на этом компьютере: заголовок и проект.' },
  { version: 'v0.35', text: 'Фон: свой эффект у палитры и уровень интенсивности.' },
] as const

export function RoadmapPanel({ query }: { query: string }) {
  return (
    <SettingsSection
      id="upcoming"
      hint="Очередь из плана. Здесь ничего не переключается."
      query={query}
    >
      <dl className="settings-hotkeys">
        {UPCOMING.map((item) => (
          <div key={item.version} className="settings-hotkey">
            <dt>{item.version}</dt>
            <dd>{item.text}</dd>
          </div>
        ))}
      </dl>
    </SettingsSection>
  )
}
