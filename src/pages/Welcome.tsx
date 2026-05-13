import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import "@/styles/goin.css";

/* ─────────── I18N ─────────── */

type Lang = "PL" | "EN";

const T = {
  PL: {
    searchPlaceholder: "Szukaj wydarzeń, miejsc, artystów…",
    newsletter: "Newsletter",
    signIn: "Zaloguj się",
    eventsToday: "wydarzeń dziś",
    thisWeek: "w tym tygodniu",
    updatedAgo: "zaktualizowano 2 min temu",
    openMicHint: "Open mic w Pardon dziś wieczorem · dodane 14 min temu",
    rightNow: "Teraz w mieście",
    bigThings: "Duże rzeczy dzieją się\nmiędzy 12 — 25 maja.",
    seeAll: "Zobacz wszystkie",
    typeLabel: "Typ",
    whenLabel: "Kiedy",
    afterLabel: "Po",
    today: "Dziś",
    tomorrow: "Jutro",
    thisWeekChip: "Ten tydzień",
    nextWeek: "Następny tydzień",
    pickDate: "Wybierz datę",
    typeAll: "Wszystkie",
    typeCinema: "Kino",
    typeTheatre: "Teatr",
    typeMusic: "Muzyka",
    typeExhibition: "Wystawy",
    typeTalk: "Spotkania",
    typeClub: "Klub",
    typeFood: "Food",
    allEvents: "Wszystkie wydarzenia",
    sortTime: "Sortuj: czas",
    print: "Drukuj",
    reserve: "Rezerwuj",
    addToCal: "Dodaj do kalendarza",
    wantToGo: "Chcę iść",
    saved: "Zapisane",
    share: "Udostępnij",
    loadMore: "Załaduj 12 więcej",
    nothingMatches: "Nic nie pasuje.",
    nothingHelp: "Spróbuj innej kategorii lub przesuń godzinę.",
    weeklyNewsletter: "Newsletter tygodniowy",
    newsletterH: "Co dzieje się w przyszłym tygodniu, w 90 sekund.",
    newsletterP: "Wyselekcjonowane wskazówki + streszczenia recenzji AI. W każdą niedzielę o 18:00.",
    subscribe: "Zapisz się",
    readers: "12 418 czytelników · Bez spamu, nigdy",
    yourWeek: "Twój tydzień",
    eventsSaved: "zapisanych wydarzeń",
    yourWeekHint: "Zaloguj się, by synchronizować urządzenia, dostać przypomnienia i dzielić się listami ze znajomymi.",
    topVenues: "Najlepsze miejsca w tym tygodniu",
    shareFriends: "Udostępnij znajomym",
    shareP: "Wyślij dzisiejsze typy jako wiadomość lub listę. Nie potrzebują konta.",
    copyLink: "Skopiuj link",
    email: "Email",
    modalEyebrow: "Zaloguj się do Goin'",
    modalH: "Spraw, by ten kalendarz był Twój.",
    modalP: "Zapisuj wydarzenia, synchronizuj przypomnienia, dziel się ze znajomymi i otrzymuj cotygodniowe podsumowanie dopasowane do Twojego gustu.",
    continueGoogle: "Kontynuuj z Google",
    continueApple: "Kontynuuj z Apple",
    or: "lub",
    sendMagic: "Wyślij magic link",
    modalFoot: "Kontynuując akceptujesz nasz regulamin. Bez hasła, bez spamu.",
    magicSent: "Sprawdź skrzynkę — wysłaliśmy link do logowania.",
    authError: "Coś poszło nie tak. Spróbuj ponownie.",
    emailRequired: "Podaj adres email.",
    connecting: "Łączenie…",
    mTabToday: "Dziś",
    mTabExplore: "Odkrywaj",
    mTabSaved: "Zapisane",
    mTabProfile: "Profil",
    toastSaved: 'Zapisano · dodano do "Chcę iść"',
    toastRemoved: "Usunięto z listy",
    toastCopied: "Link skopiowany do schowka",
  },
  EN: {
    searchPlaceholder: "Search events, venues, artists…",
    newsletter: "Newsletter",
    signIn: "Sign in",
    eventsToday: "events today",
    thisWeek: "this week",
    updatedAgo: "updated 2 min ago",
    openMicHint: "Open mic at Pardon tonight · added 14 min ago",
    rightNow: "Right now in town",
    bigThings: "Big things happening\nbetween 12 — 25 May.",
    seeAll: "See all",
    typeLabel: "Type",
    whenLabel: "When",
    afterLabel: "After",
    today: "Today",
    tomorrow: "Tomorrow",
    thisWeekChip: "This week",
    nextWeek: "Next week",
    pickDate: "Pick date",
    typeAll: "All",
    typeCinema: "Cinema",
    typeTheatre: "Theatre",
    typeMusic: "Music",
    typeExhibition: "Exhibition",
    typeTalk: "Talks",
    typeClub: "Club",
    typeFood: "Food",
    allEvents: "All events",
    sortTime: "Sort: Time",
    print: "Print",
    reserve: "Reserve",
    addToCal: "Add to cal",
    wantToGo: "Want to go",
    saved: "Saved",
    share: "Share",
    loadMore: "Load 12 more",
    nothingMatches: "Nothing matches.",
    nothingHelp: "Try a different category or push the time forward.",
    weeklyNewsletter: "Weekly newsletter",
    newsletterH: "What's on next week, in 90 seconds.",
    newsletterP: "Curated picks from us + AI-summarised reviews. Every Sunday at 18:00.",
    subscribe: "Subscribe",
    readers: "12,418 readers · No spam, ever",
    yourWeek: "Your week",
    eventsSaved: "events saved",
    yourWeekHint: "Sign in to sync across devices, get reminders, and share lists with friends.",
    topVenues: "Top venues this week",
    shareFriends: "Share with friends",
    shareP: "Send today's picks as a text or a list. They don't need an account.",
    copyLink: "Copy link",
    email: "Email",
    modalEyebrow: "Sign in to Goin'",
    modalH: "Make this calendar yours.",
    modalP: "Save events, sync reminders, share with friends, and get a weekly recap tuned to your taste.",
    continueGoogle: "Continue with Google",
    continueApple: "Continue with Apple",
    or: "or",
    sendMagic: "Send magic link",
    modalFoot: "By continuing you agree to our terms. No password, no spam.",
    magicSent: "Check your inbox — we sent you a sign-in link.",
    authError: "Something went wrong. Please try again.",
    emailRequired: "Enter your email address.",
    connecting: "Connecting…",
    mTabToday: "Today",
    mTabExplore: "Explore",
    mTabSaved: "Saved",
    mTabProfile: "Profile",
    toastSaved: 'Saved · added to "Want to go"',
    toastRemoved: "Removed from your list",
    toastCopied: "Link copied to clipboard",
  },
} as const;

