/** Пул имён для демо-списков в попапах метрик (без персистентности). */

const FIRST = [
  "James",
  "Olivia",
  "Noah",
  "Emma",
  "Liam",
  "Ava",
  "Mason",
  "Sophia",
  "Ethan",
  "Isabella",
  "Lucas",
  "Mia",
  "Alexander",
  "Charlotte",
  "Daniel",
  "Amelia",
  "Henry",
  "Harper",
  "Sebastian",
  "Evelyn",
  "Jack",
  "Abigail",
  "Owen",
  "Emily",
  "Samuel",
  "Ella",
  "David",
  "Scarlett",
  "Joseph",
  "Victoria",
  "Gabriel",
  "Aria",
  "Julian",
  "Grace",
  "Leo",
  "Chloe",
  "Mateo",
  "Penelope",
  "Wyatt",
  "Layla",
  "Nathan",
  "Riley",
  "Caleb",
  "Zoey",
  "Ryan",
  "Nora",
  "Adrian",
  "Lily",
  "Elias",
  "Hannah",
];

const LAST = [
  "Anderson",
  "Brown",
  "Chen",
  "Davis",
  "Evans",
  "Foster",
  "Garcia",
  "Harris",
  "Ivanov",
  "Johnson",
  "Kowalski",
  "Lee",
  "Martinez",
  "Nakamura",
  "O'Brien",
  "Patel",
  "Quinn",
  "Reyes",
  "Silva",
  "Taylor",
  "Ueda",
  "Volkov",
  "Walker",
  "Young",
  "Zhang",
  "Bakker",
  "Costa",
  "Dubois",
  "Eriksen",
  "Fischer",
  "Greco",
  "Hughes",
  "Ito",
  "Jensen",
  "Klein",
  "Larsen",
  "Murphy",
  "Novak",
  "Olsen",
  "Peters",
  "Romano",
  "Schmidt",
  "Torres",
  "Weber",
  "Yamamoto",
  "Abbott",
  "Blake",
  "Carter",
  "Dixon",
  "Edwards",
];

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function addDaysLocal(base: Date, days: number): Date {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  d.setDate(d.getDate() + days);
  return d;
}

function formatUntilEnd(end: Date): string {
  const today = new Date();
  const sameYear = end.getFullYear() === today.getFullYear();
  const part = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" as const }),
  }).format(end);
  return `Until ${part}`;
}

export type MetricEmployeeRow = { name: string; initials: string; untilLabel: string };

export function randomEmployeeNames(count: number, seed: number): MetricEmployeeRow[] {
  const rnd = mulberry32(seed);
  const used = new Set<string>();
  const out: MetricEmployeeRow[] = [];
  const today = new Date();
  let guard = 0;
  while (out.length < count && guard < count * 20) {
    guard++;
    const f = FIRST[Math.floor(rnd() * FIRST.length)]!;
    const l = LAST[Math.floor(rnd() * LAST.length)]!;
    const name = `${f} ${l}`;
    if (used.has(name)) continue;
    used.add(name);
    const daysAhead = 2 + Math.floor(rnd() * 28);
    out.push({
      name,
      initials: `${f[0]!}${l[0]!}`.toUpperCase(),
      untilLabel: formatUntilEnd(addDaysLocal(today, daysAhead)),
    });
  }
  while (out.length < count) {
    const n = out.length + 1;
    const rnd2 = mulberry32(seed + n * 999);
    const daysAhead = 2 + Math.floor(rnd2() * 28);
    out.push({
      name: `Guest User ${n}`,
      initials: `G${n % 10}`,
      untilLabel: formatUntilEnd(addDaysLocal(today, daysAhead)),
    });
  }
  return out;
}
