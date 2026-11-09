/* ========================================================================
   Konten sheet-config.js DIGABUNG langsung di sini (inline) supaya file HTML
   ini 100% MANDIRI — tidak lagi bergantung pada file eksternal manapun untuk
   bisa tampil. Ini sengaja dibuat begini karena banyak tempat (preview di
   chat, dikirim by email, dibuka tanpa folder pendukung) hanya membaca satu
   file HTML ini saja, dan sebelumnya dashboard jadi blank total kalau
   sheet-config.js tidak ikut ada di folder yang sama.

   Kalau kamu mau menghubungkan ke Google Sheet: cukup edit langsung nilai
   SHEET_CONFIG di bawah ini (di dalam file HTML ini), TIDAK PERLU lagi edit
   file sheet-config.js terpisah. File sheet-config.js masih disertakan
   sebagai referensi/dokumentasi saja.
   ========================================================================= */

/* =========================================================================
   SHEET-CONFIG.JS
   Menghubungkan dashboard ke Google Sheet (tanpa API key, tanpa backend).
   Cara kerja: memakai endpoint publik Google Visualization ("gviz") yang bisa
   dibaca langsung oleh browser selama sheet di-share "Anyone with the link".

   ------------------------------------------------------------------------
   LANGKAH SETUP (sekali saja)
   ------------------------------------------------------------------------
   1. Di Google Sheet, buat SATU tab bernama PERSIS: "Marketing"
      (import file template-gsheet-marketing.csv ke tab tsb).
   2. Klik "Share" -> "Anyone with the link" -> role "Viewer".
   3. Ambil SPREADSHEET_ID dari URL sheet:
        https://docs.google.com/spreadsheets/d/  >>>SPREADSHEET_ID<<<  /edit
   4. Isi SHEET_CONFIG.spreadsheetId di bawah ini dengan ID tersebut.
   5. Header kolom baris pertama harus PERSIS seperti template (urutan bebas).
   6. Kolom angka diformat NUMBER di Google Sheets, bukan Text.

   ------------------------------------------------------------------------
   TEMPLATE KOLOM (tab "Marketing")
   ------------------------------------------------------------------------
   Period | Marketing_category | Marketing_type | Business | Target | MTD Target |
   Estimated Revenue (IDR) | Estimated Closing (IDR) | Target Tahunan

   - Period: format "YYYY-MM", contoh "2026-10". Satu baris = satu Business
     dalam satu periode. Isi riwayat bulan sebelumnya supaya MoM/QoQ/YoY dan
     perhitungan End of Year (YTD) bisa jalan.
   - Marketing_category > Marketing_type > Business = hierarki pivot
     (mis. B2B > B2B2C > Mass Market). Nama Marketing_type harus unik.
   - Target Tahunan: target SETAHUN penuh untuk Business tsb (nilai yang sama
     boleh diulang di semua bulan pada tahun yang sama). Kalau kosong/0,
     proyeksi End of Year tetap dihitung tapi tanpa achievement vs target.
   - Baris Total (per Type / Category / Grand Total) TIDAK perlu ada di sheet;
     semua subtotal dihitung otomatis.

   Kalau tab belum dibuat / belum diisi, dashboard TIDAK error: otomatis
   menampilkan data contoh (demo).
   ========================================================================= */

const SHEET_CONFIG = {
  spreadsheetId: "1ySfQyzsoLJT-X0ZRs9WOEIbqAc7FGdtv52d3eRNRIrY",

  // Nama TAB per Source — HARUS PERSIS sama dengan nama tab di Google Sheets.
  sourceSheets: {
    marketing: "Marketing",
  },

  autoRefreshMinutes: 5,

  // Paksa periode berjalan tertentu (berlaku untuk semua source & metric), format "YYYY-MM".
  // Kosongkan ("") untuk otomatis memakai periode terbaru per source+metric.
  currentPeriod: "",

  columns: {
    period: "Period",
    category: "Marketing_category",
    groupChannel: "Marketing_type",
    groupUnitBusiness: "Business",
    target: "Target",
    mtdTarget: "MTD Target",
    estimatedRevenue: "Estimated Revenue (IDR)",
    estimatedClosing: "Estimated Closing (IDR)",
    yearlyTarget: "Target Tahunan",
  },

  channelColorPalette: ["#F87171", "#FBBF24", "#22D3EE", "#34D399", "#A78BFA", "#F472B6"],
};

