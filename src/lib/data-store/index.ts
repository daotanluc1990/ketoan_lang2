import type { DataStore } from './store-interface';
import { googleSheetsStore } from './google-sheets-store';
import { localJsonStore } from './local-json-store';
import { withSanitizedReads } from './sanitized-data-store';

export function getDataStore(): DataStore {
  const baseStore = process.env.DATA_STORE === 'google_sheets' ? googleSheetsStore : localJsonStore;
  return withSanitizedReads(baseStore);
}
