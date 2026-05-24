import { expect, test } from "@playwright/test"

test("lab index shows the featured experiment", async ({ page }) => {
  await page.goto("/")

  await expect(page.getByRole("heading", { name: "ttotti lab" })).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "motion as interface" })
  ).toBeVisible()
  await expect(page.getByTestId("empty-stage")).toBeVisible()
  await expect(page.getByRole("link", { name: /^open$/i })).toBeVisible()
})

test("experiments route renders a quiet list view", async ({ page }) => {
  await page.goto("/experiments")

  await expect(page.getByRole("heading", { name: "experiments" })).toBeVisible()
  await expect(
    page.locator("section").getByRole("link", { name: /hand particles/i })
  ).toBeVisible()
})

test("hand particles route renders before camera permission", async ({
  page,
}) => {
  await page.goto("/experiments/hand-particles")

  await expect(
    page.getByRole("heading", { name: "hand particles" })
  ).toBeVisible()
  await expect(page.getByTestId("hand-stage")).toBeVisible()
  await expect(page.getByRole("button", { name: "start camera" })).toBeVisible()
  await expect(page.getByText(/camera is off/i)).toBeVisible()
})

test("fake camera starts the hand particles route", async ({ page }) => {
  test.skip(
    test.info().project.name !== "chromium",
    "chromium fake camera only"
  )

  await page.goto("/experiments/hand-particles")
  await page.getByRole("button", { name: "start camera" }).click()

  await expect(page.getByText(/tracking fingertips/i)).toBeVisible({
    timeout: 30_000,
  })
})

test("mobile layout keeps controls reachable", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile-only layout check")

  await page.goto("/experiments/hand-particles")

  await expect(page.getByRole("button", { name: "start camera" })).toBeVisible()
  await expect(page.getByText("controls")).toBeVisible()
})
