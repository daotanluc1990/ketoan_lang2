# Rà soát KPI V1 theo cấu trúc web

Nguồn: pasted-text.txt do user cung cấp.

Quy ước:
- `Đã có`: app đã có KPI/card/spec/bảng đúng tên hoặc tương đương rõ.
- `Chưa có`: chưa có chỉ số riêng theo đúng tên V1.
- `Bổ sung`: nên thêm vào web theo module tương ứng.
- `Không thêm`: không nên thêm thành KPI card; giữ dạng bảng chi tiết, top list, rule cảnh báo hoặc drill-down.

## Tóm tắt

| Nhóm | Tổng KPI V1 | Đã có | Chưa có | Bổ sung | Không thêm |
|---|---:|---:|---:|---:|---:|
| Nhóm doanh thu | 14 | 7 | 7 | 7 | 0 |
| Nhóm tiền và đối soát | 12 | 3 | 9 | 9 | 0 |
| Nhóm chi phí | 15 | 6 | 9 | 9 | 0 |
| Nhóm lợi nhuận quản trị | 12 | 6 | 6 | 6 | 0 |
| Nhóm tồn kho | 15 | 12 | 3 | 3 | 8 |
| Nhóm hàng hủy / hư | 8 | 2 | 6 | 4 | 4 |
| Nhóm công thức / định mức / hao hụt | 11 | 9 | 2 | 0 | 9 |
| Nhóm thất thoát tồn kho | 8 | 4 | 4 | 2 | 4 |
| Nhóm công nợ và nhà cung cấp | 11 | 7 | 4 | 4 | 0 |
| Nhóm nhân sự và lương | 17 | 8 | 9 | 9 | 0 |
| Nhóm Data Quality / Import | 14 | 11 | 3 | 1 | 8 |
| Nhóm nhiệm vụ kế toán | 12 | 9 | 3 | 2 | 8 |
| Nhóm báo cáo ngày / tuần / tháng | 12 | 4 | 8 | 8 | 1 |
| Nhóm dự toán | 11 | 4 | 7 | 7 | 0 |
| Nhóm cảnh báo tự động | 17 | 8 | 9 | 9 | 0 |

**Tổng cộng:** 189 KPI/rule V1; đã có 100; chưa có tên riêng 89; nên bổ sung 80; không thêm thành KPI card 42.

## Nhóm doanh thu

| KPI V1 | Đơn vị | Chu kỳ | Đã có | Chưa có | Bổ sung | Không thêm | Vị trí web đúng | Ghi chú |
|---|---|---|:---:|:---:|:---:|:---:|---|---|
| Tổng doanh thu | VND | Ngày / Tuần / Tháng | x |  |  |  | /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang | Đã nằm trong CEO 30 KPI lõi và đọc từ 15_DASHBOARD_REPORT/fallback catalog. |
| Doanh thu offline | VND | Ngày / Tuần / Tháng | x |  |  |  | /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang | Đã nằm trong CEO 30 KPI lõi và đọc từ 15_DASHBOARD_REPORT/fallback catalog. |
| Doanh thu Grab | VND | Ngày / Tuần / Tháng |  | x | x |  | /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang | Nên bổ sung vào /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang với công thức/ngưỡng riêng. |
| Doanh thu ShopeeFood | VND | Ngày / Tuần / Tháng |  | x | x |  | /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang | Nên bổ sung vào /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang với công thức/ngưỡng riêng. |
| Doanh thu BeFood | VND | Ngày / Tuần / Tháng |  | x | x |  | /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang | Nên bổ sung vào /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang với công thức/ngưỡng riêng. |
| Doanh thu tiền mặt | VND | Ngày | x |  |  |  | /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang | Đã có trong module hoặc bảng/spec hiện tại. |
| Doanh thu chuyển khoản | VND | Ngày | x |  |  |  | /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang | Đã có trong module hoặc bảng/spec hiện tại. |
| Doanh thu app food | VND | Ngày / Tuần | x |  |  |  | /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang | Đã nằm trong CEO 30 KPI lõi và đọc từ 15_DASHBOARD_REPORT/fallback catalog. |
| Số đơn hàng | đơn | Ngày / Tuần / Tháng | x |  |  |  | /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang | Đã có trong module hoặc bảng/spec hiện tại. |
| Số phần bán | phần / món | Ngày / Tuần |  | x | x |  | /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang | Nên bổ sung vào /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang với công thức/ngưỡng riêng. |
| Giá trị đơn trung bình | VND/đơn | Ngày / Tuần | x |  |  |  | /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang | Đã nằm trong CEO 30 KPI lõi và đọc từ 15_DASHBOARD_REPORT/fallback catalog. |
| Doanh thu bình quân mỗi phần | VND/phần | Ngày / Tuần |  | x | x |  | /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang | Nên bổ sung vào /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang với công thức/ngưỡng riêng. |
| Tỷ trọng doanh thu app | % | Tuần / Tháng |  | x | x |  | /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang | Nên bổ sung vào /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang với công thức/ngưỡng riêng. |
| Tỷ trọng doanh thu offline | % | Tuần / Tháng |  | x | x |  | /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang | Nên bổ sung vào /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang với công thức/ngưỡng riêng. |

## Nhóm tiền và đối soát

| KPI V1 | Đơn vị | Chu kỳ | Đã có | Chưa có | Bổ sung | Không thêm | Vị trí web đúng | Ghi chú |
|---|---|---|:---:|:---:|:---:|:---:|---|---|
| Tiền mặt đầu ca | VND | Ngày / Ca |  | x | x |  | /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang, /tai-chinh/dong-tien | Nên bổ sung vào /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang, /tai-chinh/dong-tien với công thức/ngưỡng riêng. |
| Tiền mặt thu trong ca | VND | Ngày / Ca |  | x | x |  | /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang, /tai-chinh/dong-tien | Nên bổ sung vào /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang, /tai-chinh/dong-tien với công thức/ngưỡng riêng. |
| Tiền mặt chi trong ca | VND | Ngày / Ca |  | x | x |  | /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang, /tai-chinh/dong-tien | Nên bổ sung vào /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang, /tai-chinh/dong-tien với công thức/ngưỡng riêng. |
| Tiền mặt cuối ca hệ thống | VND | Ngày / Ca |  | x | x |  | /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang, /tai-chinh/dong-tien | Nên bổ sung vào /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang, /tai-chinh/dong-tien với công thức/ngưỡng riêng. |
| Tiền mặt thực đếm | VND | Ngày / Ca |  | x | x |  | /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang, /tai-chinh/dong-tien | Nên bổ sung vào /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang, /tai-chinh/dong-tien với công thức/ngưỡng riêng. |
| Chênh lệch tiền mặt | VND | Ngày | x |  |  |  | /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang, /tai-chinh/dong-tien | Đã nằm trong CEO 30 KPI lõi và đọc từ 15_DASHBOARD_REPORT/fallback catalog. |
| Tiền chuyển khoản | VND | Ngày |  | x | x |  | /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang, /tai-chinh/dong-tien | Nên bổ sung vào /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang, /tai-chinh/dong-tien với công thức/ngưỡng riêng. |
| Chuyển khoản chưa xác định | VND | Ngày |  | x | x |  | /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang, /tai-chinh/dong-tien | Nên bổ sung vào /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang, /tai-chinh/dong-tien với công thức/ngưỡng riêng. |
| Tiền app đã về | VND | Ngày / Tuần |  | x | x |  | /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang, /tai-chinh/dong-tien | Nên bổ sung vào /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang, /tai-chinh/dong-tien với công thức/ngưỡng riêng. |
| Tiền app chưa về | VND | Ngày / Tuần | x |  |  |  | /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang, /tai-chinh/dong-tien | Đã nằm trong CEO 30 KPI lõi và đọc từ 15_DASHBOARD_REPORT/fallback catalog. |
| Chênh lệch đối soát app | VND | Tuần |  | x | x |  | /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang, /tai-chinh/dong-tien | Nên bổ sung vào /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang, /tai-chinh/dong-tien với công thức/ngưỡng riêng. |
| Số ngày tiền app chưa về | ngày | Tuần | x |  |  |  | /doanh-thu/tien-mat, /doanh-thu/chuyen-khoan, /doanh-thu/app-giao-hang, /tai-chinh/dong-tien | Đã nằm trong CEO 30 KPI lõi và đọc từ 15_DASHBOARD_REPORT/fallback catalog. |

