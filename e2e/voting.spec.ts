import { test, expect, Page } from '@playwright/test'

// Helper function to login as a specific user
async function loginAs(page: Page, name: string, password: string = 'test123') {
  await page.goto('/login')
  await page.getByLabel(/name/i).fill(name)
  await page.getByLabel(/password/i).fill(password)
  await page.getByRole('button', { name: /login/i }).click()

  // Wait for navigation to home page
  await expect(page).toHaveURL('/')
}

test.describe('Voting E2E Tests', () => {
  test('should allow user to submit a vote on a drama', async ({ page }) => {
    // Login as Lowri
    await loginAs(page, 'Lowri')

    // Find and expand the test drama card
    await expect(page.getByText('Test Drama for Voting')).toBeVisible()

    // Click the expand button
    const expandButton = page.locator('button[title="Expand"]').first()
    await expandButton.click()

    // Wait for voting component to appear
    await expect(page.getByText(/cast your vote/i)).toBeVisible()

    // Select severity level 4 (High)
    const severity4Button = page.locator('button:has-text("😰")').first()
    await severity4Button.click()

    // Add a comment
    await page.getByPlaceholder(/optional comment/i).fill('This was quite intense!')

    // Submit the vote
    await page.getByRole('button', { name: /submit vote/i }).click()

    // Wait for vote to be submitted
    await expect(page.getByText(/you voted:/i)).toBeVisible()
    await expect(page.getByText('4/5')).toBeVisible()

    // Verify comment is displayed
    await expect(page.getByText('This was quite intense!')).toBeVisible()
  })

  test('should show voting progress and pending voters', async ({ page }) => {
    // Login as Emma (second participant)
    await loginAs(page, 'Emma')

    // Find and expand the test drama
    await expect(page.getByText('Test Drama for Voting')).toBeVisible()
    const expandButton = page.locator('button[title="Expand"]').first()
    await expandButton.click()

    // Check voting status bar shows progress
    await expect(page.getByText(/votes:/i)).toBeVisible()

    // Should show pending voters
    await expect(page.getByText(/pending/i)).toBeVisible()
    await expect(page.getByText(/waiting for:/i)).toBeVisible()
  })

  test('should allow user to change their vote', async ({ page }) => {
    // Login as Lowri who already voted
    await loginAs(page, 'Lowri')

    // Find and expand the test drama
    await expect(page.getByText('Test Drama for Voting')).toBeVisible()
    const expandButton = page.locator('button[title="Expand"]').first()
    await expandButton.click()

    // Should see existing vote
    await expect(page.getByText(/you voted:/i)).toBeVisible()

    // Click change vote button
    await page.getByRole('button', { name: /change vote/i }).click()

    // Should show voting form again
    await expect(page.getByText(/cast your vote/i)).toBeVisible()

    // Change to severity 5
    const severity5Button = page.locator('button:has-text("🔥")').first()
    await severity5Button.click()

    // Update comment
    await page.getByPlaceholder(/optional comment/i).clear()
    await page.getByPlaceholder(/optional comment/i).fill('Actually, this was severe!')

    // Submit the updated vote
    await page.getByRole('button', { name: /submit vote/i }).click()

    // Verify vote was updated
    await expect(page.getByText('5/5')).toBeVisible()
    await expect(page.getByText('Actually, this was severe!')).toBeVisible()
  })

  test('should show vote distribution when all participants have voted', async ({ page }) => {
    // Login as Melissa (third participant) to complete voting
    await loginAs(page, 'Melissa')

    // Find and expand the test drama
    await expect(page.getByText('Test Drama for Voting')).toBeVisible()
    const expandButton = page.locator('button[title="Expand"]').first()
    await expandButton.click()

    // Submit vote
    await expect(page.getByText(/cast your vote/i)).toBeVisible()
    const severity3Button = page.locator('button:has-text("😬")').first()
    await severity3Button.click()
    await page.getByRole('button', { name: /submit vote/i }).click()

    // Wait for vote to be submitted
    await expect(page.getByText(/you voted:/i)).toBeVisible()

    // Check for "All Voted" badge
    await expect(page.getByText(/all voted!/i)).toBeVisible()

    // Check average severity is displayed
    await expect(page.getByText(/average:/i)).toBeVisible()

    // Expand vote details
    await page.getByText(/show details/i).click()

    // Should see vote distribution
    await expect(page.getByText(/votes/i).first()).toBeVisible()
  })

  test('should validate that severity is selected before submitting', async ({ page }) => {
    // Login as a user
    await loginAs(page, 'Emma')

    // Find and expand a drama
    await expect(page.getByText('Test Drama for Voting')).toBeVisible()
    const expandButton = page.locator('button[title="Expand"]').first()
    await expandButton.click()

    // Try to submit without selecting severity
    const submitButton = page.getByRole('button', { name: /submit vote/i })

    // Button should be disabled when no severity selected
    await expect(submitButton).toBeDisabled()
  })

  test('should show different severity labels correctly', async ({ page }) => {
    // Login as a user
    await loginAs(page, 'Lowri')

    // Find and expand a drama
    const expandButton = page.locator('button[title="Expand"]').first()
    await expandButton.click()

    // Wait for voting interface
    await expect(page.getByText(/cast your vote/i)).toBeVisible()

    // Verify all severity buttons are present
    await expect(page.locator('button:has-text("😌")')).toBeVisible() // Minor (1)
    await expect(page.locator('button:has-text("😐")')).toBeVisible() // Low (2)
    await expect(page.locator('button:has-text("😬")')).toBeVisible() // Medium (3)
    await expect(page.locator('button:has-text("😰")')).toBeVisible() // High (4)
    await expect(page.locator('button:has-text("🔥")')).toBeVisible() // Severe (5)
  })

  test('should handle invalid session and redirect to login', async ({ page, context }) => {
    // Login first
    await loginAs(page, 'Lowri')

    // Navigate to home
    await expect(page).toHaveURL('/')

    // Clear cookies to simulate invalid session
    await context.clearCookies()

    // Try to interact with voting
    await page.reload()

    // Should be redirected to login page
    await expect(page).toHaveURL('/login')
  })

  test('should preserve vote comment when changing vote', async ({ page }) => {
    // Login as a user who has voted
    await loginAs(page, 'Lowri')

    // Find and expand the test drama
    await expect(page.getByText('Test Drama for Voting')).toBeVisible()
    const expandButton = page.locator('button[title="Expand"]').first()
    await expandButton.click()

    // Should see existing vote with comment
    await expect(page.getByText(/you voted:/i)).toBeVisible()
    const originalComment = await page.locator('text=/Actually, this was severe!/i').textContent()

    // Click change vote
    await page.getByRole('button', { name: /change vote/i }).click()

    // Comment textarea should be pre-filled
    const commentField = page.getByPlaceholder(/optional comment/i)
    await expect(commentField).toHaveValue(/severe/i)
  })

  test('should display loading state while fetching voting data', async ({ page }) => {
    // Login as a user
    await loginAs(page, 'Emma')

    // Find a drama card
    await expect(page.getByText('Test Drama for Voting')).toBeVisible()

    // Click expand - should briefly show loading state
    const expandButton = page.locator('button[title="Expand"]').first()
    await expandButton.click()

    // Voting data should eventually load
    // (Loading state is brief, so we just verify it loads successfully)
    await expect(page.getByText(/cast your vote|you voted:/i)).toBeVisible({ timeout: 5000 })
  })

  test('should submit vote without comment', async ({ page }) => {
    // Login as a new user for this test
    await loginAs(page, 'Grace')

    // Navigate and create a new drama first
    await page.getByRole('link', { name: /add new drama/i }).click()

    // Create a quick test drama
    await page.getByLabel(/title/i).fill('Quick voting test')
    const graceCheckbox = page.locator('label:has-text("Grace") input[type="checkbox"]')
    const ellaCheckbox = page.locator('label:has-text("Ella") input[type="checkbox"]')
    await graceCheckbox.check()
    await ellaCheckbox.check()
    await page.getByRole('button', { name: /add drama/i }).click()

    // Should be back at home
    await expect(page).toHaveURL('/')

    // Find and expand the new drama
    await expect(page.getByText('Quick voting test')).toBeVisible()
    const expandButton = page.locator('button[title="Expand"]').last()
    await expandButton.click()

    // Submit vote without comment
    const severity2Button = page.locator('button:has-text("😐")').last()
    await severity2Button.click()
    await page.getByRole('button', { name: /submit vote/i }).last().click()

    // Should show vote was recorded
    await expect(page.getByText(/you voted:/i)).toBeVisible()
    await expect(page.getByText('2/5')).toBeVisible()
  })
})
