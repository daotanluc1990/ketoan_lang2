# CEO/CFO Dashboard — Data Gaps & Next Steps

> Tài liệu này ghi rõ hạng mục nào **đã xong**, **cần import data**, và **cần thiết kế storage mới**
> để hoàn tất spec tab Tổng quan CEO/CFO.

Cập nhật sau Phase 1+3+4 (commit `84ac425`).

---

## ✅ Đã xong (code đọc data có sẵn)

| # | Mục spec | Nguồn data | Ghi chú |
|---|----------|-----------|---------|
| 1 | Tổng doanh thu | `04_DATA_DOANH_THU` + `05_DATA_SO_QUY` | KpiDelta so kỳ trước |
| 2 | Lãi gộp | Tính = DT − giá vốn app − thất thoát | Biên % hiển thị trong hint |
| 3 | LN vận hành (xấp xỉ) | Lãi gộp − `chi_co_dinh_du_toan` (tab 14) | Chính xác khi tách chi phí vận hành thật |
| 4 | Biên LN vận hành | LN vận hành / DT % | Phụ thuộc #3 |
| 5 | Dòng tiền hiện tại | `cashEnding` từ sổ quỹ | |
| 6 | Dòng tiền dự kiến | `so_du_du_kien` (tab 14) | Phase 1 |
| 7 | Mức thiếu tiền dự kiến | `cong_no_can_tra_tuan_toi` (tab 14) | Phase 1 |
| 8 | Công nợ | `06_DATA_CONG_NO` no_cuoi_ky | |
| 9 | Biểu đồ doanh thu theo kênh | `revenueByChannel` | offline vs app |
| 10 | Biểu đồ dòng tiền 30 ngày | `cashbookDailyRows` | 3 line: vào/ra/ròng |
| 11 | Biểu đồ cơ cấu chi phí | `cashbookGroupRows` | theo nhóm chi |
| 12 | Biểu đồ top thất thoát NVL | `lossTop5Rows` | |
| 13 | Biểu đồ thực vs dự toán | `financeForecast` (tab 14) | Phase 3 |
| 14 | Biểu đồ dòng tiền thực/dự kiến | `cashEnding` + `financeForecast` | Phase 3, có cảnh báo thiếu tiền |
| 15 | Bảng cảnh báo đỏ (6 cột) | `generateAlerts()` | Phase 4: Mức/Nhóm/Vấn đề/Hành động/Phụ trách/Trạng thái |

---

## 🟡 Cần import data (header đã có sẵn trong Google Sheet)

### A. Chi phí nhân sự — `07_DATA_NHAN_SU_LUONG`
- **Hiện tại**: 0 dòng data
- **Header đã có** (24 cột): `luong_tam_tinh`, `thuc_nhan`, `phu_cap`, `tam_ung`, `thuong`, `phat`, `vai_tro`, `cua_hang`...
- **Cần làm**: import file lương thật (Excel bảng lương & giờ công)
- **Ảnh hưởng khi có data**:
  - Card "LN vận hành" chính xác (trừ chi nhân sự thật thay vì chi cố định dự toán)
  - Bảng "Tỷ lệ chi phí chính" có đường tỷ lệ CP nhân sự

### B. Công nợ chi tiết — `06_DATA_CONG_NO`
- **Hiện tại**: 3 dòng (migrate legacy, thiếu data NCC thật)
- **Header đã có** (20 cột): `loai_cong_no`, `doi_tuong`, `no_cuoi_ky`, `han_thanh_toan`, `trang_thai_thanh_toan`, `muc_canh_bao`...
- **Cần làm**: import file công nợ NCC thật
- **Ảnh hưởng khi có data**:
  - Card "Công nợ" hiển thị số thật
  - Có thể làm biểu đồ tuổi nợ (nếu cần bật lại)

---

## 🔴 Cần thiết kế storage mới (chưa có header/lịch sử)