/* ─────────── DATA ─────────── */

type FeatAccent = "blue" | "yellow" | "ink" | "neutral";
type FeaturedItem = {
  id: string;
  kicker: string;
  title: string;
  dates: string;
  venue: string;
  count: string;
  accent: FeatAccent;
  url?: string;
};

const FEATURED: FeaturedItem[] = [
  { id: "mdag", kicker: "FESTIVAL", title: "MDAG · Millennium Docs", dates: "12 — 25 MAY", venue: "Kinoteka · Muranów · +6", count: "47 films", accent: "blue" },
  { id: "fangor", kicker: "EXHIBITION", title: "Wojciech Fangor — Spaces", dates: "04 MAY — 18 JUN", venue: "Muzeum Sztuki Nowoczesnej", count: "6 weeks", accent: "yellow" },
  { id: "jazz", kicker: "LIVE", title: "Jazz na Pradze", dates: "20 — 22 MAY", venue: "Skład Butelek · Pardon, To Tu", count: "18 sets", accent: "ink" },
  { id: "market", kicker: "MARKET", title: "Nocny Market — Reopening", dates: "EVERY FRI · FROM 16 MAY", venue: "ul. Towarowa 22", count: "60 stalls", accent: "blue" },
];

type EventType = "all" | "cinema" | "theatre" | "music" | "exhibition" | "talk" | "club" | "food";
type EventDay = "today" | "tomorrow" | "this-week" | "next-week";

type Ev = {
  id: number;
  time: string;
  title: string;
  series: string;
  venue: string;
  type: Exclude<EventType, "all">;
  typeLabel: string;
  day: EventDay;
  price: string;
  desc: string;
  tags: string[];
  url?: string;
  featured?: boolean;
};

