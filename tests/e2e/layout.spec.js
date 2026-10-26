import { expect, test } from '@playwright/test'

// Layout and routing: collapsible left pane (with accessibility checks),
// a course that has no materials at all, unknown routes, and the narrow
// mobile viewport.

test('left pane collapses and expands accessibly', async ({ page }) => {
  await page.goto('/#/courses/HIST111')
  const toggle = page.getByTestId('collapse-toggle')
  const content = page.locator('#course-pane-content')
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(content).toBeVisible()

  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(content).toHaveAttribute('hidden', '')
  await expect(content).toHaveAttribute('aria-hidden', 'true')
  await expect(page.getByTestId('course-title')).toBeHidden()
  await expect(page.getByTestId('material-chip').first()).toBeHidden()
  // The collapsed pane is a narrow rail; the viewer keeps the rest.
  const paneBox = await page.locator('.course-pane').boundingBox()
  expect(paneBox.width).toBeLessThanOrEqual(80)
  await expect(page.getByTestId('viewer-default')).toBeVisible()

  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(content).toBeVisible()
  await expect(page.getByTestId('course-title')).toBeVisible()
})

test('a course without materials still renders its full syllabus', async ({ page }) => {
  await page.goto('/#/courses/HIST101')
  await expect(page.getByTestId('course-title')).toHaveText(
    'Ancient Egypt: Pharaohs, Pyramids, and Daily Life',
  )
  await expect(page.getByTestId('syllabus-row')).toHaveCount(10)
  await expect(page.getByTestId('material-chip')).toHaveCount(0)
  await expect(page.locator('.no-materials')).toHaveCount(10)
  await expect(page.getByTestId('viewer-default-image')).toHaveAttribute(
    'src',
    /Special:Redirect\/file\/Rosetta%20Stone/,
  )
  await expect(page.getByTestId('instructor-card')).toContainText('Dr. Leila Rahman')
})

test('unknown routes show a not-found page that links home', async ({ page }) => {
  await page.goto('/#/courses/HIST999')
  await expect(page.getByTestId('notfound')).toBeVisible()
  await expect(page.getByTestId('notfound')).toContainText('HIST999')

  await page.goto('/#/nonsense')
  await expect(page.getByTestId('notfound')).toBeVisible()

  await page.getByRole('link', { name: 'Back to the course catalog' }).click()
  await expect(page).toHaveURL(/#\/$/)
  await expect(page.getByTestId('course-card')).toHaveCount(12)
})

test('mobile viewport stacks the panes without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#/')
  const cards = page.locator('[data-testid="course-card"]')
  await expect(cards.first()).toBeVisible()
  const [first, second] = await Promise.all([
    cards.nth(0).boundingBox(),
    cards.nth(1).boundingBox(),
  ])
  expect(first.x).toBe(second.x) // single column
  expect(first.y).toBeLessThan(second.y)

  await page.goto('/#/courses/HIST111')
  await expect(page.getByTestId('syllabus-table')).toBeVisible()
  await expect(page.getByTestId('viewer-default')).toBeVisible()

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
})
