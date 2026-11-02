import { chromium } from '@playwright/test'
import fs from 'node:fs'

const base = 'http://127.0.0.1:5173'
const out = 'shots'
fs.mkdirSync(out, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 })
const page = await context.newPage()
const errors = []
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text())
})
page.on('pageerror', (error) => errors.push(`PAGEERROR: ${error.message}`))

await page.goto(`${base}/login`, { waitUntil: 'networkidle' })
await page.screenshot({ path: `${out}/desktop-login.png`, fullPage: true })

await page.getByText('Vào nhanh bản demo').click()
await page.waitForURL(`${base}/`)
await page.waitForTimeout(900)
await page.screenshot({ path: `${out}/desktop-dashboard.png`, fullPage: true })

const routes = [
  ['calendar', '/calendar'],
  ['bookings', '/bookings'],
  ['front-desk', '/front-desk'],
  ['rooms', '/rooms'],
  ['room-detail', '/rooms/r3'],
  ['housekeeping', '/housekeeping'],
  ['guests', '/guests'],
  ['payments', '/payments'],
  ['reports', '/reports'],
  ['settings', '/settings'],
  ['install', '/install'],
]

const overflow = []
for (const [name, route] of routes) {
  await page.goto(`${base}${route}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  const dims = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }))
  if (dims.scrollWidth > dims.innerWidth + 1) overflow.push({ route, ...dims })
  await page.screenshot({ path: `${out}/desktop-${name}.png`, fullPage: true })
}

const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const mobile = await mobileContext.newPage()
await mobile.goto(`${base}/login`, { waitUntil: 'networkidle' })
await mobile.screenshot({ path: `${out}/mobile-login.png`, fullPage: true })
await mobile.getByText('Vào nhanh bản demo').click()
await mobile.waitForURL(`${base}/`)
await mobile.waitForTimeout(800)

const mobileOverflow = []
for (const [name, route] of [['dashboard', '/'], ['calendar', '/calendar'], ['bookings', '/bookings'], ['front-desk', '/front-desk'], ['rooms', '/rooms'], ['room-detail', '/rooms/r3'], ['guests', '/guests'], ['reports', '/reports'], ['settings', '/settings'], ['install', '/install']]) {
  await mobile.goto(`${base}${route}`, { waitUntil: 'networkidle' })
  await mobile.waitForTimeout(600)
  const dims = await mobile.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }))
  if (dims.scrollWidth > dims.innerWidth + 1) mobileOverflow.push({ route, ...dims })
  await mobile.screenshot({ path: `${out}/mobile-${name}.png`, fullPage: false })
  await mobile.screenshot({ path: `${out}/mobile-${name}-full.png`, fullPage: true })
}

console.log(JSON.stringify({ errors, overflow, mobileOverflow }, null, 2))
await browser.close()
