import { createComparableRow, createRowHash } from '@/lib/import/row-hash';
import type { ImportRow, ImportRowStatus } from '@/lib/import/import-types';

export type ExistingRowIndex = {
  byKey: Map<string, Set<string>>;
  byHash: Set<string>;
};

function hasComparableBusinessData(row: Record<string, unknown>) {
  return Object.keys(createComparableRow(row)).length > 0;
}

function text(value: unknown) {
  return String(value ?? '').trim();
}

function normalized(value: unknown) {
  return text(value).toUpperCase().replace(/\s+/g, '_');
}

function addKey(keys: Set<string>, parts: unknown[]) {
  const cleanParts = parts.map(normalized).filter(Boolean);
  if (cleanParts.length >= 2) keys.add(cleanParts.join('|'));
}

function businessKeys(row: Record<string, unknown>, fallbackKey?: string) {
  const keys = new Set<string>();
  if (fallbackKey) keys.add(normalized(fallbackKey));
  addKey(keys, ['SO_QUY', row['Mã phiếu'] ?? row['Số phiếu']]);
  addKey(keys, ['SO_QUY_NGAY', row['Ngày'], row['Mã phiếu'] ?? row['Số phiếu']]);
  addKey(keys, ['FILE_PHIEU', row['Tên file nguồn'], row['Mã phiếu'] ?? row['Số phiếu']]);
  addKey(keys, ['HANG_NGAY_KHO', row['Ngày'] ?? row['Ngày kiểm kê'] ?? row['Ngày hủy'], row['Kho'], row['Mã hàng'] ?? row['Mã NVL'] ?? row['Tên hàng']]);
  addKey(keys, ['CONG_NO', row['Ngày'], row['Nhà cung cấp/Đối tượng'] ?? row['Nhà cung cấp'] ?? row['Đối tượng'], row['Còn phải trả'] ?? row['Phải trả']]);
  addKey(keys, ['BTT_PHIEU_HANG', row['Ngày'], row['Mã phiếu'], row['Cửa hàng'] ?? row['Chi nhánh'], row['Mã hàng'] ?? row['Tên hàng']]);
  return [...keys];
}

function addHash(index: ExistingRowIndex, key: string, hash: string) {
  if (!hash) return;
  const hashes = index.byKey.get(key) ?? new Set<string>();
  hashes.add(hash);
  index.byKey.set(key, hashes);
  index.byHash.add(hash);
}

export function buildExistingRowIndex(existingRows: Record<string, unknown>[]): ExistingRowIndex {
  const index: ExistingRowIndex = { byKey: new Map<string, Set<string>>(), byHash: new Set<string>() };
  for (const row of existingRows) {
    const storedHash = text(row['Dấu vết dòng']);
    const computedHash = hasComparableBusinessData(row) ? createRowHash(row) : '';
    const keys = businessKeys(row, text(row['Mã dòng dữ liệu']));
    if (!keys.length) {
      if (storedHash) index.byHash.add(storedHash);
      if (computedHash) index.byHash.add(computedHash);
      continue;
    }
    for (const key of keys) {
      addHash(index, key, storedHash);
      addHash(index, key, computedHash);
    }
  }
  return index;
}

export function classifyImportRows(rows: ImportRow[], existingIndex: ExistingRowIndex): ImportRow[] {
  return rows.map((row) => {
    let status: ImportRowStatus = 'Dòng mới';
    const keys = businessKeys(row.data, row.maDongDuLieu);
    const matchedHashes = keys.flatMap((key) => [...(existingIndex.byKey.get(key) ?? new Set<string>())]);
    const hasExactDuplicate = matchedHashes.includes(row.dauVetDong) || existingIndex.byHash.has(row.dauVetDong);
    const hasSameBusinessKey = matchedHashes.length > 0;
    if (row.errors?.length) status = 'Dòng lỗi';
    else if (hasExactDuplicate) status = 'Dữ liệu trùng';
    else if (hasSameBusinessKey) status = 'Dữ liệu lệch';
    return { ...row, status };
  });
}