## Nhóm chi phí

| KPI V1 | Đơn vị | Chu kỳ | Đã có | Chưa có | Bổ sung | Không thêm | Vị trí web đúng | Ghi chú |
|---|---|---|:---:|:---:|:---:|:---:|---|---|
| Tổng chi phí | VND | Ngày / Tuần / Tháng | x |  |  |  | /tai-chinh/dong-tien, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang | Đã có trong module hoặc bảng/spec hiện tại. |
| Chi phí nguyên liệu | VND | Tuần / Tháng |  | x | x |  | /tai-chinh/dong-tien, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang | Nên bổ sung vào /tai-chinh/dong-tien, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang với công thức/ngưỡng riêng. |
| Chi phí bao bì | VND | Tuần / Tháng |  | x | x |  | /tai-chinh/dong-tien, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang | Nên bổ sung vào /tai-chinh/dong-tien, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang với công thức/ngưỡng riêng. |
| Chi phí nhân sự | VND | Tuần / Tháng | x |  |  |  | /tai-chinh/dong-tien, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang | Đã có trong module hoặc bảng/spec hiện tại. |
| Chi phí mặt bằng | VND | Tháng | x |  |  |  | /tai-chinh/dong-tien, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang | Đã có trong module hoặc bảng/spec hiện tại. |
| Chi phí điện nước gas | VND | Tuần / Tháng | x |  |  |  | /tai-chinh/dong-tien, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang | Đã có trong module hoặc bảng/spec hiện tại. |
| Chi phí marketing | VND | Tuần / Tháng |  | x | x |  | /tai-chinh/dong-tien, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang | Nên bổ sung vào /tai-chinh/dong-tien, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang với công thức/ngưỡng riêng. |
| Chi phí sửa chữa bảo trì | VND | Tuần / Tháng |  | x | x |  | /tai-chinh/dong-tien, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang | Nên bổ sung vào /tai-chinh/dong-tien, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang với công thức/ngưỡng riêng. |
| Chi phí hao hụt / hủy hàng | VND | Ngày / Tuần / Tháng |  | x | x |  | /tai-chinh/dong-tien, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang | Nên bổ sung vào /tai-chinh/dong-tien, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang với công thức/ngưỡng riêng. |
| Chi phí khác | VND | Ngày / Tuần | x |  |  |  | /tai-chinh/dong-tien, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang | Đã có trong module hoặc bảng/spec hiện tại. |
| Chi chưa phân loại | VND | Ngày / Tuần | x |  |  |  | /tai-chinh/dong-tien, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang | Đã nằm trong CEO 30 KPI lõi và đọc từ 15_DASHBOARD_REPORT/fallback catalog. |
| Tỷ lệ chi phí nguyên liệu | % | Tuần / Tháng |  | x | x |  | /tai-chinh/dong-tien, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang | Nên bổ sung vào /tai-chinh/dong-tien, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang với công thức/ngưỡng riêng. |
| Tỷ lệ chi phí nhân sự | % | Tuần / Tháng |  | x | x |  | /tai-chinh/dong-tien, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang | Nên bổ sung vào /tai-chinh/dong-tien, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang với công thức/ngưỡng riêng. |
| Tỷ lệ bao bì | % | Tuần / Tháng |  | x | x |  | /tai-chinh/dong-tien, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang | Nên bổ sung vào /tai-chinh/dong-tien, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang với công thức/ngưỡng riêng. |
| Tỷ lệ tổng chi phí | % | Tuần / Tháng |  | x | x |  | /tai-chinh/dong-tien, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang | Nên bổ sung vào /tai-chinh/dong-tien, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang với công thức/ngưỡng riêng. |

## Nhóm lợi nhuận quản trị

| KPI V1 | Đơn vị | Chu kỳ | Đã có | Chưa có | Bổ sung | Không thêm | Vị trí web đúng | Ghi chú |
|---|---|---|:---:|:---:|:---:|:---:|---|---|
| Lãi gộp | VND | Tuần / Tháng | x |  |  |  | /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /pl-tuan | Đã có trong module hoặc bảng/spec hiện tại. |
| Biên lợi nhuận gộp | % | Tuần / Tháng |  | x | x |  | /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /pl-tuan | Nên bổ sung vào /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /pl-tuan với công thức/ngưỡng riêng. |
| Lợi nhuận vận hành | VND | Tuần / Tháng | x |  |  |  | /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /pl-tuan | Đã có trong module hoặc bảng/spec hiện tại. |
| Biên lợi nhuận vận hành | % | Tuần / Tháng |  | x | x |  | /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /pl-tuan | Nên bổ sung vào /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /pl-tuan với công thức/ngưỡng riêng. |
| Lợi nhuận tạm tính | VND | Ngày / Tuần / Tháng | x |  |  |  | /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /pl-tuan | Đã nằm trong CEO 30 KPI lõi và đọc từ 15_DASHBOARD_REPORT/fallback catalog. |
| Biên lợi nhuận tạm tính | % | Tuần / Tháng |  | x | x |  | /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /pl-tuan | Nên bổ sung vào /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /pl-tuan với công thức/ngưỡng riêng. |
| Doanh thu hòa vốn | VND | Tháng |  | x | x |  | /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /pl-tuan | Nên bổ sung vào /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /pl-tuan với công thức/ngưỡng riêng. |
| Lợi nhuận / ngày | VND/ngày | Ngày / Tuần |  | x | x |  | /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /pl-tuan | Nên bổ sung vào /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /pl-tuan với công thức/ngưỡng riêng. |
| Lợi nhuận / đơn | VND/đơn | Tuần / Tháng | x |  |  |  | /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /pl-tuan | Đã có trong module hoặc bảng/spec hiện tại. |
| Lợi nhuận / phần | VND/phần | Tuần / Tháng |  | x | x |  | /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /pl-tuan | Nên bổ sung vào /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /pl-tuan với công thức/ngưỡng riêng. |
| Food cost tạm tính | % | Ngày / Tuần / Tháng | x |  |  |  | /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /pl-tuan | Đã nằm trong CEO 30 KPI lõi và đọc từ 15_DASHBOARD_REPORT/fallback catalog. |
| Labor cost tạm tính | % | Tuần / Tháng | x |  |  |  | /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /pl-tuan | Đã nằm trong CEO 30 KPI lõi và đọc từ 15_DASHBOARD_REPORT/fallback catalog. |

