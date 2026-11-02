import { chromium } from '@playwright/test'
import fs from 'node:fs'

const base = 'http://127.0.0.1:5173'
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
const results = []
const errors = []
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text())
})
page.on('pageerror', (error) => errors.push(`PAGEERROR: ${error.message}`))

const step = async (name, fn) => {
  try {
    await fn()
    results.push({ name, ok: true })
  } catch (error) {
    results.push({ name, ok: false, error: String(error).slice(0, 500) })
  }
}

const dateKey = (offset) => {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return date.toISOString().slice(0, 10)
}

await page.goto(`${base}/login`, { waitUntil: 'networkidle' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle' })
await page.getByText('Vào nhanh bản demo').click()
await page.waitForURL(`${base}/`)
await page.waitForTimeout(500)

const checkIn = dateKey(20)
const checkOut = dateKey(22)

await step('create booking', async () => {
  await page.goto(`${base}/bookings?new=1`, { waitUntil: 'networkidle' })
  const dialog = page.getByRole('dialog')
  await dialog.waitFor()
  await dialog.getByPlaceholder('Nguyễn Thu Hà').fill('Khách Test QA')
  await dialog.getByPlaceholder('0905 123 456').fill('0999 888 777')
  await dialog.getByPlaceholder('guest@email.com').fill('qa@atrung.demo')
  await dialog.locator('select').first().selectOption('r5')
  const dates = dialog.locator('input[type="date"]')
  await dates.nth(0).fill(checkIn)
  await dates.nth(1).fill(checkOut)
  await dialog.getByRole('button', { name: 'Tạo booking' }).click()
  await page.getByRole('heading', { name: 'Khách Test QA' }).waitFor({ timeout: 5000 })
  const store = await page.evaluate(() => localStorage.getItem('atrung-hotel-demo-v1'))
  if (!store || !store.includes('Khách Test QA')) throw new Error('Booking not persisted in store')
  await page.keyboard.press('Escape')
})

await step('edit room price', async () => {
  await page.goto(`${base}/settings`, { waitUntil: 'networkidle' })
  await page.getByRole('tab', { name: 'Phòng & giá' }).click()
  const priceInput = page.locator('input[type="number"]').first()
  await priceInput.fill('700000')
  await page.waitForTimeout(300)
  await page.reload({ waitUntil: 'networkidle' })
  await page.getByRole('tab', { name: 'Phòng & giá' }).click()
  const persisted = await page.locator('input[type="number"]').first().inputValue()
  if (persisted !== '700000') throw new Error(`Expected 700000, got ${persisted}`)
})

await step('check-in guest', async () => {
  await page.goto(`${base}/front-desk?tab=arrivals`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Check-in', exact: true }).first().click()
  await page.getByRole('button', { name: 'Xác nhận check-in' }).click()
  await page.getByText(/Đã check-in/).waitFor({ timeout: 5000 })
})

await step('check-out guest', async () => {
  await page.goto(`${base}/front-desk?tab=inhouse`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Trả phòng', exact: true }).first().click()
  await page.getByRole('button', { name: 'Xác nhận trả phòng' }).click()
  await page.getByText(/Đã trả phòng/).waitFor({ timeout: 5000 })
})

await step('record payment', async () => {
  await page.goto(`${base}/payments`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Thu tiền', exact: true }).first().click()
  await page.getByRole('button', { name: 'Ghi nhận thanh toán' }).click()
  await page.getByText(/Đã ghi nhận/).waitFor({ timeout: 5000 })
})

await step('export report csv', async () => {
  await page.goto(`${base}/reports`, { waitUntil: 'networkidle' })
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Xuất CSV' }).click()
  const download = await downloadPromise
  const path = 'shots/report-smoke.csv'
  await download.saveAs(path)
  const csv = fs.readFileSync(path, 'utf8')
  if (!csv.includes('Doanh thu') || !csv.includes('Công suất')) throw new Error('CSV content invalid')
})

await step('pwa manifest', async () => {
  const response = await page.request.get(`${base}/manifest.webmanifest`)
  if (!response.ok()) throw new Error(`manifest status ${response.status()}`)
  const manifest = await response.json()
  if (!manifest.icons?.length) throw new Error('manifest icons missing')
})

console.log(JSON.stringify({ results, errors }, null, 2))
await browser.close()
