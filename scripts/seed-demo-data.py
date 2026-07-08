"""
Seed DEMO data vào Google Sheet để dashboard CEO/CFO hiển thị đầy đủ.
User sẽ xóa sau. Data giả định dựa trên quy mô thật (DT 641tr/tuần).

Tabs fill:
- 07_DATA_NHAN_SU_LUONG: 18 nhân viên (lương F&B hợp lý)
- 06_DATA_CONG_NO: 7 NCC (có hạn thanh toán, tuổi nợ đa dạng)
- 14_CALC_TAI_CHINH_DU_TOAN: 5 tuần snapshot (cho chart xu hướng)
- 12_CALC_TON_KHO: 5 tuần snapshot (cho chart tồn kho)
- 13_CALC_HAO_HUT_THAT_THOAT: 5 tuần snapshot (cho chart thất thoát)
- DATA_NCC_TANG_GIA (sheet mới): 5 NCC tăng giá
"""
import re, json, urllib.request, urllib.parse, time, base64, random

random.seed(42)  # deterministic

with open('.env.local', encoding='utf-8') as f:
    env = f.read()
sid = re.search(r'GOOGLE_SHEET_ID\s*=\s*["\']?([A-Za-z0-9_-]+)', env).group(1)
pk_line = re.search(r'GOOGLE_PRIVATE_KEY\s*=\s*(.+)', env).group(1).strip()
if (pk_line[0] in '"\'' and pk_line[-1] in '"\''): pk_line = pk_line[1:-1]
pk_raw = pk_line.replace('\\\\n', '\n').replace('\\n', '\n')
email = re.search(r'GOOGLE_CLIENT_EMAIL\s*=\s*["\']?([^"\'\n]+)', env).group(1)

# Auth
header = {"alg": "RS256", "typ": "JWT"}
now = int(time.time())
payload = {"iss": email, "scope": "https://www.googleapis.com/auth/spreadsheets",
           "aud": "https://oauth2.googleapis.com/token", "exp": now + 3600, "iat": now}