const EVENTS: Ev[] = [
  { id: 1, time: "11:00", title: "500 mil", series: "Kino przy herbacie", venue: "Kinoteka", type: "cinema", typeLabel: "Cinema", day: "today", price: "24 zł",
    desc: "Nastoletni Finn i jego młodszy brat Charlie uciekają z domu, by uniknąć rozstania po rozstaniu rodziców. Lo-fi roadmovie spod znaku Sundance.",
    tags: ["Drama", "94 min", "PL subs"] },
  { id: 2, time: "11:30", title: "Wspinaczka", series: "MDAG", venue: "Kinoteka", type: "cinema", typeLabel: "Cinema", day: "today", price: "28 zł",
    desc: "Emily Harrington jako pierwsza kobieta wspięła się w mniej niż 24 godziny na El Capitan w Yosemite — kultowa ściana, kultowy rekord.",
    tags: ["Documentary", "EN/PL subs", "78 min"], featured: true },
  { id: 3, time: "11:30", title: "O czasie i wodzie", series: "MDAG", venue: "Muranów", type: "cinema", typeLabel: "Cinema", day: "today", price: "28 zł",
    desc: "Film o pamięci, przemijaniu i utracie tego, co wydaje się niezniszczalne. Islandzki pisarz Andri Snær Magnason rozmawia ze swoją babcią o lodowcach.",
    tags: ["Documentary", "95 min"] },
  { id: 4, time: "11:45", title: "Zapytaj E. Jean", series: "MDAG", venue: "Kinoteka", type: "cinema", typeLabel: "Cinema", day: "today", price: "28 zł",
    desc: "Dowcipna, nieustraszona i szczera dziennikarka oraz felietonistka E. Jean Carroll całe życie namawiała kobiety, by upominały się o siebie.",
    tags: ["Documentary", "84 min"] },
  { id: 5, time: "19:00", title: "Boscy Bracia", series: "Teatr Nowy", venue: "Teatr Nowy", type: "theatre", typeLabel: "Theatre", day: "today", price: "60 zł",
    desc: "Współczesna adaptacja Braci Karamazow w reżyserii Krzysztofa Garbaczewskiego. Dwa akty, jedna noc, cztery winy.",
    tags: ["Drama", "2h 40min", "PL"] },
  { id: 6, time: "20:30", title: "Niechęć", series: "Pardon, To Tu", venue: "Pardon, To Tu", type: "music", typeLabel: "Live", day: "today", price: "80 zł",
    desc: "Krakowski kwartet wraca z nowym materiałem. Post-rock, krautrock, kosmos. Support: Hańba!",
    tags: ["Post-rock", "Live", "+ support"], featured: true },
  { id: 7, time: "21:00", title: "Fangor — Spaces", series: "Vernissage", venue: "Muzeum Sztuki Nowoczesnej", type: "exhibition", typeLabel: "Exhibition", day: "today", price: "Free",
    desc: "Otwarcie retrospektywy malarza op-artu. Wernisaż z DJ-setem Bartosza Krugera i barem na trawie do północy.",
    tags: ["Opening", "Free entry", "Bar"] },
];

const CITIES = ["Warszawa", "Kraków", "Wrocław", "Gdańsk", "Poznań", "Łódź"];
const LANGS: Lang[] = ["PL", "EN"];

/* ─────────── ICON ─────────── */

type IconName =
  | "pin" | "chev" | "chevR" | "chevL" | "clock" | "cal" | "heart" | "heartF"
  | "share" | "bell" | "user" | "globe" | "search" | "plus" | "mail" | "menu"
  | "arrow" | "sparkle" | "filter" | "ext" | "home" | "compass" | "bookmark";

