# A Trung Homestay · Hotel Admin UI

Bản demo giao diện quản lý homestay cho **A Trung Homestay · Quy Nhơn**. Mục tiêu của giai đoạn này là một UI đẹp, responsive, cài được như app (PWA) và có đủ luồng nghiệp vụ để khách xem/chốt dự án.

> Đây là **UI demo với dữ liệu mẫu**, chưa phải PMS vận hành thật. Không có backend, không thanh toán thật, không lưu số thẻ/CVV. Dữ liệu nằm trong `localStorage` của trình duyệt.

## Demo

- Trang đăng nhập: chọn vai trò **Chủ homestay / Quản lý / Lễ tân / Buồng phòng**.
- Nút **“Vào nhanh bản demo”** mở thẳng dashboard với quyền chủ homestay.
- Mật khẩu demo: bất kỳ.
- Nút **Khôi phục dữ liệu** trong sidebar hoặc `Cài đặt → Dữ liệu demo` để reset toàn bộ.

## Phạm vi đã làm

- Dashboard: công suất, doanh thu, khách đến/đi/đang ở, trạng thái phòng, cảnh báo.
- Lịch phòng 14 ngày: timeline booking + tab **Giá & tồn**, sửa giá/đóng bán theo ngày.
- Đặt phòng: danh sách, tìm kiếm, lọc, tạo/sửa/hủy, kiểm tra trùng phòng, đặt cọc.
- Lễ tân: khách đến, đang ở, trả phòng; check-in/out; thu tiền; walk-in.
- Phòng: 7 phòng, 4 loại phòng; ảnh, tiện nghi, giá, trạng thái, sửa thông tin/giá/ảnh bìa.
- Buồng phòng: kanban Cần làm / Đang dọn / Hoàn tất, giao việc, ưu tiên.
- Khách: hồ sơ, tag, lịch sử lưu trú, chi tiêu, gọi/Zalo.
- Thanh toán: công nợ, phiếu thu, sổ quỹ, hóa đơn in A4.
- Báo cáo: doanh thu, công suất, ADR, RevPAR, nguồn khách, hiệu suất loại phòng, export CSV.
- Cài đặt: thông tin homestay, bảng giá, vai trò, PWA, reset dữ liệu.
- PWA: manifest, icon, service worker, offline app shell, trang hướng dẫn cài Android/iPhone.

### 7 phòng theo hồ sơ

| Phòng | Tầng | Loại | Giá đề xuất |
|---|---|---|---|
| P1, P2 | Tầng 1 | Garden Double | 650.000đ |
| P3, P4 | Tầng 2 | Deluxe Balcony | 950.000đ |
| P5 | Tầng 2 | Family Suite | 1.350.000đ |
| P6, P7 | Tầng tum | Terrace Suite | 1.150.000đ |

Giá, diện tích, mô tả và ảnh đều sửa được trong UI. Đây là dữ liệu mẫu, không phải số đo thi công đã chốt.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS 4
- React Router
- Zustand + localStorage
- Radix UI primitives
- Recharts
- Framer Motion
- Lucide Icons
- `vite-plugin-pwa` (Workbox)

## Chạy local

```bash
npm install
npm run dev
```

Mở `http://localhost:5173`.

Build production:

```bash
npm run build
npm run preview
```

## Kiểm thử

```bash
node scripts/screenshot.mjs   # chụp desktop/mobile + kiểm tra tràn ngang
node scripts/smoke.mjs        # tạo booking, sửa giá, check-in/out, thu tiền, export CSV
node scripts/pwa-smoke.mjs    # manifest, service worker, offline (cần npm run preview)
```

Ảnh kiểm tra nằm trong `shots/`.

## Deploy Vercel

Project đã có `vercel.json` cho SPA rewrite.

```bash
npx vercel
npx vercel --prod
```

Hoặc import repo GitHub vào Vercel, chọn framework **Vite**, build command `npm run build`, output `dist`.

PWA cần HTTPS. Vercel cung cấp HTTPS mặc định; service worker sẽ đăng ký sau lần tải đầu.

## Cấu trúc chính

```text
src/
  components/       UI, layout, booking dialogs, room editor
  data/seed.ts      dữ liệu mẫu 7 phòng + booking + payment
  lib/              format, analytics, constants
  pages/            các màn hình
  store/            Zustand store + localStorage
  types.ts
public/
  images/           ảnh phòng/hotel đã tối ưu WebP
  icons/            icon PWA
scripts/            screenshot, smoke test, tạo icon
```

## Hình ảnh

- Ảnh P3 là render 3D từ dự án (`Room3-Parametric/Furnished_02_From_balcony.png`, `Furnished_03_To_balcony.png`).
- Các ảnh còn lại là ảnh minh hoạ miễn phí từ Unsplash, dùng cho mục đích demo giao diện:
  - `photo-1611892440504-42a792e24d32`
  - `photo-1590490360182-c33d57733427`
  - `photo-1566665797739-1674de7a421a`
  - `photo-1618773928121-c32242e63f39`
  - `photo-1582719478250-c89cae4dc85b`
  - `photo-1578683010236-d716f9a3f461`
  - `photo-1551882547-ff40c63fe5fa`
  - `photo-1564501049412-61c2a3083791`
  - `photo-1584132967334-10e028bd69f7`
  - `photo-1595576508898-0ad5c879a061`
  - `photo-1631049307264-da0ec9d70304`
  - `photo-1571003123894-1f0594d2b5d9`
  - `photo-1598928506311-c55ded91a20c`
  - `photo-1522708323590-d24dbb6b0267`
  - `photo-1505693416388-ac5ce068fe85`
  - `photo-1560448204-e02f11c3d0e2`
- Ảnh stock chỉ là minh hoạ, **thay bằng ảnh thật của homestay trước khi go-live**.

## Giới hạn của bản demo

- Không có backend/auth thật; phân quyền chỉ mô phỏng ở UI.
- Không lưu thẻ/CVV; thanh toán chỉ ghi nhận phương thức.
- Hóa đơn là bản in nội bộ, chưa phải hóa đơn điện tử hợp pháp.
- Chưa có OTA/channel manager, night audit đầy đủ, loyalty, POS, khóa từ.
- PWA không lên CH Play/App Store. Khi cần store/push mạnh/in nhiệt/offline nặng mới bọc Capacitor.
- iOS cần cài thủ công qua Safari; push cần cài vào màn hình chính (iOS 16.4+).

## Roadmap gợi ý

1. Backend + database + auth thật (Postgres/Supabase).
2. Booking engine công khai cho khách.
3. Thanh toán VNPay/MoMo + hóa đơn.
4. OTA/channel manager + đối soát.
5. Night audit, báo cáo nâng cao.
6. Capacitor wrapper nếu cần CH Play/App Store.