## Nhóm tồn kho

| KPI V1 | Đơn vị | Chu kỳ | Đã có | Chưa có | Bổ sung | Không thêm | Vị trí web đúng | Ghi chú |
|---|---|---|:---:|:---:|:---:|:---:|---|---|
| Tồn đầu kỳ | kg / g / lít / ml / cái / phần | Ngày / Tuần / Tháng | x |  |  | x | /kho-cua-hang/ton-kho, /kho-bep-trung-tam/ton-kho-hao-hut | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |
| Nhập trong kỳ | kg / g / lít / ml / cái / phần | Ngày / Tuần | x |  |  | x | /kho-cua-hang/ton-kho, /kho-bep-trung-tam/ton-kho-hao-hut | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |
| Nhập từ BTT | kg / g / lít / ml / cái / phần | Ngày / Tuần | x |  |  | x | /kho-cua-hang/ton-kho, /kho-bep-trung-tam/ton-kho-hao-hut | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |
| Nhập NCC | kg / g / lít / ml / cái / phần | Ngày / Tuần | x |  |  | x | /kho-cua-hang/ton-kho, /kho-bep-trung-tam/ton-kho-hao-hut | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |
| Xuất BTT cho cửa hàng | kg / g / lít / ml / cái / phần | Ngày / Tuần | x |  |  | x | /kho-cua-hang/ton-kho, /kho-bep-trung-tam/ton-kho-hao-hut | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |
| Xuất bán theo định mức | kg / g / lít / ml / cái / phần | Ngày / Tuần | x |  |  | x | /kho-cua-hang/ton-kho, /kho-bep-trung-tam/ton-kho-hao-hut | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |
| Tồn lý thuyết | kg / g / lít / ml / cái / phần | Ngày / Tuần | x |  |  | x | /kho-cua-hang/ton-kho, /kho-bep-trung-tam/ton-kho-hao-hut | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |
| Tồn cuối thực tế | kg / g / lít / ml / cái / phần | Ngày / Tuần | x |  |  | x | /kho-cua-hang/ton-kho, /kho-bep-trung-tam/ton-kho-hao-hut | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |
| Chênh lệch tồn kho | kg / g / lít / ml / cái / phần | Ngày / Tuần | x |  |  |  | /kho-cua-hang/ton-kho, /kho-bep-trung-tam/ton-kho-hao-hut | Đã có trong module hoặc bảng/spec hiện tại. |
| Giá trị lệch tồn | VND | Ngày / Tuần | x |  |  |  | /kho-cua-hang/ton-kho, /kho-bep-trung-tam/ton-kho-hao-hut | Đã có trong module hoặc bảng/spec hiện tại. |
| Tồn âm | kg / g / lít / ml / cái / phần / VND | Ngày / Tuần | x |  |  |  | /kho-cua-hang/ton-kho, /kho-bep-trung-tam/ton-kho-hao-hut | Đã nằm trong CEO 30 KPI lõi và đọc từ 15_DASHBOARD_REPORT/fallback catalog. |
| Giá trị tồn kho | VND | Tuần / Tháng | x |  |  |  | /kho-cua-hang/ton-kho, /kho-bep-trung-tam/ton-kho-hao-hut | Đã nằm trong CEO 30 KPI lõi và đọc từ 15_DASHBOARD_REPORT/fallback catalog. |
| Số ngày tồn kho | ngày | Tuần |  | x | x |  | /kho-cua-hang/ton-kho, /kho-bep-trung-tam/ton-kho-hao-hut | Nên bổ sung vào /kho-cua-hang/ton-kho, /kho-bep-trung-tam/ton-kho-hao-hut với công thức/ngưỡng riêng. |
| Hàng sắp hết | kg / g / lít / ml / cái / ngày tồn | Ngày / Tuần |  | x | x |  | /kho-cua-hang/ton-kho, /kho-bep-trung-tam/ton-kho-hao-hut | Nên bổ sung vào /kho-cua-hang/ton-kho, /kho-bep-trung-tam/ton-kho-hao-hut với công thức/ngưỡng riêng. |
| Hàng tồn quá lâu | ngày | Tuần / Tháng |  | x | x |  | /kho-cua-hang/ton-kho, /kho-bep-trung-tam/ton-kho-hao-hut | Nên bổ sung vào /kho-cua-hang/ton-kho, /kho-bep-trung-tam/ton-kho-hao-hut với công thức/ngưỡng riêng. |

## Nhóm hàng hủy / hư

| KPI V1 | Đơn vị | Chu kỳ | Đã có | Chưa có | Bổ sung | Không thêm | Vị trí web đúng | Ghi chú |
|---|---|---|:---:|:---:|:---:|:---:|---|---|
| Số lượng hàng hủy cửa hàng | kg / g / lít / ml / cái / phần | Ngày / Tuần | x |  |  | x | /kho-cua-hang/hang-huy-hu, /hang-huy | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |
| Số lượng hàng hủy BTT | kg / g / lít / ml / cái / phần | Ngày / Tuần | x |  |  | x | /kho-cua-hang/hang-huy-hu, /hang-huy | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |
| Giá trị hàng hủy / hư | VND | Ngày / Tuần / Tháng |  | x | x |  | /kho-cua-hang/hang-huy-hu, /hang-huy | Nên bổ sung vào /kho-cua-hang/hang-huy-hu, /hang-huy với công thức/ngưỡng riêng. |
| Tỷ lệ hủy | % | Tuần / Tháng |  | x | x |  | /kho-cua-hang/hang-huy-hu, /hang-huy | Nên bổ sung vào /kho-cua-hang/hang-huy-hu, /hang-huy với công thức/ngưỡng riêng. |
| Hàng hủy không chứng từ | dòng / vụ việc | Ngày / Tuần |  | x | x |  | /kho-cua-hang/hang-huy-hu, /hang-huy | Nên bổ sung vào /kho-cua-hang/hang-huy-hu, /hang-huy với công thức/ngưỡng riêng. |
| Hàng hủy cần giải trình | dòng / vụ việc | Ngày / Tuần |  | x | x |  | /kho-cua-hang/hang-huy-hu, /hang-huy | Nên bổ sung vào /kho-cua-hang/hang-huy-hu, /hang-huy với công thức/ngưỡng riêng. |
| Hàng hủy theo lý do | kg / phần / VND | Tuần / Tháng |  | x |  | x | /kho-cua-hang/hang-huy-hu, /hang-huy | Không thêm thành KPI card; nếu cần thì giữ dưới dạng cột bảng, top list hoặc drill-down. |
| Hàng hủy theo người phụ trách | VND / vụ việc | Tuần / Tháng |  | x |  | x | /kho-cua-hang/hang-huy-hu, /hang-huy | Không thêm thành KPI card; nếu cần thì giữ dưới dạng cột bảng, top list hoặc drill-down. |

