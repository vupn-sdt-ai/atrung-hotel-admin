import { chromium } from '@playwright/test'
import fs from 'node:fs'

const base = 'https://atrung-hotel-admin.vercel.app'
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
const errors = []
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text())
})
page.on('pageerror', (error) => errors.push(`PAGEERROR: ${error.message}`))

await page.goto(`${base}/login`, { waitUntil: 'networkidle' })
const loginTitle = await page.getByRole('heading', { name: 'Đăng nhập quản lý' }).textContent()
await page.screenshot({ path: 'shots/vercel-login.png', fullPage: true })
await page.getByText('Vào nhanh bản demo').click()
await page.waitForURL(`${base}/`)
await page.waitForTimeout(1200)
const dashboardTitle = await page.getByRole('heading').first().textContent()
await page.screenshot({ path: 'shots/vercel-dashboard.png', fullPage: true })

const routes = ['/calendar', '/bookings', '/front-desk', '/rooms', '/rooms/r3', '/housekeeping', '/guests', '/payments', '/reports', '/settings', '/install']
const routeResults = []
for (const route of routes) {
  const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(300)
  const images = await page.evaluate(() => [...document.images].map((image) => ({ src: image.src, ok: image.complete && image.naturalWidth > 0 })))
  routeResults.push({ route, status: response?.status(), brokenImages: images.filter((image) => !image.ok).length })
}

const manifestResponse = await page.request.get(`${base}/manifest.webmanifest`)
const manifest = await manifestResponse.json()
const swResponse = await page.request.get(`${base}/sw.js`)
const registration = await page.evaluate(async () => {
  if (!('serviceWorker' in navigator)) return { supported: false }
  const reg = await navigator.serviceWorker.ready
  return { supported: true, active: Boolean(reg.active), scope: reg.scope }
})

const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
const mobile = await mobileContext.newPage()
await mobile.goto(`${base}/login`, { waitUntil: 'networkidle' })
await mobile.getByText('Vào nhanh bản demo').click()
await mobile.waitForURL(`${base}/`)
await mobile.waitForTimeout(800)
await mobile.screenshot({ path: 'shots/vercel-mobile-dashboard.png', fullPage: false })
const mobileOverflow = await mobile.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }))

console.log(JSON.stringify({
  loginTitle,
  dashboardTitle,
  routeResults,
  manifest: { status: manifestResponse.status(), name: manifest.name, icons: manifest.icons?.length },
  sw: { status: swResponse.status(), contentType: swResponse.headers()['content-type'] },
  registration,
  mobileOverflow,
  errors,
}, null, 2))
fs.writeFileSync('shots/vercel-verify.json', JSON.stringify({ loginTitle, dashboardTitle, routeResults, registration, mobileOverflow, errors }, null, 2))
await browser.close()