/* =========================================================================
   Tidak perlu diubah di bawah ini kecuali struktur sheet berubah drastis.
   ========================================================================= */

const REQUIRED_COLUMN_KEYS = [
  "groupChannel", "groupUnitBusiness", "target", "mtdTarget",
  "estimatedRevenue", "estimatedClosing",
];

function _normalizeMetric(raw){
  const s = String(raw || "").toLowerCase().trim();
  if(s.startsWith("view")) return "views";
  if(s.startsWith("video")) return "video";
  return "revenue"; // default / fallback untuk sheet lama tanpa kolom Metric
}

function _normalizeHeader(str) {
  return String(str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function _toNumber(v) {
  if (v === null || v === undefined || v === "") return 0;
  if (typeof v === "number") return v;
  const cleaned = String(v).replace(/[^0-9.\-]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function _buildSheetUrl(config, sheetName) {
  const base = `https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/gviz/tq?tqx=out:json`;
  return `${base}&sheet=${encodeURIComponent(sheetName)}`;
}

/* ---------- Helper aritmatika periode "YYYY-MM" (dipakai juga oleh dashboard) ---------- */
function parsePeriod(p) {
  const [y, m] = String(p).split("-").map(Number);
  return { y, m };
}
function periodKey(y, m) {
  return `${y}-${String(m).padStart(2, "0")}`;
}
function shiftMonth(period, delta) {
  let { y, m } = parsePeriod(period);
  m += delta;
  while (m < 1) { m += 12; y--; }
  while (m > 12) { m -= 12; y++; }
  return periodKey(y, m);
}
function quarterMonthsToDate(period) {
  const { y, m } = parsePeriod(period);
  const qStartMonth = Math.floor((m - 1) / 3) * 3 + 1;
  const months = [];
  for (let mm = qStartMonth; mm <= m; mm++) months.push(periodKey(y, mm));
  return months;
}
function priorQuarterMonthsToDate(period) {
  return quarterMonthsToDate(period).map((p) => shiftMonth(p, -3));
}
const ID_MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
function formatPeriodLabel(period) {
  const { y, m } = parsePeriod(period);
  if(!y || !m || m < 1 || m > 12 || isNaN(y) || isNaN(m)) return String(period); // fallback aman, bukan "undefined NaN"
  return `${ID_MONTHS[m - 1]} ${y}`;
}

/**
 * Ambil data mentah dari SATU tab/sheet -> array of row objects
 * { period, metric, groupChannel, groupUnitBusiness, target, mtdTarget, estimatedRevenue, estimatedClosing }
 */
/** Normalisasi nilai kolom Period jadi "YYYY-MM" yang valid, atau null kalau
 *  tidak bisa diartikan (kosong, format salah, dsb). Juga menangani kasus sel
 *  diformat sebagai Date di Google Sheets (gviz mengembalikannya sebagai
 *  string "Date(YYYY,MM,DD)" dengan bulan 0-based). */
function _normalizePeriodString(raw){
  if(raw === null || raw === undefined || raw === "") return null;
  const dateMatch = String(raw).match(/^Date\((\d+),(\d+),(\d+)/);
  if(dateMatch){
    const y = parseInt(dateMatch[1],10);
    const m = parseInt(dateMatch[2],10) + 1; // bulan di gviz 0-based
    return periodKey(y, m);
  }
  const s = String(raw).trim();
  const m2 = s.match(/^(\d{4})[\/\-](\d{1,2})$/);
  if(m2){
    const mm = parseInt(m2[2],10);
    if(mm >= 1 && mm <= 12) return periodKey(parseInt(m2[1],10), mm);
  }
  return null;
}

async function fetchSheetRows(config, sheetName) {
  if (!config.spreadsheetId || config.spreadsheetId.includes("PASTE_SPREADSHEET_ID")) {
    throw new Error("SHEET_CONFIG.spreadsheetId belum diisi. Lihat komentar di sheet-config.js.");
  }

  const url = _buildSheetUrl(config, sheetName);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Gagal mengambil tab "${sheetName}" (HTTP ${res.status}). Pastikan sheet di-share "Anyone with the link" dan nama tab benar.`);
  }

  const text = await res.text();
  const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?\s*$/);
  if (!match) {
    throw new Error(`Format respons tab "${sheetName}" tidak dikenali. Cek apakah nama tab tsb benar dan sheet-nya publik.`);
  }

  let json;
  try {
    json = JSON.parse(match[1]);
  } catch (e) {
    throw new Error(`Gagal parse JSON dari tab "${sheetName}": ` + e.message);
  }

  if (json.status === "error") {
    const msg = (json.errors && json.errors[0] && json.errors[0].detailed_message) || `Tab "${sheetName}" tidak ditemukan.`;
    throw new Error("Google Sheet error: " + msg);
  }

  const cols = json.table.cols.map((c) => _normalizeHeader(c.label));
  const colIndex = {};
  Object.entries(config.columns).forEach(([key, headerLabel]) => {
    colIndex[key] = cols.indexOf(_normalizeHeader(headerLabel));
  });

  const missing = REQUIRED_COLUMN_KEYS.filter((key) => colIndex[key] === -1).map((key) => config.columns[key]);
  if (missing.length) {
    throw new Error(`Kolom berikut tidak ditemukan di tab "${sheetName}": ` + missing.join(", "));
  }

  const hasPeriodColumn = colIndex.period !== undefined && colIndex.period !== -1;
  const hasMetricColumn = colIndex.metric !== undefined && colIndex.metric !== -1;

  let skippedInvalidPeriod = 0;
  let skippedEmpty = 0;

  const rows = json.table.rows
    .map((row) => {
      const cell = (key) => (row.c[colIndex[key]] ? row.c[colIndex[key]].v : null);
      const groupChannel = String(cell("groupChannel") || "").trim();
      const groupUnitBusiness = String(cell("groupUnitBusiness") || "").trim();
      const isEmptyRow = groupChannel === "" && groupUnitBusiness === "";

      let period = null;
      if(hasPeriodColumn){
        period = _normalizePeriodString(cell("period"));
      } else {
        period = config.currentPeriod || "current";
      }

      const rawMetric = hasMetricColumn ? String(cell("metric") || "").trim() : "";
      return {
        period,
        metric: _normalizeMetric(rawMetric),
        category: String(cell("category") || "").trim(),
        yearlyTarget: _toNumber(cell("yearlyTarget")),
        groupChannel, groupUnitBusiness,
        target: _toNumber(cell("target")),
        mtdTarget: _toNumber(cell("mtdTarget")),
        estimatedRevenue: _toNumber(cell("estimatedRevenue")),
        estimatedClosing: _toNumber(cell("estimatedClosing")),
        _isEmptyRow: isEmptyRow,
      };
    })
    .filter((r) => {
      if(r._isEmptyRow){ skippedEmpty++; return false; }
      if(hasPeriodColumn && r.period === null){ skippedInvalidPeriod++; return false; }
      return true;
    })
    .map((r) => { delete r._isEmptyRow; return r; });

  if(skippedInvalidPeriod > 0){
    console.warn(`[sheet-config] Tab "${sheetName}": ${skippedInvalidPeriod} baris diabaikan karena kolom Period kosong/format tidak valid (harus "YYYY-MM", contoh "2026-07").`);
  }

  if (!rows.length) {
    throw new Error(`Tab "${sheetName}" berhasil dibuka tapi tidak ada baris data yang valid` + (skippedInvalidPeriod ? ` (${skippedInvalidPeriod} baris diabaikan karena Period tidak valid — cek format "YYYY-MM").` : '.'));
  }

  return rows;
}

function _mkUnit(name, target, mtdTarget, actual, closing, yearlyTarget) {
  const { mtdPct, achPct, gapPct } = _computePercents(target, mtdTarget, actual);
  return { name, target, mtdTarget, actual, closing, yearlyTarget: yearlyTarget || 0, mtdPct, achPct, gapPct };
}
function _aggregate(items) {
  const sum = (k) => items.reduce((s, x) => s + (x[k] || 0), 0);
  const target = sum("target"), mtdTarget = sum("mtdTarget"), actual = sum("actual"), closing = sum("closing"), yearlyTarget = sum("yearlyTarget");
  return { target, mtdTarget, actual, closing, yearlyTarget, ..._computePercents(target, mtdTarget, actual) };
}
function _mkChannel(name, category, color, units) { return { name, category, color, total: _aggregate(units), units }; }
function _mkGrand(channels) { return _aggregate(channels.map((c) => c.total)); }

function _computePercents(target, mtdTarget, actual) {
  const mtdPct = mtdTarget !== 0 ? (actual / mtdTarget) * 100 : 0;
  const achPct = target !== 0 ? (actual / target) * 100 : 0;
  const gapPct = mtdTarget !== 0 ? mtdPct - 100 : 0;
  return { mtdPct, achPct, gapPct };
}

/**
 * Ubah rows (SATU periode saja) -> { DATA, GRAND }.
 * DATA = daftar Marketing_type (channel) { name, category, color, total, units[Business] },
 * diurutkan supaya Marketing_category yang sama berdekatan.
 */
function buildDashboardData(rows, config, metric) {
  const order = [];
  const map = new Map();
  const catOrder = [];
  rows.forEach((r) => {
    if (!catOrder.includes(r.category)) catOrder.push(r.category);
    const key = r.category + "||" + r.groupChannel;
    if (!map.has(key)) { map.set(key, { name: r.groupChannel, category: r.category, units: [] }); order.push(key); }
    map.get(key).units.push(_mkUnit(r.groupUnitBusiness, r.target, r.mtdTarget, r.estimatedRevenue, r.estimatedClosing, r.yearlyTarget));
  });
  order.sort((a, b) => catOrder.indexOf(map.get(a).category) - catOrder.indexOf(map.get(b).category));
  const DATA = order.map((key, i) => {
    const c = map.get(key);
    return _mkChannel(c.name, c.category, config.channelColorPalette[i % config.channelColorPalette.length], c.units);
  });
  return { DATA, GRAND: _mkGrand(DATA) };
}

/**
 * Kelompokkan rows SATU SOURCE (bisa multi-metric + multi-periode) ->
 * { revenue:{periodsIndex,currentPeriod,allPeriods}, views:{...}, video:{...} }
 * Metric yang tidak ada datanya di tab ini TIDAK dimasukkan.
 */
function buildMetricsIndex(rows, config) {
  const byMetric = new Map();
  rows.forEach((r) => {
    if (!byMetric.has(r.metric)) byMetric.set(r.metric, []);
    byMetric.get(r.metric).push(r);
  });

  const metricsIndex = {};
  byMetric.forEach((metricRows, metric) => {
    const byPeriod = new Map();
    metricRows.forEach((r) => {
      if (!byPeriod.has(r.period)) byPeriod.set(r.period, []);
      byPeriod.get(r.period).push(r);
    });
    const periodsIndex = {};
    byPeriod.forEach((periodRows, period) => {
      periodsIndex[period] = buildDashboardData(periodRows, config, metric);
    });
    const allPeriods = Array.from(byPeriod.keys()).sort();
    const currentPeriod = (config.currentPeriod && periodsIndex[config.currentPeriod])
      ? config.currentPeriod
      : allPeriods[allPeriods.length - 1];
    metricsIndex[metric] = { periodsIndex, currentPeriod, allPeriods };
  });

  return metricsIndex;
}

/**
 * Fetch + transform SEMUA source (Marketing) sekaligus, masing-masing
 * dari tab-nya sendiri. Setiap source diambil independen — kalau satu tab
 * gagal/tidak ada, source lain tetap lanjut berhasil.
 * Return: { youtube: {ok:true, metricsIndex} | {ok:false, error}, meta:{...}, tiktok:{...} }
 */
async function loadAllSourcesFromSheet(config = SHEET_CONFIG) {
  const entries = Object.entries(config.sourceSheets);
  const results = {};
  await Promise.all(entries.map(async ([source, sheetName]) => {
    try {
      const rows = await fetchSheetRows(config, sheetName);
      results[source] = { ok: true, metricsIndex: buildMetricsIndex(rows, config) };
    } catch (e) {
      results[source] = { ok: false, error: e.message };
    }
  }));
  return results;
}