## Nhóm công thức / định mức / hao hụt

| KPI V1 | Đơn vị | Chu kỳ | Đã có | Chưa có | Bổ sung | Không thêm | Vị trí web đúng | Ghi chú |
|---|---|---|:---:|:---:|:---:|:---:|---|---|
| Định mức nguyên liệu / món | g/phần, ml/phần, cái/phần | Khi cập nhật | x |  |  | x | /kho-cua-hang/cong-thuc-dinh-muc, /hao-hut-vuot-dinh-muc | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |
| Số lượng món bán | phần / ly / miếng / chai | Ngày / Tuần | x |  |  | x | /kho-cua-hang/cong-thuc-dinh-muc, /hao-hut-vuot-dinh-muc | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |
| Nguyên liệu đáng lẽ dùng | kg / g / lít / ml / cái | Ngày / Tuần | x |  |  | x | /kho-cua-hang/cong-thuc-dinh-muc, /hao-hut-vuot-dinh-muc | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |
| Hao hụt hợp lệ | % | Khi cập nhật | x |  |  | x | /kho-cua-hang/cong-thuc-dinh-muc, /hao-hut-vuot-dinh-muc | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |
| Nguyên liệu được phép dùng | kg / g / lít / ml / cái | Ngày / Tuần | x |  |  | x | /kho-cua-hang/cong-thuc-dinh-muc, /hao-hut-vuot-dinh-muc | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |
| Nguyên liệu thực tế đã dùng | kg / g / lít / ml / cái | Ngày / Tuần | x |  |  | x | /kho-cua-hang/cong-thuc-dinh-muc, /hao-hut-vuot-dinh-muc | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |
| Vượt định mức số lượng | kg / g / lít / ml / cái | Ngày / Tuần | x |  |  | x | /kho-cua-hang/cong-thuc-dinh-muc, /hao-hut-vuot-dinh-muc | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |
| Tỷ lệ vượt định mức | % | Ngày / Tuần | x |  |  |  | /kho-cua-hang/cong-thuc-dinh-muc, /hao-hut-vuot-dinh-muc | Đã nằm trong CEO 30 KPI lõi và đọc từ 15_DASHBOARD_REPORT/fallback catalog. |
| Giá trị vượt định mức | VND | Ngày / Tuần / Tháng | x |  |  |  | /kho-cua-hang/cong-thuc-dinh-muc, /hao-hut-vuot-dinh-muc | Đã nằm trong CEO 30 KPI lõi và đọc từ 15_DASHBOARD_REPORT/fallback catalog. |
| Top món dùng quá tay | món + VND | Tuần / Tháng |  | x |  | x | /kho-cua-hang/cong-thuc-dinh-muc, /hao-hut-vuot-dinh-muc | Không thêm thành KPI card; nếu cần thì giữ dưới dạng cột bảng, top list hoặc drill-down. |
| Top NVL vượt định mức | NVL + VND | Tuần / Tháng |  | x |  | x | /kho-cua-hang/cong-thuc-dinh-muc, /hao-hut-vuot-dinh-muc | Không thêm thành KPI card; nếu cần thì giữ dưới dạng cột bảng, top list hoặc drill-down. |

## Nhóm thất thoát tồn kho

| KPI V1 | Đơn vị | Chu kỳ | Đã có | Chưa có | Bổ sung | Không thêm | Vị trí web đúng | Ghi chú |
|---|---|---|:---:|:---:|:---:|:---:|---|---|
| Thiếu kho | kg / g / lít / ml / cái / phần | Ngày / Tuần | x |  |  | x | /that-thoat-ton-kho, /that-thoat-chi-tiet | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |
| Dư kho | kg / g / lít / ml / cái / phần | Ngày / Tuần | x |  |  | x | /that-thoat-ton-kho, /that-thoat-chi-tiet | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |
| Giá trị thất thoát tồn kho | VND | Ngày / Tuần / Tháng | x |  |  |  | /that-thoat-ton-kho, /that-thoat-chi-tiet | Đã nằm trong CEO 30 KPI lõi và đọc từ 15_DASHBOARD_REPORT/fallback catalog. |
| Tỷ lệ thất thoát tồn kho | % | Tuần / Tháng | x |  |  |  | /that-thoat-ton-kho, /that-thoat-chi-tiet | Đã có trong module hoặc bảng/spec hiện tại. |
| Hàng thiếu không rõ lý do | kg / cái / VND | Ngày / Tuần |  | x | x |  | /that-thoat-ton-kho, /that-thoat-chi-tiet | Nên bổ sung vào /that-thoat-ton-kho, /that-thoat-chi-tiet với công thức/ngưỡng riêng. |
| Hàng dư bất thường | kg / cái / VND | Ngày / Tuần |  | x | x |  | /that-thoat-ton-kho, /that-thoat-chi-tiet | Nên bổ sung vào /that-thoat-ton-kho, /that-thoat-chi-tiet với công thức/ngưỡng riêng. |
| Top NVL thất thoát | NVL + VND | Tuần / Tháng |  | x |  | x | /that-thoat-ton-kho, /that-thoat-chi-tiet | Không thêm thành KPI card; nếu cần thì giữ dưới dạng cột bảng, top list hoặc drill-down. |
| Top kho/cửa hàng thất thoát | Kho/cửa hàng + VND | Tuần / Tháng |  | x |  | x | /that-thoat-ton-kho, /that-thoat-chi-tiet | Không thêm thành KPI card; nếu cần thì giữ dưới dạng cột bảng, top list hoặc drill-down. |

## Nhóm công nợ và nhà cung cấp

| KPI V1 | Đơn vị | Chu kỳ | Đã có | Chưa có | Bổ sung | Không thêm | Vị trí web đúng | Ghi chú |
|---|---|---|:---:|:---:|:---:|:---:|---|---|
| Công nợ phải trả NCC | VND | Ngày / Tuần / Tháng | x |  |  |  | /cong-no, /kho-bep-trung-tam/nhap-ncc | Đã có trong module hoặc bảng/spec hiện tại. |
| Công nợ đến hạn | VND | Ngày / Tuần | x |  |  |  | /cong-no, /kho-bep-trung-tam/nhap-ncc | Đã nằm trong CEO 30 KPI lõi và đọc từ 15_DASHBOARD_REPORT/fallback catalog. |
| Công nợ quá hạn | VND | Ngày / Tuần | x |  |  |  | /cong-no, /kho-bep-trung-tam/nhap-ncc | Đã nằm trong CEO 30 KPI lõi và đọc từ 15_DASHBOARD_REPORT/fallback catalog. |
| Số ngày quá hạn | ngày | Ngày / Tuần | x |  |  |  | /cong-no, /kho-bep-trung-tam/nhap-ncc | Đã có trong module hoặc bảng/spec hiện tại. |
| Tổng mua hàng từ NCC | VND | Tuần / Tháng | x |  |  |  | /cong-no, /kho-bep-trung-tam/nhap-ncc | Đã có trong module hoặc bảng/spec hiện tại. |
| Đơn giá mua | VND/kg, VND/cái, VND/lít | Theo lần nhập | x |  |  |  | /cong-no, /kho-bep-trung-tam/nhap-ncc | Đã có trong module hoặc bảng/spec hiện tại. |
| Biến động giá mua | % | Tuần / Tháng | x |  |  |  | /cong-no, /kho-bep-trung-tam/nhap-ncc | Đã có trong module hoặc bảng/spec hiện tại. |
| Số lần giao thiếu | lần | Tuần / Tháng |  | x | x |  | /cong-no, /kho-bep-trung-tam/nhap-ncc | Nên bổ sung vào /cong-no, /kho-bep-trung-tam/nhap-ncc với công thức/ngưỡng riêng. |
| Số lần lỗi chất lượng | lần | Tuần / Tháng |  | x | x |  | /cong-no, /kho-bep-trung-tam/nhap-ncc | Nên bổ sung vào /cong-no, /kho-bep-trung-tam/nhap-ncc với công thức/ngưỡng riêng. |
| Tỷ lệ lỗi NCC | % | Tháng |  | x | x |  | /cong-no, /kho-bep-trung-tam/nhap-ncc | Nên bổ sung vào /cong-no, /kho-bep-trung-tam/nhap-ncc với công thức/ngưỡng riêng. |
| NCC cần đối chiếu | NCC / khoản | Tuần |  | x | x |  | /cong-no, /kho-bep-trung-tam/nhap-ncc | Nên bổ sung vào /cong-no, /kho-bep-trung-tam/nhap-ncc với công thức/ngưỡng riêng. |

