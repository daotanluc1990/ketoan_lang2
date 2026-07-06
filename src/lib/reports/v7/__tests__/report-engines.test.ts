import { describe, expect, it } from 'vitest';
import { buildTheoreticalIngredientRows } from '../report-engines';

function sumMaterial(rows: Record<string, unknown>[], material: string) {
  return rows
    .filter((row) => row['Tên nguyên vật liệu'] === material)
    .reduce((total, row) => total + Number(row['Được phép dùng'] ?? 0), 0);
}

describe('v7 report engines', () => {
  it('infers ingredient usage from wide weekly sales columns like the CHẾ BIẾN sheet', () => {
    const rows = buildTheoreticalIngredientRows([
      {
        'Chi nhánh': 'NVT',
        'Mã tuần': '2026-W26',
        'Trà Tắc Quán (ly)': 273,
        'Trà Tắc App (ly)': 645,
        'Chả (miếng)': 2030,
        'Canh Rong biển (chén)': 1848,
        'Coca (App)': 209,
        'Số hộp': 5966,
        'Số dĩa': 1066
      }
    ], []);

    expect(sumMaterial(rows, 'Trà lài')).toBeCloseTo(3.0294, 4);
    expect(sumMaterial(rows, 'Mật ong')).toBeCloseTo(9.1321, 4);
    expect(sumMaterial(rows, 'Tắc trái')).toBeCloseTo(37.9685, 4);
    expect(sumMaterial(rows, 'Nước đường')).toBeCloseTo(58.1645, 4);
    expect(sumMaterial(rows, 'Mọc')).toBeCloseTo(19.8489, 4);
    expect(sumMaterial(rows, 'Thịt xay')).toBeCloseTo(36.96, 4);
    expect(sumMaterial(rows, 'Coca')).toBeCloseTo(36.2267, 4);
    expect(sumMaterial(rows, 'Gạo')).toBeCloseTo(879, 4);
    expect(sumMaterial(rows, 'Sườn')).toBeCloseTo(949.32, 4);
  });

  it('normalizes master recipe units before multiplying sales quantities', () => {
    const rows = buildTheoreticalIngredientRows([
      { ten_mon: 'Trà tắc', so_luong_ban: 100 },
      { ten_mon: 'Coca', so_luong_ban: 10 }
    ], [
      { ma_mon: 'SP_TRA_TAC', ten_mon: 'Trà tắc', ten_nvl: 'Trà lài', dvt_nvl: 'g', dinh_muc_1_don_vi: 3.3 },
      { ma_mon: 'SP_COCA', ten_mon: 'Coca', ten_nvl: 'Coca', dvt_nvl: 'ml', dinh_muc_1_don_vi: 260 }
    ]);

    expect(sumMaterial(rows, 'Trà lài')).toBeCloseTo(0.33, 4);
    expect(rows.find((row) => row['Tên nguyên vật liệu'] === 'Trà lài')?.['ĐVT']).toBe('Kg');
    expect(sumMaterial(rows, 'Coca')).toBeCloseTo(1.7333, 4);
    expect(rows.find((row) => row['Tên nguyên vật liệu'] === 'Coca')?.['ĐVT']).toBe('Chai 1.5L');
  });
});
