import { useState, useEffect, useRef } from "react";

const TEAL = "#2B7F8A";
const TEAL_DARK = "#1d5c65";
const TEAL_BG = "#0d2d35";
const TEAL_LIGHT = "#e8f4f6";
const OFF_WHITE = "#f7f4ef";
const INK = "#1a1a1a";
const WARM_GRAY = "#6b6560";
const BAR_HEIGHT = 64;

// ── Undersøkelse ──────────────────────────────────────────────────────────────
// answers[0] = hvem (rolle), answers[1] = interesse, answers[2] = forventning (tekst)
const survey = [
  {
    sporsmal: "Hvem er du?",
    hint: "Velg det som passer best.",
    fase: "Rolle",
    type: "choice",
    valg: [
      { id: "tonsberg", label: "Ansatt i Tønsberg kommune" },
      { id: "annenkommune", label: "Ansatt i annen kommune" },
      { id: "forsker", label: "Forsker eller student" },
      { id: "annet", label: "Noe annet" },
    ],
  },
  {
    sporsmal: "Hva er du mest nysgjerrig på?",
    hint: "Dette hjelper oss vise det viktigste først.",
    fase: "Interesse",
    type: "choice",
    valg: [
      { id: "metode", label: "Hvordan dere jobber (LLP-metoden)" },
      { id: "prosjekter", label: "Hva dere har laget (prosjekter)" },
      { id: "fremover", label: "Hva dere utforsker fremover" },
      { id: "alt", label: "Alt litt" },
    ],
  },
  {
    sporsmal: "Hva forventer du å finne her?",
    hint: "Skriv gjerne fritt – ingen gale svar.",
    fase: "Forventning",
    type: "text",
  },
];

// ── LLP-kapittler (scrollytelling) ────────────────────────────────────────────
const llpChapters = [
  {
    type: "phase", phaseLabel: "Lære",
    laerdom: "Forstå først. Konkluder sist.",
    desc: "Det kan være fristende å hoppe rett til ideene – men da risikerer du å lage noe som løser feil problem. Lære-fasen handler om å komme tettere på folkene det gjelder: hvem er de, hva opplever de, og hvorfor er det en utfordring?",
    accent: "#4ae8d4", pattern: "circles",
    punkter: ["Kom tett på menneskene det gjelder", "Still spørsmål som åpner opp – ikke lukker ned", "Observer, lytt og kartlegg opplevelser", "Forstå problemet før du tenker på løsningen"],
  },
  {
    type: "phase", phaseLabel: "Lage",
    laerdom: "Mange idéer før én god løsning.",
    desc: "Når du har fått oversikt over utfordringen, er det på tide å begynne å lage. Ikke én perfekt løsning – men mange idéer, små utkast og kanskje noen rare forslag. Alt er lov i starten!",
    accent: "#e8b84a", pattern: "grid",
    punkter: ["Lag mange idéer raskt – ikke én perfekt", "Bygg enkle prototyper og skisser", "Co-design med de som skal bruke løsningen", "Konkretiser slik at andre kan forholde seg til det"],
  },
  {
    type: "phase", phaseLabel: "Prøve",
    laerdom: "Den eneste måten å vite er å teste.",
    desc: "Den eneste måten å vite om en idé fungerer, er å prøve den ut. Få ærlige tilbakemeldinger så tidlig som mulig, slik at du kan forbedre løsningen før du går videre.",
    accent: "#e8734a", pattern: "dots",
    punkter: ["Planlegg testen godt – hvem, hva, hvordan", "Lytt aktivt og still gode spørsmål", "Samle ærlige tilbakemeldinger", "Ta med lærdommene inn i neste runde"],
  },
  { type: "loop", accent: "#4ae8d4", pattern: "circles" },
  { type: "hoppinn-lage", accent: "#e8b84a", pattern: "grid" },
  { type: "hoppinn-prove", accent: "#e8734a", pattern: "dots" },
];

// ── Tjenester (hva vi gjør) ───────────────────────────────────────────────────
const tjenester = [
  { emoji: "🤝", title: "Rådgivning og sparring", desc: "Noen ganger holder det med en god samtale. Vi hjelper deg å tenke gjennom utfordringen og finne en vei videre.", tag: "Rådgivning" },
  { emoji: "🏗️", title: "Prosjekt- og prosessledelse", desc: "Vi leder utviklings- og innovasjonsprosjekter fra A til Å – alltid etter prinsippene i Lære, lage, prøve.", tag: "Prosjektledelse" },
  { emoji: "⚡", title: "Ekspressløp for innovasjon", desc: "Et intensivt og strukturert løp for å komme raskt fra utfordring til løsning. Tilpasset din situasjon.", tag: "Workshop" },
  { emoji: "🎓", title: "Kurs og kompetanse", desc: "Vi holder kurs og har laget et nettverk for kommuneinnovatører – for deg som vil lære mer og dele erfaringer.", tag: "Kompetanse" },
  { emoji: "📡", title: "Oppløft – digital møteplass", desc: "Én gang i måneden inviterer vi til læring, inspirasjon og deling. Åpent for kommunens ansatte og andre.", tag: "Nettverk" },
];

// ── Prosjektportefølje ────────────────────────────────────────────────────────
const portefolje = [
  {
    emoji: "🏗️",
    title: "Byggeløftet",
    etat: "Plan og bygg",
    status: "Avsluttet",
    desc: "Nye måter å jobbe på i plan- og byggesaker. Faste dialogarenaer med utbyggere, nye rutiner for oppstartsmøter og bedre styringsdata i saksbehandlingssystemet.",
    laerdom: "Kontinuerlig dialog med næringsliv gir raskere og bedre beslutninger.",
    faser: ["Lære", "Lage", "Prøve"],
  },
  {
    emoji: "👶",
    title: "Bedre oppfølging av nyfødte",
    etat: "Helse og omsorg",
    status: "Avsluttet",
    desc: "Ekspressløp for å kartlegge og forbedre kommunens oppfølging av nyfødte og familier i sårbare situasjoner. Resulterte i ny rutinehåndbok og tettere tverrfaglig samarbeid.",
    laerdom: "Brukernes opplevelse avslørte gap ingen visste om.",
    faser: ["Lære", "Lage", "Prøve"],
  },
  {
    emoji: "📋",
    title: "Digital saksbehandling NAV",
    etat: "NAV Tønsberg",
    status: "Pågår",
    desc: "Kartlegging av flaskehalser i saksbehandlingsflyt. Identifiserte tre prosesser som kan effektiviseres betydelig med enkle digitale grep – nå i prototypefase.",
    laerdom: "De ansatte visste løsningen. Vi hjalp dem å formulere den.",
    faser: ["Lære", "Lage"],
  },
  {
    emoji: "🏫",
    title: "Skole-hjem-samarbeid 2.0",
    etat: "Oppvekst",
    status: "Pågår",
    desc: "Utforsker nye modeller for samarbeid mellom skole og foreldre, med særlig fokus på familier som opplever terskelen som høy. Brukerintervjuer er gjennomført – nå i lage-fase.",
    laerdom: "Terskelen er ikke digital. Den er relasjonell.",
    faser: ["Lære", "Lage"],
  },
  {
    emoji: "🗺️",
    title: "Tønsbergkartet",
    etat: "By- og stedsutvikling",
    status: "Avsluttet",
    desc: "Medvirkningsprosess for kommuneplanen der innbyggere kunne markere steder som er viktige for dem. Over 800 innspill samlet inn via enkel digital løsning.",
    laerdom: "Enkle verktøy senker terskelen for medvirkning dramatisk.",
    faser: ["Lære", "Prøve"],
  },
  {
    emoji: "💊",
    title: "Legemiddelhåndtering sykehjem",
    etat: "Helse og omsorg",
    status: "Avsluttet",
    desc: "Ekspressløp for å redusere feil i legemiddelhåndtering på sykehjem. Resulterte i ny sjekkliste og opplæringsmodul som nå er implementert på alle kommunale sykehjem.",
    laerdom: "En enkel sjekkliste kan redde liv.",
    faser: ["Lære", "Lage", "Prøve"],
  },
];

// ── Seksjonsortering basert på svar ──────────────────────────────────────────
// Returnerer en ordnet liste av seksjons-ID-er
function getSectionOrder(answers) {
  var interesse = answers[1] || "alt";
  if (interesse === "metode") return ["om", "llp", "fremover", "prosjekter", "hmw", "kontakt"];
  if (interesse === "prosjekter") return ["om", "prosjekter", "llp", "fremover", "hmw", "kontakt"];
  if (interesse === "fremover") return ["om", "fremover", "llp", "prosjekter", "hmw", "kontakt"];
  return ["om", "llp", "prosjekter", "fremover", "hmw", "kontakt"];
}