## Nhóm nhân sự và lương

| KPI V1 | Đơn vị | Chu kỳ | Đã có | Chưa có | Bổ sung | Không thêm | Vị trí web đúng | Ghi chú |
|---|---|---|:---:|:---:|:---:|:---:|---|---|
| Số nhân sự trong ca | người | Ngày / Ca |  | x | x |  | /luong-nhan-su/cham-cong, /luong-nhan-su/tam-ung-thuong-phat, /luong-nhan-su/bang-luong | Nên bổ sung vào /luong-nhan-su/cham-cong, /luong-nhan-su/tam-ung-thuong-phat, /luong-nhan-su/bang-luong với công thức/ngưỡng riêng. |
| Tổng giờ công | giờ | Ngày / Tuần / Tháng |  | x | x |  | /luong-nhan-su/cham-cong, /luong-nhan-su/tam-ung-thuong-phat, /luong-nhan-su/bang-luong | Nên bổ sung vào /luong-nhan-su/cham-cong, /luong-nhan-su/tam-ung-thuong-phat, /luong-nhan-su/bang-luong với công thức/ngưỡng riêng. |
| Tổng ca làm | ca | Tuần / Tháng |  | x | x |  | /luong-nhan-su/cham-cong, /luong-nhan-su/tam-ung-thuong-phat, /luong-nhan-su/bang-luong | Nên bổ sung vào /luong-nhan-su/cham-cong, /luong-nhan-su/tam-ung-thuong-phat, /luong-nhan-su/bang-luong với công thức/ngưỡng riêng. |
| Lương cơ bản | VND | Tháng | x |  |  |  | /luong-nhan-su/cham-cong, /luong-nhan-su/tam-ung-thuong-phat, /luong-nhan-su/bang-luong | Đã có trong module hoặc bảng/spec hiện tại. |
| Phụ cấp | VND | Tháng | x |  |  |  | /luong-nhan-su/cham-cong, /luong-nhan-su/tam-ung-thuong-phat, /luong-nhan-su/bang-luong | Đã có trong module hoặc bảng/spec hiện tại. |
| Thưởng cá nhân | VND | Tháng |  | x | x |  | /luong-nhan-su/cham-cong, /luong-nhan-su/tam-ung-thuong-phat, /luong-nhan-su/bang-luong | Nên bổ sung vào /luong-nhan-su/cham-cong, /luong-nhan-su/tam-ung-thuong-phat, /luong-nhan-su/bang-luong với công thức/ngưỡng riêng. |
| Thưởng tập thể | VND | Tháng |  | x | x |  | /luong-nhan-su/cham-cong, /luong-nhan-su/tam-ung-thuong-phat, /luong-nhan-su/bang-luong | Nên bổ sung vào /luong-nhan-su/cham-cong, /luong-nhan-su/tam-ung-thuong-phat, /luong-nhan-su/bang-luong với công thức/ngưỡng riêng. |
| Tạm ứng | VND | Tháng | x |  |  |  | /luong-nhan-su/cham-cong, /luong-nhan-su/tam-ung-thuong-phat, /luong-nhan-su/bang-luong | Đã có trong module hoặc bảng/spec hiện tại. |
| Khấu trừ | VND | Tháng | x |  |  |  | /luong-nhan-su/cham-cong, /luong-nhan-su/tam-ung-thuong-phat, /luong-nhan-su/bang-luong | Đã có trong module hoặc bảng/spec hiện tại. |
| Tổng chi phí nhân sự | VND | Tuần / Tháng | x |  |  |  | /luong-nhan-su/cham-cong, /luong-nhan-su/tam-ung-thuong-phat, /luong-nhan-su/bang-luong | Đã có trong module hoặc bảng/spec hiện tại. |
| Chi phí nhân sự / doanh thu | % | Tuần / Tháng | x |  |  |  | /luong-nhan-su/cham-cong, /luong-nhan-su/tam-ung-thuong-phat, /luong-nhan-su/bang-luong | Đã có trong module hoặc bảng/spec hiện tại. |
| Doanh thu / giờ công | VND/giờ | Ngày / Tuần | x |  |  |  | /luong-nhan-su/cham-cong, /luong-nhan-su/tam-ung-thuong-phat, /luong-nhan-su/bang-luong | Đã có trong module hoặc bảng/spec hiện tại. |
| Doanh thu / người / ca | VND/người/ca | Ngày / Tuần |  | x | x |  | /luong-nhan-su/cham-cong, /luong-nhan-su/tam-ung-thuong-phat, /luong-nhan-su/bang-luong | Nên bổ sung vào /luong-nhan-su/cham-cong, /luong-nhan-su/tam-ung-thuong-phat, /luong-nhan-su/bang-luong với công thức/ngưỡng riêng. |
| Số lỗi nhân sự | lỗi | Ngày / Tuần |  | x | x |  | /luong-nhan-su/cham-cong, /luong-nhan-su/tam-ung-thuong-phat, /luong-nhan-su/bang-luong | Nên bổ sung vào /luong-nhan-su/cham-cong, /luong-nhan-su/tam-ung-thuong-phat, /luong-nhan-su/bang-luong với công thức/ngưỡng riêng. |
| Đi trễ | phút / lần | Ngày / Tháng | x |  |  |  | /luong-nhan-su/cham-cong, /luong-nhan-su/tam-ung-thuong-phat, /luong-nhan-su/bang-luong | Đã có trong module hoặc bảng/spec hiện tại. |
| Nghỉ không báo | lần | Tháng |  | x | x |  | /luong-nhan-su/cham-cong, /luong-nhan-su/tam-ung-thuong-phat, /luong-nhan-su/bang-luong | Nên bổ sung vào /luong-nhan-su/cham-cong, /luong-nhan-su/tam-ung-thuong-phat, /luong-nhan-su/bang-luong với công thức/ngưỡng riêng. |
| KPI nhân sự | điểm / % | Tháng |  | x | x |  | /luong-nhan-su/cham-cong, /luong-nhan-su/tam-ung-thuong-phat, /luong-nhan-su/bang-luong | Nên bổ sung vào /luong-nhan-su/cham-cong, /luong-nhan-su/tam-ung-thuong-phat, /luong-nhan-su/bang-luong với công thức/ngưỡng riêng. |

