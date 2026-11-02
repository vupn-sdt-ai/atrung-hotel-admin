import { chromium } from '@playwright/test'

const base = 'http://127.0.0.1:4173'
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
const page = await context.newPage()
await page.goto(`${base}/login`, { waitUntil: 'networkidle' })
await page.evaluate(async () => { await navigator.serviceWorker.ready })
await page.waitForTimeout(3000)
const before = await page.evaluate(async () => ({
  controller: Boolean(navigator.serviceWorker.controller),
  caches: await caches.keys(),
  cacheEntries: await (async () => {
    const names = await caches.keys()
    const out = {}
    for (const name of names) {
      const cache = await caches.open(name)
      out[name] = (await cache.keys()).map((request) => request.url).slice(0, 10)
    }
    return out
  })(),
}))
await page.getByText('Vào nhanh bản demo').click()
await page.waitForURL(`${base}/`)
await page.waitForTimeout(1000)
const afterLogin = await page.evaluate(() => ({ controller: Boolean(navigator.serviceWorker.controller), url: location.href }))
await context.setOffline(true)
await page.reload({ waitUntil: 'domcontentloaded' }).catch((error) => console.log('reload error', String(error)))
await page.waitForTimeout(3000)
const offline = await page.evaluate(() => ({
  controller: Boolean(navigator.serviceWorker.controller),
  url: location.href,
  text: document.body.innerText.slice(0, 500),
  html: document.documentElement.outerHTML.slice(0, 500),
}))
await page.screenshot({ path: 'shots/offline.png' })
await context.setOffline(false)
console.log(JSON.stringify({ before, afterLogin, offline }, null, 2))
await browser.close()
