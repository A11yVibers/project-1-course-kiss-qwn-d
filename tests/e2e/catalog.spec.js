import { expect, test } from '@playwright/test'

// Catalog coverage: population from history_courses.csv, search, filters,
// sorting, reset, empty state, and navigation into a course page.

const card = (page, id) => page.locator(`[data-testid="course-card"][data-course-id="${id}"]`)

test.beforeEach(async ({ page }) => {
  await page.goto('/#/')
})

test('catalog lists all 12 courses with data-driven stats', async ({ page }) => {
  await expect(page.getByTestId('catalog-stats')).toHaveText('12 courses · 4 instructors · 144 classes')
  await expect(page.getByTestId('course-card')).toHaveCount(12)
  await expect(card(page, 'HIST111')).toContainText('The Silk Roads: Trade, Religion, and Exchange')
  await expect(card(page, 'HIST110')).toContainText('World War II: A Global History')
})

test('cards carry the CSV image URL, instructor, and course link', async ({ page }) => {
  const silkRoads = card(page, 'HIST111')
  await expect(silkRoads).toHaveAttribute('href', '#/courses/HIST111')
  await expect(silkRoads.getByTestId('card-image')).toHaveAttribute('src', /Special:Redirect\/file\/A%20Caravan/)
  await expect(silkRoads).toContainText('Dr. Leila Rahman')
  await expect(silkRoads).toContainText('5 weeks')
  await expect(silkRoads).toContainText('10 classes')
})

test('search narrows the catalog by topic', async ({ page }) => {
  await page.getByTestId('search-input').fill('silk')
  await expect(page.getByTestId('course-card')).toHaveCount(1)
  await expect(card(page, 'HIST111')).toBeVisible()
  await expect(page.getByTestId('result-count')).toHaveText('1 course')
})

test('search matches instructor names and clears with the X button', async ({ page }) => {
  await page.getByTestId('search-input').fill('Rahman')
  const ids = await page
    .locator('[data-testid="course-card"]')
    .evaluateAll((els) => els.map((el) => el.dataset.courseId))
  expect(ids.sort()).toEqual(['HIST101', 'HIST106', 'HIST111'])
  await page.getByTestId('search-clear').click()
  await expect(page.getByTestId('course-card')).toHaveCount(12)
})

test('instructor filter shows only that instructor’s courses', async ({ page }) => {
  await page.getByTestId('instructor-filter').selectOption('INS03')
  const ids = await page
    .locator('[data-testid="course-card"]')
    .evaluateAll((els) => els.map((el) => el.dataset.courseId))
  expect(ids.sort()).toEqual(['HIST104', 'HIST105', 'HIST110'])
})

test('duration filter shows 8-week courses only', async ({ page }) => {
  await page.getByTestId('duration-filter').selectOption('8')
  await expect(page.getByTestId('course-card')).toHaveCount(1)
  await expect(card(page, 'HIST110')).toBeVisible()
})

test('sort by most classes puts the 16-class course first', async ({ page }) => {
  await page.getByTestId('sort-select').selectOption('classes')
  await expect(page.locator('[data-testid="course-card"]').first()).toHaveAttribute(
    'data-course-id',
    'HIST110',
  )
})

test('sort by title orders cards A–Z', async ({ page }) => {
  await page.getByTestId('sort-select').selectOption('title')
  const titles = await page
    .locator('[data-testid="course-card"] .card-title')
    .evaluateAll((els) => els.map((el) => el.textContent))
  const sorted = [...titles].sort((a, b) => a.localeCompare(b))
  expect(titles).toEqual(sorted)
})

test('reset filters restores the full catalog from the empty state', async ({ page }) => {
  await page.getByTestId('search-input').fill('silk')
  await page.getByTestId('instructor-filter').selectOption('INS02')
  await expect(page.getByTestId('empty-state')).toBeVisible()
  await expect(page.getByTestId('empty-state')).toContainText('No courses match your filters')
  await page.getByTestId('reset-filters').click()
  await expect(page.getByTestId('course-card')).toHaveCount(12)
  await expect(page.getByTestId('instructor-filter')).toHaveValue('all')
})

test('empty state offers to clear filters', async ({ page }) => {
  await page.getByTestId('search-input').fill('zzzz-no-match')
  await expect(page.getByTestId('empty-state')).toBeVisible()
  await page.getByTestId('clear-filters').click()
  await expect(page.getByTestId('course-card')).toHaveCount(12)
})

test('clicking a card opens that course’s page', async ({ page }) => {
  await card(page, 'HIST111').click()
  await expect(page).toHaveURL(/#\/courses\/HIST111$/)
  await expect(page.getByTestId('course-title')).toHaveText(
    'The Silk Roads: Trade, Religion, and Exchange',
  )
})