## Nhóm Data Quality / Import

| KPI V1 | Đơn vị | Chu kỳ | Đã có | Chưa có | Bổ sung | Không thêm | Vị trí web đúng | Ghi chú |
|---|---|---|:---:|:---:|:---:|:---:|---|---|
| Data Quality Score | điểm / % | Ngày / Tuần | x |  |  |  | /nhap-lieu/upload, /nhap-lieu/lich-su-import, /nhap-lieu/du-lieu-loi-thieu, /kiem-soat-du-lieu | Đã nằm trong CEO 30 KPI lõi và đọc từ 15_DASHBOARD_REPORT/fallback catalog. |
| Số nguồn dữ liệu còn thiếu | nguồn / file | Ngày / Tuần |  | x | x |  | /nhap-lieu/upload, /nhap-lieu/lich-su-import, /nhap-lieu/du-lieu-loi-thieu, /kiem-soat-du-lieu | Nên bổ sung vào /nhap-lieu/upload, /nhap-lieu/lich-su-import, /nhap-lieu/du-lieu-loi-thieu, /kiem-soat-du-lieu với công thức/ngưỡng riêng. |
| Số file đã upload | file | Ngày / Tuần | x |  |  |  | /nhap-lieu/upload, /nhap-lieu/lich-su-import, /nhap-lieu/du-lieu-loi-thieu, /kiem-soat-du-lieu | Đã có trong module hoặc bảng/spec hiện tại. |
| Số file import lỗi | file | Ngày / Tuần | x |  |  |  | /nhap-lieu/upload, /nhap-lieu/lich-su-import, /nhap-lieu/du-lieu-loi-thieu, /kiem-soat-du-lieu | Đã có trong module hoặc bảng/spec hiện tại. |
| Số dòng đọc được | dòng | Theo file | x |  |  | x | /nhap-lieu/upload, /nhap-lieu/lich-su-import, /nhap-lieu/du-lieu-loi-thieu, /kiem-soat-du-lieu | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |
| Số dòng hợp lệ | dòng | Theo file | x |  |  | x | /nhap-lieu/upload, /nhap-lieu/lich-su-import, /nhap-lieu/du-lieu-loi-thieu, /kiem-soat-du-lieu | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |
| Số dòng lỗi | dòng | Theo file | x |  |  | x | /nhap-lieu/upload, /nhap-lieu/lich-su-import, /nhap-lieu/du-lieu-loi-thieu, /kiem-soat-du-lieu | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |
| Số dòng trùng | dòng | Theo file | x |  |  | x | /nhap-lieu/upload, /nhap-lieu/lich-su-import, /nhap-lieu/du-lieu-loi-thieu, /kiem-soat-du-lieu | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |
| Số cột thiếu | cột | Theo file | x |  |  | x | /nhap-lieu/upload, /nhap-lieu/lich-su-import, /nhap-lieu/du-lieu-loi-thieu, /kiem-soat-du-lieu | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |
| Số ngày ngoài kỳ | dòng | Theo file | x |  |  | x | /nhap-lieu/upload, /nhap-lieu/lich-su-import, /nhap-lieu/du-lieu-loi-thieu, /kiem-soat-du-lieu | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |
| Dữ liệu chưa phân loại | dòng / VND | Ngày / Tuần | x |  |  |  | /nhap-lieu/upload, /nhap-lieu/lich-su-import, /nhap-lieu/du-lieu-loi-thieu, /kiem-soat-du-lieu | Đã có trong module hoặc bảng/spec hiện tại. |
| Dữ liệu không có mã kho/cửa hàng | dòng | Theo file |  | x |  | x | /nhap-lieu/upload, /nhap-lieu/lich-su-import, /nhap-lieu/du-lieu-loi-thieu, /kiem-soat-du-lieu | Không thêm thành KPI card; nếu cần thì giữ dưới dạng cột bảng, top list hoặc drill-down. |
| Dữ liệu không có mã hàng/NVL | dòng | Theo file |  | x |  | x | /nhap-lieu/upload, /nhap-lieu/lich-su-import, /nhap-lieu/du-lieu-loi-thieu, /kiem-soat-du-lieu | Không thêm thành KPI card; nếu cần thì giữ dưới dạng cột bảng, top list hoặc drill-down. |
| Trạng thái đủ dữ liệu chốt báo cáo | Đủ / Chưa đủ | Ngày / Tuần | x |  |  |  | /nhap-lieu/upload, /nhap-lieu/lich-su-import, /nhap-lieu/du-lieu-loi-thieu, /kiem-soat-du-lieu | Đã có trong module hoặc bảng/spec hiện tại. |

## Nhóm nhiệm vụ kế toán

