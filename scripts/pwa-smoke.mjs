import { chromium } from '@playwright/test'

const base = 'http://127.0.0.1:4173'
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
const page = await context.newPage()
const errors = []
page.on('pageerror', (error) => errors.push(error.message))

await page.goto(`${base}/login`, { waitUntil: 'networkidle' })
const manifest = await page.request.get(`${base}/manifest.webmanifest`)
const manifestData = await manifest.json()
const sw = await page.request.get(`${base}/sw.js`)
const icon = await page.request.get(`${base}/icons/icon-192.png`)

const registration = await page.evaluate(async () => {
  if (!('serviceWorker' in navigator)) return { supported: false }
  const reg = await navigator.serviceWorker.ready
  return { supported: true, scope: reg.scope, active: Boolean(reg.active) }
})

await page.getByText('Vào nhanh bản demo').click()
await page.waitForURL(`${base}/`)
await page.waitForTimeout(1500)
const heading = await page.getByRole('heading').first().textContent()

await context.setOffline(true)
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1000)
const offlineHeading = await page.locator('body').innerText()
await context.setOffline(false)

console.log(JSON.stringify({
  manifestStatus: manifest.status(),
  manifestName: manifestData.name,
  icons: manifestData.icons?.length,
  swStatus: sw.status(),
  swContentType: sw.headers()['content-type'],
  iconStatus: icon.status(),
  registration,
  heading,
  offlineHasContent: offlineHeading.includes('A TRUNG') || offlineHeading.includes('Đăng nhập') || offlineHeading.includes('Tổng quan'),
  errors,
}, null, 2))
await browser.close()
