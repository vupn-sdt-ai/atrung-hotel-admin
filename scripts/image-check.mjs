import { chromium } from '@playwright/test'

const base = 'http://127.0.0.1:4173'
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
await page.goto(`${base}/login`, { waitUntil: 'networkidle' })
await page.getByText('Vào nhanh bản demo').click()
await page.waitForURL(`${base}/`)
const routes = ['/', '/calendar', '/bookings', '/front-desk', '/rooms', '/rooms/r3', '/housekeeping', '/guests', '/payments', '/reports', '/settings', '/install']
const broken = []
for (const route of routes) {
  await page.goto(`${base}${route}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  const images = await page.evaluate(() => [...document.images].map((image) => ({ src: image.src, ok: image.complete && image.naturalWidth > 0 })))
  for (const image of images.filter((item) => !item.ok)) broken.push({ route, src: image.src })
}
console.log(JSON.stringify({ errors, broken, checked: routes.length }, null, 2))
await browser.close()