| KPI V1 | Đơn vị | Chu kỳ | Đã có | Chưa có | Bổ sung | Không thêm | Vị trí web đúng | Ghi chú |
|---|---|---|:---:|:---:|:---:|:---:|---|---|
| Tổng nhiệm vụ kế toán | việc | Ngày | x |  |  |  | /nhiem-vu-ke-toan/viec-hom-nay, /nhiem-vu-ke-toan/viec-qua-han, /nhiem-vu-ke-toan/viec-cho-xac-nhan | Đã có trong module hoặc bảng/spec hiện tại. |
| Việc hôm nay | việc | Ngày | x |  |  | x | /nhiem-vu-ke-toan/viec-hom-nay, /nhiem-vu-ke-toan/viec-qua-han, /nhiem-vu-ke-toan/viec-cho-xac-nhan | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |
| Việc chưa xử lý | việc | Ngày | x |  |  | x | /nhiem-vu-ke-toan/viec-hom-nay, /nhiem-vu-ke-toan/viec-qua-han, /nhiem-vu-ke-toan/viec-cho-xac-nhan | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |
| Việc đang xử lý | việc | Ngày | x |  |  | x | /nhiem-vu-ke-toan/viec-hom-nay, /nhiem-vu-ke-toan/viec-qua-han, /nhiem-vu-ke-toan/viec-cho-xac-nhan | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |
| Việc chờ xác nhận | việc | Ngày | x |  |  | x | /nhiem-vu-ke-toan/viec-hom-nay, /nhiem-vu-ke-toan/viec-qua-han, /nhiem-vu-ke-toan/viec-cho-xac-nhan | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |
| Việc quá hạn | việc | Ngày | x |  |  | x | /nhiem-vu-ke-toan/viec-hom-nay, /nhiem-vu-ke-toan/viec-qua-han, /nhiem-vu-ke-toan/viec-cho-xac-nhan | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |
| Việc mức đỏ | việc | Ngày | x |  |  | x | /nhiem-vu-ke-toan/viec-hom-nay, /nhiem-vu-ke-toan/viec-qua-han, /nhiem-vu-ke-toan/viec-cho-xac-nhan | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |
| Việc mức cam | việc | Ngày | x |  |  | x | /nhiem-vu-ke-toan/viec-hom-nay, /nhiem-vu-ke-toan/viec-qua-han, /nhiem-vu-ke-toan/viec-cho-xac-nhan | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |
| Việc ảnh hưởng chốt báo cáo | việc | Ngày / Tuần | x |  |  |  | /nhiem-vu-ke-toan/viec-hom-nay, /nhiem-vu-ke-toan/viec-qua-han, /nhiem-vu-ke-toan/viec-cho-xac-nhan | Đã có trong module hoặc bảng/spec hiện tại. |
| Thời gian xử lý trung bình | giờ / việc | Tuần / Tháng |  | x | x |  | /nhiem-vu-ke-toan/viec-hom-nay, /nhiem-vu-ke-toan/viec-qua-han, /nhiem-vu-ke-toan/viec-cho-xac-nhan | Nên bổ sung vào /nhiem-vu-ke-toan/viec-hom-nay, /nhiem-vu-ke-toan/viec-qua-han, /nhiem-vu-ke-toan/viec-cho-xac-nhan với công thức/ngưỡng riêng. |
| Tỷ lệ hoàn thành nhiệm vụ | % | Tuần / Tháng |  | x | x |  | /nhiem-vu-ke-toan/viec-hom-nay, /nhiem-vu-ke-toan/viec-qua-han, /nhiem-vu-ke-toan/viec-cho-xac-nhan | Nên bổ sung vào /nhiem-vu-ke-toan/viec-hom-nay, /nhiem-vu-ke-toan/viec-qua-han, /nhiem-vu-ke-toan/viec-cho-xac-nhan với công thức/ngưỡng riêng. |
| Người phụ trách còn việc quá hạn | người / việc | Ngày / Tuần |  | x |  | x | /nhiem-vu-ke-toan/viec-hom-nay, /nhiem-vu-ke-toan/viec-qua-han, /nhiem-vu-ke-toan/viec-cho-xac-nhan | Không thêm thành KPI card; nếu cần thì giữ dưới dạng cột bảng, top list hoặc drill-down. |

## Nhóm báo cáo ngày / tuần / tháng

| KPI V1 | Đơn vị | Chu kỳ | Đã có | Chưa có | Bổ sung | Không thêm | Vị trí web đúng | Ghi chú |
|---|---|---|:---:|:---:|:---:|:---:|---|---|
| Báo cáo ngày đã tạo | báo cáo | Ngày |  | x | x |  | /bao-cao-quan-tri/ngay, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /lich-su-chot-bao-cao | Nên bổ sung vào /bao-cao-quan-tri/ngay, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /lich-su-chot-bao-cao với công thức/ngưỡng riêng. |
| Báo cáo ngày chưa gửi | báo cáo | Ngày |  | x | x |  | /bao-cao-quan-tri/ngay, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /lich-su-chot-bao-cao | Nên bổ sung vào /bao-cao-quan-tri/ngay, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /lich-su-chot-bao-cao với công thức/ngưỡng riêng. |
| Báo cáo tuần đã tạo | báo cáo | Tuần |  | x | x |  | /bao-cao-quan-tri/ngay, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /lich-su-chot-bao-cao | Nên bổ sung vào /bao-cao-quan-tri/ngay, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /lich-su-chot-bao-cao với công thức/ngưỡng riêng. |
| Báo cáo tuần chưa gửi | báo cáo | Tuần |  | x | x |  | /bao-cao-quan-tri/ngay, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /lich-su-chot-bao-cao | Nên bổ sung vào /bao-cao-quan-tri/ngay, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /lich-su-chot-bao-cao với công thức/ngưỡng riêng. |
| Báo cáo tháng đã tạo | báo cáo | Tháng |  | x | x |  | /bao-cao-quan-tri/ngay, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /lich-su-chot-bao-cao | Nên bổ sung vào /bao-cao-quan-tri/ngay, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /lich-su-chot-bao-cao với công thức/ngưỡng riêng. |
| Báo cáo tháng chưa gửi | báo cáo | Tháng |  | x | x |  | /bao-cao-quan-tri/ngay, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /lich-su-chot-bao-cao | Nên bổ sung vào /bao-cao-quan-tri/ngay, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /lich-su-chot-bao-cao với công thức/ngưỡng riêng. |
| Báo cáo trễ hạn | báo cáo | Ngày / Tuần |  | x | x |  | /bao-cao-quan-tri/ngay, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /lich-su-chot-bao-cao | Nên bổ sung vào /bao-cao-quan-tri/ngay, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /lich-su-chot-bao-cao với công thức/ngưỡng riêng. |
| Số cảnh báo trong báo cáo | cảnh báo | Ngày / Tuần / Tháng | x |  |  |  | /bao-cao-quan-tri/ngay, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /lich-su-chot-bao-cao | Đã có trong module hoặc bảng/spec hiện tại. |
| Số vấn đề cần CEO xử lý | vấn đề | Ngày / Tuần / Tháng | x |  |  |  | /bao-cao-quan-tri/ngay, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /lich-su-chot-bao-cao | Đã có trong module hoặc bảng/spec hiện tại. |
| Tỷ lệ hoàn thành báo cáo đúng hạn | % | Tháng |  | x | x |  | /bao-cao-quan-tri/ngay, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /lich-su-chot-bao-cao | Nên bổ sung vào /bao-cao-quan-tri/ngay, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /lich-su-chot-bao-cao với công thức/ngưỡng riêng. |
| Trạng thái được chốt báo cáo | Được chốt / Chưa được chốt | Ngày / Tuần | x |  |  |  | /bao-cao-quan-tri/ngay, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /lich-su-chot-bao-cao | Đã có trong module hoặc bảng/spec hiện tại. |
| Lý do chưa được chốt | lỗi / nguồn / task | Ngày / Tuần | x |  |  | x | /bao-cao-quan-tri/ngay, /bao-cao-quan-tri/tuan, /bao-cao-quan-tri/thang, /lich-su-chot-bao-cao | Đã có/đúng hơn là chi tiết bảng nghiệp vụ; không đưa thêm thành KPI card riêng. |

## Nhóm dự toán