// ── Hjelpefunksjoner ──────────────────────────────────────────────────────────
function Pattern({ type, color }) {
  var op = 0.06;
  if (type === "circles") return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: op }}>
      {[...Array(5)].map(function(_, i) { return <circle key={i} cx={(8+i*20)+"%"} cy="50%" r={30+i*28} fill="none" stroke={color} strokeWidth="1.5" />; })}
    </svg>
  );
  if (type === "grid") return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: op }}>
      {[...Array(10)].map(function(_, i) { return <line key={"v"+i} x1={(i*12)+"%"} y1="0%" x2={(i*12)+"%"} y2="100%" stroke={color} strokeWidth="1" />; })}
      {[...Array(8)].map(function(_, i) { return <line key={"h"+i} x1="0%" y1={(i*15)+"%"} x2="100%" y2={(i*15)+"%"} stroke={color} strokeWidth="1" />; })}
    </svg>
  );
  if (type === "dots") return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: op }}>
      {[...Array(6)].map(function(_, r) { return [...Array(12)].map(function(_, c) { return <circle key={r+"-"+c} cx={(c*9+3)+"%"} cy={(r*20+8)+"%"} r="2.5" fill={color} />; }); })}
    </svg>
  );
  return null;
}

function StickyNote({ text }) {
  return <div style={{ background: "#fffde7", border: "1px solid #f0e68c", borderRadius: 4, padding: "8px 14px", color: "#5a5228", fontFamily: "'Caveat', cursive", fontSize: 15, display: "inline-block", transform: "rotate(-1deg)", boxShadow: "2px 3px 8px rgba(0,0,0,0.08)", marginTop: 8 }}>{text}</div>;
}

function Feltnotat({ answers }) {
  var [collapsed, setCollapsed] = useState(false);
  useEffect(function() { var t = setTimeout(function() { setCollapsed(true); }, 8000); return function() { clearTimeout(t); }; }, []);
  if (!answers[2]) return null;
  return (
    <div style={{ position: "fixed", bottom: 20, right: 16, zIndex: 200, fontFamily: "'Caveat', cursive" }}>
      {collapsed ? (
        <button onClick={function() { setCollapsed(false); }} style={{ background: "#fffde7", border: "1px solid #f0e68c", borderRadius: 20, padding: "6px 14px", color: "#5a5228", fontSize: 13, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", fontFamily: "'Caveat', cursive" }}>Ditt feltnotat</button>
      ) : (
        <div style={{ background: "#fffde7", border: "1px solid #f0e68c", borderRadius: 8, padding: "12px 14px", maxWidth: 220, boxShadow: "0 4px 20px rgba(0,0,0,0.1)", transform: "rotate(-1deg)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#5a5228" }}>Ditt svar</p>
            <button onClick={function() { setCollapsed(true); }} style={{ background: "none", border: "none", color: "#9a8a40", fontSize: 14, cursor: "pointer", padding: "0 0 0 8px", lineHeight: 1 }}>x</button>
          </div>
          <p style={{ margin: "0 0 3px", fontSize: 14, color: "#5a5228" }}>"{answers[2].slice(0, 55)}{answers[2].length > 55 ? "..." : ""}"</p>
          <p style={{ margin: 0, opacity: 0.6, fontSize: 12, color: "#5a5228" }}>forventningen din</p>
        </div>
      )}
    </div>
  );
}

function OppfolgingsBoks({ answers, onSvar }) {
  var [svar, setSvar] = useState("");
  var [sendt, setSendt] = useState(false);
  if (!answers[2]) return null;
  return (
    <div style={{ background: "white", borderRadius: 12, padding: "28px 32px", border: "1px solid rgba(43,127,138,0.15)", maxWidth: 540, boxShadow: "0 4px 24px rgba(43,127,138,0.08)", fontFamily: "'DM Sans', sans-serif" }}>
      <p style={{ color: TEAL, fontWeight: 600, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>Oppfølging</p>
      <p style={{ fontSize: 16, color: INK, fontWeight: 600, marginBottom: 8 }}>
        Du forventet: <span style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: TEAL }}>"{answers[2]}"</span>
      </p>
      {!sendt ? (
        <div>
          <p style={{ fontSize: 14, color: WARM_GRAY, marginBottom: 16 }}>Ble forventningen innfridd?</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Ja, absolutt!", "Delvis", "Ikke helt", "Nei, men interessant"].map(function(alt) {
              return <button key={alt} onClick={function() { setSvar(alt); setSendt(true); onSvar && onSvar(alt); }} style={{ background: OFF_WHITE, border: "1px solid rgba(0,0,0,0.1)", borderRadius: 20, padding: "7px 14px", fontSize: 13, color: INK, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>{alt}</button>;
            })}
          </div>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: 16, color: INK }}>Du svarte: <strong style={{ color: TEAL }}>{svar}</strong></p>
          <StickyNote text="Takk – det hjelper oss bli bedre." />
        </div>
      )}
    </div>
  );
}

// ── LLP scrollytelling ────────────────────────────────────────────────────────
function LoopChapter() {
  var items = ["Lære", "Lage", "Prøve"]; var cols = ["#4ae8d4","#e8b84a","#e8734a"];
  var rep = items.concat(items).concat(items).concat(items);
  var repCols = cols.concat(cols).concat(cols).concat(cols);
  return (
    <div style={{ padding: (BAR_HEIGHT+8)+"px 24px 56px", overflowY: "auto", height: "100%", maxWidth: 560 }}>
      <p style={{ color: "#4ae8d4", fontWeight: 700, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Slik fungerer det i praksis</p>
      <h2 style={{ fontSize: "clamp(28px,6vw,44px)", fontWeight: 700, color: "white", lineHeight: 1.15, marginBottom: 12 }}>LLP er en måte å tenke på.</h2>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, marginBottom: 28 }}>Ikke en rigid prosess, men et tankesett. Du gjentar fasene til du har en løsning du vet fungerer.</p>
      <style>{`@keyframes scrollLeft { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} } .loop-track{display:flex;animation:scrollLeft 10s linear infinite;width:max-content;}`}</style>
      <div style={{ overflow: "hidden", marginLeft: -24, marginRight: -24, padding: "16px 0", marginBottom: 24 }}>
        <div className="loop-track">
          {rep.map(function(label, i) {
            var col = repCols[i];
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 16px", flexShrink: 0 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid "+col+"66", background: col+"18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: col, letterSpacing: 1, textTransform: "uppercase" }}>{label==="Lære"?"L":label==="Lage"?"La":"P"}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: col, whiteSpace: "nowrap" }}>{label}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.15)", marginLeft: 4 }}>→</span>
              </div>
            );
          })}
        </div>
      </div>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.75 }}>Modellen passer like godt i en times workshop som i større prosesser, og er egnet både for nybegynnere og erfarne.</p>
      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: 2, textTransform: "uppercase", marginTop: 24 }}>scroll videre</p>
    </div>
  );
}

function HoppInnLage() {
  return (
    <div style={{ padding: (BAR_HEIGHT+8)+"px 24px 56px", overflowY: "auto", height: "100%", maxWidth: 560 }}>
      <p style={{ color: "#e8b84a", fontWeight: 700, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>En siste ting</p>
      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 20 }}>
        <div style={{ background: "#e8b84a", borderRadius: 4, padding: "4px 12px", fontSize: 11, fontWeight: 700, color: TEAL_BG }}>Lage</div>
        <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>→</div>
        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 4, padding: "4px 12px", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Prøve</div>
        <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>→</div>
        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, padding: "4px 12px", fontSize: 11, color: "rgba(255,255,255,0.25)" }}>Lære</div>
      </div>
      <h2 style={{ fontSize: "clamp(26px,6vw,40px)", fontWeight: 700, color: "white", lineHeight: 1.15, marginBottom: 12 }}>Har du en skikkelig god idé?</h2>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.75, marginBottom: 20 }}>Da kan du godt begynne rett i Lage-fasen. Bygg noe konkret, få det ut i hendene på folk – og la tilbakemeldingene ta deg tilbake til Lære etterpå.</p>
      <p style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: "#e8b84a", marginBottom: 24 }}>"Ikke la mangel på innsikt stoppe en god idé – bare vær åpen for å ta feil."</p>
      <div style={{ background: "rgba(232,184,74,0.1)", border: "1px solid rgba(232,184,74,0.25)", borderRadius: 8, padding: "14px 16px" }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, margin: 0 }}>Eksempel: Du har en idé til en ny digital tjeneste. Lag en enkel skisse eller klikkbar prototype – og test den med noen brukere før du investerer mer tid.</p>
      </div>
      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: 2, textTransform: "uppercase", marginTop: 28 }}>scroll videre</p>
    </div>
  );
}

