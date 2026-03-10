export type TimeFilter = "today" | "tomorrow" | "next3days";

export type Source = {
  url: string;
  name: string;
};

export type Folder = {
  id: string;
  name: string;
  sources: Source[];
};

export type ResultItem = {
  title: string;
  time: string;
  venue: string;
  date: string;
};

const leisureSources: Source[] = [
  { url: "muranow.waw.pl", name: "Kino Muranów" },
  { url: "kinoteka.pl", name: "Kinoteka" },
  { url: "iluzjon.fn.org.pl", name: "Kino Iluzjon" },
  { url: "teatrpowszechny.pl", name: "Teatr Powszechny" },
  { url: "teatrdramatyczny.pl", name: "Teatr Dramatyczny" },
  { url: "teatr-zydowski.pl", name: "Teatr Żydowski" },
  { url: "klubkomediowy.pl", name: "Klub Komediowy" },
  { url: "jassmine.pl", name: "Jassmine Jazz Club" },
];

export const defaultFolders: Folder[] = [
  {
    id: "leisure",
    name: "Leisure in Warsaw",
    sources: leisureSources,
  },
];

const todayStr = () => {
  const d = new Date();
  return d.toLocaleDateString("pl-PL", { day: "numeric", month: "long" });
};

const tomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toLocaleDateString("pl-PL", { day: "numeric", month: "long" });
};

const day3Str = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString("pl-PL", { day: "numeric", month: "long" });
};

const mockResults: Record<string, ResultItem[]> = {
  today: [
    { title: "Anora", time: "17:00", venue: "Kino Muranów", date: todayStr() },
    { title: "The Brutalist", time: "19:30", venue: "Kino Muranów", date: todayStr() },
    { title: "Conclave", time: "18:00", venue: "Kinoteka", date: todayStr() },
    { title: "Flow", time: "16:00", venue: "Kino Iluzjon", date: todayStr() },
    { title: "Merlin. Operacja Śmierć", time: "20:00", venue: "Kinoteka", date: todayStr() },
    { title: "Wielki Gatsby — spektakl", time: "19:00", venue: "Teatr Powszechny", date: todayStr() },
    { title: "Dybuk — spektakl", time: "19:00", venue: "Teatr Żydowski", date: todayStr() },
    { title: "Stand-up open mic", time: "20:30", venue: "Klub Komediowy", date: todayStr() },
    { title: "Jazz jam session", time: "21:00", venue: "Jassmine Jazz Club", date: todayStr() },
  ],
  tomorrow: [
    { title: "Emilia Pérez", time: "17:30", venue: "Kino Muranów", date: tomorrowStr() },
    { title: "The Substance", time: "20:00", venue: "Kinoteka", date: tomorrowStr() },
    { title: "Nosferatu", time: "21:00", venue: "Kino Iluzjon", date: tomorrowStr() },
    { title: "Hamlet — spektakl", time: "19:00", venue: "Teatr Dramatyczny", date: tomorrowStr() },
    { title: "Wieczór improwizacji", time: "20:00", venue: "Klub Komediowy", date: tomorrowStr() },
    { title: "Nina Simone Tribute", time: "20:30", venue: "Jassmine Jazz Club", date: tomorrowStr() },
  ],
  next3days: [
    { title: "Anora", time: "17:00", venue: "Kino Muranów", date: todayStr() },
    { title: "The Brutalist", time: "19:30", venue: "Kino Muranów", date: todayStr() },
    { title: "Conclave", time: "18:00", venue: "Kinoteka", date: todayStr() },
    { title: "Emilia Pérez", time: "17:30", venue: "Kino Muranów", date: tomorrowStr() },
    { title: "The Substance", time: "20:00", venue: "Kinoteka", date: tomorrowStr() },
    { title: "Nosferatu", time: "21:00", venue: "Kino Iluzjon", date: tomorrowStr() },
    { title: "Hamlet — spektakl", time: "19:00", venue: "Teatr Dramatyczny", date: tomorrowStr() },
    { title: "Flow", time: "16:00", venue: "Kino Iluzjon", date: day3Str(2) },
    { title: "Wielki Gatsby — spektakl", time: "19:00", venue: "Teatr Powszechny", date: day3Str(2) },
    { title: "Kuba Jurzyk Solo", time: "20:00", venue: "Klub Komediowy", date: day3Str(2) },
    { title: "Latin Jazz Night", time: "21:00", venue: "Jassmine Jazz Club", date: day3Str(2) },
  ],
};

export function getMockResults(_folderId: string, filter: TimeFilter): ResultItem[] {
  return mockResults[filter] || [];
}
