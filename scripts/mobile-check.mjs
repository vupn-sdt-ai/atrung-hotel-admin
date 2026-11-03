import { chromium } from '@playwright/test'

const base = 'http://127.0.0.1:5173'
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
const page = await context.newPage()
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
await page.goto(`${base}/login`, { waitUntil: 'networkidle' })
await page.getByText('Vào nhanh bản demo').click()
await page.waitForURL(`${base}/`)
await page.waitForTimeout(400)

const results = {}
await page.getByRole('button', { name: 'Thêm' }).click()
await page.getByRole('heading', { name: 'Điều hướng' }).waitFor()
results.moreSheet = true
results.moreHasName = (await page.getByRole('dialog').innerText()).includes('Anh Trưng')
await page.screenshot({ path: 'shots/mobile-more-sheet.png', fullPage: false })
await page.getByRole('link', { name: 'Khách' }).click()
await page.waitForURL(`${base}/guests`)

await page.getByRole('button', { name: 'Thông báo' }).click()
results.notifications = await page.getByText('Việc cần chú ý').isVisible()
await page.keyboard.press('Escape')

await page.getByRole('button', { name: 'Tìm kiếm' }).click()
results.search = await page.getByPlaceholder(/Tìm booking/).isVisible()
await page.keyboard.press('Escape')

results.headerTop = await page.evaluate(() => {
  const header = document.querySelector('header')
  return header ? Math.round(header.getBoundingClientRect().top) : null
})
console.log(JSON.stringify({ results, errors }, null, 2))
await browser.close()
