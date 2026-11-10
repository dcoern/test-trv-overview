/* =========================================================================
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
   - Target Tahunan (CARA 1, disarankan): buat tab TERPISAH bernama "TargetTahunan" dengan kolom
     Tahun | Marketing_type | Business | Target Tahunan (1 baris per Business per tahun).
     Kolom Marketing_type opsional (dipakai kalau nama Business ada di lebih dari satu Type).
   - Target Tahunan (CARA 2, cadangan): kolom "Target Tahunan" di tab Marketing, target SETAHUN penuh untuk Business tsb (nilai yang sama
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
    yearlyTarget: "Target Tahunan",   // opsional: dipakai kalau tab TargetTahunan tidak ada
  },

  // Tab TERPISAH untuk Target Tahunan per Business (disarankan).
  // Kolom: Tahun | Marketing_type (opsional) | Business | Target Tahunan
  // Kalau tab ini tidak ada/gagal dibaca, dashboard memakai kolom "Target Tahunan" di tab Marketing.
  // Tab Sales League (Corporate & Wholesales). 1 baris = 1 sales x 1 bulan.
  // Kalau tab tidak ada / belum diisi, halaman Sales League memakai data contoh (demo).
  salesLeague: {
    sheet: "SalesLeague",
    // spreadsheetId: "",     // opsional: isi kalau Sales League memakai file Google Sheet TERPISAH
    topN: 5,            // jumlah sales di "Best Performance"
    remindN: 5,         // maksimum sales di "Reminder"
    remindBelow: 80,    // KPI Score (%) di bawah ini = perlu reminder
    // KPI Score = jumlah (bobot x skor komponen) / jumlah bobot komponen yang datanya ada
    weights: { achievement: 70, churn: 10, activity: 20 },
    achCap: 120,        // Achievement dihitung maksimal segini (%) dalam KPI Score
    actCap: 100,        // Activity (FU pelanggan baru) dihitung maksimal segini (%) dalam KPI Score
    columns: {
      period: "Period",
      name: "Nama Sales",
      join: "Join Date",
      unit: "Business Unit",
      segment: "Segment",
      arpu: "ARPU Tier",
      region: "Regional/Kota",
      asm: "ASM",                              // nama ASM (atasan langsung sales), opsional
      targetNew: "Target New Acquisition",
      targetMonthly: "Target Bulanan",        // New + Recurring. Target Recurring = Target Bulanan - Target New
      targetRecurring: "Target Recurring",    // alternatif kalau tidak ada kolom Target Bulanan
      actualNew: "Actual New Acquisition",
      actualRecurring: "Actual Recurring",
      targetFu: "Target FU Pelanggan Baru",   // opsional: target jumlah follow-up calon pelanggan baru per bulan
      actualFu: "Actual FU Pelanggan Baru",   // opsional: realisasi follow-up
      churn: "Churn (IDR)",                   // opsional
      base: "Recurring Base (IDR)",           // opsional
      targetChurn: "Target Churn %",          // opsional, mis. 2 atau 2%
    },
  },

  yearlyTargetSheet: "TargetTahunan",
  yearlyColumns: {
    year: "Tahun",
    type: "Marketing_type",
    business: "Business",
    target: "Target Tahunan",
  },

  channelColorPalette: ["#DC2626", "#D97706", "#0891B2", "#059669", "#7C3AED", "#DB2777"],
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
/** Baca tab TargetTahunan -> { byTypeBusiness: Map("tahun||type||business"), byBusiness: Map("tahun||business") }.
 *  Return null kalau tab tidak ada / kosong / kolom wajib tidak lengkap (dashboard lalu
 *  memakai kolom "Target Tahunan" di tab Marketing). */