def b64(d): return base64.urlsafe_b64encode(json.dumps(d, separators=(',', ':')).encode()).rstrip(b'=').decode()
si = b64(header) + '.' + b64(payload)
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
key = serialization.load_pem_private_key(pk_raw.encode(), password=None)
jwt = si + '.' + base64.urlsafe_b64encode(key.sign(si.encode(), padding.PKCS1v15(), hashes.SHA256())).rstrip(b'=').decode()
data = ('grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + jwt).encode()
token = json.loads(urllib.request.urlopen(urllib.request.Request(
    'https://oauth2.googleapis.com/token', data=data, method='POST')).read())['access_token']

API = f'https://sheets.googleapis.com/v4/spreadsheets/{sid}'
BATCH = f'https://sheets.googleapis.com/v4/spreadsheets/{sid}:batchUpdate'

def read(sheet, rng):
    u = f'{API}/values/{urllib.parse.quote(sheet + "!" + rng)}'
    r = urllib.request.Request(u); r.add_header('Authorization', 'Bearer ' + token)
    return json.loads(urllib.request.urlopen(r).read()).get('values', [])

def clear_sheet(sheet, ncols):
    """Clear all data rows below header."""
    last_col = chr(65 + ncols - 1) if ncols <= 26 else 'Z'
    rng = f'{sheet}!A2:{last_col}10000'
    body = json.dumps({"ranges": [rng]}).encode()
    r = urllib.request.Request(f'{API}/values:batchClear', data=body, method='POST')
    r.add_header('Authorization', 'Bearer ' + token)
    r.add_header('Content-Type', 'application/json')
    urllib.request.urlopen(r).read()

def write_rows(sheet, rows, start_row=2):
    """Write rows to sheet starting at given row (2 = after header)."""
    if not rows: return
    ncols = max(len(r) for r in rows)
    last_col = chr(65 + ncols - 1) if ncols <= 26 else 'Z'
    rng = f'{sheet}!A{start_row}:{last_col}{start_row + len(rows) - 1}'
    body = json.dumps({"values": rows}).encode()
    u = f'{API}/values/{urllib.parse.quote(rng)}?valueInputOption=RAW'
    r = urllib.request.Request(u, data=body, method='PUT')
    r.add_header('Authorization', 'Bearer ' + token)
    r.add_header('Content-Type', 'application/json')
    resp = json.loads(urllib.request.urlopen(r).read())
    print(f'  {sheet}: wrote {resp.get("updatedRows", 0)} rows')

def add_sheet(title, headers):
    """Create new sheet tab + header row."""
    body = json.dumps({"requests": [{"addSheet": {"properties": {"title": title}}}]}).encode()
    r = urllib.request.Request(BATCH, data=body, method='POST')
    r.add_header('Authorization', 'Bearer ' + token)
    r.add_header('Content-Type', 'application/json')
    try:
        urllib.request.urlopen(r).read()
    except Exception as e:
        print(f'  (sheet {title} may exist: {e})')
    write_rows(title, [headers], start_row=1)

NOW = '2026-07-09T10:00:00'
BATCH_ID = 'DEMO_SEED_20260709'

# === 1. 07_DATA_NHAN_SU_LUONG (24 cols) ===
print('=== 07_DATA_NHAN_SU_LUONG ===')
clear_sheet('07_DATA_NHAN_SU_LUONG', 24)
nhan_vien = [
    ('Nguyễn Văn An', 'Quản lý cửa hàng', 'NVT', 26, 208, 0, 0, 0, 0, 0, 500000, 0, 1500000, 12000000, 500000, 13000000),
    ('Trần Thị Bình', 'Thu ngân', 'NVT', 26, 208, 1, 0, 0, 0, 0, 200000, 0, 500000, 7000000, 0, 7700000),
    ('Lê Hoàng Cường', 'Bếp trưởng', 'BTT', 26, 240, 0, 0, 2, 0, 0, 300000, 0, 1000000, 12000000, 0, 13300000),
    ('Phạm Thị Dung', 'Nhân viên bếp', 'BTT', 25, 200, 0, 1, 0, 0, 0, 0, 50000, 0, 7500000, 200000, 7250000),
    ('Vũ Minh Duc', 'Nhân viên phục vụ', 'NVT', 24, 192, 2, 0, 0, 0, 0, 0, 0, 300000, 6500000, 0, 6800000),
    ('Đặng Thị Em', 'Nhân viên phục vụ', 'NVT', 25, 200, 0, 0, 0, 0, 500000, 100000, 0, 400000, 6500000, 0, 6900000),
    ('Bùi Văn Fin', 'Tạp vụ', 'NVT', 26, 208, 0, 0, 0, 0, 0, 0, 0, 0, 5000000, 0, 5000000),
    ('Hồ Thị Giang', 'Thu ngân', 'NVT', 26, 208, 0, 0, 0, 0, 0, 200000, 0, 500000, 7000000, 0, 7700000),
    ('Ngô Văn Hung', 'Bếp phó', 'BTT', 25, 200, 1, 0, 1, 0, 0, 0, 0, 800000, 9000000, 0, 9800000),
    ('Lý Thị Inh', 'Nhân viên bếp', 'BTT', 24, 192, 0, 1, 0, 0, 0, 0, 0, 0, 7000000, 0, 7000000),
    ('Phan Văn Khoa', 'Giao hàng', 'NVT', 25, 200, 0, 0, 0, 6, 0, 0, 0, 500000, 6500000, 0, 7000000),
    ('Đỗ Thị Lan', 'Nhân viên phục vụ', 'NVT', 22, 176, 3, 2, 0, 0, 0, 0, 100000, 200000, 6000000, 0, 6100000),
    ('Vương Văn Mạnh', 'Bếp trưởng', 'NVT', 26, 240, 0, 0, 1, 0, 0, 300000, 0, 1000000, 12000000, 0, 13300000),
    ('Cao Thị Nga', 'Kế toán', 'BTT', 26, 208, 0, 0, 0, 0, 0, 500000, 0, 1500000, 13000000, 800000, 14200000),
    ('Đinh Văn Öng', 'Lao công', 'BTT', 26, 208, 0, 0, 0, 0, 0, 0, 0, 0, 5000000, 0, 5000000),
    ('Mai Thị Phượng', 'Marketing', 'BTT', 26, 208, 0, 0, 0, 0, 0, 0, 0, 1000000, 10000000, 0, 11000000),
    ('Tô Văn Quân', 'Nhân viên kho', 'BTT', 25, 200, 0, 0, 0, 0, 0, 0, 0, 500000, 7000000, 0, 7500000),
    ('Lương Thị Sen', 'Thu ngân', 'NVT', 25, 200, 1, 0, 0, 0, 0, 200000, 0, 500000, 7000000, 0, 7700000),
]
rows7 = []
for i, (ten, vaitro, ch, socong, giolam, ditre, nghi, cagay, tamung, thuong, phat, phucap, luongtt, khautru, thucnhan, *_extra) in enumerate(nhan_vien, 1):
    rows7.append([
        f'DEMO_NV_{i:03d}', '2026-W27', ten, vaitro, ch, socong, giolam, ditre, nghi, cagay,
        tamung, thuong, phat, phucap, luongtt, khautru, thucnhan,
        'Đã duyệt', '', BATCH_ID, 'DEMO_SEED', NOW, 'admin@ctl', 'Hợp lệ'
    ])
write_rows('07_DATA_NHAN_SU_LUONG', rows7)

# === 2. 06_DATA_CONG_NO (20 cols) ===
print('=== 06_DATA_CONG_NO ===')
clear_sheet('06_DATA_CONG_NO', 20)
ncc = [
    ('Phạm Thị Gạo', 'NCC001', 'Gạo', 45000000, 12000000, 5000000, 52000000, '2026-07-15', 'Đã đối chiếu', 'Chưa đến hạn', 'Xanh', ''),
    ('Công ty TNHH Thịt Sườn', 'NCC002', 'Thịt sườn cốt lết', 85000000, 30000000, 15000000, 100000000, '2026-07-10', 'Đã đối chiếu', 'Đến hạn', 'Cam', 'Sắp đến hạn thanh toán'),
    ('HTX Rau Quả Miền Đông', 'NCC003', 'Rau củ quả', 18000000, 6000000, 2000000, 22000000, '2026-07-05', 'Đã đối chiếu', 'Quá hạn', 'Đỏ', 'Quá hạn 4 ngày'),
    ('Cty CP Thủy Sản Nam Bộ', 'NCC004', 'Tôm cá thủy sản', 32000000, 10000000, 8000000, 34000000, '2026-06-28', 'Đã đối chiếu', 'Quá hạn', 'Đỏ', 'Quá hạn 11 ngày — cần xử lý gấp'),
    ('DNTN Bao Bì Sài Gòn', 'NCC005', 'Bao bì hộp dĩa', 12000000, 4000000, 0, 16000000, '2026-07-20', 'Chưa đối chiếu', 'Chưa đến hạn', 'Xanh', ''),
    ('CH Đồ Uống Phúc Long', 'NCC006', 'Trà coca đồ uống', 8500000, 2500000, 1500000, 9500000, '2026-07-03', 'Đã đối chiếu', 'Quá hạn', 'Đỏ', 'Quá hạn 6 ngày'),
    ('Cty Than Hoa Củ Nhiên Liệu', 'NCC007', 'Than hoa', 6500000, 2000000, 1000000, 7500000, '2026-07-12', 'Đã đối chiếu', 'Đến hạn', 'Cam', 'Sắp đến hạn'),
]
rows6 = []
for i, (ten, ma, mh, nodau, tang, giam, nocuoi, han, doichieu, thanhtoan, muc, ghi) in enumerate(ncc, 1):
    rows6.append([
        f'DEMO_CN_{i:03d}', '2026-W27', '2026-07-09', 'Phải trả NCC', ten, ma,
        nodau, tang, giam, nocuoi, han, doichieu, thanhtoan, muc, ghi,
        BATCH_ID, 'DEMO_SEED', NOW, 'admin@ctl', 'Hợp lệ'
    ])
write_rows('06_DATA_CONG_NO', rows6)

# === 3. 14_CALC_TAI_CHINH_DU_TOAN — 5 tuần snapshot (18 cols) ===
print('=== 14_CALC_TAI_CHINH_DU_TOAN (5 tuần) ===')
clear_sheet('14_CALC_TAI_CHINH_DU_TOAN', 18)
weeks14 = [
    # ky, batdau, ketthuc, dt_thuc, tong_thu, tong_chi, dong_tien, cn_den_han, sd_dau, sd_cuoi, dt_tb4, dt_du_toan, chi_bien_doi, chi_co_dinh, cn_tra, sd_du_kien, muc, hanh_dong
    ('2026-W23', '2026-06-02', '2026-06-08', '485000000', '780000000', '620000000', '160000000', '15000000', '0', '160000000', '0', '520000000', '372000000', '248000000', '15000000', '167000000', 'Xanh', 'Ổn'),
    ('2026-W24', '2026-06-09', '2026-06-15', '555000000', '860000000', '690000000', '170000000', '18000000', '160000000', '330000000', '520000000', '580000000', '410000000', '273000000', '18000000', '342000000', 'Xanh', 'Ổn'),
    ('2026-W25', '2026-06-16', '2026-06-22', '590000000', '910000000', '740000000', '170000000', '22000000', '330000000', '500000000', '543000000', '620000000', '442000000', '290000000', '22000000', '478000000', 'Cam', 'Chi tăng — kiểm NVL'),
    ('2026-W26', '2026-06-23', '2026-06-29', '610000000', '940000000', '780000000', '160000000', '19000000', '500000000', '660000000', '577000000', '650000000', '460000000', '305000000', '19000000', '531000000', 'Xanh', 'Ổn'),
    ('2026-W27', '2026-06-30', '2026-07-06', '641667000', '963378123', '807141024', '156237099', '18991000', '660000000', '816237099', '602000000', '673750350', '484284614', '322856410', '18991000', '834296739', 'Vàng', 'Công thức sheet: đối chiếu DT, sổ quỹ, công nợ'),
]
write_rows('14_CALC_TAI_CHINH_DU_TOAN', weeks14)

# === 4. 12_CALC_TON_KHO — 5 tuần snapshot (24 cols) ===
print('=== 12_CALC_TON_KHO (5 tuần) ===')
clear_sheet('12_CALC_TON_KHO', 24)
nvl_items = [
    ('NVL001', 'Sườn cốt lết', 'kg', 85, 120, 95, 100, 2, 0, 0, 8, 105),
    ('NVL002', 'Cốt lết heo', 'kg', 70, 100, 78, 85, 1, 0, 0, 6, 88),
    ('NVL003', 'Gạo tấm', 'kg', 200, 350, 280, 260, 5, 0, 0, 10, 195),
    ('NVL004', 'Trứng gà', 'cái', 500, 800, 620, 680, 8, 0, 0, 0, 592),
    ('NVL005', 'Chả lụa', 'miếng', 120, 180, 140, 155, 2, 0, 0, 3, 100),
]
weeks12 = ['2026-W23', '2026-W24', '2026-W25', '2026-W26', '2026-W27']
ton_values = [150000000, 155000000, 168000000, 160000000, 162800000]
rows12 = []
r = 0
for wk_idx, wk in enumerate(weeks12):
    for nvl_idx, (ma, ten, dvt, td, tn, tt, xb, hl, dct, dcg, cl, kkt) in enumerate(nvl_items):
        # scale ton_dau slightly per week for trend
        scale = 1 + (wk_idx - 2) * 0.02
        td2 = round(td * scale); tn2 = round(tn * scale); tt2 = round(tt * scale)
        xb2 = round(xb * scale); kkt2 = round(kkt * scale)
        ton_lt = td2 + tn2 - xb2
        chenh = kkt2 - ton_lt
        gia_tri_lech = abs(chenh) * 65000  # ~65k/kg
        ton_cuoi = kkt2
        muc = 'Đỏ' if chenh < -2 else 'Cam' if chenh < 0 else 'Xanh'
        rows12.append([
            wk, 'Kho cửa hàng', f'KHO_CUA_HANG_NVT', 'Kho cửa hàng NVT', ma, ten, dvt,
            td2, tn2, tt2, xb2, hl, dct, dcg, ton_lt, kkt2, chenh,
            abs(chenh) if chenh < 0 else 0, chenh if chenh > 0 else 0, gia_tri_lech,
            ton_cuoi, round(td2 * 0.95), muc, 'Kiểm kê đối chiếu'
        ])
        r += 1
write_rows('12_CALC_TON_KHO', rows12)

# === 5. 13_CALC_HAO_HUT_THAT_THOAT — 5 tuần snapshot (21 cols) ===
print('=== 13_CALC_HAO_HUT_THAT_THOAT (5 tuần) ===')
clear_sheet('13_CALC_HAO_HUT_THAT_THOAT', 21)
loss_items = [
    ('MON001', 'Cơm tấm sườn', 'NVL001', 'Sườn cốt lết', 'kg', 850, 0.12, 0.03, 102, 110, 8, 0.078, 520000),
    ('MON002', 'Cơm tấm cốt lết', 'NVL002', 'Cốt lết heo', 'kg', 620, 0.10, 0.025, 62, 68, 6, 0.097, 390000),
    ('MON003', 'Cơm tấm chả', 'NVL005', 'Chả lụa', 'miếng', 450, 1.0, 0.05, 450, 472, 22, 0.049, 154000),
    ('MON004', 'Trứng chiên', 'NVL004', 'Trứng gà', 'cái', 1200, 1.0, 0.0, 1200, 1245, 45, 0.0375, 67500),
    ('MON005', 'Canh rong biển', 'NVL006', 'Rong biển', 'kg', 180, 0.02, 0.01, 3.6, 4.1, 0.5, 0.139, 16250),
]
rows13 = []
for wk_idx, wk in enumerate(weeks13 := weeks12):
    for ma_mon, ten_mon, ma_nvl, ten_nvl, dvt, sl, dm, hh_pct, nvl_dung, nvl_thuc, vuot_sl, vuot_pct, gia_tri in loss_items:
        scale = 1 + (wk_idx - 2) * 0.03
        sl2 = round(sl * scale); nvl_dung2 = round(nvl_dung * scale); nvl_thuc2 = round(nvl_thuc * scale)
        vuot_sl2 = nvl_thuc2 - nvl_dung2
        gia_tri2 = round(gia_tri * scale)
        muc = 'Đỏ' if vuot_pct > 0.08 else 'Cam' if vuot_pct > 0.04 else 'Xanh'
        rows13.append([
            wk, 'Kho cửa hàng', 'KHO_CUA_HANG_NVT', ma_mon, ten_mon, ma_nvl, ten_nvl, dvt,
            sl2, dm, hh_pct, nvl_dung2, nvl_thuc2, vuot_sl2, vuot_pct, gia_tri2,
            0, 0, 0, muc, 'Kiểm tra quy trình sơ chế'
        ])
write_rows('13_CALC_HAO_HUT_THAT_THOAT', rows13)

# === 6. DATA_NCC_TANG_GIA (sheet mới) ===
print('=== DATA_NCC_TANG_GIA (sheet mới) ===')
ncc_headers = ['ma_ncc', 'ten_ncc', 'ma_hang', 'ten_hang', 'don_gia_cu', 'don_gia_moi', 'ty_le_tang', 'anh_huong_chi', 'muc_canh_bao', 'ngay_phat_hien', 'ghi_chu']
try:
    add_sheet('DATA_NCC_TANG_GIA', ncc_headers)
except Exception as e:
    print(f'  (add_sheet: {e})')
ncc_tang_gia = [
    ['NCC002', 'Công ty TNHH Thịt Sườn', 'NVL001', 'Sườn cốt lết', '185000', '205000', '10.8%', '8600000/tuần', 'Cam', '2026-07-01', 'Giá thị trường tăng, cân nhắc NCC thay thế'],
    ['NCC004', 'Cty CP Thủy Sản Nam Bộ', 'NVL010', 'Tôm sú', '320000', '365000', '14.1%', '3600000/tuần', 'Đỏ', '2026-07-03', 'Tăng mạnh — ảnh hưởng menu hải sản'],
    ['NCC001', 'Phạm Thị Gạo', 'NVL003', 'Gạo tấm', '22000', '23500', '6.8%', '1700000/tuần', 'Cam', '2026-06-25', 'Mùa gặt mới giá tăng nhẹ'],
    ['NCC005', 'DNTN Bao Bì Sài Gòn', 'NVL020', 'Hộp cơm', '3500', '3800', '8.6%', '680000/tuần', 'Cam', '2026-07-05', 'Giấy bao bì tăng toàn ngành'],
    ['NCC006', 'CH Đồ Uống Phúc Long', 'NVL025', 'Coca lon', '8500', '9200', '8.2%', '420000/tuần', 'Vàng', '2026-06-28', 'NCC chính thức tăng giá Q3'],
]
write_rows('DATA_NCC_TANG_GIA', ncc_tang_gia, start_row=2)

print('\n✅ DONE — all demo data seeded')
print(f'Batches: {BATCH_ID} (xóa batch này để dọn data demo)')