### C. P&L theo tuần (lịch sử nhiều kỳ)
- **Vấn đề**: tab `14_CALC_TAI_CHINH_DU_TOAN` chỉ lưu **1 dòng snapshot** kỳ hiện tại
- **Cần làm**:
  1. Thêm cơ chế lưu snapshot cuối kỳ (weekly snapshot) — 1 dòng/tuần
  2. Khi chốt báo cáo tuần, freeze dòng vào lịch sử
- **Ảnh hưởng**: biểu đồ "Lợi nhuận quản trị" (waterfall/xu hướng P&L nhiều tuần)
- **Placeholder hiện tại**: hiển thị "Cần dữ liệu P&L theo tuần"

### D. Tỷ lệ chi phí theo tuần (CP NVL / nhân sự / bao bì)
- **Vấn đề**: `cogsPercent` chỉ tính snapshot, không lưu theo tuần
- **Cần làm**: cùng cơ chế weekly snapshot như mục C
- **Ảnh hưởng**: biểu đồ "Tỷ lệ chi phí chính" (3 đường xu hướng %)
- **Placeholder hiện tại**: hiển thị "Cần dữ liệu tỷ lệ chi phí theo tuần"

### E. Tồn kho theo tuần
- **Vấn đề**: `12_CALC_TON_KHO` chỉ 1 dòng snapshot
- **Cần làm**: weekly snapshot
- **Ảnh hưởng**: biểu đồ "Xu hướng tồn kho" (line/area phát hiện chôn vốn)

### F. Đối soát app tách theo Grab/ShopeeFood/BeFood
- **Vấn đề**: chỉ có `appFeePercent` tổng, không tách theo từng app
- **Cần làm**: thêm field `ten_app` trong `04_DATA_DOANH_THU` + import dữ liệu đối soát từng app
- **Ảnh hưởng**: biểu đồ "Chênh lệch đối soát app" theo ngày, drill-down theo app

### G. NCC tăng giá (bảng cảnh báo)
- **Vấn đề**: không có tab/field riêng
- **Cần làm**: thêm sheet `DATA_NCC_TANG_GIA` với cột: tên NCC, mặt hàng, tỷ lệ tăng, ảnh hưởng CP NVL, mức cảnh báo
- **Ảnh hưởng**: bảng cảnh báo "Nhà cung cấp tăng giá" trong spec §3 biểu đồ 10

---

## Thứ tự ưu tiên đề xuất

1. **Import file lương** (mục A) — bạn có file, import được ngay → LN vận hành chính xác + tỷ lệ CP nhân sự
2. **Import file công nợ** (mục B) — bạn có file, import được ngay → công nợ thật
3. **Weekly snapshot** (mục C+D+E) — cần dev storage, làm 1 lần cho 3 biểu đồ lịch sử
4. **Đối soát app tách** (mục F) — cần thêm field + import dữ liệu từng app
5. **NCC tăng giá** (mục G) — cần tạo sheet mới + quy trình nhập

---

## Kiểm tra nhanh

Vào tab Tổng quan CEO/CFO, kiểm 30 giây:
- [ ] 8 KPI card đầu trang hiển thị số (không "—")
- [ ] Biểu đồ doanh thu kênh có 2 cột (offline + app)
- [ ] Biểu đồ dòng tiền 30 ngày có 3 đường
- [ ] Biểu đồ thực/dự toán có 4 cột (DT thực, DT dự toán, chi biến đổi, chi cố định)
- [ ] Biểu đồ dòng tiền thực/dự kiến có 3 cột + cảnh báo thiếu tiền nếu lệch
- [ ] Bảng cảnh báo đỏ có 6 cột (Mức/Nhóm/Vấn đề/Hành động/Phụ trách/Trạng thái)
- [ ] 2 placeholder (LN quản trị + tỷ lệ chi phí) hiển thị "Cần dữ liệu theo tuần"