| KPI V1 | Đơn vị | Chu kỳ | Đã có | Chưa có | Bổ sung | Không thêm | Vị trí web đúng | Ghi chú |
|---|---|---|:---:|:---:|:---:|:---:|---|---|
| Doanh thu dự toán | VND | Tuần / Tháng | x |  |  |  | /tai-chinh/du-toan, /du-toan | Đã có trong module hoặc bảng/spec hiện tại. |
| Doanh thu dự toán theo ngày | VND/ngày | Tuần |  | x | x |  | /tai-chinh/du-toan, /du-toan | Nên bổ sung vào /tai-chinh/du-toan, /du-toan với công thức/ngưỡng riêng. |
| Chi phí dự toán | VND | Tuần / Tháng |  | x | x |  | /tai-chinh/du-toan, /du-toan | Nên bổ sung vào /tai-chinh/du-toan, /du-toan với công thức/ngưỡng riêng. |
| Chi phí biến đổi dự toán | VND | Tuần / Tháng |  | x | x |  | /tai-chinh/du-toan, /du-toan | Nên bổ sung vào /tai-chinh/du-toan, /du-toan với công thức/ngưỡng riêng. |
| Chi phí cố định dự toán | VND | Tuần / Tháng |  | x | x |  | /tai-chinh/du-toan, /du-toan | Nên bổ sung vào /tai-chinh/du-toan, /du-toan với công thức/ngưỡng riêng. |
| Công nợ cần trả | VND | Tuần | x |  |  |  | /tai-chinh/du-toan, /du-toan | Đã có trong module hoặc bảng/spec hiện tại. |
| Số dư tiền đầu kỳ | VND | Tuần / Tháng | x |  |  |  | /tai-chinh/du-toan, /du-toan | Đã có trong module hoặc bảng/spec hiện tại. |
| Số dư tiền dự kiến | VND | Tuần / Tháng |  | x | x |  | /tai-chinh/du-toan, /du-toan | Nên bổ sung vào /tai-chinh/du-toan, /du-toan với công thức/ngưỡng riêng. |
| Mức thiếu tiền dự kiến | VND | Tuần / Tháng |  | x | x |  | /tai-chinh/du-toan, /du-toan | Nên bổ sung vào /tai-chinh/du-toan, /du-toan với công thức/ngưỡng riêng. |
| Độ tin cậy dự toán | % | Tuần / Tháng |  | x | x |  | /tai-chinh/du-toan, /du-toan | Nên bổ sung vào /tai-chinh/du-toan, /du-toan với công thức/ngưỡng riêng. |
| Chênh lệch thực tế so với dự toán | VND / % | Tuần / Tháng | x |  |  |  | /tai-chinh/du-toan, /du-toan | Đã có trong module hoặc bảng/spec hiện tại. |

## Nhóm cảnh báo tự động

| KPI V1 | Đơn vị | Chu kỳ | Đã có | Chưa có | Bổ sung | Không thêm | Vị trí web đúng | Ghi chú |
|---|---|---|:---:|:---:|:---:|:---:|---|---|
| Doanh thu giảm mạnh | % | Ngày / Tuần |  | x | x |  | /tong-quan/ceo-cfo, /nhiem-vu-ke-toan/*, module alert cards | Nên bổ sung vào /tong-quan/ceo-cfo, /nhiem-vu-ke-toan/*, module alert cards với công thức/ngưỡng riêng. |
| Food cost vượt chuẩn | % | Ngày / Tuần |  | x | x |  | /tong-quan/ceo-cfo, /nhiem-vu-ke-toan/*, module alert cards | Nên bổ sung vào /tong-quan/ceo-cfo, /nhiem-vu-ke-toan/*, module alert cards với công thức/ngưỡng riêng. |
| Labor cost vượt chuẩn | % | Tuần / Tháng |  | x | x |  | /tong-quan/ceo-cfo, /nhiem-vu-ke-toan/*, module alert cards | Nên bổ sung vào /tong-quan/ceo-cfo, /nhiem-vu-ke-toan/*, module alert cards với công thức/ngưỡng riêng. |
| Hủy hàng cao | VND / % | Ngày / Tuần |  | x | x |  | /tong-quan/ceo-cfo, /nhiem-vu-ke-toan/*, module alert cards | Nên bổ sung vào /tong-quan/ceo-cfo, /nhiem-vu-ke-toan/*, module alert cards với công thức/ngưỡng riêng. |
| Chênh lệch tiền mặt | VND | Ngày | x |  |  |  | /tong-quan/ceo-cfo, /nhiem-vu-ke-toan/*, module alert cards | Đã nằm trong CEO 30 KPI lõi và đọc từ 15_DASHBOARD_REPORT/fallback catalog. |
| App chưa đối soát | VND / ngày | Ngày / Tuần |  | x | x |  | /tong-quan/ceo-cfo, /nhiem-vu-ke-toan/*, module alert cards | Nên bổ sung vào /tong-quan/ceo-cfo, /nhiem-vu-ke-toan/*, module alert cards với công thức/ngưỡng riêng. |
| Tồn kho âm | kg / cái / VND | Ngày / Tuần | x |  |  |  | /tong-quan/ceo-cfo, /nhiem-vu-ke-toan/*, module alert cards | Đã có trong module hoặc bảng/spec hiện tại. |
| Tồn kho quá cao | ngày tồn | Tuần |  | x | x |  | /tong-quan/ceo-cfo, /nhiem-vu-ke-toan/*, module alert cards | Nên bổ sung vào /tong-quan/ceo-cfo, /nhiem-vu-ke-toan/*, module alert cards với công thức/ngưỡng riêng. |
| Nguyên liệu sắp hết | ngày tồn / kg / cái | Ngày |  | x | x |  | /tong-quan/ceo-cfo, /nhiem-vu-ke-toan/*, module alert cards | Nên bổ sung vào /tong-quan/ceo-cfo, /nhiem-vu-ke-toan/*, module alert cards với công thức/ngưỡng riêng. |
| Vượt định mức | % / VND | Ngày / Tuần | x |  |  |  | /tong-quan/ceo-cfo, /nhiem-vu-ke-toan/*, module alert cards | Đã có trong module hoặc bảng/spec hiện tại. |
| Thất thoát tồn kho | % / VND | Tuần | x |  |  |  | /tong-quan/ceo-cfo, /nhiem-vu-ke-toan/*, module alert cards | Đã có trong module hoặc bảng/spec hiện tại. |
| NCC tăng giá | % | Tuần / Tháng |  | x | x |  | /tong-quan/ceo-cfo, /nhiem-vu-ke-toan/*, module alert cards | Nên bổ sung vào /tong-quan/ceo-cfo, /nhiem-vu-ke-toan/*, module alert cards với công thức/ngưỡng riêng. |
| Chi phí phát sinh bất thường | VND | Ngày / Tuần |  | x | x |  | /tong-quan/ceo-cfo, /nhiem-vu-ke-toan/*, module alert cards | Nên bổ sung vào /tong-quan/ceo-cfo, /nhiem-vu-ke-toan/*, module alert cards với công thức/ngưỡng riêng. |
| Thiếu chứng từ | chứng từ / dòng | Ngày / Tuần | x |  |  |  | /tong-quan/ceo-cfo, /nhiem-vu-ke-toan/*, module alert cards | Đã có trong module hoặc bảng/spec hiện tại. |
| Thiếu nguồn dữ liệu | nguồn / file | Ngày / Tuần | x |  |  |  | /tong-quan/ceo-cfo, /nhiem-vu-ke-toan/*, module alert cards | Đã có trong module hoặc bảng/spec hiện tại. |
| Task đỏ chưa xử lý | việc | Ngày | x |  |  |  | /tong-quan/ceo-cfo, /nhiem-vu-ke-toan/*, module alert cards | Đã có trong module hoặc bảng/spec hiện tại. |
| Báo cáo trễ | báo cáo | Ngày / Tuần | x |  |  |  | /tong-quan/ceo-cfo, /nhiem-vu-ke-toan/*, module alert cards | Đã nằm trong CEO 30 KPI lõi và đọc từ 15_DASHBOARD_REPORT/fallback catalog. |

