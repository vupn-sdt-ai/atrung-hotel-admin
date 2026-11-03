import { chromium } from '@playwright/test'

const base = 'http://127.0.0.1:5173'
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
await page.goto(`${base}/login`, { waitUntil: 'networkidle' })
await page.getByText('Vào nhanh bản demo').click()
await page.waitForURL(`${base}/`)
await page.waitForTimeout(500)
await page.evaluate(() => {
  const raw = localStorage.getItem('atrung-hotel-demo-v1')
  if (!raw) return
  const data = JSON.parse(raw)
  data.version = 1
  data.state.session = { ...data.state.session, name: 'Nguyễn Vũ', initials: 'NV' }
  localStorage.setItem('atrung-hotel-demo-v1', JSON.stringify(data))
})
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(500)
const text = await page.locator('body').innerText()
console.log(JSON.stringify({ migratedToAnhTrung: text.includes('Anh Trưng'), stillOld: text.includes('Nguyễn Vũ') }, null, 2))
await browser.close()
