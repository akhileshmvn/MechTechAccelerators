// Source data from the provided addresses_embedded.js file
// In a real app, this could be imported from a JSON file, but for the mockup, we'll inline a subset
// and provide the full list logic.
const ADDRESS_DATA = [
  {"Address":"71 ST. NICHOLAS DRIVE","City":"NORTH POLE","State":"AK","Zip":"99705"},
  {"Address":"356 OLD STEESE HWY","City":"FAIRBANKS","State":"AK","Zip":"99701"},
  {"Address":"3576 AIRPORT WAY","City":"FAIRBANKS","State":"AK","Zip":"99709"},
  {"Address":"9400 GLACIER HWY","City":"JUNEAU","State":"AK","Zip":"99803"},
  {"Address":"201 KATLIAN ST","City":"SITKA","State":"AK","Zip":"99835"},
  {"Address":"2417 TONGASS AVE","City":"KETCHIKAN","State":"AK","Zip":"99901"},
  {"Address":"402 W. MARINE WAY","City":"KODIAK","State":"AK","Zip":"99615"},
  {"Address":"3726 LAKE STREET","City":"HOMER","State":"AK","Zip":"99603"},
  {"Address":"35553 KENAI SPUR HIGHWAY","City":"SOLDOTNA","State":"AK","Zip":"99669"},
  {"Address":"10672 KENAI SPUR HIGHWAY","City":"KENAI","State":"AK","Zip":"99611"},
  {"Address":"1830 E. PARKS HWY","City":"WASILLA","State":"AK","Zip":"99654"},
  {"Address":"4711 BUSINESS PARK BLVD","City":"ANCHORAGE","State":"AK","Zip":"99503"},
  {"Address":"320 W 5TH AVENUE","City":"ANCHORAGE","State":"AK","Zip":"99501"},
  {"Address":"1865 E PARKS HWY","City":"WASILLA","State":"AK","Zip":"99654"},
  {"Address":"320 WEST 5TH AVE","City":"ANCHORAGE","State":"AK","Zip":"99501"},
  {"Address":"600 E. NORTHERN LIGHTS BLVD. #E","City":"ANCHORAGE","State":"AK","Zip":"99503"},
  {"Address":"11432 BUSINESS BLVD","City":"EAGLE RIVER","State":"AK","Zip":"99577"},
  {"Address":"800 E DIMOND BLVD","City":"ANCHORAGE","State":"AK","Zip":"99515"},
  {"Address":"1118 N MULDOON ROAD","City":"ANCHORAGE","State":"AK","Zip":"99504"}
];

import ExcelJS from 'exceljs';
import { saveFile } from './file-utils';

const LETTERS = "ABCDEFGHJKLMNOPQRSTUVWXYZ";
const L2I = Object.fromEntries([...LETTERS].map((c, i) => [c, i]));

function isValidStartName(name: string) {
  if (!name || name.length < 5) return false;
  const suffix = name.slice(-4);
  return /^[A-Z]{4}$/.test(suffix) && [...suffix].every(ch => ch in L2I);
}

function splitPrefix(name: string) {
  return { prefix: name.slice(0, -4), counter: name.slice(-4) };
}

function decodeCounter(s: string) {
  let v = 0;
  for (const ch of s) {
    v = v * 25 + L2I[ch];
  }
  return v;
}

function encodeCounter(n: number) {
  let out = Array(4).fill('A');
  for (let i = 3; i >= 0; i--) {
    out[i] = LETTERS[n % 25];
    n = Math.floor(n / 25);
  }
  return n > 0 ? null : out.join('');
}

function generateNames(startName: string, count: number) {
  startName = startName.toUpperCase().trim();
  if (!isValidStartName(startName)) throw new Error("Invalid start name: " + startName + ". Must end with 4 letters A–Z excluding 'I'.");
  if (!(count > 0)) throw new Error("Count must be positive for " + startName);
  
  const { prefix, counter } = splitPrefix(startName);
  const base = decodeCounter(counter);
  const list = [];
  
  for (let i = 0; i < count; i++) {
    const enc = encodeCounter(base + i);
    if (enc === null) throw new Error("Sequence overflow after " + i + " names for start " + startName);
    const full = prefix + enc;
    list.push({ index: i + 1, last: full, first: enc });
  }
  return list;
}

