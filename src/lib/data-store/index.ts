import type { DataStore } from './store-interface';
import { googleSheetsStore } from './google-sheets-store';
import { localJsonStore } from './local-json-store';
import { withSanitizedReads } from './sanitized-data-store';

const MISSING_GOOGLE_SHEETS_MESSAGE = 'PRODUCTION_GOOGLE_SHEETS_NOT_CONFIGURED: Vercel chưa kết nối Google Sheet thật. Không được đọc/ghi local .data trên production. Kiểm tra GOOGLE_SHEET_ID, GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, DATA_STORE=google_sheets.';

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

export function getDataStore(): DataStore {
  const explicitLocal = process.env.DATA_STORE === 'local';
  const shouldUseGoogleSheets = process.env.DATA_STORE === 'google_sheets' || (!explicitLocal && hasGoogleSheetsRuntimeEnv());

  if (shouldUseGoogleSheets) return withSanitizedReads(googleSheetsStore);
  if (isProductionRuntime()) return withSanitizedReads(productionMissingGoogleSheetsStore);
  return withSanitizedReads(localJsonStore);
}
