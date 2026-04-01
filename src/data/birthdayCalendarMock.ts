/** Ежегодные дни рождения (месяц 0–11, день месяца). */

export interface TeamBirthday {
  id: string;
  month: number;
  day: number;
  name: string;
  initials: string;
  ageTurning?: number;
}

export const teamBirthdays: TeamBirthday[] = [
  { id: "1", month: 9, day: 26, name: "Sarah Jenkins", initials: "SJ", ageTurning: 32 },
  { id: "2", month: 9, day: 28, name: "Marcus Thorne", initials: "MT", ageTurning: 41 },
  { id: "3", month: 9, day: 29, name: "Priya Nair", initials: "PN", ageTurning: 29 },
  { id: "4", month: 0, day: 12, name: "Elena Vasquez", initials: "EV", ageTurning: 35 },
  { id: "5", month: 0, day: 22, name: "James Okonkwo", initials: "JO", ageTurning: 28 },
  { id: "6", month: 1, day: 3, name: "Alex Mercer", initials: "AM", ageTurning: 39 },
  { id: "7", month: 1, day: 18, name: "Oliver Grant", initials: "OG", ageTurning: 44 },
  { id: "8", month: 2, day: 7, name: "Nina Kovács", initials: "NK", ageTurning: 31 },
  { id: "9", month: 2, day: 21, name: "Tomás Rivera", initials: "TR", ageTurning: 27 },
  { id: "10", month: 3, day: 5, name: "Hannah Lee", initials: "HL", ageTurning: 33 },
  { id: "11", month: 3, day: 16, name: "Daniel Frost", initials: "DF", ageTurning: 36 },
  { id: "12", month: 4, day: 1, name: "Yuki Tanaka", initials: "YT", ageTurning: 30 },
  { id: "13", month: 4, day: 20, name: "Sofia Martins", initials: "SM", ageTurning: 26 },
  { id: "14", month: 5, day: 11, name: "Chris Bell", initials: "CB", ageTurning: 42 },
  { id: "15", month: 6, day: 4, name: "Amira Hassan", initials: "AH", ageTurning: 29 },
  { id: "16", month: 6, day: 19, name: "Lukas Weber", initials: "LW", ageTurning: 38 },
  { id: "17", month: 7, day: 8, name: "Emma Clarke", initials: "EC", ageTurning: 24 },
  { id: "18", month: 7, day: 25, name: "Noah Singh", initials: "NS", ageTurning: 45 },
  { id: "19", month: 8, day: 9, name: "Mia O'Connor", initials: "MO", ageTurning: 34 },
  { id: "20", month: 10, day: 2, name: "Victor Lang", initials: "VL", ageTurning: 40 },
  { id: "21", month: 10, day: 17, name: "Rachel Bloom", initials: "RB", ageTurning: 32 },
  { id: "22", month: 11, day: 6, name: "Ivan Petrov", initials: "IP", ageTurning: 37 },
  { id: "23", month: 11, day: 24, name: "Grace Okafor", initials: "GO", ageTurning: 28 },
];

export function birthdaysOnDay(monthIndex: number, day: number): TeamBirthday[] {
  return teamBirthdays.filter((b) => b.month === monthIndex && b.day === day);
}