function pickRandomAddress() {
  const idx = Math.floor(Math.random() * ADDRESS_DATA.length);
  const a = ADDRESS_DATA[idx];
  return { 
    Address: String(a.Address || ''), 
    City: String(a.City || ''), 
    State: String(a.State || '').toUpperCase(), 
    Zip: String(a.Zip || '') 
  };
}

function randomGender() {
  return Math.random() < 0.5 ? 'Male' : 'Female';
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function randomDOBBefore2000() {
  const start = new Date(1950, 0, 1).getTime();
  const end = new Date(1999, 11, 31).getTime();
  const t = start + Math.floor(Math.random() * (end - start + 1));
  const d = new Date(t);
  return `${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}/${d.getFullYear()}`;
}

function timestamp() {
  const d = new Date();
  const z = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${z(d.getMonth() + 1)}${z(d.getDate())}_${z(d.getHours())}${z(d.getMinutes())}${z(d.getSeconds())}`;
}

export interface Batch {
  id: string;
  startName: string;
  count: number;
}

export async function generatePatientData(batches: Batch[], fileName?: string) {
  let all: any[] = [];
  
  for (const b of batches) {
    const names = generateNames(b.startName, b.count);
    names.forEach((n: any) => {
      const a = pickRandomAddress();
      n.addr = { Address: a.Address, City: a.City, State: a.State, Zip: String(a.Zip || '').padStart(5, '0') };
      n.gender = randomGender();
      n.dob = randomDOBBefore2000();
      all.push(n);
    });
  }

  const header = [
    "Index", "Scenario", "TestCase", "LastName", "FirstName", "PatientMRN", "HealthPlan", "Address", "City", "Zip", "State", "Gender", "DOB",
    "RCEncounterLocation", "RCEncounter", "Encounter1", "Encounter2", "SecondaryPersonnel", "PersonID", "ReferralSource1", "ReferralSource2", "ReferralReason1", "ReferralReason2", "RCEncounterAdded", "Encounter1Added", "Encounter2Added", "HP1Added", "HP2Added", "Unassigned"
  ];

  const rows = all.map(r => [
    r.index, "", "", r.last, r.first, "", "", r.addr.Address, r.addr.City, String(r.addr.Zip || '').padStart(5, '0'),
    r.addr.State, r.gender, r.dob,
    "ED", "Historical", "CKCC - ESKD", "TOC - ESKD", "", "", "Care Manager", "Care Manager", "Care coordination", "Care coordination", "", "", "", "", "", ""
  ]);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Patients', { views: [{ state: 'frozen', ySplit: 1 }] });

  ws.addRow(header);
  ws.addRows(rows);

  const headerRow = ws.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  headerRow.height = 20;
  headerRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } };
  });

  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: header.length } };

  // Set column widths
  const MIN: Record<number, number> = { 4: 10, 8: 24, 9: 14, 10: 8, 11: 8, 12: 8, 13: 12 };
  const padding = 2;
  
  header.forEach((h, i) => {
    const colIndex = i + 1;
    let maxLen = String(h).length;
    // Sample only first 50 rows for performance if large
    const sampleLimit = Math.min(ws.rowCount, 50); 
    for (let r = 2; r <= sampleLimit; r++) {
      const val = ws.getRow(r).getCell(colIndex).value;
      const len = val ? String(val).length : 0;
      if (len > maxLen) maxLen = len;
    }
    ws.getColumn(colIndex).width = Math.max(maxLen + padding, MIN[colIndex] || 6);
  });

  const base = fileName?.trim();
  const fname = (base ? base : `Patients_${timestamp()}`) + '.xlsx';
  const buffer = await wb.xlsx.writeBuffer();
  
  await saveFile(
    new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    fname,
    "Excel Spreadsheet",
    { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"] }
  );
}
