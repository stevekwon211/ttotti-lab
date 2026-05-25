import { expect, test } from "@playwright/test"

async function expectNoVerticalOverflow(page: import("@playwright/test").Page) {
  const metrics = await page.evaluate(() => ({
    clientHeight: document.documentElement.clientHeight,
    scrollHeight: document.documentElement.scrollHeight,
  }))

  expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.clientHeight + 1)
}

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const metrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))

  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1)
}

test("lab index shows the featured experiment", async ({ page }) => {
  await page.goto("/")

  await expect(page.getByRole("heading", { name: "ttotti lab" })).toBeVisible()
  await expect(page.getByTestId("external-preview")).toBeVisible()
})

test("desktop app shells do not body-scroll", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop-only shell check")

  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1024, height: 768 },
  ]) {
    await page.setViewportSize(viewport)

    await page.goto("/")
    await expectNoVerticalOverflow(page)

    await page.goto("/hand-particles")
    await expectNoVerticalOverflow(page)

    await page.goto("/splatcarve")
    await expectNoVerticalOverflow(page)
  }
})

test("experiments routes are not product surfaces", async ({ page }) => {
  for (const route of [
    "/experiments",
    "/experiments/hand-particles",
    "/experiments/splatcarve",
  ]) {
    const response = await page.goto(route)

    expect(response?.status()).toBe(404)
    await expect(
      page.getByRole("heading", { name: "experiments" })
    ).toHaveCount(0)
  }
})

test("splatcarve route renders an external showcase", async ({ page }) => {
  await page.goto("/splatcarve")

  const showcase = page.locator("section")

  await expect(showcase.getByTestId("external-preview")).toBeVisible()
  await expect(showcase.getByRole("link")).toHaveCount(0)
  await expect(showcase.getByTestId("fallback-video")).toHaveCount(0)
})

test("hand particles route renders before camera permission", async ({
  page,
}) => {
  await page.goto("/hand-particles")

  await expect(page.getByTestId("hand-stage")).toBeVisible()
  await expect(page.getByRole("button", { name: "start camera" })).toBeVisible()
  await expect(page.getByText(/camera is off/i)).toBeVisible()
  await expect(page.getByRole("button", { name: "0.78" })).toHaveCount(0)
  await expect(page.locator("main aside")).toHaveCount(1)
  await expect(page.locator("section aside")).toHaveCount(0)
})

test("fake camera starts the hand particles route", async ({ page }) => {
  test.skip(
    test.info().project.name !== "chromium",
    "chromium fake camera only"
  )

  await page.goto("/hand-particles")
  await page.getByRole("button", { name: "start camera" }).click()

  await expect(page.getByText(/tracking fingertips/i)).toBeVisible({
    timeout: 30_000,
  })
  await expect(page.getByText("delegate")).toBeVisible()
})

test("mobile layout keeps controls reachable", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile-only layout check")

  await page.goto("/hand-particles")

  await expect(page.getByRole("button", { name: "start camera" })).toBeVisible()
  await expect(page.locator("section aside")).toHaveCount(0)
})

test("mobile routes avoid horizontal page overflow", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "mobile-only overflow check")

  for (const route of [
    "/",
    "/hand-particles",
    "/splatcarve",
  ]) {
    await page.goto(route)
    await expectNoHorizontalOverflow(page)
  }
})

test("interactive states are visible", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop hover check")

  await page.goto("/")

  const navLink = page
    .getByTestId("work-nav")
    .getByRole("link", { name: /hand particles/i })
  const navBefore = await navLink.evaluate(
    (element) => getComputedStyle(element).backgroundColor
  )

  await navLink.hover()

  const navAfter = await navLink.evaluate(
    (element) => getComputedStyle(element).backgroundColor
  )

  expect(navAfter).not.toBe(navBefore)
})