const Icon = ({ name, size = 16, stroke = 1.6 }: { name: IconName; size?: number; stroke?: number }) => {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "pin": return <svg {...p}><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>;
    case "chev": return <svg {...p}><path d="m6 9 6 6 6-6"/></svg>;
    case "chevR": return <svg {...p}><path d="m9 6 6 6-6 6"/></svg>;
    case "chevL": return <svg {...p}><path d="m15 6-6 6 6 6"/></svg>;
    case "clock": return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case "cal": return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>;
    case "heart": return <svg {...p}><path d="M12 21s-7-4.5-9.2-9A5 5 0 0 1 12 6.5 5 5 0 0 1 21.2 12c-2.2 4.5-9.2 9-9.2 9Z"/></svg>;
    case "heartF": return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7-4.5-9.2-9A5 5 0 0 1 12 6.5 5 5 0 0 1 21.2 12c-2.2 4.5-9.2 9-9.2 9Z"/></svg>;
    case "share": return <svg {...p}><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/></svg>;
    case "bell": return <svg {...p}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>;
    case "user": return <svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>;
    case "globe": return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>;
    case "search": return <svg {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case "plus": return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>;
    case "mail": return <svg {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>;
    case "menu": return <svg {...p}><path d="M3 6h18M3 12h18M3 18h18"/></svg>;
    case "arrow": return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case "sparkle": return <svg {...p}><path d="M12 3v6M12 15v6M3 12h6M15 12h6"/></svg>;
    case "filter": return <svg {...p}><path d="M3 5h18M6 12h12M10 19h4"/></svg>;
    case "ext": return <svg {...p}><path d="M7 17 17 7M9 7h8v8"/></svg>;
    case "home": return <svg {...p}><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>;
    case "compass": return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="m15 9-2 6-6 2 2-6z"/></svg>;
    case "bookmark": return <svg {...p}><path d="M6 3h12v18l-6-4-6 4z"/></svg>;
    default: return null;
  }
};

/* ─────────── ICS GENERATOR ─────────── */

function downloadIcs(ev: Ev) {
  const today = new Date();
  const [hh, mm] = ev.time.split(":").map(Number);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hh, mm);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Goin//EN",
    "BEGIN:VEVENT",
    `UID:goin-${ev.id}@goin.app`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${ev.title}`,
    `LOCATION:${ev.venue}`,
    `DESCRIPTION:${ev.desc.replace(/\n/g, "\\n")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${ev.title.replace(/[^\w]+/g, "-").toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ─────────── COMPONENTS ─────────── */

function EventRow({ ev, t, saved, onSave, onShare }: { ev: Ev; t: typeof T.PL; saved: boolean; onSave: () => void; onShare: () => void }) {
  const [open, setOpen] = useState(ev.featured || false);
  return (
    <article className={`g-event ${open ? "is-open" : ""}`}>
      <button className="g-event__head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <div className="g-event__chev" aria-hidden>
          <Icon name={open ? "chev" : "chevR"} size={14} />
        </div>
        <div className="g-event__time">
          <span className="g-event__time-num">{ev.time}</span>
        </div>
        <div className="g-event__main">
          <div className="g-event__titleline">
            <span className="g-event__series">{ev.series}</span>
            <span className="g-event__sep" aria-hidden>·</span>
            <span className="g-event__title">{ev.title}</span>
          </div>
          {!open && <p className="g-event__desc-mini">{ev.desc}</p>}
        </div>
        <div className="g-event__meta">
          <span className="g-event__type">{ev.typeLabel}</span>
          <span className="g-event__venue"><Icon name="pin" size={11} /> {ev.venue}</span>
        </div>
      </button>

      {open && (
        <div className="g-event__body">
          <p className="g-event__desc">{ev.desc}</p>
          <div className="g-event__tags">
            {ev.tags.map((tag) => <span key={tag} className="g-tag">{tag}</span>)}
          </div>
          <div className="g-event__actions">
            <a
              className="g-btn g-btn--primary"
              href={ev.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              {t.reserve} <Icon name="ext" size={13} />
            </a>
            <button
              className="g-btn g-btn--ghost"
              onClick={(e) => { e.stopPropagation(); downloadIcs(ev); }}
            >
              <Icon name="cal" size={14} /> {t.addToCal}
            </button>
            <button
              className={`g-btn g-btn--ghost ${saved ? "is-saved" : ""}`}
              onClick={(e) => { e.stopPropagation(); onSave(); }}
            >
              <Icon name={saved ? "heartF" : "heart"} size={14} />
              {saved ? t.saved : t.wantToGo}
            </button>
            <button
              className="g-btn g-btn--ghost"
              onClick={(e) => { e.stopPropagation(); onShare(); }}
            >
              <Icon name="share" size={14} /> {t.share}
            </button>
            <span className="g-event__price">{ev.price}</span>
          </div>
        </div>
      )}
    </article>
  );
}

function FeaturedCard({ ev, active, onClick }: { ev: FeaturedItem; active: boolean; onClick: () => void }) {
  return (
    <button
      className={`g-feat ${ev.accent !== "neutral" ? `g-feat--${ev.accent}` : ""} ${active ? "is-active" : ""}`}
      onClick={onClick}
    >
      <div className="g-feat__kicker">
        <span className="g-feat__dot" /> {ev.kicker}
      </div>
      <div className="g-feat__title">{ev.title}</div>
      <div className="g-feat__dates">{ev.dates}</div>
      <div className="g-feat__foot">
        <span className="g-feat__venue">{ev.venue}</span>
        <span className="g-feat__count">{ev.count}</span>
      </div>
      <div className="g-feat__cta" aria-hidden>
        <Icon name="arrow" size={16} />
      </div>
    </button>
  );
}

function GoogleGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1S8.7 6 12 6c1.9 0 3.1.8 3.8 1.5L18.7 5C16.9 3.3 14.6 2.3 12 2.3 6.5 2.3 2.1 6.7 2.1 12.1S6.5 22 12 22c6.9 0 9.5-4.8 9.5-7.3 0-.5 0-.9-.1-1.3H12Z"/>
      <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.2-2.5c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H3v2.7C4.6 19.7 8 22 12 22Z"/>
      <path fill="#FBBC05" d="M6.2 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.5H3C2.3 8.9 2 10.4 2 12s.4 3.1 1 4.5l3.2-2.7Z"/>
      <path fill="#4285F4" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 3 14.6 2 12 2 8 2 4.6 4.3 3 7.5l3.2 2.7C7 7.7 9.3 5.9 12 5.9Z"/>
    </svg>
  );
}

function AppleGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.4 12.7c0-2.4 2-3.6 2.1-3.6-1.2-1.7-3-1.9-3.6-1.9-1.5-.2-3 .9-3.7.9-.8 0-2-.9-3.3-.8-1.7 0-3.3 1-4.1 2.5-1.8 3-.5 7.6 1.3 10 .9 1.2 1.9 2.5 3.3 2.4 1.3-.1 1.8-.8 3.4-.8s2 .8 3.3.8c1.4 0 2.3-1.2 3.1-2.4 1-1.4 1.4-2.7 1.4-2.8 0 0-2.7-1-2.7-4.3ZM14 5.6c.7-.8 1.1-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4Z"/>
    </svg>
  );
}

