export type DateFilterMode = "daily" | "weekly" | "monthly";
export type TimeFilter = "today" | "tomorrow" | "next3days" | "thisweek" | "nextweek" | "thismonth" | "nextmonth";

export type Source = {
  url: string;
  name: string;
  category?: string;
};

export type Folder = {
  id: string;
  name: string;
  sources: Source[];
  promptHint?: string;
  dateFilterMode: DateFilterMode;
};

export type ResultItem = {
  title: string;
  time: string;
  venue: string;
  date: string;
  description?: string;
  director?: string;
  cast?: string;
  duration?: string;
  genre?: string;
  sourceUrl?: string;
};

const leisureSources: Source[] = [
  { url: "kinomuranow.pl/repertuar", name: "Kino Muraów" },
  { url: "kinoteka.pl/repertuar/", name: "Kinoteka" },
  { url: "www.iluzjon.fn.org.pl/repertuar/", name: "Kino Iluzjon" },
  { url: "teatrstudio.pl/pl/repertuar/", name: "Teatr Studio" },
  { url: "teatrdramatyczny.pl/repertuar", name: "Teatr Dramatyczny" },
  { url: "powszechny.com/pl/repertuar", name: "Teatr Powszechny" },
  { url: "trwarszawa.pl/repertuar", name: "TR Warszawa" },
  { url: "komediowy.pl/", name: "Klub Komediowy" },
  { url: "jassmine.com/koncerty/", name: "Klub Jassmine" },
];

