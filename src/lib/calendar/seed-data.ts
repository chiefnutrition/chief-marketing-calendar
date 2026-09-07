import type { DateCategory, Region } from "./types";

export type KeyDateSeed = {
  name: string;
  start: string;
  end?: string;
  region: Region;
  category: DateCategory;
  notes?: string;
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function iso(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function nthWeekday(year: number, month: number, weekday: number, n: number): string {
  const first = new Date(year, month - 1, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  const day = 1 + offset + (n - 1) * 7;
  return iso(year, month, day);
}

function lastWeekday(year: number, month: number, weekday: number): string {
  const last = new Date(year, month, 0).getDate();
  const d = new Date(year, month - 1, last);
  const diff = (d.getDay() - weekday + 7) % 7;
  return iso(year, month, last - diff);
}

function firstSunday(year: number, month: number): string {
  return nthWeekday(year, month, 0, 1);
}

/** Anonymous Gregorian algorithm — returns Easter Sunday. */
function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function shift(date: Date, days: number): string {
  const n = new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  return iso(n.getFullYear(), n.getMonth() + 1, n.getDate());
}

function fromParts(isoDate: string): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const LUNAR: Record<number, { cny: string; diwali: string }> = {
  2026: { cny: "2026-02-17", diwali: "2026-11-08" },
  2027: { cny: "2027-02-06", diwali: "2027-10-29" },
};

const SUPER_BOWL: Record<number, string> = {
  2026: "2026-02-08",
  2027: "2027-02-14",
};

function buildYear(year: number): KeyDateSeed[] {
  const easter = easterSunday(year);
  const lunar = LUNAR[year];
  const rows: KeyDateSeed[] = [];

  const add = (
    name: string,
    start: string,
    opts?: { end?: string; region?: Region; category?: DateCategory; notes?: string },
  ) => {
    rows.push({
      name,
      start,
      end: opts?.end,
      region: opts?.region ?? "BOTH",
      category: opts?.category ?? "public",
      notes: opts?.notes,
    });
  };

  add("New Year's Day", iso(year, 1, 1), { notes: "National public holiday" });
  add("New Year's resolutions window", iso(year, 1, 1), {
    end: iso(year, 1, 14),
    category: "retail",
    notes: "Health, protein, new-year reset campaigns",
  });
  add("Martin Luther King Jr. Day", nthWeekday(year, 1, 1, 3), {
    region: "US",
    notes: "3rd Monday in January",
  });
  add("Australia Day", iso(year, 1, 26), {
    region: "AU",
    notes: "National public holiday",
  });
  add("Back to school (AU)", iso(year, 1, 27), {
    end: iso(year, 2, 6),
    region: "AU",
    category: "school",
    notes: "Lunchbox / lunchbox bar window as NSW term 1 starts",
  });
  add("Chinese New Year", lunar?.cny ?? iso(year, 2, 1), {
    category: "cultural",
    notes: "Lunar new year — gifting and family meals",
  });
  add("Super Bowl", SUPER_BOWL[year] ?? nthWeekday(year, 2, 0, 2), {
    region: "US",
    category: "sporting",
    notes: "Snacking and party-food campaigns",
  });
  add("Valentine's Day", iso(year, 2, 14), {
    category: "retail",
    notes: "Gifting — bars, hampers, couples",
  });
  add("Presidents' Day", nthWeekday(year, 2, 1, 3), {
    region: "US",
    notes: "3rd Monday in February — long weekend sales",
  });
  add("Labour Day (WA)", nthWeekday(year, 3, 1, 1), {
    region: "AU",
    notes: "Western Australia — 1st Monday in March",
  });
  add("Labour Day (VIC / TAS)", nthWeekday(year, 3, 1, 2), {
    region: "AU",
    notes: "2nd Monday in March",
  });
  add("Canberra Day", nthWeekday(year, 3, 1, 2), {
    region: "AU",
    notes: "ACT public holiday",
  });
  add("International Women's Day", iso(year, 3, 8), {
    category: "cultural",
  });
  add("St Patrick's Day", iso(year, 3, 17), {
    region: "US",
    category: "cultural",
  });
  add("US spring break (typical)", iso(year, 3, 9), {
    end: iso(year, 3, 20),
    region: "US",
    category: "school",
    notes: "Timing varies by district — mid-March is the common window",
  });
  add("World Health Day", iso(year, 4, 7), {
    category: "cultural",
    notes: "Everyday nutrition, recovery, protein-as-food",
  });
  add("Earth Day", iso(year, 4, 22), {
    category: "cultural",
    notes: "Regen / organic / planet-led campaigns",
  });
  add("Good Friday", shift(easter, -2), { notes: "Public holiday AU + some US states" });
  add("Easter Saturday", shift(easter, -1), { region: "AU" });
  add("Easter Sunday", shift(easter, 0), { category: "retail", notes: "Gifting, family, long weekend" });
  add("Easter Monday", shift(easter, 1), { region: "AU" });
  add("Anzac Day", iso(year, 4, 25), {
    region: "AU",
    notes: "National day of remembrance",
  });
  add("US Tax Day", iso(year, 4, 15), {
    region: "US",
    category: "retail",
    notes: "Observed if it falls on a weekend",
  });
  add("Labour Day (QLD / NT)", nthWeekday(year, 5, 1, 1), {
    region: "AU",
    notes: "1st Monday in May",
  });
  add("Mother's Day", nthWeekday(year, 5, 0, 2), {
    category: "retail",
    notes: "2nd Sunday in May — same date in AU and US. Plan EDM 7–10 days prior.",
  });
  add("National Sorry Day", iso(year, 5, 26), {
    region: "AU",
    category: "cultural",
  });
  add("National Reconciliation Week", iso(year, 5, 27), {
    end: iso(year, 6, 3),
    region: "AU",
    category: "cultural",
  });
  add("Memorial Day", lastWeekday(year, 5, 1), {
    region: "US",
    notes: "Last Monday in May — unofficial start of US summer",
  });
  add("WA Day", nthWeekday(year, 6, 1, 1), {
    region: "AU",
    notes: "Western Australia — 1st Monday in June",
  });
  add("King's Birthday (most states)", nthWeekday(year, 6, 1, 2), {
    region: "AU",
    notes: "NSW, VIC, SA, TAS, ACT, NT — 2nd Monday in June. QLD/WA differ.",
  });
  add("Juneteenth", iso(year, 6, 19), { region: "US" });
  add("Father's Day (US)", nthWeekday(year, 6, 0, 3), {
    region: "US",
    category: "retail",
    notes: "3rd Sunday in June — different from AU",
  });
  add("Pride Month", iso(year, 6, 1), {
    end: iso(year, 6, 30),
    category: "cultural",
  });
  add("EOFY sale window (AU)", iso(year, 6, 15), {
    end: iso(year, 6, 30),
    region: "AU",
    category: "retail",
    notes: "End of financial year — promotions, stocktake, subscribe-and-save",
  });
  add("EOFY (AU)", iso(year, 6, 30), {
    region: "AU",
    category: "retail",
    notes: "Australian financial year ends",
  });
  add("US summer break starts (typical)", iso(year, 6, 1), {
    region: "US",
    category: "school",
    notes: "Districts vary; use as a planning marker not a hard date",
  });
  add("Independence Day", iso(year, 7, 4), {
    region: "US",
    notes: "US public holiday — BBQ / travel / snacking",
  });
  add("Dry July", iso(year, 7, 1), {
    end: iso(year, 7, 31),
    region: "AU",
    category: "retail",
    notes: "Alcohol-free July — health, recovery, swap-the-drink campaigns",
  });
  add("Amazon Prime Day (typical)", iso(year, 7, 8), {
    end: iso(year, 7, 11),
    category: "retail",
    notes: "Confirm dates each year — digital retail moment AU + US",
  });
  add("NAIDOC Week", nthWeekday(year, 7, 0, 1), {
    end: shift(fromParts(nthWeekday(year, 7, 0, 1)), 7),
    region: "AU",
    category: "cultural",
    notes: "First Sunday of July, seven days — confirm annually with the NAIDOC committee",
  });
  add("US summer break ends (typical)", iso(year, 8, 15), {
    region: "US",
    category: "school",
    notes: "Back-to-school US campaign window is mid-July through August",
  });
  add("Back to school (US)", iso(year, 8, 1), {
    end: iso(year, 8, 20),
    region: "US",
    category: "retail",
    notes: "Lunchbox, routine, family-health campaigns",
  });
  add("Women's Health Week (AU)", nthWeekday(year, 9, 1, 1), {
    end: shift(fromParts(nthWeekday(year, 9, 1, 1)), 6),
    region: "AU",
    category: "cultural",
    notes: "Jean Hailes week — first week of September",
  });
  add("Father's Day (AU)", firstSunday(year, 9), {
    region: "AU",
    category: "retail",
    notes: "1st Sunday in September — different from US. Plan EDM 7–10 days prior.",
  });
  add("R U OK? Day", nthWeekday(year, 9, 4, 2), {
    region: "AU",
    category: "cultural",
    notes: "Second Thursday in September",
  });
  add("Labor Day (US)", nthWeekday(year, 9, 1, 1), {
    region: "US",
    notes: "1st Monday in September — unofficial end of US summer",
  });
  add("AFL Grand Final", lastWeekday(year, 9, 6), {
    region: "AU",
    category: "sporting",
    notes: "Last Saturday in September (typical). Confirm each year.",
  });
  add("Grand Final Friday (VIC)", lastWeekday(year, 9, 5), {
    region: "AU",
    category: "sporting",
    notes: "Friday before the AFL Grand Final — VIC public holiday",
  });
  add("King's Birthday (WA)", lastWeekday(year, 9, 1), {
    region: "AU",
    notes: "Western Australia — last Monday in September",
  });
  add("NRL Grand Final", nthWeekday(year, 10, 0, 1), {
    region: "AU",
    category: "sporting",
    notes: "First Sunday in October (typical). Confirm each year.",
  });
  add("Labour Day (NSW / ACT / SA)", nthWeekday(year, 10, 1, 1), {
    region: "AU",
    notes: "1st Monday in October. Also QLD King's Birthday.",
  });
  add("Indigenous Peoples' Day / Columbus Day", nthWeekday(year, 10, 1, 2), {
    region: "US",
  });
  add("World Mental Health Day", iso(year, 10, 10), {
    category: "cultural",
  });
  add("National Nutrition Week (AU)", iso(year, 10, 11), {
    end: iso(year, 10, 17),
    region: "AU",
    category: "cultural",
    notes: "Typically the second week of October — Nutrition Australia",
  });
  add("Halloween", iso(year, 10, 31), {
    category: "retail",
    notes: "Treats, kids, seasonal flavours",
  });
  add("Melbourne Cup", nthWeekday(year, 11, 2, 1), {
    region: "AU",
    category: "sporting",
    notes: "First Tuesday in November — VIC public holiday, national cultural moment",
  });
  add("Veterans Day", iso(year, 11, 11), { region: "US" });
  add("Singles Day", iso(year, 11, 11), {
    category: "retail",
    notes: "11.11 — online gifting sales",
  });
  add("Movember", iso(year, 11, 1), {
    end: iso(year, 11, 30),
    category: "cultural",
    notes: "Men's health month",
  });
  add("Click Frenzy (AU)", iso(year, 11, 9), {
    end: iso(year, 11, 11),
    region: "AU",
    category: "retail",
    notes: "Timing varies — mid-November online sale. Confirm each year.",
  });
  add("Diwali", lunar?.diwali ?? iso(year, 11, 1), {
    category: "cultural",
    notes: "Festival of lights — family, gifting",
  });
  add("Thanksgiving", nthWeekday(year, 11, 4, 4), {
    region: "US",
    notes: "4th Thursday in November",
  });
  add("Black Friday", (() => {
    const thanks = fromParts(nthWeekday(year, 11, 4, 4));
    return shift(thanks, 1);
  })(), {
    category: "retail",
    notes: "Day after US Thanksgiving — AU digital also participates",
  });
  add("Cyber Monday", (() => {
    const thanks = fromParts(nthWeekday(year, 11, 4, 4));
    return shift(thanks, 4);
  })(), {
    category: "retail",
    notes: "Monday after Thanksgiving",
  });
  add("Giving Tuesday", (() => {
    const thanks = fromParts(nthWeekday(year, 11, 4, 4));
    return shift(thanks, 5);
  })(), {
    category: "cultural",
  });
  add("Cyber week", (() => {
    const thanks = fromParts(nthWeekday(year, 11, 4, 4));
    return shift(thanks, 1);
  })(), {
    end: (() => {
      const thanks = fromParts(nthWeekday(year, 11, 4, 4));
      return shift(thanks, 6);
    })(),
    category: "retail",
    notes: "Black Friday through Cyber Monday week",
  });
  add("Christmas campaign window", iso(year, 12, 1), {
    end: iso(year, 12, 24),
    category: "retail",
    notes: "Hampers, gifting, last-order cutoffs. Plan first EDM in late November.",
  });
  add("Christmas Eve", iso(year, 12, 24), { category: "retail" });
  add("Christmas Day", iso(year, 12, 25), { notes: "Public holiday" });
  add("Boxing Day", iso(year, 12, 26), {
    region: "AU",
    category: "retail",
    notes: "AU public holiday and major sale day",
  });
  add("New Year's Eve", iso(year, 12, 31), { category: "retail" });

  return rows;
}

const NSW_SCHOOL: KeyDateSeed[] = [
  {
    name: "AU summer holidays (NSW)",
    start: "2025-12-22",
    end: "2026-01-26",
    region: "AU",
    category: "school",
    notes: "NSW dates — other states vary by a few days",
  },
  {
    name: "AU autumn holidays (NSW)",
    start: "2026-04-07",
    end: "2026-04-17",
    region: "AU",
    category: "school",
    notes: "NSW dates — other states vary by a few days",
  },
  {
    name: "AU winter holidays (NSW)",
    start: "2026-07-06",
    end: "2026-07-17",
    region: "AU",
    category: "school",
    notes: "NSW dates — other states vary by a few days",
  },
  {
    name: "AU spring holidays (NSW)",
    start: "2026-09-28",
    end: "2026-10-09",
    region: "AU",
    category: "school",
    notes: "NSW dates — other states vary by a few days",
  },
  {
    name: "AU summer holidays (NSW)",
    start: "2026-12-18",
    end: "2027-01-27",
    region: "AU",
    category: "school",
    notes: "NSW Eastern division. Western division runs to 3 Feb 2027.",
  },
  {
    name: "AU autumn holidays (NSW)",
    start: "2027-04-12",
    end: "2027-04-23",
    region: "AU",
    category: "school",
    notes: "NSW dates — other states vary by a few days",
  },
  {
    name: "AU winter holidays (NSW)",
    start: "2027-07-05",
    end: "2027-07-16",
    region: "AU",
    category: "school",
    notes: "NSW dates — other states vary by a few days",
  },
  {
    name: "AU spring holidays (NSW)",
    start: "2027-09-27",
    end: "2027-10-08",
    region: "AU",
    category: "school",
    notes: "NSW dates — other states vary by a few days",
  },
  {
    name: "AU summer holidays (NSW)",
    start: "2027-12-21",
    end: "2028-01-28",
    region: "AU",
    category: "school",
    notes: "NSW dates — other states vary by a few days",
  },
];

export function buildKeyDates(): KeyDateSeed[] {
  return [...buildYear(2026), ...buildYear(2027), ...NSW_SCHOOL];
}