function SignInModal({ open, onClose, t }: { open: boolean; onClose: () => void; t: typeof T.PL }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState<null | "google" | "apple" | "magic">(null);
  const [message, setMessage] = useState<{ kind: "error" | "ok"; text: string } | null>(null);

  useEffect(() => {
    if (!open) return;
    setMessage(null);
    setBusy(null);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL || "/"}`;

  const oauth = async (provider: "google" | "apple") => {
    setBusy(provider);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    if (error) {
      setMessage({ kind: "error", text: error.message || t.authError });
      setBusy(null);
    }
  };

  const magic = async () => {
    if (!email) { setMessage({ kind: "error", text: t.emailRequired }); return; }
    setBusy("magic");
    setMessage(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    setBusy(null);
    if (error) setMessage({ kind: "error", text: error.message || t.authError });
    else setMessage({ kind: "ok", text: t.magicSent });
  };

  return (
    <div className="g-modal" onClick={onClose}>
      <div className="g-modal__panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="g-modal__close" onClick={onClose} aria-label="Close">×</button>
        <div className="g-eyebrow">{t.modalEyebrow}</div>
        <h3 className="g-modal__h">{t.modalH}</h3>
        <p className="g-modal__p">{t.modalP}</p>

        <div className="g-oauth-row">
          <button
            className="g-btn g-oauth g-oauth--google"
            onClick={() => oauth("google")}
            disabled={busy !== null}
          >
            <GoogleGlyph size={16} />
            <span>{busy === "google" ? t.connecting : t.continueGoogle}</span>
          </button>
          <button
            className="g-btn g-oauth g-oauth--apple"
            onClick={() => oauth("apple")}
            disabled={busy !== null}
          >
            <AppleGlyph size={16} />
            <span>{busy === "apple" ? t.connecting : t.continueApple}</span>
          </button>
        </div>

        <div className="g-modal__or"><span>{t.or}</span></div>

        <div className="g-modal__auth">
          <input
            className="g-input"
            placeholder="your@email.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <button
            className="g-btn g-btn--blue g-btn--lg"
            onClick={magic}
            disabled={busy !== null}
          >
            {busy === "magic" ? t.connecting : t.sendMagic}
          </button>
        </div>

        {message && (
          <div className={`g-modal__msg ${message.kind === "error" ? "is-error" : "is-ok"}`}>
            {message.text}
          </div>
        )}

        <div className="g-modal__foot">{t.modalFoot}</div>
      </div>
    </div>
  );
}

/* ─────────── MAIN PAGE ─────────── */

const Welcome = () => {
  const [city, setCity] = useState<string>(() => localStorage.getItem("goin.city") || "Warszawa");
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem("goin.lang") as Lang) || "PL");
  const [cityOpen, setCityOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [type, setType] = useState<EventType>("all");
  const [day, setDay] = useState<EventDay>("today");
  const [after, setAfter] = useState("");
  const [activeFeat, setActiveFeat] = useState<string>("mdag");
  const [savedIds, setSavedIds] = useState<Set<number>>(() => {
    const raw = localStorage.getItem("goin.saved");
    return new Set(raw ? (JSON.parse(raw) as number[]) : []);
  });
  const [signInOpen, setSignInOpen] = useState(false);
  const [toast, setToast] = useState("");

  const t = T[lang];

  useEffect(() => { localStorage.setItem("goin.city", city); }, [city]);
  useEffect(() => { localStorage.setItem("goin.lang", lang); }, [lang]);
  useEffect(() => { localStorage.setItem("goin.saved", JSON.stringify(Array.from(savedIds))); }, [savedIds]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 1800);
    return () => clearTimeout(timer);
  }, [toast]);

  const localizedEvents = useMemo<Ev[]>(() => EVENTS.map((e) => ({
    ...e,
    typeLabel: (
      {
        cinema: t.typeCinema, theatre: t.typeTheatre, music: t.typeMusic,
        exhibition: t.typeExhibition, talk: t.typeTalk, club: t.typeClub, food: t.typeFood,
      } as Record<string, string>
    )[e.type] || e.typeLabel,
  })), [t]);

  const TYPES = useMemo(() => [
    { id: "all" as EventType, label: t.typeAll, count: 142 },
    { id: "cinema" as EventType, label: t.typeCinema, count: 38 },
    { id: "theatre" as EventType, label: t.typeTheatre, count: 21 },
    { id: "music" as EventType, label: t.typeMusic, count: 27 },
    { id: "exhibition" as EventType, label: t.typeExhibition, count: 19 },
    { id: "talk" as EventType, label: t.typeTalk, count: 12 },
    { id: "club" as EventType, label: t.typeClub, count: 14 },
    { id: "food" as EventType, label: t.typeFood, count: 11 },
  ], [t]);

  const DAYS = useMemo(() => [
    { id: "today" as EventDay, label: t.today, sub: "Tue 12" },
    { id: "tomorrow" as EventDay, label: t.tomorrow, sub: "Wed 13" },
    { id: "this-week" as EventDay, label: t.thisWeekChip, sub: "12 — 18" },
    { id: "next-week" as EventDay, label: t.nextWeek, sub: "19 — 25" },
  ], [t]);

  const filtered = useMemo(() => {
    return localizedEvents
      .filter((e) => type === "all" || e.type === type)
      .filter((e) => e.day === day || day === "this-week" || day === "next-week")
      .filter((e) => !after || e.time >= after);
  }, [localizedEvents, type, day, after]);

  const toggleSave = (id: number) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); setToast(t.toastRemoved); }
      else { next.add(id); setToast(t.toastSaved); }
      return next;
    });
  };

  const onShare = async () => {
    try { await navigator.clipboard.writeText(window.location.href); } catch { /* noop */ }
    setToast(t.toastCopied);
  };

  const headingLabel = `${DAYS.find((d) => d.id === day)?.label} · ${type === "all" ? t.allEvents : TYPES.find((x) => x.id === type)?.label}`;

  return (
    <div className="g-app">
      <header className="g-top">
        <div className="g-top__left">
          <div className="g-brand">
            <span className="g-brand__mark">G<i className="g-brand__dot" />in'</span>
          </div>
          <span className="g-top__sep" />
          <button
            className="g-pick"
            onClick={() => { setCityOpen((o) => !o); setLangOpen(false); }}
            onBlur={() => setTimeout(() => setCityOpen(false), 150)}
          >
            <Icon name="pin" size={13} />
            <span>{city}</span>
            <Icon name="chev" size={12} />
            {cityOpen && (
              <div className="g-pop">
                {CITIES.map((c) => (
                  <div
                    key={c}
                    className={`g-pop__item ${c === city ? "is-on" : ""}`}
                    onMouseDown={(e) => { e.preventDefault(); setCity(c); setCityOpen(false); }}
                  >
                    {c}
                  </div>
                ))}
              </div>
            )}
          </button>
          <button
            className="g-pick g-pick--ghost"
            onClick={() => { setLangOpen((o) => !o); setCityOpen(false); }}
            onBlur={() => setTimeout(() => setLangOpen(false), 150)}
          >
            <Icon name="globe" size={13} />
            <span>{lang}</span>
            <Icon name="chev" size={12} />
            {langOpen && (
              <div className="g-pop">
                {LANGS.map((l) => (
                  <div
                    key={l}
                    className={`g-pop__item ${l === lang ? "is-on" : ""}`}
                    onMouseDown={(e) => { e.preventDefault(); setLang(l); setLangOpen(false); }}
                  >
                    {l}
                  </div>
                ))}
              </div>
            )}
          </button>
        </div>

        <div className="g-top__search">
          <Icon name="search" size={14} />
          <input placeholder={t.searchPlaceholder} />
          <kbd>⌘K</kbd>
        </div>

        <div className="g-top__right">
          <button className="g-link"><Icon name="mail" size={13} /> {t.newsletter}</button>
          <button className="g-btn g-btn--ink" onClick={() => setSignInOpen(true)}>
            {t.signIn} <Icon name="arrow" size={13} />
          </button>
        </div>
      </header>

      <div className="g-bar">
        <span><b>{filtered.length}</b> {t.eventsToday}</span>
        <span className="g-dot" />
        <span>87 {t.thisWeek}</span>
        <span className="g-dot" />
        <span>{t.updatedAgo}</span>
        <span className="g-bar__spacer" />
        <span className="g-bar__hint"><Icon name="sparkle" size={12} /> {t.openMicHint}</span>
      </div>

      <section className="g-hero">
        <div className="g-hero__head">
          <div>
            <div className="g-eyebrow">{t.rightNow}</div>
            <h2 className="g-hero__h">
              {t.bigThings.split("\n").map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </h2>
          </div>
          <div className="g-hero__nav">
            <button className="g-iconbtn" aria-label="prev"><Icon name="chevL" size={14} /></button>
            <button className="g-iconbtn" aria-label="next"><Icon name="chevR" size={14} /></button>
            <button className="g-link g-link--soft">{t.seeAll} <Icon name="arrow" size={12} /></button>
          </div>
        </div>
        <div className="g-hero__strip">
          {FEATURED.slice(0, 5).map((f) => (
            <FeaturedCard key={f.id} ev={f} active={activeFeat === f.id} onClick={() => setActiveFeat(f.id)} />
          ))}
        </div>
      </section>

      <section className="g-filters">
        <div className="g-filters__row">
          <div className="g-filters__label">{t.typeLabel}</div>
          <div className="g-filters__chips">
            {TYPES.map((tp) => (
              <button
                key={tp.id}
                className={`g-chip ${type === tp.id ? "is-active" : ""}`}
                onClick={() => setType(tp.id)}
              >
                <span>{tp.label}</span>
                <em className="g-chip__count">{tp.count}</em>
              </button>
            ))}
          </div>
        </div>
        <div className="g-filters__row">
          <div className="g-filters__label">{t.whenLabel}</div>
          <div className="g-filters__chips">
            {DAYS.map((d) => (
              <button
                key={d.id}
                className={`g-daychip ${day === d.id ? "is-active" : ""}`}
                onClick={() => setDay(d.id)}
              >
                <span className="g-daychip__label">{d.label}</span>
                <span className="g-daychip__sub">{d.sub}</span>
              </button>
            ))}
            <button className="g-daychip g-daychip--more">
              <Icon name="cal" size={14} />
              <span className="g-daychip__label">{t.pickDate}</span>
            </button>
          </div>
          <div className="g-filters__right">
            <label className="g-after">
              <span>{t.afterLabel}</span>
              <input type="time" value={after} onChange={(e) => setAfter(e.target.value)} />
            </label>
          </div>
        </div>
      </section>

      <div className="g-main">
        <div className="g-list">
          <div className="g-list__head">
            <h3 className="g-list__h">{headingLabel}</h3>
            <div className="g-list__tools">
              <button className="g-link g-link--soft">{t.sortTime} <Icon name="chev" size={12} /></button>
              <button className="g-link g-link--soft" onClick={() => window.print()}>{t.print}</button>
            </div>
          </div>
          {filtered.map((ev) => (
            <EventRow
              key={ev.id}
              ev={ev}
              t={t}
              saved={savedIds.has(ev.id)}
              onSave={() => toggleSave(ev.id)}
              onShare={onShare}
            />
          ))}
          {filtered.length === 0 && (
            <div className="g-empty">
              <div className="g-empty__h">{t.nothingMatches}</div>
              <p>{t.nothingHelp}</p>
            </div>
          )}
          <div className="g-list__more">
            <button className="g-btn g-btn--outline">{t.loadMore}</button>
          </div>
        </div>

        <aside className="g-side">
          <div className="g-card g-card--newsletter">
            <div className="g-eyebrow g-eyebrow--inv">{t.weeklyNewsletter}</div>
            <h3 className="g-card__h">{t.newsletterH}</h3>
            <p className="g-card__p">{t.newsletterP}</p>
            <div className="g-newsletter">
              <input placeholder="hello@you.com" />
              <button className="g-btn g-btn--ink">{t.subscribe}</button>
            </div>
            <div className="g-card__foot">{t.readers}</div>
          </div>

          <div className="g-card">
            <div className="g-card__head">
              <div className="g-eyebrow">{t.yourWeek}</div>
              <button className="g-link g-link--soft" onClick={() => setSignInOpen(true)}>
                {t.signIn} <Icon name="arrow" size={12} />
              </button>
            </div>
            <div className="g-saved">
              <div className="g-saved__row">
                <span className="g-saved__num">{savedIds.size}</span>
                <span className="g-saved__lbl">{t.eventsSaved}</span>
              </div>
              <div className="g-saved__bar">
                <div className="g-saved__bar-fill" style={{ width: `${Math.min(savedIds.size * 14, 100)}%` }} />
              </div>
              <p className="g-saved__hint">{t.yourWeekHint}</p>
            </div>
          </div>

          <div className="g-card">
            <div className="g-eyebrow">{t.topVenues}</div>
            <ul className="g-venues">
              {[
                ["Kinoteka", 24, "Cinema · Śródmieście"],
                ["Teatr Nowy", 12, "Theatre · Mokotów"],
                ["Pardon, To Tu", 9, "Music · Praga"],
                ["MSN", 7, "Exhibition · Wola"],
                ["Skład Butelek", 6, "Music · Praga"],
              ].map(([n, c, m]) => (
                <li key={n as string}>
                  <span className="g-venues__n">{n}</span>
                  <span className="g-venues__c">{c}</span>
                  <span className="g-venues__m">{m}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="g-card g-card--share">
            <div className="g-eyebrow">{t.shareFriends}</div>
            <p className="g-card__p">{t.shareP}</p>
            <div className="g-share">
              <button className="g-btn g-btn--ghost" onClick={onShare}>
                <Icon name="share" size={13} /> {t.copyLink}
              </button>
              <button className="g-btn g-btn--ghost">
                <Icon name="mail" size={13} /> {t.email}
              </button>
            </div>
          </div>
        </aside>
      </div>

      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} t={t} />
      {toast && <div className="g-toast">{toast}</div>}
    </div>
  );
};

export default Welcome;
