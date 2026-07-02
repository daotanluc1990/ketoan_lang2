import type { DataStore } from './store-interface';
import { googleSheetsStore } from './google-sheets-store';
import { localJsonStore } from './local-json-store';
import { withSanitizedReads } from './sanitized-data-store';

const MISSING_GOOGLE_SHEETS_MESSAGE = 'PRODUCTION_GOOGLE_SHEETS_NOT_CONFIGURED: Vercel chưa kết nối Google Sheet thật. Không được đọc/ghi local .data trên production. Kiểm tra GOOGLE_SHEET_ID, GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, DATA_STORE=google_sheets.';
const READ_CACHE_TTL_MS = 120_000;
const readCache = new Map<string, { expiresAt: number; rows: Awaited<ReturnType<DataStore['read']>> }>();

function hasGoogleSheetsRuntimeEnv() {
  return Boolean(process.env.GOOGLE_SHEET_ID && process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);
}

function isProductionRuntime() {
  return process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
}

const productionMissingGoogleSheetsStore: DataStore = {
  async read() {
    throw new Error(MISSING_GOOGLE_SHEETS_MESSAGE);
  },
  async append() {
    throw new Error(MISSING_GOOGLE_SHEETS_MESSAGE);
  },
  async replace() {
    throw new Error(MISSING_GOOGLE_SHEETS_MESSAGE);
  },
  async markRowsByImportId(input) {
    throw new Error(`${MISSING_GOOGLE_SHEETS_MESSAGE} Không thể rollback ${input.maLanImport}.`);
  }
};

function clearReadCache(sheetName?: string) {
  if (sheetName) {
    readCache.delete(sheetName);
    return;
  }
  readCache.clear();
}

function withShortReadCache(store: DataStore): DataStore {
  return {
    async read(sheetName) {
      const now = Date.now();
      const cached = readCache.get(sheetName);
      if (cached && cached.expiresAt > now) return cached.rows.map((row) => ({ ...row }));
      const rows = await store.read(sheetName);
      readCache.set(sheetName, { expiresAt: now + READ_CACHE_TTL_MS, rows: rows.map((row) => ({ ...row })) });
      return rows;
    },
    async append(sheetName, rows) {
      await store.append(sheetName, rows);
      clearReadCache(sheetName);
      clearReadCache();
    },
    async replace(sheetName, rows) {
      await store.replace(sheetName, rows);
      clearReadCache(sheetName);
      clearReadCache();
    },
    async markRowsByImportId(input) {
      const result = store.markRowsByImportId
        ? await store.markRowsByImportId(input)
        : { sheetName: input.sheetName, matchedRows: 0, updatedRows: 0 };
      clearReadCache(input.sheetName);
      clearReadCache();
      return result;
    }
  };
}

export function getDataStore(): DataStore {
  const explicitLocal = process.env.DATA_STORE === 'local';
  const shouldUseGoogleSheets = process.env.DATA_STORE === 'google_sheets' || (!explicitLocal && hasGoogleSheetsRuntimeEnv());

  if (shouldUseGoogleSheets) return withShortReadCache(withSanitizedReads(googleSheetsStore));
  if (isProductionRuntime()) return withSanitizedReads(productionMissingGoogleSheetsStore);
  return withShortReadCache(withSanitizedReads(localJsonStore));
}