function HoppInnProve() {
  return (
    <div style={{ padding: (BAR_HEIGHT+8)+"px 24px 56px", overflowY: "auto", height: "100%", maxWidth: 560 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 20 }}>
        <div style={{ background: "#e8734a", borderRadius: 4, padding: "4px 12px", fontSize: 11, fontWeight: 700, color: "white" }}>Prøve</div>
        <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>→</div>
        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, padding: "4px 12px", fontSize: 11, color: "rgba(255,255,255,0.25)" }}>Lære</div>
        <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>→</div>
        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, padding: "4px 12px", fontSize: 11, color: "rgba(255,255,255,0.25)" }}>Lage</div>
      </div>
      <h2 style={{ fontSize: "clamp(26px,6vw,40px)", fontWeight: 700, color: "white", lineHeight: 1.15, marginBottom: 12 }}>Vil du forbedre noe som allerede finnes?</h2>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.75, marginBottom: 20 }}>Da kan du hoppe rett til Prøve. Test det som allerede finnes, samle ærlige tilbakemeldinger – og la det ta deg tilbake til Lære eller Lage når du vet hva som må forbedres.</p>
      <p style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: "#e8734a", marginBottom: 24 }}>"Den eneste måten å vite er å teste."</p>
      <div style={{ background: "rgba(232,115,74,0.1)", border: "1px solid rgba(232,115,74,0.25)", borderRadius: 8, padding: "14px 16px" }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, margin: 0 }}>Eksempel: Du har en eksisterende tjeneste som ikke fungerer godt nok. Observer brukerne, still åpne spørsmål – og ta lærdommene med inn i neste runde.</p>
      </div>
    </div>
  );
}

function LLPProgressBar({ activeIndex, progress, onJump }) {
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: BAR_HEIGHT, zIndex: 20, padding: "14px 32px 0", pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 100%)", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1, pointerEvents: "all" }}>
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.12)", transform: "translateY(-50%)" }} />
        <div style={{ position: "absolute", top: "50%", left: 0, height: 1, width: (progress*100)+"%", background: "rgba(255,255,255,0.5)", transform: "translateY(-50%)" }} />
        <div style={{ display: "flex", justifyContent: "space-around", position: "relative" }}>
          {llpChapters.map(function(ch, i) {
            var isActive = i===activeIndex, isPast = i<activeIndex;
            var label = ch.type==="phase" ? ch.phaseLabel : ch.type==="loop" ? "..." : "→";
            return (
              <div key={i} onClick={function() { onJump(i); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: isActive?"white":"transparent", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", whiteSpace: "nowrap", transition: "color 0.3s ease", height: 12, lineHeight: "12px" }}>{label}</div>
                <div style={{ width: isActive?8:5, height: isActive?8:5, borderRadius: "50%", background: isActive?"white":isPast?"rgba(255,255,255,0.55)":"rgba(255,255,255,0.18)", transition: "all 0.3s ease" }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LLPScrollytelling({ scrollContainer, answers, onSvarSet }) {
  var [progress, setProgress] = useState(0);
  var [activeIndex, setActiveIndex] = useState(0);
  var sectionRef = useRef(null);
  var rafRef = useRef(null);

  useEffect(function() {
    var container = scrollContainer && scrollContainer.current;
    if (!container) return;
    function handleScroll() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(function() {
        var section = sectionRef.current;
        if (!section) return;
        var scrollTop = container.scrollTop;
        var sectionTop = section.offsetTop;
        var maxScroll = section.offsetHeight - container.clientHeight;
        if (maxScroll <= 0) return;
        var raw = Math.min(Math.max((scrollTop - sectionTop) / maxScroll, 0), 1);
        setProgress(raw);
        setActiveIndex(Math.min(Math.floor(raw * llpChapters.length), llpChapters.length - 1));
      });
    }
    container.addEventListener("scroll", handleScroll, { passive: true });
    return function() { container.removeEventListener("scroll", handleScroll); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [scrollContainer]);

  function jumpToChapter(i) {
    var section = sectionRef.current, container = scrollContainer && scrollContainer.current;
    if (!section || !container) return;
    var maxScroll = section.offsetHeight - container.clientHeight;
    container.scrollTo({ top: section.offsetTop + (i / llpChapters.length) * maxScroll + 8, behavior: "smooth" });
  }
  function skipToEnd() {
    var section = sectionRef.current, container = scrollContainer && scrollContainer.current;
    if (!section || !container) return;
    container.scrollTo({ top: section.offsetTop + section.offsetHeight - container.clientHeight + 1, behavior: "smooth" });
  }

  var chapter = llpChapters[activeIndex];
  var translateX = -activeIndex * 100;

  return (
    <div>
      <div style={{ background: OFF_WHITE, padding: "48px 24px 56px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <p style={{ color: TEAL, fontWeight: 700, fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 10 }}>Metoden vår</p>
          <h2 style={{ fontSize: "clamp(26px,6vw,36px)", fontWeight: 700, color: INK, lineHeight: 1.15, marginBottom: 12 }}>Lære. Lage. Prøve.<br />I den rekkefølgen.</h2>
          <p style={{ fontSize: 15, color: WARM_GRAY, lineHeight: 1.7, maxWidth: 500 }}>LLP er samlet fra det beste i designdrevet innovasjon, Lean Startup og tjenestedesign – tilpasset virkeligheten i Tønsberg kommune. Scroll for å utforske.</p>
        </div>
      </div>

      <div ref={sectionRef} style={{ height: (llpChapters.length * 160) + "vh", position: "relative" }}>
        <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ position: "absolute", inset: 0, background: TEAL_BG }}>
            <div style={{ position: "absolute", inset: "-20%" }}><Pattern type={chapter.pattern||"circles"} color={chapter.accent||TEAL} /></div>
          </div>
          <LLPProgressBar activeIndex={activeIndex} progress={progress} onJump={jumpToChapter} />
          <div style={{ position: "absolute", inset: 0, display: "flex", transform: "translateX("+translateX+"vw)", transition: "transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94)", width: (llpChapters.length*100)+"vw" }}>
            {llpChapters.map(function(ch, i) {
              var dist = i - activeIndex, isActive = dist === 0;
              return (
                <div key={i} style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "flex-start", flexShrink: 0, opacity: isActive?1:Math.max(0,1-Math.abs(dist)*0.85), transform: "scale("+(isActive?1:0.95)+") translateX("+(dist*6)+"px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}>
                  {ch.type === "phase" && (
                    <div style={{ padding: (BAR_HEIGHT+8)+"px 24px 56px", overflowY: "auto", height: "100%", maxWidth: 560 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: ch.accent, letterSpacing: 2, textTransform: "uppercase" }}>Fase {i+1} av 3</span>
                        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 9 }}>·</span>
                        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 1.5, textTransform: "uppercase" }}>LLP</span>
                      </div>
                      <h2 style={{ fontSize: "clamp(36px,8vw,56px)", fontWeight: 700, color: "white", lineHeight: 1.0, marginBottom: 4 }}>{ch.phaseLabel}</h2>
                      <div style={{ width: 24, height: 2, background: ch.accent, marginBottom: 8 }} />
                      <p style={{ fontFamily: "'Caveat', cursive", fontSize: "clamp(16px,3.5vw,20px)", color: ch.accent, lineHeight: 1.3, marginBottom: 8 }}>"{ch.laerdom}"</p>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 12, maxWidth: 420 }}>{ch.desc}</p>
                      <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 8 }} />
                      <p style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>I praksis</p>
                      {ch.punkter.map(function(item, j) {
                        return <div key={j} style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}><div style={{ width: 3, height: 3, borderRadius: "50%", background: ch.accent, flexShrink: 0, marginTop: 6, opacity: 0.6 }} /><p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5, margin: 0 }}>{item}</p></div>;
                      })}
                    </div>
                  )}
                  {ch.type === "loop" && <LoopChapter />}
                  {ch.type === "hoppinn-lage" && <HoppInnLage />}
                  {ch.type === "hoppinn-prove" && <HoppInnProve />}
                </div>
              );
            })}
          </div>
          <div style={{ position: "absolute", bottom: 14, left: 0, right: 0, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px", zIndex: 20 }}>
            {activeIndex===0 && progress<0.02 ? <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase" }}>scroll ned</div> : <div />}
            <button onClick={skipToEnd} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", fontSize: 10, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", letterSpacing: 1, textTransform: "uppercase" }}>Hopp over</button>
          </div>
        </div>
      </div>

      <div style={{ background: OFF_WHITE, padding: "48px 24px 0" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: WARM_GRAY, marginBottom: 32 }}>LLP er ikke et kurs. Det er en vane.</p>
          {answers && answers[2] && <OppfolgingsBoks answers={answers} onSvar={onSvarSet} />}
        </div>
      </div>
    </div>
  );
}