export const defaultFolders: Folder[] = [
  {
    id: "leisure",
    name: "leisure",
    sources: leisureSources,
    dateFilterMode: "daily",
  },
  {
    id: "ngo-jobs",
    name: "jobs in NGO's",
    dateFilterMode: "monthly",
    sources: [
      { url: "pracuj.pl", name: "Pracuj.pl" },
      { url: "ngo.pl/praca", name: "NGO.pl Praca" },
      { url: "idealist.org", name: "Idealist" },
    ],
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
    {
      title: "Anora",
      time: "17:00",
      venue: "Kino Muraów",
      date: todayStr(),
      description: "A young sex worker from Brooklyn gets her chance at a Cinderella story when she marries the son of a Russian oligarch. But when the news reaches Russia, her fairy tale is threatened.",
      director: "Sean Baker",
      cast: "Mikey Madison, Mark Eydelshteyn, Yura Borisov",
      duration: "139 min",
      genre: "Drama / Comedy",
      sourceUrl: "https://muranow.waw.pl",
    },
    {
      title: "The Brutalist",
      time: "19:30",
      venue: "Kino Muraów",
      date: todayStr(),
      description: "A visionary architect escapes post-war Europe and arrives in America to rebuild his life. When a wealthy client recognizes his talent, an obsessive and destructive relationship develops.",
      director: "Brady Corbet",
      cast: "Adrien Brody, Felicity Jones, Guy Pearce",
      duration: "215 min",
      genre: "Drama",
      sourceUrl: "https://muranow.waw.pl",
    },
    {
      title: "Conclave",
      time: "18:00",
      venue: "Kinoteka",
      date: todayStr(),
      description: "Following the unexpected death of the Pope, Cardinal Lawrence is tasked with managing the conclave to elect a new one. Locked inside the Vatican, he uncovers a web of secrets and scandals.",
      director: "Edward Berger",
      cast: "Ralph Fiennes, Stanley Tucci, John Lithgow",
      duration: "120 min",
      genre: "Thriller / Drama",
      sourceUrl: "https://kinoteka.pl",
    },
    {
      title: "Flow",
      time: "16:00",
      venue: "Kino Iluzjon",
      date: todayStr(),
      description: "A solitary cat embarks on a journey through a flooded world, sharing a small boat with a capybara, a lemur, a bird, and a dog. Together, they navigate surreal landscapes to find a new home.",
      director: "Gints Zilbalodis",
      cast: "Animated — no voice cast",
      duration: "85 min",
      genre: "Animation / Adventure",
      sourceUrl: "https://iluzjon.fn.org.pl",
    },
    {
      title: "Merlin. Operacja Śmierć",
      time: "20:00",
      venue: "Kinoteka",
      date: todayStr(),
      description: "Poland, 1980s. A young intelligence officer codenamed Merlin is drawn into a dangerous Cold War operation that will test his loyalty, courage, and survival instincts.",
      director: "Johan Renck",
      cast: "Bartosz Bielenia, Sandra Drzymalska",
      duration: "128 min",
      genre: "Thriller / Spy",
      sourceUrl: "https://kinoteka.pl",
    },
    {
      title: "Wielki Gatsby — spektakl",
      time: "19:00",
      venue: "Teatr Powszechny",
      date: todayStr(),
      description: "A theatrical adaptation of F. Scott Fitzgerald's classic novel about wealth, love, and the American Dream set in the roaring 1920s. Directed by Paweł Miśkiewicz.",
      director: "Paweł Miśkiewicz",
      cast: "Teatr Powszechny ensemble",
      duration: "150 min",
      genre: "Theatre / Drama",
      sourceUrl: "https://teatrpowszechny.pl",
    },
    {
      title: "Stand-up open mic",
      time: "20:30",
      venue: "Klub Komediowy",
      date: todayStr(),
      description: "An open mic night where new and experienced comedians take the stage for 5-minute sets. Expect fresh jokes, surprising stories, and the occasional heckler.",
      genre: "Stand-up / Comedy",
      sourceUrl: "https://komediowy.pl",
    },
    {
      title: "Jazz jam session",
      time: "21:00",
      venue: "Klub Jassmine",
      date: todayStr(),
      description: "An open jam session where local jazz musicians gather for an evening of improvised sets. Bring your instrument or just enjoy the music with a drink.",
      genre: "Jazz / Live Music",
      sourceUrl: "https://jassmine.com",
    },
  ],
  tomorrow: [
    {
      title: "Emilia Pérez",
      time: "17:30",
      venue: "Kino Muraów",
      date: tomorrowStr(),
      description: "A Mexican cartel leader seeks the help of a lawyer to fake his death and transition into the woman he has always wanted to be. A musical crime drama unlike any other.",
      director: "Jacques Audiard",
      cast: "Zoe Saldaña, Karla Sofía Gascón, Selena Gomez",
      duration: "132 min",
      genre: "Musical / Crime / Drama",
      sourceUrl: "https://muranow.waw.pl",
    },
    {
      title: "The Substance",
      time: "20:00",
      venue: "Kinoteka",
      date: tomorrowStr(),
      description: "A fading celebrity discovers a black-market drug that temporarily creates a younger, better version of herself. But there's a price — and the balance between the two bodies must be maintained.",
      director: "Coralie Fargeat",
      cast: "Demi Moore, Margaret Qualley, Dennis Quaid",
      duration: "141 min",
      genre: "Horror / Sci-Fi",
      sourceUrl: "https://kinoteka.pl",
    },
    {
      title: "Nosferatu",
      time: "21:00",
      venue: "Kino Iluzjon",
      date: tomorrowStr(),
      description: "A gothic reimagining of the 1922 classic. A young woman in 19th-century Germany becomes the obsession of an ancient Transylvanian vampire, bringing untold horror to her doorstep.",
      director: "Robert Eggers",
      cast: "Bill Skarsgård, Lily-Rose Depp, Nicholas Hoult",
      duration: "133 min",
      genre: "Horror / Gothic",
      sourceUrl: "https://iluzjon.fn.org.pl",
    },
    {
      title: "Hamlet — spektakl",
      time: "19:00",
      venue: "Teatr Dramatyczny",
      date: tomorrowStr(),
      description: "A modern staging of Shakespeare's tragedy. Prince Hamlet returns to Denmark to find his father dead and his mother married to his uncle. Madness, revenge, and betrayal follow.",
      director: "Monika Strzępka",
      cast: "Teatr Dramatyczny ensemble",
      duration: "180 min",
      genre: "Theatre / Tragedy",
      sourceUrl: "https://teatrdramatyczny.pl",
    },
    {
      title: "Wieczór improwizacji",
      time: "20:00",
      venue: "Klub Komediowy",
      date: tomorrowStr(),
      description: "An evening of fully improvised comedy sketches based on audience suggestions. Two teams compete for laughs in a fast-paced improv battle.",
      genre: "Improv / Comedy",
      sourceUrl: "https://komediowy.pl",
    },
    {
      title: "Nina Simone Tribute",
      time: "20:30",
      venue: "Klub Jassmine",
      date: tomorrowStr(),
      description: "A live tribute concert celebrating the music of Nina Simone — from 'Feeling Good' to 'Sinnerman'. Performed by a Warsaw-based jazz quartet with guest vocalist.",
      genre: "Jazz / Live Music",
      sourceUrl: "https://jassmine.com",
    },
  ],
  next3days: [
    {
      title: "Anora",
      time: "17:00",
      venue: "Kino Muraów",
      date: todayStr(),
      description: "A young sex worker from Brooklyn gets her chance at a Cinderella story when she marries the son of a Russian oligarch. But when the news reaches Russia, her fairy tale is threatened.",
      director: "Sean Baker",
      cast: "Mikey Madison, Mark Eydelshteyn, Yura Borisov",
      duration: "139 min",
      genre: "Drama / Comedy",
      sourceUrl: "https://muranow.waw.pl",
    },
    {
      title: "The Brutalist",
      time: "19:30",
      venue: "Kino Muraów",
      date: todayStr(),
      description: "A visionary architect escapes post-war Europe and arrives in America to rebuild his life.",
      director: "Brady Corbet",
      cast: "Adrien Brody, Felicity Jones, Guy Pearce",
      duration: "215 min",
      genre: "Drama",
      sourceUrl: "https://muranow.waw.pl",
    },
    {
      title: "Conclave",
      time: "18:00",
      venue: "Kinoteka",
      date: todayStr(),
      description: "Following the unexpected death of the Pope, Cardinal Lawrence is tasked with managing the conclave.",
      director: "Edward Berger",
      cast: "Ralph Fiennes, Stanley Tucci, John Lithgow",
      duration: "120 min",
      genre: "Thriller / Drama",
      sourceUrl: "https://kinoteka.pl",
    },
    {
      title: "Emilia Pérez",
      time: "17:30",
      venue: "Kino Muraów",
      date: tomorrowStr(),
      description: "A Mexican cartel leader seeks the help of a lawyer to fake his death and transition into the woman he has always wanted to be.",
      director: "Jacques Audiard",
      cast: "Zoe Saldaña, Karla Sofía Gascón, Selena Gomez",
      duration: "132 min",
      genre: "Musical / Crime / Drama",
      sourceUrl: "https://muranow.waw.pl",
    },
    {
      title: "The Substance",
      time: "20:00",
      venue: "Kinoteka",
      date: tomorrowStr(),
      description: "A fading celebrity discovers a black-market drug that temporarily creates a younger, better version of herself.",
      director: "Coralie Fargeat",
      cast: "Demi Moore, Margaret Qualley, Dennis Quaid",
      duration: "141 min",
      genre: "Horror / Sci-Fi",
      sourceUrl: "https://kinoteka.pl",
    },
    {
      title: "Nosferatu",
      time: "21:00",
      venue: "Kino Iluzjon",
      date: tomorrowStr(),
      description: "A gothic reimagining of the 1922 classic about an ancient Transylvanian vampire.",
      director: "Robert Eggers",
      cast: "Bill Skarsgård, Lily-Rose Depp, Nicholas Hoult",
      duration: "133 min",
      genre: "Horror / Gothic",
      sourceUrl: "https://iluzjon.fn.org.pl",
    },
    {
      title: "Hamlet — spektakl",
      time: "19:00",
      venue: "Teatr Dramatyczny",
      date: tomorrowStr(),
      description: "A modern staging of Shakespeare's tragedy about revenge and betrayal.",
      director: "Monika Strzępka",
      cast: "Teatr Dramatyczny ensemble",
      duration: "180 min",
      genre: "Theatre / Tragedy",
      sourceUrl: "https://teatrdramatyczny.pl",
    },
    {
      title: "Flow",
      time: "16:00",
      venue: "Kino Iluzjon",
      date: day3Str(2),
      description: "A solitary cat embarks on a journey through a flooded world, sharing a small boat with a capybara, a lemur, a bird, and a dog.",
      director: "Gints Zilbalodis",
      cast: "Animated — no voice cast",
      duration: "85 min",
      genre: "Animation / Adventure",
      sourceUrl: "https://iluzjon.fn.org.pl",
    },
    {
      title: "Wielki Gatsby — spektakl",
      time: "19:00",
      venue: "Teatr Powszechny",
      date: day3Str(2),
      description: "A theatrical adaptation of Fitzgerald's novel about wealth and the American Dream.",
      director: "Paweł Miśkiewicz",
      cast: "Teatr Powszechny ensemble",
      duration: "150 min",
      genre: "Theatre / Drama",
      sourceUrl: "https://teatrpowszechny.pl",
    },
    {
      title: "Kuba Jurzyk Solo",
      time: "20:00",
      venue: "Klub Komediowy",
      date: day3Str(2),
      description: "One of Poland's sharpest stand-up comedians performs a full hour of new material about modern life, relationships, and growing up in a small town.",
      genre: "Stand-up / Comedy",
      sourceUrl: "https://komediowy.pl",
    },
    {
      title: "Latin Jazz Night",
      time: "21:00",
      venue: "Klub Jassmine",
      date: day3Str(2),
      description: "An evening of Afro-Cuban rhythms, bossa nova grooves, and Latin jazz standards performed by a live quintet. Dancing encouraged.",
      genre: "Jazz / Latin",
      sourceUrl: "https://jassmine.com",
    },
  ],
};

export function getMockResults(_folderId: string, filter: TimeFilter): ResultItem[] {
  return mockResults[filter] || [];
}
