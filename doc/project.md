# Fashion Nails Morley Galleria - Website & Booking System

## 1. Giới thiệu tổng quan (Overview)
- **Thương hiệu**: **Fashion Nails** (Logo biểu tượng cánh chim hoàng gia vương miện vàng)
- **Địa điểm**: Morley Galleria Shopping Centre, Morley, Western Australia, WA 6062
- **Hotline**: (08) 9275 8899 / +61 8 9275 8899
- **Ưu đãi & Chương trình đặc biệt**:
  - **Gift Vouchers Available** (Phiếu quà tặng có sẵn tại quầy)
  - **Giảm 10% (10% Off)** dành cho Người cao tuổi (Seniors), Học sinh/Sinh viên (Students), và Nhân viên Morley Galleria (Morley Galleria Staff)

---

## 2. Bảng giá & Menu dịch vụ chính thức (Official Services & Pricing)

| Nhóm dịch vụ (Category) | Dịch vụ (Service Name) | Giá niêm yết (AUD) | Thời lượng ước tính |
| :--- | :--- | :---: | :---: |
| **Builder Gel - BIAB** | Natural nails | $60 | 60 phút |
| | FULL SET | $80 | 75 phút |
| | Refill | $65 | 60 phút |
| **Acrylic Nails** | FULL SET acrylic with shellac | $70 | 75 phút |
| | FULL SET Toes with shellac | $75 | 75 phút |
| | FULL SET Permanent French (white tips) | $65 | 70 phút |
| | Overlay on natural nails with shellac | $60 | 60 phút |
| | Refill acrylic with shellac | $55 | 60 phút |
| **Shellac** | Cut buff shape shellac | $35 | 35 phút |
| | Manicure shellac | $50 | 45 phút |
| | Pedicure shellac | $55 | 50 phút |
| | Manicure & pedicure shellac | $100 | 90 phút |
| **Gel X Extensions** | Natural nails | $80 | 75 phút |
| | Refill | $70 | 60 phút |
| **SNS (Dipping Powder)**| SNS on natural nails | $55 | 50 phút |
| | FULL SET SNS | $70 | 65 phút |
| **Nail Polish** | Cut buff shape nail polish | $25 | 30 phút |
| | Manicure with nail polish | $40 | 45 phút |
| | Pedicure with nail polish | $45 | 50 phút |
| | Spa pedicure & manicure with nail polish | $80 | 85 phút |
| **Extra Services** | Cat eyes (Mắt mèo) | $20 | 15 phút |
| | Chrome colours (Tráng gương) | $20 | 15 phút |
| | Air brush ombre (Phun Ombre) | $25 | 20 phút |
| | Take off & shape strengthen (Tháo móng & dưỡng định hình) | $25 | 25 phút |
| | Single nails repair (Sửa móng lẻ) | $10 | 10 phút |
| | French style by hand (Vẽ đầu móng French tay thủ công) | Từ $20 (From $20) | 20 phút |
| | Nail art & design (Vẽ nghệ thuật theo yêu cầu) | Từ $25 (From $25) | 30 phút |
| | Express manicure (Chăm sóc móng cấp tốc) | Thêm $15 (+Extra $15)| 15 phút |

---

## 3. Kiến trúc kỹ thuật (Technical Architecture)

- **Frontend**:
  - React 18 + Vite
  - Design System: Apple Human Interface Guidelines kết hợp phong cách sang trọng Luxury Gold & Noir
  - Đa ngôn ngữ: Tiếng Việt (VI) & Tiếng Anh (EN)
  - Hệ thống đặt lịch 6 bước: Chọn dịch vụ -> Chọn chuyên viên -> Chọn ngày & giờ -> Điền thông tin -> Kiểm tra -> Xác nhận & Tải lịch (.ics).
  - Tương thích Responsive hoàn hảo trên Mobile, Tablet và Desktop.

- **Backend & API**:
  - Express.js (Node.js) chạy tại cổng 5000 (`/api/bookings`, `/api/health`).
  - Lưu trữ dữ liệu: JSON file database (`server/data/bookings.json`).
  - Hỗ trợ triển khai Netlify Serverless Functions (`netlify/functions/api.js`).

---

## 4. Trải nghiệm Cuộn Storytelling Chuẩn Apple (Apple Product Storytelling)

Website trang bị hệ thống phân đoạn dẫn dắt câu chuyện điện ảnh gồm 4 chương liên hoàn:
1. **Thanh điều hướng Capsule kính mờ (Liquid Glass Capsule Nav)**: Nổi cố định (`sticky`), tự động trượt bắt vị trí cuộn qua `IntersectionObserver`, hỗ trợ người dùng nhảy nhanh tới từng chương.
2. **Chương 01 - The Sanctuary**: Ốc đảo thư giãn giữa trung tâm thương mại Morley Galleria sôi động (Chỉ số 500+ khách, 4.9★ Google).
3. **Chương 02 - The Autoclave Standard**: Vô trùng chuẩn y tế 100% (nồi hấp 134°C, bao niêm phong xé trước mắt khách, dũa mút 1 lần).
4. **Chương 03 - Master Artistry & BIAB**: Kỹ thuật nuôi móng tự nhiên dẻo dai bằng Builder Gel BIAB, Gel-X siêu nhẹ và vẽ nghệ thuật thủ công.
5. **Chương 04 - Community Privileges**: Tri ân cư dân Morley với ưu đãi 10% (Seniors/Students/Staff), Gift Vouchers và nút bấm chuyển tiếp liền mạch vào Bảng giá dịch vụ.