function _isoDateFromSheet(v){
  if(v === null || v === undefined || v === "") return "";
  let d = null;
  const m = String(v).match(/^Date\((\d+),(\d+),(\d+)/);
  if(m) d = new Date(+m[1], +m[2], +m[3]);
  else { const t = new Date(String(v).trim()); if(!isNaN(t)) d = t; }
  if(!d) return "";
  return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
}

/** Baca tab SalesLeague -> array baris
 *  { period,name,join,unit,segment,arpu,tNew,tRec,aNew,aRec,churn,base,tcPct }.
 *  Hanya Business Unit Corporate & Wholesales yang dipakai. Return null kalau tab tidak ada/kosong/kolom kurang. */
async function fetchLeagueRows(config) {
  const lc = config.salesLeague;
  if (!lc || !lc.sheet) return null;
  const sid = lc.spreadsheetId || config.spreadsheetId;
  if (!sid || sid.includes("PASTE_SPREADSHEET_ID")) return null;
  try {
    const res = await fetch(_buildSheetUrl({ ...config, spreadsheetId: sid }, lc.sheet));
    if (!res.ok) return null;
    const text = await res.text();
    const m = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?\s*$/);
    if (!m) return null;
    const json = JSON.parse(m[1]);
    if (json.status === "error" || !json.table) return null;
    const labels = json.table.cols.map((c) => _normalizeHeader(c.label));
    const ix = {};
    Object.entries(lc.columns).forEach(([k, h]) => { ix[k] = labels.indexOf(_normalizeHeader(h)); });
    const need = ["period","name","unit","targetNew","actualNew","actualRecurring"];
    const miss = need.filter((k) => ix[k] < 0).map((k) => lc.columns[k]);
    if (ix.targetMonthly < 0 && ix.targetRecurring < 0) miss.push(`${lc.columns.targetMonthly} (atau ${lc.columns.targetRecurring})`);
    if (miss.length) { console.warn(`[sheet-config] Tab "${lc.sheet}" ada tapi kolom ini tidak ditemukan: ${miss.join(", ")} — Sales League memakai data contoh.`); return null; }
    const hasChurn = ix.churn >= 0 && ix.base >= 0;
    const hasFu = ix.targetFu >= 0 && ix.actualFu >= 0;
    const out = [];
    json.table.rows.forEach((row) => {
      const cell = (k) => (ix[k] >= 0 && row.c[ix[k]] ? row.c[ix[k]] : null);
      const v = (k) => { const c = cell(k); return c ? c.v : null; };
      const period = _normalizePeriodString(v("period"));
      const name = String(v("name") || "").trim();
      const unitRaw = String(v("unit") || "").toLowerCase();
      const unit = unitRaw.includes("corporate") ? "Corporate" : (unitRaw.includes("wholesale") ? "Wholesales" : "");
      if (!period || !name || !unit) return;
      const segRaw = String(v("segment") || "").toLowerCase();
      const segment = unit === "Wholesales" ? "Wholesales" : (segRaw.includes("sam") ? "Corporate (SAM)" : "Corporate (Organic)");
      const tNew = _toNumber(v("targetNew"));
      const tRec = ix.targetMonthly >= 0 ? Math.max(0, _toNumber(v("targetMonthly")) - tNew) : _toNumber(v("targetRecurring"));
      // Target Churn %: "2%" (sel berformat persen -> 0.02) atau angka 2 -> keduanya = 2 (persen)
      let tcPct = null;
      const tc = cell("targetChurn");
      if (tc && tc.v !== null && tc.v !== "") {
        const raw = _toNumber(tc.v);
        tcPct = (typeof tc.f === "string" && tc.f.includes("%")) ? raw * 100 : raw;
      }
      out.push({
        period, name, unit, segment,
        join: _isoDateFromSheet(v("join")),
        arpu: String(v("arpu") || "").trim(),
        region: String(v("region") || "").trim(),
        asm: String(v("asm") || "").trim(),
        tNew, tRec, aNew: _toNumber(v("actualNew")), aRec: _toNumber(v("actualRecurring")),
        tFu: hasFu ? _toNumber(v("targetFu")) : null, aFu: hasFu ? _toNumber(v("actualFu")) : null,
        churn: hasChurn ? _toNumber(v("churn")) : null,
        base: hasChurn ? _toNumber(v("base")) : null,
        tcPct,
      });
    });
    return out.length ? out : null;
  } catch (e) {
    console.warn("[sheet-config] Tab SalesLeague gagal dibaca:", e.message);
    return null;
  }
}

async function fetchYearlyTargets(config) {
  if (!config.yearlyTargetSheet) return null;
  try {
    const res = await fetch(_buildSheetUrl(config, config.yearlyTargetSheet));
    if (!res.ok) return null;
    const text = await res.text();
    const m = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?\s*$/);
    if (!m) return null;
    const json = JSON.parse(m[1]);
    if (json.status === "error" || !json.table) return null;
    const labels = json.table.cols.map((c) => _normalizeHeader(c.label));
    const ix = (name) => labels.indexOf(_normalizeHeader(name));
    const yc = config.yearlyColumns;
    const iY = ix(yc.year), iB = ix(yc.business), iT = ix(yc.target), iType = ix(yc.type);
    if (iY < 0 || iB < 0 || iT < 0) {
      console.warn(`[sheet-config] Tab "${config.yearlyTargetSheet}" ada tapi kolom wajib (${yc.year}, ${yc.business}, ${yc.target}) tidak lengkap — pakai kolom Target Tahunan di tab Marketing.`);
      return null;
    }
    const byTypeBusiness = new Map(), byBusiness = new Map();
    let n = 0;
    json.table.rows.forEach((row) => {
      const v = (i) => (i >= 0 && row.c[i] ? row.c[i].v : null);
      const year = parseInt(String(v(iY)).replace(/[^0-9]/g, ""), 10);
      const business = String(v(iB) || "").trim();
      const target = _toNumber(v(iT));
      if (!year || !business) return;
      const type = iType >= 0 ? String(v(iType) || "").trim() : "";
      if (type) byTypeBusiness.set(`${year}||${type}||${business}`, target);
      byBusiness.set(`${year}||${business}`, target);
      n++;
    });
    return n > 0 ? { byTypeBusiness, byBusiness, count: n } : null;
  } catch (e) {
    console.warn("[sheet-config] Tab TargetTahunan gagal dibaca:", e.message);
    return null;
  }
}

/** Timpa row.yearlyTarget dengan nilai dari tab TargetTahunan (cocok per tahun + type + business). */
function applyYearlyTargets(rows, yt) {
  if (!yt) return 0;
  let matched = 0;
  rows.forEach((r) => {
    const y = parsePeriod(r.period).y;
    if (!y) return;
    let v = yt.byTypeBusiness.get(`${y}||${r.groupChannel}||${r.groupUnitBusiness}`);
    if (v === undefined) v = yt.byBusiness.get(`${y}||${r.groupUnitBusiness}`);
    if (v !== undefined) { r.yearlyTarget = v; matched++; }
  });
  return matched;
}

async function loadAllSourcesFromSheet(config = SHEET_CONFIG) {
  const entries = Object.entries(config.sourceSheets);
  const results = {};
  const yearlyTargets = await fetchYearlyTargets(config);
  await Promise.all(entries.map(async ([source, sheetName]) => {
    try {
      const rows = await fetchSheetRows(config, sheetName);
      applyYearlyTargets(rows, yearlyTargets);
      results[source] = { ok: true, metricsIndex: buildMetricsIndex(rows, config) };
    } catch (e) {
      results[source] = { ok: false, error: e.message };
    }
  }));
  return results;
}