// ── Innholdsseksjoner ─────────────────────────────────────────────────────────
function SeksjonOm({ answers }) {
  var rolle = answers[0] || "";
  var erTonsberg = rolle === "tonsberg";
  return (
    <section style={{ padding: "48px 24px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {erTonsberg && (
          <div style={{ background: TEAL_LIGHT, border: "1px solid "+TEAL+"33", borderRadius: 8, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>👋</span>
            <p style={{ fontSize: 14, color: TEAL_DARK, margin: 0, fontWeight: 500 }}>Hei, kollega! Godt å se deg her.</p>
          </div>
        )}
        <p style={{ color: TEAL, fontWeight: 600, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>Om TønsbergLØFTET</p>
        <h2 style={{ fontSize: "clamp(22px,5vw,28px)", fontWeight: 700, color: INK, marginBottom: 16, lineHeight: 1.2 }}>Vi støtter kommunen i å jobbe på nye måter.</h2>
        <p style={{ fontSize: 15, color: WARM_GRAY, lineHeight: 1.8, marginBottom: 12 }}>TønsbergLØFTET er et eget team i Tønsberg kommune. Vi bidrar inn i konkrete utviklings- og innovasjonsprosjekter på tvers av hele organisasjonen – gjennom rådgivning, prosjektledelse og kompetansebygging.</p>
        <p style={{ fontSize: 15, color: WARM_GRAY, lineHeight: 1.8, marginBottom: 28 }}>Noen ganger er litt sparring med oss nok. Andre ganger er vi inne og leder prosesser fra A til Å.</p>

        {/* Prinsipper */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 36 }}>
          {[
            { label: "Brukerorientert", desc: "Vi starter med folk som kjenner utfordringen på kroppen" },
            { label: "Eksperimentelt", desc: "Vi prøver raskt, lærer og justerer kurs" },
            { label: "Samarbeid", desc: "De beste ideene oppstår når ulike fagfelt møtes" },
            { label: "På tvers", desc: "Vi jobber i hele Tønsberg kommune" },
          ].map(function(card) {
            return <div key={card.label} style={{ background: "white", borderRadius: 10, padding: "12px 16px", flex: "1 1 130px", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}><p style={{ fontWeight: 600, color: INK, marginBottom: 2, fontSize: 13 }}>{card.label}</p><p style={{ color: WARM_GRAY, fontSize: 12, margin: 0 }}>{card.desc}</p></div>;
          })}
        </div>

        {/* Slik kan vi hjelpe */}
        <p style={{ color: TEAL, fontWeight: 600, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>Slik kan vi hjelpe</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tjenester.map(function(t) {
            return (
              <div key={t.title} style={{ background: "white", borderRadius: 10, padding: "14px 16px", border: "1px solid rgba(0,0,0,0.06)", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{t.emoji}</span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <p style={{ fontWeight: 600, color: INK, fontSize: 14, margin: 0 }}>{t.title}</p>
                    <span style={{ background: TEAL_LIGHT, color: TEAL, fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 20, letterSpacing: 0.5, textTransform: "uppercase" }}>{t.tag}</span>
                  </div>
                  <p style={{ color: WARM_GRAY, fontSize: 12, margin: 0, lineHeight: 1.55 }}>{t.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SeksjonProsjekter() {
  var [aktivt, setAktivt] = useState(null);
  var statusFarge = { "Avsluttet": WARM_GRAY, "Pågår": TEAL };

  return (
    <section style={{ padding: "56px 24px", background: "white" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <p style={{ color: TEAL, fontWeight: 600, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>Prosjektportefølje</p>
        <h2 style={{ fontSize: "clamp(22px,5vw,28px)", fontWeight: 700, color: INK, marginBottom: 8, lineHeight: 1.2 }}>Noen av prosjektene vi har jobbet med</h2>
        <p style={{ fontSize: 14, color: WARM_GRAY, lineHeight: 1.7, marginBottom: 28 }}>Alle prosjekter følger LLP-metoden, men tilpasses hver enkelt situasjon.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {portefolje.map(function(p, i) {
            var erApen = aktivt === i;
            return (
              <div key={p.title}
                onClick={function() { setAktivt(erApen ? null : i); }}
                style={{ background: erApen ? TEAL_LIGHT : OFF_WHITE, borderRadius: 12, padding: "16px 18px", border: "1px solid "+(erApen ? TEAL+"33" : "rgba(0,0,0,0.06)"), cursor: "pointer", transition: "all 0.2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flex: 1 }}>
                    <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>{p.emoji}</span>
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 3 }}>
                        <p style={{ fontWeight: 700, color: INK, fontSize: 14, margin: 0 }}>{p.title}</p>
                        <span style={{ fontSize: 10, fontWeight: 600, color: statusFarge[p.status] || WARM_GRAY, background: "rgba(0,0,0,0.05)", padding: "2px 7px", borderRadius: 20 }}>{p.status}</span>
                      </div>
                      <p style={{ fontSize: 12, color: WARM_GRAY, margin: 0 }}>{p.etat}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 16, color: TEAL, flexShrink: 0, marginTop: 2, transform: erApen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
                </div>
                {erApen && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(43,127,138,0.12)" }}>
                    <p style={{ fontSize: 13, color: WARM_GRAY, lineHeight: 1.7, marginBottom: 12 }}>{p.desc}</p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                      {p.faser.map(function(f) {
                        var fc = f==="Lære"?"#4ae8d4":f==="Lage"?"#e8b84a":"#e8734a";
                        return <span key={f} style={{ fontSize: 10, fontWeight: 700, color: fc, background: fc+"18", border: "1px solid "+fc+"44", padding: "3px 10px", borderRadius: 20, letterSpacing: 0.5, textTransform: "uppercase" }}>{f}</span>;
                      })}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 14, flexShrink: 0 }}>📋</span>
                      <p style={{ fontSize: 12, color: TEAL_DARK, fontStyle: "italic", margin: 0, lineHeight: 1.5 }}>"{p.laerdom}"</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SeksjonFremover() {
  var [aktivTab, setAktivTab] = useState("sandkasse");
  var tabs = [
    { id: "sandkasse", label: "Sandkassen", emoji: "🧪" },
    { id: "system", label: "Innovasjonssystemet", emoji: "⚙️" },
    { id: "vibekoding", label: "Vibekoding", emoji: "🤖" },
  ];
  var vibeprosjekter = [
    { emoji: "🧩", title: "Workshopverktøy", desc: "En samling digitale verktøy for å fasilitere workshops – timer, abstemmingsverktøy, idévegg og mer." },
    { emoji: "🧑‍🤝‍🧑", title: "Personagalleri", desc: "KI-genererte syntetiske personas for rask brukertesting. Last opp innsikt, få tilbake realistiske brukerprofiler." },
    { emoji: "💬", title: "Chatbotfabrikk", desc: "Bygg enkle chatboter for intern bruk uten kode. Koble til kommunens egne dokumenter og rutiner." },
    { emoji: "🔧", title: "Byråkratens lommekniv", desc: "En samling små verktøy som løser konkrete kontorfloker – skjemaassistent, møtereferatgenerator, brevmal-builder og mer." },
  ];

  return (
    <section style={{ background: TEAL_BG, padding: "56px 0 0" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px" }}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Hva vi utforsker fremover</p>
        <h2 style={{ fontSize: "clamp(22px,5vw,28px)", fontWeight: 700, color: "white", marginBottom: 12, lineHeight: 1.2 }}>Neste steg for TønsbergLØFTET</h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, marginBottom: 28 }}>Vi er ikke ferdig. Her er tre retninger vi er spesielt nysgjerrige på.</p>
      </div>

      {/* Tab-bar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        {tabs.map(function(t) {
          var er = aktivTab === t.id;
          return (
            <button key={t.id} onClick={function() { setAktivTab(t.id); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "12px 8px", fontFamily: "'DM Sans', sans-serif",
                fontSize: 12, fontWeight: er ? 700 : 500,
                color: er ? "white" : "rgba(255,255,255,0.4)",
                borderBottom: er ? "2px solid "+TEAL : "2px solid transparent",
                whiteSpace: "nowrap", transition: "all 0.2s",
                marginBottom: -1, textAlign: "center",
                touchAction: "manipulation",
              }}>
              {t.emoji} {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab-innhold */}
      <div style={{ padding: "32px 24px 56px", maxWidth: 640, margin: "0 auto" }}>

        {aktivTab === "sandkasse" && (
          <div>
            <p style={{ fontSize: 22, fontFamily: "'Caveat', cursive", color: "#4ae8d4", marginBottom: 16 }}>"Hva skjer hvis vi bare prøver?"</p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, marginBottom: 20 }}>
              Sandkassen er et rom for å teste ut idéer – digitale og ikke-digitale – uten at alt må ha en ferdig plan. Målet er å utforske løsninger på mer radikale og systemiske utfordringer som kommunen står overfor.
            </p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, marginBottom: 24 }}>
              I sandkassen handler det ikke om å forbedre det som finnes. Det handler om å stille de ubehagelige spørsmålene: Hva om vi løste dette helt annerledes?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Raske eksperimenter", desc: "Teste nye løsninger i liten skala – uten å forplikte seg til full implementering" },
                { label: "Tverrfaglige team", desc: "Sette sammen folk som normalt ikke jobber sammen" },
                { label: "Systemisk blikk", desc: "Utfordre strukturer og praksiser, ikke bare prosesser" },
              ].map(function(k) {
                return (
                  <div key={k.label} style={{ background: "rgba(74,232,212,0.06)", border: "1px solid rgba(74,232,212,0.2)", borderRadius: 8, padding: "12px 16px" }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#4ae8d4", marginBottom: 4 }}>{k.label}</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.6 }}>{k.desc}</p>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 24 }}><StickyNote text="Dette er fortsatt under utforskning. Nysgjerrig? Si ifra!" /></div>
          </div>
        )}

        {aktivTab === "system" && (
          <div>
            <p style={{ fontSize: 22, fontFamily: "'Caveat', cursive", color: "#e8b84a", marginBottom: 16 }}>"LLP er metoden. Men hva er riggen rundt?"</p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, marginBottom: 20 }}>
              Vi vil bygge et bedre system rundt innovasjonsarbeidet i Tønsberg. Ikke bare metoden, men strukturene, nettverkene og verktøyene som gjør det lettere for alle å jobbe på nye måter.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {[
                { label: "Kommuneinnovatørnettverk", desc: "Et levende nettverk av ansatte på tvers av etater som er ekstra engasjert i innovasjon" },
                { label: "Oppløft – månedlig møteplass", desc: "Fast arena for læring, inspirasjon og erfaringsdeling – åpent for alle" },
                { label: "Innovasjonsstyring", desc: "Koble LLP til kommunens prosjektveiviser og styringsmodeller" },
                { label: "Måling og læring", desc: "Hvordan vet vi at innovasjonsarbeidet gir verdi? Vi vil utvikle bedre måter å lære av det vi gjør." },
              ].map(function(k) {
                return (
                  <div key={k.label} style={{ background: "rgba(232,184,74,0.06)", border: "1px solid rgba(232,184,74,0.2)", borderRadius: 8, padding: "12px 16px" }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#e8b84a", marginBottom: 4 }}>{k.label}</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.6 }}>{k.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {aktivTab === "vibekoding" && (
          <div>
            <p style={{ fontSize: 22, fontFamily: "'Caveat', cursive", color: "#e8734a", marginBottom: 16 }}>"Hva om hvem som helst kunne bygge verktøy?"</p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, marginBottom: 8 }}>
              Vibekoding handler om å bruke KI til å utvikle raske prototyper og digitale verktøy – uten å være utvikler. Vi utforsker hvordan dette kan senke terskelen for innovasjon i kommunen.
            </p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, marginBottom: 24 }}>
              Når alle kan lage enkle digitale verktøy tilpasset egne behov, skjer noe med kulturen. Terskelen for å prøve synker dramatisk.
            </p>

            <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Verktøyportefølje</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {vibeprosjekter.map(function(v) {
                return (
                  <div key={v.title} style={{ background: "rgba(232,115,74,0.06)", border: "1px solid rgba(232,115,74,0.2)", borderRadius: 10, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{v.emoji}</span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#e8734a", marginBottom: 4 }}>{v.title}</p>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.6 }}>{v.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "14px 16px" }}>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, margin: 0 }}>
                Alle verktøyene er bygget med KI-assistanse uten tradisjonell utvikling – og viser hva som er mulig når fagkunnskap kombineres med moderne AI-verktøy.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function SeksjonProvLLP({ answers, isStatic }) {
  var [aktivTab, setAktivTab] = useState("laere");
  // Løftet state – resultater fra fullførte faser
  var [brukerhistorie, setBrukerhistorie] = useState(null); // { rolle, behov, verdi }
  var [vinnerIde, setVinnerIde] = useState(null);           // streng med vinnende idé

  if (isStatic) return null;

  var rolle = answers[0] || "annet";
  var kontekst = rolle === "tonsberg" ? "din avdeling" : rolle === "annenkommune" ? "din kommune" : "din organisasjon";

  var tabs = [
    { id: "laere", label: "Lære", accent: "#4ae8d4" },
    { id: "lage", label: "Lage", accent: "#e8b84a" },
    { id: "prove", label: "Prøve", accent: "#e8734a" },
  ];

  return (
    <section style={{ background: OFF_WHITE, padding: "56px 0 0" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 24px 24px" }}>
        <p style={{ color: TEAL, fontWeight: 600, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>Prøv selv</p>
        <h2 style={{ fontSize: "clamp(22px,5vw,28px)", fontWeight: 700, color: INK, marginBottom: 8, lineHeight: 1.2 }}>Prøv LLP i praksis</h2>
        <p style={{ fontSize: 14, color: WARM_GRAY, lineHeight: 1.7 }}>Én øvelse per fase. Prøv dem på en utfordring fra {kontekst}.</p>
      </div>

      {/* Tab-bar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "1px solid rgba(0,0,0,0.08)", maxWidth: 600, margin: "0 auto" }}>
        {tabs.map(function(t) {
          var er = aktivTab === t.id;
          return (
            <button key={t.id} onClick={function() { setAktivTab(t.id); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "12px 8px", fontFamily: "'DM Sans', sans-serif",
                fontSize: 13, fontWeight: er ? 700 : 500,
                color: er ? t.accent : WARM_GRAY,
                borderBottom: er ? "2px solid "+t.accent : "2px solid transparent",
                textAlign: "center", transition: "all 0.2s", marginBottom: -1,
                touchAction: "manipulation",
              }}>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Øvelsene */}
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "28px 24px 56px" }}>
        {aktivTab === "laere" && (
          <OvelsesBrukerhistorie
            accent="#4ae8d4"
            onFerdig={function(bh) { setBrukerhistorie(bh); }}
            onNeste={function(){ setAktivTab("lage"); }}
          />
        )}
        {aktivTab === "lage" && (
          <OvelsesCrazyEight
            accent="#e8b84a"
            brukerhistorie={brukerhistorie}
            onFerdig={function(vinner) { setVinnerIde(vinner); }}
            onNeste={function(){ setAktivTab("prove"); }}
          />
        )}
        {aktivTab === "prove" && (
          <OvelsesBrukercase
            accent="#e8734a"
            vinnerIde={vinnerIde}
            onNeste={null}
          />
        )}
      </div>
    </section>
  );
}

// Lære: Brukerhistorie
function OvelsesBrukerhistorie({ accent, onFerdig, onNeste }) {
  var [rolle, setRolle] = useState("");
  var [behov, setBehov] = useState("");
  var [verdi, setVerdi] = useState("");
  var [ferdig, setFerdig] = useState(false);
  var kanSende = rolle.trim() && behov.trim() && verdi.trim();

  if (ferdig) return (
    <div>
      <p style={{ color: WARM_GRAY, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600, marginBottom: 16 }}>Din brukerhistorie</p>
      <div style={{ background: "white", border: "1px solid "+accent+"44", borderRadius: 12, padding: "20px 22px", marginBottom: 20 }}>
        <p style={{ fontSize: 16, color: INK, lineHeight: 1.8, margin: 0 }}>
          Som <strong style={{ color: accent }}>{rolle}</strong> vil jeg <strong style={{ color: accent }}>{behov}</strong> slik at <strong style={{ color: accent }}>{verdi}</strong>.
        </p>
      </div>
      <p style={{ fontSize: 13, color: WARM_GRAY, lineHeight: 1.65, marginBottom: 20 }}>
        En brukerhistorie holder fokus på hvem vi lager noe for, hva de trenger og hvorfor det gir verdi. Del den med teamet ditt – og sjekk om alle er enige.
      </p>
      <StickyNote text="Prøv å lage tre brukerhistorier for samme utfordring." />
      <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={function() { setRolle(""); setBehov(""); setVerdi(""); setFerdig(false); }}
          style={{ background: "none", color: accent, border: "1px solid "+accent, padding: "9px 20px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
          Prøv igjen
        </button>
        {onNeste && (
          <button onClick={onNeste}
            style={{ background: accent, color: "white", border: "none", padding: "9px 20px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, touchAction: "manipulation" }}>
            Gå videre til Lage →
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <p style={{ fontSize: 13, color: WARM_GRAY, lineHeight: 1.65, marginBottom: 20 }}>
        En brukerhistorie er et enkelt verktøy for å holde fokus på hvem du lager noe for. Fyll inn feltene og se historien ta form.
      </p>
      <div style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 12, padding: "20px 20px", marginBottom: 20 }}>
        <p style={{ fontSize: 14, color: INK, lineHeight: 2.2, margin: 0 }}>
          Som{" "}
          <input value={rolle} onChange={function(e){setRolle(e.target.value);}}
            placeholder="hvem?"
            style={{ border: "none", borderBottom: "2px solid "+accent, outline: "none", fontSize: 16, color: INK, width: 120, fontFamily: "'DM Sans', sans-serif", background: "transparent", padding: "0 4px" }} />
          {" "}vil jeg{" "}
          <input value={behov} onChange={function(e){setBehov(e.target.value);}}
            placeholder="hva?"
            style={{ border: "none", borderBottom: "2px solid "+accent, outline: "none", fontSize: 16, color: INK, width: 160, fontFamily: "'DM Sans', sans-serif", background: "transparent", padding: "0 4px" }} />
          {" "}slik at{" "}
          <input value={verdi} onChange={function(e){setVerdi(e.target.value);}}
            placeholder="hvorfor?"
            style={{ border: "none", borderBottom: "2px solid "+accent, outline: "none", fontSize: 16, color: INK, width: 160, fontFamily: "'DM Sans', sans-serif", background: "transparent", padding: "0 4px" }} />.
        </p>
      </div>
      <button onClick={function() { if (kanSende) { setFerdig(true); onFerdig && onFerdig({ rolle: rolle, behov: behov, verdi: verdi }); } }} disabled={!kanSende}
        style={{ background: kanSende ? accent : "#ddd", color: kanSende ? "white" : WARM_GRAY, border: "none", padding: "11px 24px", borderRadius: 8, fontSize: 14, cursor: kanSende ? "pointer" : "default", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
        Lag brukerhistorien →
      </button>
    </div>
  );
}

function OvelsesCrazyEight({ accent, brukerhistorie, onFerdig, onNeste }) {
  var [steg, setSteg] = useState("intro"); // intro | aktiv | stem | ferdig
  var [sekLeft, setSekLeft] = useState(60);
  var [ideer, setIdeer] = useState(["","","",""]);
  var [stemmer, setStemmer] = useState([0,0,0,0]);
  var [prikkerIgjen, setPrikkerIgjen] = useState(5);
  var timerRef = useRef(null);

  function startTimer() {
    setSteg("aktiv");
    setSekLeft(60);
    timerRef.current = setInterval(function() {
      setSekLeft(function(s) {
        if (s <= 1) { clearInterval(timerRef.current); setSteg("stem"); return 0; }
        return s - 1;
      });
    }, 1000);
  }

  useEffect(function() {
    return function() { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  function oppdaterIdé(i, val) {
    setIdeer(function(prev) { var ny = prev.slice(); ny[i] = val; return ny; });
  }

  function giStemme(i) {
    if (prikkerIgjen <= 0) return;
    setStemmer(function(prev) { var ny = prev.slice(); ny[i]++; return ny; });
    setPrikkerIgjen(function(p) { return p - 1; });
  }

  function fjernStemme(i) {
    if (stemmer[i] <= 0) return;
    setStemmer(function(prev) { var ny = prev.slice(); ny[i]--; return ny; });
    setPrikkerIgjen(function(p) { return p + 1; });
  }

  function reset() {
    setIdeer(["","","",""]);
    setStemmer([0,0,0,0]);
    setPrikkerIgjen(5);
    setSekLeft(60);
    setSteg("intro");
  }

  var vinner = stemmer.indexOf(Math.max.apply(null, stemmer));

  if (steg === "intro") return (
    <div>
      {brukerhistorie && (
        <div style={{ background: "#4ae8d4"+"15", border: "1px solid #4ae8d444", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
          <p style={{ fontSize: 9, color: "#4ae8d4", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Ramme fra Lære</p>
          <p style={{ fontSize: 13, color: INK, margin: 0, lineHeight: 1.6 }}>
            Som <strong>{brukerhistorie.rolle}</strong> vil jeg <strong>{brukerhistorie.behov}</strong> slik at <strong>{brukerhistorie.verdi}</strong>.
          </p>
        </div>
      )}
      <p style={{ fontSize: 13, color: WARM_GRAY, lineHeight: 1.65, marginBottom: 16 }}>
        {brukerhistorie ? "Finn fire løsninger som kan dekke brukerhistorien over. Du har 60 sekunder – ikke tenk, bare skriv. Etterpå stemmer du på den beste." : "Tving hjernen til å produsere idéer raskt. Du har 60 sekunder – ikke tenk, bare skriv. Etterpå stemmer du på den beste."}
      </p>
      <div style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
        {["60 sekunder totalt", "Ingen dårlige idéer", "Et stikkord holder fint"].map(function(r) {
          return <p key={r} style={{ fontSize: 12, color: WARM_GRAY, margin: "0 0 4px" }}>• {r}</p>;
        })}
      </div>
      <button onClick={startTimer} style={{ background: accent, color: "white", border: "none", padding: "13px 28px", borderRadius: 8, fontSize: 15, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, touchAction: "manipulation" }}>
        Start ▶
      </button>
    </div>
  );

  if (steg === "aktiv") return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 12, color: WARM_GRAY, margin: 0 }}>Fyll så mange du rekker</p>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", border: "3px solid "+accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: accent }}>{sekLeft}</span>
          </div>
          <span style={{ fontSize: 11, color: WARM_GRAY }}>sek</span>
        </div>
      </div>
      <div style={{ width: "100%", height: 4, background: "rgba(0,0,0,0.06)", borderRadius: 2, marginBottom: 16, overflow: "hidden" }}>
        <div style={{ height: "100%", background: accent, width: (sekLeft/60*100)+"%", transition: "width 1s linear", borderRadius: 2 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {ideer.map(function(ide, i) {
          return (
            <div key={i} style={{ background: "white", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 8, padding: "10px 14px" }}>
              <p style={{ fontSize: 9, color: accent, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Idé {i+1}</p>
              <textarea value={ide} onChange={function(e){oppdaterIdé(i,e.target.value);}}
                placeholder="Skriv raskt..."
                style={{ width: "100%", border: "none", outline: "none", fontSize: 16, fontFamily: "'DM Sans', sans-serif", resize: "none", background: "transparent", color: INK, lineHeight: 1.5, display: "block" }}
                rows={1} />
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 14 }}>
        <button onClick={function(){ clearInterval(timerRef.current); setSteg("stem"); }}
          style={{ background: "none", color: accent, border: "1px solid "+accent, padding: "9px 20px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, touchAction: "manipulation" }}>
          Ferdig – stem nå →
        </button>
      </div>
    </div>
  );

  if (steg === "stem") return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: INK, margin: 0 }}>Stem på den beste idéen</p>
        <div style={{ display: "flex", gap: 4 }}>
          {[...Array(5)].map(function(_, i) {
            return <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: i < prikkerIgjen ? accent : "rgba(0,0,0,0.1)", transition: "background 0.2s" }} />;
          })}
        </div>
      </div>
      <p style={{ fontSize: 12, color: WARM_GRAY, marginBottom: 16 }}>Du har {prikkerIgjen} prikk{prikkerIgjen !== 1 ? "er" : ""} igjen. Trykk på en idé for å gi den en prikk – trykk igjen for å ta den tilbake.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {ideer.map(function(ide, i) {
          return (
            <div key={i}
              style={{ background: stemmer[i] > 0 ? accent+"15" : "white", border: "1px solid "+(stemmer[i] > 0 ? accent : "rgba(0,0,0,0.08)"), borderRadius: 8, padding: "12px 14px", cursor: "pointer", transition: "all 0.2s", touchAction: "manipulation" }}
              onClick={function(){ prikkerIgjen > 0 ? giStemme(i) : stemmer[i] > 0 ? fjernStemme(i) : null; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 9, color: stemmer[i] > 0 ? accent : WARM_GRAY, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>Idé {i+1}</p>
                  <p style={{ fontSize: 13, color: ide ? INK : WARM_GRAY, margin: 0, fontStyle: ide ? "normal" : "italic" }}>{ide || "tom"}</p>
                </div>
                <div style={{ display: "flex", gap: 3, marginLeft: 12, flexShrink: 0 }}>
                  {[...Array(stemmer[i])].map(function(_, j) {
                    return <div key={j} style={{ width: 8, height: 8, borderRadius: "50%", background: accent }} />;
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={function(){ setSteg("ferdig"); }}
        style={{ background: accent, color: "white", border: "none", padding: "11px 24px", borderRadius: 8, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, touchAction: "manipulation" }}>
        Se resultatet →
      </button>
    </div>
  );

  if (steg === "ferdig") return (
    <div>
      <p style={{ fontSize: 18, fontFamily: "'Caveat', cursive", color: accent, marginBottom: 14 }}>
        {ideer[vinner] ? "\""+ideer[vinner]+"\" vant!" : "Stemmeresultat"}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {ideer.map(function(ide, i) {
          var erVinner = i === vinner && stemmer[i] > 0;
          return (
            <div key={i} style={{ background: erVinner ? accent+"20" : "white", border: "1px solid "+(erVinner ? accent : "rgba(0,0,0,0.06)"), borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 9, color: erVinner ? accent : WARM_GRAY, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>Idé {i+1}{erVinner ? " 🏆" : ""}</p>
                <p style={{ fontSize: 13, color: ide ? INK : WARM_GRAY, margin: 0, fontStyle: ide ? "normal" : "italic" }}>{ide || "tom"}</p>
              </div>
              <div style={{ display: "flex", gap: 3, marginLeft: 12, flexShrink: 0 }}>
                {[...Array(stemmer[i])].map(function(_, j) {
                  return <div key={j} style={{ width: 8, height: 8, borderRadius: "50%", background: accent }} />;
                })}
              </div>
            </div>
          );
        })}
      </div>
      <StickyNote text="Neste steg: bygg en enkel prototype av vinneren." />
      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={reset}
          style={{ background: "none", color: accent, border: "1px solid "+accent, padding: "9px 20px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, touchAction: "manipulation" }}>
          Prøv igjen
        </button>
        {onNeste && (
          <button onClick={function(){ onFerdig && onFerdig(ideer[vinner] || ""); onNeste(); }}
            style={{ background: accent, color: "white", border: "none", padding: "9px 20px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, touchAction: "manipulation" }}>
            Gå videre til Prøve →
          </button>
        )}
      </div>
    </div>
  );

  return null;
}

// Prøve: Testcase
function OvelsesBrukercase({ accent, vinnerIde, onNeste }) {
  var [bruker, setBruker] = useState("");
  var [situasjon, setSituasjon] = useState("");
  var [oppgave, setOppgave] = useState("");
  var [ferdig, setFerdig] = useState(false);
  var kanSende = bruker.trim() && situasjon.trim() && oppgave.trim();

  if (ferdig) return (
    <div>
      <p style={{ color: WARM_GRAY, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600, marginBottom: 14 }}>Din testcase</p>
      <div style={{ background: "white", border: "1px solid "+accent+"44", borderRadius: 10, padding: "18px 18px", marginBottom: 16 }}>
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 10, color: accent, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Brukeren</p>
          <p style={{ fontSize: 14, color: INK, margin: 0, lineHeight: 1.6 }}>{bruker}</p>
        </div>
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 10, color: accent, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Situasjon</p>
          <p style={{ fontSize: 14, color: INK, margin: 0, lineHeight: 1.6 }}>{situasjon}</p>
        </div>
        <div style={{ paddingTop: 14, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <p style={{ fontSize: 10, color: accent, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Oppgave</p>
          <div style={{ background: accent+"12", borderRadius: 6, padding: "10px 14px" }}>
            <p style={{ fontSize: 15, color: INK, margin: 0, lineHeight: 1.65, fontWeight: 500 }}>{oppgave}</p>
          </div>
        </div>
      </div>
      <p style={{ fontSize: 12, color: WARM_GRAY, lineHeight: 1.65, marginBottom: 6 }}>Les testcasen høyt for brukeren, gi dem prototypen – og observer uten å hjelpe.</p>
      <StickyNote text="Tre brukere er nok til å finne de største problemene." />
      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={function() { setBruker(""); setSituasjon(""); setOppgave(""); setFerdig(false); }}
          style={{ background: "none", color: accent, border: "1px solid "+accent, padding: "9px 20px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
          Lag ny testcase
        </button>
      </div>
    </div>
  );

  return (
    <div>
      {vinnerIde && (
        <div style={{ background: "#e8b84a"+"15", border: "1px solid #e8b84a44", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
          <p style={{ fontSize: 9, color: "#e8b84a", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Vinnende idé fra Lage</p>
          <p style={{ fontSize: 13, color: INK, margin: 0, lineHeight: 1.6, fontWeight: 500 }}>{vinnerIde}</p>
        </div>
      )}
      <p style={{ fontSize: 13, color: WARM_GRAY, lineHeight: 1.65, marginBottom: 20 }}>
        {vinnerIde ? "Lag en testcase for den vinnende idéen. Fyll inn hvem som tester, situasjonen de er i, og oppgaven de skal løse." : "En testcase gir brukeren kontekst og en konkret oppgave å løse med prototypen din – uten at du trenger å forklare underveis."}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 11, color: WARM_GRAY, fontWeight: 600, letterSpacing: 0.5, marginBottom: 6 }}>Hvem er brukeren?</p>
          <input value={bruker} onChange={function(e){setBruker(e.target.value);}} placeholder="Eks: En saksbehandler som jobber med byggesøknader..."
            style={{ width: "100%", padding: "11px 14px", fontSize: 16, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 8, outline: "none", fontFamily: "'DM Sans', sans-serif", color: INK }} />
        </div>
        <div>
          <p style={{ fontSize: 11, color: WARM_GRAY, fontWeight: 600, letterSpacing: 0.5, marginBottom: 6 }}>Hva er situasjonen?</p>
          <textarea value={situasjon} onChange={function(e){setSituasjon(e.target.value);}} placeholder="Eks: Det er mandag morgen og hun har fått inn en ny søknad. Hun er usikker på hvilke vedlegg som mangler..."
            rows={3} style={{ width: "100%", padding: "11px 14px", fontSize: 16, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 8, outline: "none", fontFamily: "'DM Sans', sans-serif", color: INK, resize: "none", lineHeight: 1.55 }} />
        </div>
        <div>
          <p style={{ fontSize: 11, color: WARM_GRAY, fontWeight: 600, letterSpacing: 0.5, marginBottom: 6 }}>Hva er oppgaven?</p>
          <input value={oppgave} onChange={function(e){setOppgave(e.target.value);}} placeholder="Eks: Finn ut hva som mangler i søknaden og send tilbakemelding til søkeren."
            style={{ width: "100%", padding: "11px 14px", fontSize: 16, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 8, outline: "none", fontFamily: "'DM Sans', sans-serif", color: INK }} />
        </div>
      </div>
      <button onClick={function(){if(kanSende)setFerdig(true);}} disabled={!kanSende}
        style={{ background: kanSende ? accent : "#ddd", color: kanSende ? "white" : WARM_GRAY, border: "none", padding: "11px 24px", borderRadius: 8, fontSize: 14, cursor: kanSende ? "pointer" : "default", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
        Generer testcase →
      </button>
    </div>
  );
}

function SeksjonKontakt({ answers, oppfolgingSvar }) {
  var rolle = answers[0] || "annet";

  var innhold = {
    tonsberg: {
      tittel: "Vi sitter ikke langt unna.",
      ingress: "Er du ansatt i Tønsberg kommune og vil prøve noe nytt i avdelingen din? Ta kontakt direkte – vi er på tvers av hele organisasjonen.",
      badge: "Intern kontakt",
    },
    annenkommune: {
      tittel: "Vi deler gjerne erfaringer.",
      ingress: "Er du ansatt i en annen kommune og nysgjerrig på hvordan vi jobber? Vi er åpne for erfaringsutveksling og samarbeid på tvers av kommunegrenser.",
      badge: "Tverrkommunalt samarbeid",
    },
    forsker: {
      tittel: "Vi er interessert i samarbeid.",
      ingress: "Forsker du på innovasjon i offentlig sektor? TønsbergLØFTET har erfaring fra praksis og er åpne for akademisk samarbeid og datainnsamling.",
      badge: "Forskning og samarbeid",
    },
    annet: {
      tittel: "Book oss for en uforpliktende prat!",
      ingress: "Lurer du på hvordan TønsbergLØFTET kan hjelpe? Ta kontakt – vi er alltid nysgjerrige på nye perspektiver.",
      badge: null,
    },
  };

  var t = innhold[rolle] || innhold.annet;

  return (
    <section style={{ background: TEAL_DARK, padding: "64px 24px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        {answers[2] && (
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 24 }}>
            Du forventet: <em>"{answers[2]}"</em>{oppfolgingSvar ? " – og svarte " : ""}
            <strong style={{ color: "rgba(255,255,255,0.75)" }}>{oppfolgingSvar || ""}</strong>
          </p>
        )}
        {t.badge && (
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: "4px 12px", fontSize: 11, color: "rgba(255,255,255,0.55)", letterSpacing: 1, textTransform: "uppercase", fontWeight: 600, marginBottom: 16 }}>
            {t.badge}
          </div>
        )}
        <h2 style={{ fontSize: "clamp(24px,6vw,32px)", fontWeight: 700, color: "white", marginBottom: 12, fontFamily: "'Caveat', cursive" }}>{t.tittel}</h2>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, marginBottom: 28, lineHeight: 1.7 }}>{t.ingress}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {[{ navn: "Vibeke Eliassen", tlf: "91 62 98 03" }, { navn: "Marius Granholt Lundervold", tlf: "91 38 48 97" }, { navn: "Kristian Jahren Øvretveit", tlf: "92 85 46 19" }].map(function(p) {
            return (
              <div key={p.navn} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "12px 16px" }}>
                <span style={{ color: "white", fontSize: 14, fontWeight: 500 }}>{p.navn}</span>
                <a href={"tel:"+p.tlf.replace(/ /g,"")} style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, textDecoration: "none" }}>{p.tlf}</a>
              </div>
            );
          })}
        </div>
        <a href="mailto:postmottak@tonsberg.kommune.no" style={{ background: "white", color: TEAL_DARK, padding: "12px 24px", borderRadius: 8, fontSize: 15, textDecoration: "none", fontWeight: 700, display: "inline-block" }}>Send e-post</a>
      </div>
    </section>
  );
}

// ── Hovedinnhold med dynamisk seksjonsortering ────────────────────────────────
function MainContent({ answers, isStatic }) {
  var [oppfolgingSvar, setOppfolgingSvar] = useState(null);
  var containerRef = useRef(null);
  var sectionOrder = isStatic ? ["om","llp","prosjekter","fremover","hmw","kontakt"] : getSectionOrder(answers);

  var seksjonMap = {
    om: <SeksjonOm key="om" answers={answers} />,
    llp: <LLPScrollytelling key="llp" scrollContainer={containerRef} answers={answers} onSvarSet={setOppfolgingSvar} />,
    prosjekter: <SeksjonProsjekter key="prosjekter" />,
    fremover: <SeksjonFremover key="fremover" />,
    hmw: <SeksjonProvLLP key="hmw" answers={answers} isStatic={isStatic} />,
    kontakt: <SeksjonKontakt key="kontakt" answers={answers} oppfolgingSvar={oppfolgingSvar} />,
  };

  return (
    <div ref={containerRef} style={{ fontFamily: "'DM Sans', sans-serif", background: OFF_WHITE, height: "100vh", overflowY: "auto" }}>
      {!isStatic && <Feltnotat answers={answers} />}

      <section style={{ background: TEAL, padding: "60px 24px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>TønsbergLØFTET · Tønsberg kommune</p>
          <h1 style={{ fontSize: "clamp(28px,7vw,44px)", fontWeight: 700, color: "white", lineHeight: 1.1, marginBottom: 14 }}>Innovasjon –<br />å jobbe på nye måter.</h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", lineHeight: 1.7, maxWidth: 460 }}>For å løse dagens og fremtidige utfordringer må vi tenke nytt og jobbe på nye måter. TønsbergLØFTET støtter organisasjonen i dette arbeidet – på tvers av hele Tønsberg kommune.</p>
          <div style={{ marginTop: 12 }}><StickyNote text="De fleste scroller forbi dette. Ta deg tid." /></div>
        </div>
      </section>

      {sectionOrder.map(function(id) { return seksjonMap[id]; })}
    </div>
  );
}

// ── App – undersøkelse ────────────────────────────────────────────────────────
export default function App() {
  var [phase, setPhase] = useState("intro");
  var [introStep, setIntroStep] = useState(0);
  var [qIndex, setQIndex] = useState(0);
  var [answers, setAnswers] = useState([]);
  var [pendingChoice, setPendingChoice] = useState(null);
  var [currentText, setCurrentText] = useState("");
  var [transitionStep, setTransitionStep] = useState(0);

  var q = survey[qIndex];

  function handleChoice(id) {
    setPendingChoice(id);
  }

  function commitAndNext(val) {
    var newAnswers = answers.concat([val]);
    setAnswers(newAnswers);
    setPendingChoice(null);
    setCurrentText("");
    if (qIndex < survey.length - 1) {
      setQIndex(function(i) { return i + 1; });
    } else {
      setPhase("transition");
      setTransitionStep(0);
      setTimeout(function() { setTransitionStep(1); }, 1600);
      setTimeout(function() { setTransitionStep(2); }, 3200);
      setTimeout(function() { setPhase("main"); }, 5000);
    }
  }

  function handleNext() {
    if (q.type === "choice" && pendingChoice) commitAndNext(pendingChoice);
    if (q.type === "text" && currentText.trim()) commitAndNext(currentText.trim());
  }

  var canProceed = q.type === "choice" ? !!pendingChoice : currentText.trim().length > 0;

  return (
    <div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Caveat:wght@500;600;700&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);} }
        * { margin:0; padding:0; box-sizing:border-box; }
        html, body { overflow-x:hidden; }
      `}</style>

      {phase === "intro" && (
        <div style={{ minHeight: "100vh", background: OFF_WHITE, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
          <button onClick={function() { setPhase("static"); }} style={{ position: "fixed", top: 16, right: 16, background: "none", border: "none", color: WARM_GRAY, fontSize: 12, cursor: "pointer", opacity: 0.5 }}>Hopp over</button>
          <div style={{ maxWidth: 500, width: "100%", animation: "fadeIn 0.6s ease" }}>
            {introStep === 0 && (
              <div>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: TEAL, marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏙️</div>
                <h1 style={{ fontSize: "clamp(26px,7vw,36px)", fontWeight: 700, color: INK, marginBottom: 10, lineHeight: 1.15 }}>Velkommen til TønsbergLØFTET.</h1>
                <p style={{ fontSize: 15, color: WARM_GRAY, marginBottom: 28, lineHeight: 1.6 }}>Innovasjons- og tjenesteutviklingsenhet i Tønsberg kommune.</p>
                <button onClick={function() { setIntroStep(1); }} style={{ background: TEAL, color: "white", border: "none", padding: "12px 24px", borderRadius: 8, fontSize: 15, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Fortell meg mer</button>
              </div>
            )}
            {introStep === 1 && (
              <div style={{ animation: "fadeIn 0.5s ease" }}>
                <p style={{ color: TEAL, fontWeight: 600, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>Før du scroller videre</p>
                <h2 style={{ fontSize: "clamp(22px,6vw,30px)", fontWeight: 700, color: INK, marginBottom: 14, lineHeight: 1.2 }}>Du er brukeren vår. Vi er nysgjerrige.</h2>
                <p style={{ fontSize: 15, color: WARM_GRAY, marginBottom: 28, lineHeight: 1.7 }}>Tre raske spørsmål hjelper oss vise det viktigste for deg først. Det tar under ett minutt.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button onClick={function() { setPhase("survey"); }} style={{ background: TEAL, color: "white", border: "none", padding: "13px 24px", borderRadius: 8, fontSize: 15, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, textAlign: "left" }}>Svar på tre spørsmål →</button>
                  <button onClick={function() { setPhase("main"); }} style={{ background: "none", color: TEAL, border: "2px solid "+TEAL, padding: "12px 24px", borderRadius: 8, fontSize: 15, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, textAlign: "left" }}>Gå rett til siden</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {phase === "survey" && (
        <div style={{ minHeight: "100vh", background: TEAL_BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: "'DM Sans', sans-serif" }}>
          <button onClick={function() { setPhase("main"); }} style={{ position: "fixed", top: 16, right: 16, background: "rgba(255,255,255,0.08)", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer", padding: "6px 12px", borderRadius: 20 }}>Hopp over</button>

          <div style={{ maxWidth: 480, width: "100%" }}>
            {/* Progress */}
            <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
              {survey.map(function(_, i) {
                return <div key={i} style={{ height: 3, borderRadius: 2, flex: 1, background: i < qIndex ? "rgba(255,255,255,0.6)" : i === qIndex ? "white" : "rgba(255,255,255,0.15)", transition: "background 0.3s" }} />;
              })}
            </div>

            <div key={qIndex} style={{ animation: "fadeIn 0.35s ease" }}>
              {/* Fase-label */}
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>{q.fase} · {qIndex+1}/{survey.length}</p>

              <h2 style={{ fontSize: "clamp(22px,6vw,30px)", color: "white", fontWeight: 700, marginBottom: 8, lineHeight: 1.25 }}>{q.sporsmal}</h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 24, lineHeight: 1.5 }}>{q.hint}</p>

              {q.type === "choice" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {q.valg.map(function(v) {
                    var isSelected = pendingChoice === v.id;
                    return (
                      <button key={v.id} onClick={function() { handleChoice(v.id); }}
                        style={{
                          background: isSelected ? "white" : "rgba(255,255,255,0.07)",
                          border: "1px solid " + (isSelected ? "white" : "rgba(255,255,255,0.15)"),
                          borderRadius: 10, padding: "14px 18px", fontSize: 15,
                          color: isSelected ? TEAL_BG : "rgba(255,255,255,0.8)",
                          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                          fontWeight: isSelected ? 700 : 400, textAlign: "left",
                          transition: "all 0.2s",
                        }}>
                        {v.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {q.type === "text" && (
                <textarea
                  value={currentText}
                  onChange={function(e) { setCurrentText(e.target.value); }}
                  onKeyDown={function(e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleNext(); } }}
                  placeholder="Skriv gjerne fritt..."
                  rows={3}
                  autoFocus
                  style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 10, padding: 16, color: "white", fontSize: 16, fontFamily: "'DM Sans', sans-serif", resize: "none", outline: "none", lineHeight: 1.6, display: "block" }}
                />
              )}

              <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
                <button onClick={handleNext} disabled={!canProceed}
                  style={{
                    background: canProceed ? "white" : "rgba(255,255,255,0.15)",
                    color: canProceed ? TEAL_BG : "rgba(255,255,255,0.3)",
                    border: "none", padding: "12px 24px", borderRadius: 8, fontSize: 15,
                    cursor: canProceed ? "pointer" : "default",
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                    transition: "all 0.2s",
                  }}>
                  {qIndex < survey.length - 1 ? "Neste →" : "Se siden →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === "transition" && (
        <div style={{ minHeight: "100vh", background: TEAL_BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
          <div style={{ maxWidth: 440 }}>
            {transitionStep >= 0 && <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, marginBottom: 14, animation: "fadeIn 0.6s ease" }}>Takk. Det var nyttig.</p>}
            {transitionStep >= 1 && <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontStyle: "italic", marginBottom: 20, animation: "fadeIn 0.6s ease" }}>*sorterer innholdet etter dine svar...*</p>}
            {transitionStep >= 2 && <p style={{ color: "white", fontSize: 18, fontWeight: 500, animation: "fadeIn 0.6s ease", lineHeight: 1.6 }}>Her er siden – satt opp for deg.</p>}
          </div>
        </div>
      )}

      {(phase === "main" || phase === "static") && (
        <MainContent answers={answers} isStatic={phase === "static"} />
      )}
    </div>
  );
}
