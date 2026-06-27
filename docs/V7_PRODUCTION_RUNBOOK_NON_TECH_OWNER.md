# V8.4 Production Runbook cho chủ không rành kỹ thuật

Tài liệu này dùng khi đưa app kế toán Cơm Tấm Làng vào dùng thật.

## 1. Trạng thái bản hiện tại

Commit production QA mới nhất cần kiểm tra trên Vercel:

```text
f5606883347cf242342d39d874815257ce1b1656
```

Vercel project cần dùng:

```text
https://vercel.com/com-tam-lang/ketoan-lang2
```

Không dùng kết luận từ Vercel cũ `cotamlang` nếu nó báo rate-limit hoặc trỏ sai project.

## 2. Biến môi trường bắt buộc

Dữ liệu thật:

```text
DATA_STORE=google_sheets
GOOGLE_SHEET_ID=1L361UPAsaJd_VDjBrxQBwoCgnlkRceXB6C04feZYUrA
GOOGLE_CLIENT_EMAIL=<service-account-email>
GOOGLE_PRIVATE_KEY=<service-account-private-key>
```

Quyền và bảo vệ app:

```text
APP_RBAC_ENABLED=true
APP_DEFAULT_ROLE=Kế toán
APP_ALLOW_ROLE_OVERRIDE=false
```

Basic Auth nếu bật lại:

```text
APP_BASIC_AUTH_ENABLED=true
APP_USERNAME=<user>
APP_PASSWORD=<password>
```

Bot nếu dùng:

```text
TELEGRAM_BOT_TOKEN=<token>
TELEGRAM_CHAT_ID=<chat-id>
```

Không đưa file `.env`, service account JSON, key, token lên GitHub.

## 3. QA kỹ thuật trước khi live

Bộ lệnh máy dev nếu có:

```bash
npm install
npm run typecheck
npm run lint
npm run test
npm run smoke
npm run static-ui-qa
npm run synthetic-data-qa
npm run build
```

Nếu không có máy dev, dùng Vercel build làm cổng kiểm tra tối thiểu. Vercel phải báo Ready/Success.

## 4. QA Google Sheet

Google Sheet production phải có đủ các nhóm sheet:

```text
DL_DOANH_THU_APP
DL_DOANH_THU_CUA_HANG
DL_SO_QUY
DL_TON_KHO
DL_THAT_THOAT_NVL
DL_CONG_NO
DL_THU_MUA
DM_*
DL_XNT_*
DL_XUAT_BTT_CHO_CUA_HANG
DL_CUA_HANG_NHAN_TU_BTT
DL_HUY_*
DL_CHE_BIEN_THUC_TE
KQ_*
IMPORT_*
AUDIT_LOG
LICH_SU_CHOT_BAO_CAO
```

File `SoQuy_*.xlsx` phải luôn nhận là **Sổ quỹ**, không được nhận nhầm thành tồn kho/thất thoát.

File `Công nợ.xlsx` phải nhận là **Công nợ**.

File `TỒN KHO BẾP TRUNG TÂM.xlsx` phải nhận là **XNT Bếp Trung Tâm**.

File `Xuất Hủy.xlsx` phải nhận là **Hủy hàng BTT**.

## 5. Test production 15 phút

Mở app production và kiểm tra:

```text
Tổng quan kế toán
Bàn làm việc kế toán
Nhập liệu & Import
P&L Tuần
Dòng tiền Tuần
Cân đối rút gọn
Dự toán tuần tới
Kho cửa hàng
Kho Bếp Trung Tâm
Đối chiếu BTT - Cửa hàng
Hàng hủy
Hao hụt / Vượt định mức
Thất thoát tồn kho
Định mức món bán
Công nợ
Cài đặt & Bot báo cáo
Lịch sử chốt báo cáo
```

Yêu cầu:

```text
Không trang trắng
Không crash
Không dùng dữ liệu mẫu
Không hiện mô tả dài làm rối dashboard
Bảng phải scroll nội bộ
KPI phải compact
Thiếu dữ liệu chỉ hiển thị trạng thái nhỏ
```

## 6. Test import thật

Thứ tự test:

```text
1. Chọn nhiều file Excel.
2. Bấm Kiểm tra batch.
3. Chỉ bấm Import file đạt khi Lỗi = 0 và Lệch = 0.
4. Mở Google Sheet kiểm tra đúng sheet đích.
5. Mở tab báo cáo tương ứng để xem số đọc lên.
```

Bộ file tối thiểu:

```text
TỒN KHO BẾP TRUNG TÂM.xlsx
Công nợ.xlsx
Xuất Hủy.xlsx
SoQuy_*.xlsx
Doanh thu app
Doanh thu cửa hàng
Tồn kho cửa hàng
Thất thoát NVL
```

## 7. Chốt báo cáo

Chỉ chốt khi:

```text
Lỗi import = 0
Dữ liệu lệch = 0
File nhận diện đúng sheet
Các tab kho/BTT/hủy/hao hụt/thất thoát đọc được dữ liệu
CEO/Admin xem lại dashboard
```

Kế toán được preview. CEO/Admin mới được xác nhận chốt.

## 8. Rollback

Khi có lỗi production:

```text
1. Không sửa tay dữ liệu trước khi ghi nhận lỗi.
2. Chụp màn hình lỗi.
3. Ghi tên file đang import.
4. Ghi thời điểm lỗi.
5. Rollback Vercel về deployment Ready gần nhất hoặc revert commit GitHub.
6. Nếu dữ liệu đã ghi sai, dùng Hoàn tác import theo Mã lần import.
```

## 9. Khi nào được gọi là production ready

Chỉ gọi là production ready khi:

```text
Vercel build success
17 tab mở được
Import batch thật pass
Google Sheet ghi đúng sheet đích
Báo cáo đọc lại đúng dữ liệu thật
RBAC không cho sai quyền chốt báo cáo
Có audit log
Có rollback bằng Mã lần import
CEO xem được dashboard/chốt tuần
```
