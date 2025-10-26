import { test, expect } from '@playwright/test'

test.describe('Drama Tracker E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display home page with seeded data', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Drama Tracker' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Current Drama Board' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Add New Drama' })).toBeVisible()
  })

  test('happy path: add a new friend', async ({ page }) => {
    // Navigate to home
    await page.goto('/')

    // Fill in the add friend form
    await page.getByLabel(/friend name/i).fill('Ava')

    // Submit the form
    await page.getByRole('button', { name: /add friend/i }).click()

    // Wait for the form to be cleared (indicating success)
    await expect(page.getByLabel(/friend name/i)).toHaveValue('')

    // Go to add drama page to verify new friend appears
    await page.getByRole('link', { name: /add new drama/i }).click()

    // Check if Ava appears in the participants list
    await expect(page.getByText('Ava')).toBeVisible()
  })

  test('happy path: add a new drama', async ({ page }) => {
    // Navigate to add drama page
    await page.getByRole('link', { name: /add new drama/i }).click()

    // Fill in the form
    await page.getByLabel(/title/i).fill('Group chat meltdown')
    await page.getByLabel(/details/i).fill('Everyone was arguing about plans')

    // Select participants (Lowri and Emma from seed data)
    const lowriCheckbox = page.locator('label:has-text("Lowri") input[type="checkbox"]')
    const emmaCheckbox = page.locator('label:has-text("Emma") input[type="checkbox"]')

    await lowriCheckbox.check()
    await emmaCheckbox.check()

    // Submit the form
    await page.getByRole('button', { name: /add drama/i }).click()

    // Should be redirected to home page
    await expect(page).toHaveURL('/')

    // Verify the new drama appears
    await expect(page.getByText('Group chat meltdown')).toBeVisible()
    await expect(page.getByText('Lowri')).toBeVisible()
    await expect(page.getByText('Emma')).toBeVisible()
  })

  test('validation: cannot submit drama with only 1 participant', async ({ page }) => {
    // Navigate to add drama page
    await page.getByRole('link', { name: /add new drama/i }).click()

    // Fill in the form
    await page.getByLabel(/title/i).fill('Solo drama')

    // Select only one participant
    const lowriCheckbox = page.locator('label:has-text("Lowri") input[type="checkbox"]')
    await lowriCheckbox.check()

    // Submit button should be disabled (form is invalid)
    const submitButton = page.getByRole('button', { name: /add drama/i })
    await expect(submitButton).toBeDisabled()
  })

  test('statistics page: displays charts and metrics', async ({ page }) => {
    // Navigate to statistics page
    await page.getByRole('link', { name: /statistics/i }).click()

    // Check page loads
    await expect(page.getByRole('heading', { name: /statistics/i })).toBeVisible()

    // Check for total dramas section
    await expect(page.getByText(/total dramas/i)).toBeVisible()

    // Check for charts sections
    await expect(page.getByText(/drama involvement by person/i)).toBeVisible()
    await expect(page.getByText(/drama trends over time/i)).toBeVisible()
  })

  test('drama card: can expand and collapse', async ({ page }) => {
    // Navigate to home
    await page.goto('/')

    // Find a drama card (assuming seeded data exists)
    const dramaCards = page.locator('[class*="border-gray-200"]').filter({ hasText: 'Click to expand' })
    const firstCard = dramaCards.first()

    // Click to expand
    await firstCard.click()

    // Should show collapse text
    await expect(firstCard.getByText('Click to collapse')).toBeVisible()

    // Click to collapse
    await firstCard.click()

    // Should show expand text again
    await expect(firstCard.getByText('Click to expand')).toBeVisible()
  })

  test('validation: cannot add friend with duplicate name', async ({ page }) => {
    // Try to add a friend with a name that already exists (Lowri from seed)
    await page.getByLabel(/friend name/i).fill('Lowri')
    await page.getByRole('button', { name: /add friend/i }).click()

    // Should show error message
    await expect(page.getByText(/already exists/i)).toBeVisible()
  })

  test('navigation: can navigate between pages', async ({ page }) => {
    // Start at home
    await expect(page).toHaveURL('/')

    // Go to statistics
    await page.getByRole('link', { name: /statistics/i }).click()
    await expect(page).toHaveURL('/statistics')

    // Go back to home
    await page.getByRole('link', { name: /home/i }).click()
    await expect(page).toHaveURL('/')

    // Go to add drama
    await page.getByRole('link', { name: /add new drama/i }).click()
    await expect(page).toHaveURL('/drama/new')

    // Use back link
    await page.getByRole('link', { name: /back to home/i }).click()
    await expect(page).toHaveURL('/')
  })
})
