import { NextResponse } from 'next/server';
import { getDataStore } from '@/lib/data-store';
import { getServerEnv, hasGoogleSheetsEnv } from '@/lib/env/server-env';
import { SHEET_NAMES } from '@/lib/google-sheets/sheet-names';
import { createSheetsClient } from '@/lib/google-sheets/sheets-client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function maskSheetId(value?: string) {
  if (!value) return 'missing';
  if (value.length <= 12) return value;
  return `${value.slice(0, 6)}...${value.slice(-6)}`;
}

async function count(sheetName: string) {
  try {
    return (await getDataStore().read(sheetName)).length;
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'read failed' };
  }
}

export async function GET() {
  const env = getServerEnv();
  const sheetsHealth = await createSheetsClient().healthCheck().catch((error) => ({ ok: false, message: error instanceof Error ? error.message : 'health failed' }));
  const counts = {
    DL_SO_QUY: await count(SHEET_NAMES.DL_SO_QUY),
    DL_DOANH_THU_CUA_HANG: await count(SHEET_NAMES.DL_DOANH_THU_CUA_HANG),
    DL_DOANH_THU_APP: await count(SHEET_NAMES.DL_DOANH_THU_APP),
    DL_TON_KHO: await count(SHEET_NAMES.DL_TON_KHO),
    DL_THAT_THOAT_NVL: await count(SHEET_NAMES.DL_THAT_THOAT_NVL),
    IMPORT_LICH_SU: await count(SHEET_NAMES.IMPORT_LICH_SU)
  };

  return NextResponse.json({
    ok: true,
    build: 'DEBUG_DATA_SOURCE_V1_20260627',
    dataStoreEnv: env.dataStore,
    googleSheetsEnvReady: hasGoogleSheetsEnv(),
    googleSheetIdMasked: maskSheetId(env.googleSheetId),
    sheetsHealth,
    counts
  });
}
