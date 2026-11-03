import { chromium } from '@playwright/test'

const base = process.env.BASE_URL || 'http://127.0.0.1:5173'
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
await page.goto(`${base}/login`, { waitUntil: 'networkidle' })
await page.getByText('Vào nhanh bản demo').click()
await page.waitForURL(`${base}/`)
await page.goto(`${base}/calendar`, { waitUntil: 'networkidle' })

const bookingChip = page.locator('button[title*="Sophie"]').first()
await bookingChip.click()
await page.getByRole('heading', { name: 'Chi tiết đặt phòng' }).waitFor()
const modalText = await page.getByRole('dialog').innerText()
await page.screenshot({ path: 'shots/calendar-booking-modal.png', fullPage: false })
await page.keyboard.press('Escape')

const emptyCell = page.getByLabel(/Đặt P6 ngày 2026-11-06/)
await emptyCell.click()
await page.getByRole('heading', { name: 'Đặt phòng mới' }).waitFor()
const formVisible = await page.getByRole('dialog').isVisible()
await page.keyboard.press('Escape')

console.log(JSON.stringify({
  modalHasGuest: modalText.includes('Sophie Martin'),
  modalHasPayment: modalText.includes('Thanh toán'),
  formVisible,
  errors,
}, null, 2))
await browser.close()
