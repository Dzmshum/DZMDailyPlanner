/**
 * Завершённые проекты.
 * Запуск: npx tsx scripts/verify-projects.mjs
 */
import { normalizePlan, createDefaultPlan } from '../src/types/index.ts'
import {
  filterProjectsForSelect,
  getActiveProjects,
} from '../src/lib/selectors.ts'

function assert(name, condition) {
  if (!condition) {
    console.error('FAIL:', name)
    process.exitCode = 1
  } else {
    console.log('OK:', name)
  }
}

const projects = [
  { id: 'a', name: 'Alpha', color: '#f00', completed: false, completedAt: null },
  { id: 'b', name: 'Beta Done', color: '#0f0', completed: true, completedAt: '2026-01-01' },
  { id: 'c', name: 'Gamma', color: '#00f', completed: false, completedAt: null },
]

assert('активных 2', getActiveProjects(projects).length === 2)

const defaultList = filterProjectsForSelect(projects, '', null)
assert(
  'без поиска только активные',
  defaultList.length === 2 && defaultList.every((p) => !p.completed),
)

const searchDone = filterProjectsForSelect(projects, 'beta', '')
assert('поиск находит завершённый', searchDone.length === 1 && searchDone[0].id === 'b')

const keepSelected = filterProjectsForSelect(projects, '', 'b')
assert(
  'выбранный завершённый остаётся в списке',
  keepSelected.some((p) => p.id === 'b'),
)

const legacy = normalizePlan({
  ...createDefaultPlan(),
  projects: [{ id: 'x', name: 'Legacy', color: '#abc' }],
})
assert(
  'normalizePlan: completed по умолчанию false',
  legacy.projects[0].completed === false && legacy.projects[0].completedAt === null,
)

if (process.exitCode) {
  console.error('\nЕсть ошибки проверки')
  process.exit(1)
} else {
  console.log('\nВсе проверки пройдены')
}
