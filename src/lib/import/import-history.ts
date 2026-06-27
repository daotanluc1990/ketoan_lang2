import { getDataStore } from '@/lib/data-store';
import { SHEET_NAMES } from '@/lib/google-sheets/sheet-names';

export async function getImportHistory() {
  return getDataStore().read(SHEET_NAMES.IMPORT_LICH_SU).catch((error) => {
    console.warn('[import-history] Cannot read import history:', error instanceof Error ? error.message : error);
    return [];
  });
}
