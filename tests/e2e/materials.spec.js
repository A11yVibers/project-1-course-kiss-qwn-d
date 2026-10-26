import { expect, test } from '@playwright/test'

// Material viewer behaviour on HIST111: default course image, all four
// viewer types (pdf, video, youtube, markdown), selection state, in-place
// switching without navigation, and the back-to-image action.
//
// Branch coverage note: MaterialBody's "cannot be previewed" fallback is
// unreachable with the supplied immutable data (every course_materials.csv
// row resolves to a bundled file, an embed URL, or inline Markdown text),
// so no test exercises it without fabricating data.

const chip = (page, materialId) =>
  page.locator(`[data-testid="material-chip"][data-material-id="${materialId}"]`)

test.beforeEach(async ({ page }) => {
  await page.goto('/#/courses/HIST111')
})

test('right pane defaults to the course main image', async ({ page }) => {
  await expect(page.getByTestId('viewer-default')).toBeVisible()
  const image = page.getByTestId('viewer-default-image')
  await expect(image).toHaveAttribute('src', /Special:Redirect\/file\/A%20Caravan/)
  await expect(image).toHaveAttribute(
    'alt',
    'Course image for The Silk Roads: Trade, Religion, and Exchange',
  )
  await expect(page.getByTestId('viewer-title')).toHaveCount(0)
})

test('selecting the PDF opens it in the viewer without navigating', async ({ page }) => {
  await chip(page, 'HIST111-C01-M01').click()
  await expect(page.getByTestId('viewer-default')).toHaveCount(0)
  await expect(page.getByTestId('viewer-pdf')).toBeVisible()
  await expect(page.getByTestId('viewer-pdf')).toHaveAttribute(
    'src',
    /silk_roads_class_01_lecture[^/]*\.pdf/,
  )
  await expect(page.getByTestId('viewer-title')).toHaveText('Lecture Notes: What Were the Silk Roads?')
  await expect(page).toHaveURL(/#\/courses\/HIST111$/)
})

test('selecting the lecture video shows a native player', async ({ page }) => {
  await chip(page, 'HIST111-C01-M02').click()
  const video = page.getByTestId('viewer-video')
  await expect(video).toBeVisible()
  await expect(video).toHaveAttribute('controls', '')
  await expect(video).toHaveAttribute('src', /silk_roads_class_01_lecture[^/]*\.mp4/)
})

test('selecting the YouTube material embeds youtube-nocookie', async ({ page }) => {
  await chip(page, 'HIST111-C02-M01').click()
  await expect(page.getByTestId('viewer-youtube')).toHaveAttribute(
    'src',
    'https://www.youtube-nocookie.com/embed/vfe-eNq-Qyg',
  )
})

test('selecting the Markdown assignment renders the document', async ({ page }) => {
  await chip(page, 'HIST111-C02-M02').click()
  const doc = page.getByTestId('viewer-markdown')
  await expect(doc).toBeVisible()
  await expect(doc.locator('h1')).toHaveText('Assignment: Mapping the Silk Roads')
  await expect(doc.locator('h2').first()).toHaveText('Class')
  await expect(doc).toContainText('network rather than a single road')
  await expect(doc.locator('strong', { hasText: 'Prompt:' })).toBeVisible()
  await expect(doc.locator('ol li')).toHaveCount(4)
  await expect(doc.locator('ol li').first()).toContainText(
    'At least two examples of goods or technologies',
  )
  // The grading-criteria pipe table renders with its right-aligned column.
  const table = doc.locator('table.md-table')
  await expect(table).toBeVisible()
  await expect(table.locator('thead th').nth(1)).toHaveCSS('text-align', 'right')
  await expect(table).toContainText('Historical accuracy')
  await expect(table.locator('tbody tr').last()).toContainText('Total')
  await expect(page.getByTestId('viewer-download-link')).toHaveAttribute(
    'download',
    'silk_roads_class_02_assignment.md',
  )
})

test('switching materials never leaves the course page', async ({ page }) => {
  for (const id of [
    'HIST111-C01-M01',
    'HIST111-C01-M02',
    'HIST111-C02-M01',
    'HIST111-C02-M02',
  ]) {
    await chip(page, id).click()
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:\d+\/#\/courses\/HIST111$/)
  }
  await expect(page.getByTestId('viewer-markdown')).toBeVisible()
})

test('the selected chip keeps its active state even under the cursor', async ({ page }) => {
  const selected = chip(page, 'HIST111-C01-M01')
  await selected.click()
  await expect(selected).toHaveClass(/material-chip--active/)
  await expect(selected).toHaveAttribute('aria-pressed', 'true')
  await expect(chip(page, 'HIST111-C01-M02')).toHaveAttribute('aria-pressed', 'false')
  // Hovering must not repaint the active chip with the plain hover style
  // (regression guard for the :hover vs --active CSS specificity bug).
  await selected.hover()
  await expect(selected).toHaveCSS('background-color', 'rgb(246, 231, 196)')
  await expect(selected).toHaveCSS('border-color', 'rgb(169, 116, 31)')
})

test('back to course image restores the default view', async ({ page }) => {
  await chip(page, 'HIST111-C01-M01').click()
  await expect(page.getByTestId('viewer-pdf')).toBeVisible()
  await page.getByTestId('back-to-image').click()
  await expect(page.getByTestId('viewer-default')).toBeVisible()
  await expect(page.locator('.material-chip--active')).toHaveCount(0)
  await expect(page).toHaveURL(/#\/courses\/HIST111$/)
})
