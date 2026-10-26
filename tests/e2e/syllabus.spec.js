import { expect, test } from '@playwright/test'

// Silk Roads (HIST111) course page: course information from
// history_courses.csv / history_instructors.csv and the syllabus table from
// history_classes.csv + course_materials.csv.

test.beforeEach(async ({ page }) => {
  await page.goto('/#/courses/HIST111')
})

test('course pane shows the information from the CSV', async ({ page }) => {
  await expect(page.getByTestId('course-code')).toHaveText('HIST111')
  await expect(page.getByTestId('course-title')).toHaveText(
    'The Silk Roads: Trade, Religion, and Exchange',
  )
  await expect(page.locator('.meta-chip')).toContainText(['5 weeks', '10 classes'])
  await expect(page.getByTestId('course-description')).toContainText(
    'changing network of overland and maritime routes',
  )
})

test('instructor card comes from history_instructors.csv', async ({ page }) => {
  const card = page.getByTestId('instructor-card')
  await expect(card).toContainText('Dr. Leila Rahman')
  await expect(card.locator('.instructor-email')).toHaveAttribute(
    'href',
    'mailto:leila.rahman@historyplatform.edu',
  )
  await expect(card.locator('.instructor-photo')).toHaveAttribute(
    'src',
    /randomuser\.me\/api\/portraits\/women\/44\.jpg/,
  )
})

test('syllabus table lists all 10 classes in date order', async ({ page }) => {
  const rows = page.getByTestId('syllabus-row')
  await expect(rows).toHaveCount(10)
  await expect(rows.nth(0).getByTestId('class-title')).toHaveText('Class 1: What Were the Silk Roads?')
  await expect(rows.nth(0).locator('time')).toHaveText('21 September 2026')
  await expect(rows.nth(9).getByTestId('class-title')).toHaveText(
    'Class 10: Maritime Routes and the Legacy of the Silk Roads',
  )
  await expect(rows.nth(9).locator('time')).toHaveText('22 October 2026')
})

test('same-week classes share one rowSpan week cell', async ({ page }) => {
  await expect(page.getByTestId('week-cell')).toHaveCount(5)
  await expect(page.getByTestId('week-cell').first()).toHaveAttribute('rowspan', '2')
  await expect(page.getByTestId('week-cell').first()).toContainText('Week 1')
  // The second class of week 1 has only a date and a content cell.
  await expect(page.getByTestId('syllabus-row').nth(1).locator('th, td')).toHaveCount(2)
})

test('dates render in the pinned en-GB long format', async ({ page }) => {
  const secondClass = page.getByTestId('syllabus-row').nth(1)
  await expect(secondClass.locator('time')).toHaveAttribute('dateTime', '2026-09-24')
  await expect(secondClass.locator('time')).toHaveText('24 September 2026')
})

test('classes 1 and 2 list their materials, later classes show none yet', async ({ page }) => {
  const rows = page.getByTestId('syllabus-row')
  await expect(page.getByTestId('material-chip')).toHaveCount(4)

  const class1Chips = rows.nth(0).getByTestId('material-chip')
  await expect(class1Chips).toHaveCount(2)
  await expect(class1Chips.nth(0)).toContainText('Lecture Notes: What Were the Silk Roads?')
  await expect(class1Chips.nth(0).locator('.chip-type')).toHaveText('PDF')
  await expect(class1Chips.nth(1)).toContainText('Lecture Video: What Were the Silk Roads?')
  await expect(class1Chips.nth(1).locator('.chip-type')).toHaveText('Video')

  const class2Chips = rows.nth(1).getByTestId('material-chip')
  await expect(class2Chips).toHaveCount(2)
  await expect(class2Chips.nth(0)).toContainText(
    'The Silk Road and Ancient Trade: Crash Course World History #9',
  )
  await expect(class2Chips.nth(0).locator('.chip-type')).toHaveText('YouTube')
  await expect(class2Chips.nth(1)).toContainText('Assignment: Mapping the Silk Roads')
  await expect(class2Chips.nth(1).locator('.chip-type')).toHaveText('Markdown')

  await expect(rows.nth(2)).toContainText('No materials posted yet.')
  await expect(rows.nth(2).getByTestId('material-chip')).toHaveCount(0)
})
