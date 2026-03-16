import { Metadata } from 'next'
import Link from 'next/link'
import ContactForm from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'KoivuChat — AI-chatbotti suomalaiselle yritykselle | Koivu Labs',
  description: 'KoivuChat oppii yrityksesi tiedoista ja vastaa asiakkaidesi kysymyksiin — ympäri vuorokauden. Käyttövalmis 48 tunnissa. EU-data, GDPR-valmis, täysin brändisi näköinen.',
  openGraph: {
    title: 'KoivuChat — AI-chatbotti suomalaiselle yritykselle',
    description: 'Oppii yrityksesi tiedoista. Käyttövalmis 48 tunnissa. EU-data.',
    url: 'https://koivulabs.com/koivuchat',
  },
}

const features = [
  {
    number: '01',
    title: 'Oppii yrityksestäsi',
    subtitle: 'Knowledge Base / RAG',
    description: 'Lataa PDF-tiedostoja tai anna verkkosivujesi osoite — KoivuChat lukee sisällön ja vastaa asiakkaidesi kysymyksiin juuri sinun tietojesi pohjalta. Ei arvailua, ei hallusinointia.',
    capabilities: [
      'PDF-tiedostojen lataus suoraan administa',
      'Verkkosivujen automaattinen luku',
      'EU-alueella sijaitseva vektoritietokanta',
      'Päivitettävissä milloin tahansa',
    ],
  },
  {
    number: '02',
    title: 'Brändisi näköinen',
    subtitle: 'Full Customization',
    description: 'Botti on täysin sinun — nimi, väri, avatar, avaustervehdys ja pikavalinnat. Asiakas ei erota sitä muusta sivustostasi. Live-esikatselu adminissa ennen julkaisua.',
    capabilities: [
      'Botin nimi ja avatar (emoji tai kuva)',
      'Brändiväri ja pikavalinnat',
      'Avaustervehdys ja ohjeistus',
      'Sijoitus vasemmalle tai oikealle',
    ],
  },
  {
    number: '03',
    title: 'Analytiikka & historia',
    subtitle: 'Insights Dashboard',
    description: 'Näet reaaliajassa mitä asiakkaasi kysyvät, mihin botti vastaa ja mihin ei. Tunnista puutteet tietopohjaassasi ja paranna botin osaamista jatkuvasti.',
    capabilities: [
      'Koko keskusteluhistoria per asiakas',
      'Viestimäärät ja kiintiöseuranta',
      'Virheelliset vastaukset korostettuna',
      'Kuukausittainen yhteenveto',
    ],
  },
  {
    number: '04',
    title: 'Helppo asentaa',
    subtitle: 'One-Line Embed',
    description: 'Yksi JavaScript-rivi sivustollesi — siinä kaikki. Toimii WordPressissä, Webflowssa, Next.js:ssä ja kaikessa muussa. Brändäysmuutokset päivittyvät automaattisesti ilman koodin uudelleenasennusta.',
    capabilities: [
      'Yksi koodi, copy-paste valmis',
      'Toimii kaikilla sivustoalustoilla',
      'Automaattinen brändäyspäivitys',
      'Mobiiliresponsiivinen, iOS-optimoitu',
    ],
  },
]

const steps = [
  {
    step: '1',
    title: 'Lisäämme sinut järjestelmään',
    description: 'Luomme sinulle oman bottiympäristön — Flowise-chatflow ja vektoritietokanta automaattisesti. Ei manuaalista konfiguraatiota.',
  },
  {
    step: '2',
    title: 'Syötät yrityksesi tiedot',
    description: 'Lataat PDF:t tai annat verkkosivujesi URL:it. Botti lukee sisällön ja on valmis vastaamaan. Tietopohja päivittyy milloin haluat.',
  },
  {
    step: '3',
    title: 'Liität botin sivullesi',
    description: 'Kopioit yhden koodirivin sivustollesi. Botti on heti käyttövalmis — brändäysmuutokset päivittyvät automaattisesti taustalla.',
  },
]

const plans = [
  {
    name: 'Startti',
    nameEn: 'Starter',
    price: '49',
    priceAnnual: '39',
    setup: '499',
    description: 'Täydellinen aloitukseen. Yksi botti, perusbrändäys, asiakaspalvelua 200 viestiin asti kuukaudessa.',
    features: [
      '200 viestiä / kk',
      '1 chatbotti',
      '3 tietolähdettä (URL tai PDF)',
      'Perusbrändäys (väri, nimi)',
      'Demo-linkki',
      'Email-tuki',
    ],
    cta: 'Aloita Starttilla',
    highlight: false,
  },
  {
    name: 'Kasvu',
    nameEn: 'Growth',
    price: '99',
    priceAnnual: '79',
    setup: '799',
    description: 'Kasvavalle yritykselle. Täysi brändäys, rajattomat tietolähteet ja oma OpenAI-avain.',
    features: [
      '1 500 viestiä / kk',
      '1 chatbotti',
      'Rajattomat tietolähteet',
      'Täysi brändäys (avatar, pikavalinnat)',
      'Analytiikka & historia',
      'Oma OpenAI API-avain',
      'Prioriteettituki',
    ],
    cta: 'Aloita Kasvulla',
    highlight: true,
  },
  {
    name: 'Pro',
    nameEn: 'Pro',
    price: '199',
    priceAnnual: '159',
    setup: '1 490',
    description: 'Useammalle botille tai isommalle volyymille. White-label, SLA ja 3 erillistä bottia.',
    features: [
      'Rajattomat viestit',
      '3 chatbottia',
      'Rajattomat tietolähteet',
      'White-label (ei KoivuLabs-brändäystä)',
      'Analytiikka & historia',
      'Omat OpenAI-avaimet',
      'SLA + dedikoitu tuki',
    ],
    cta: 'Aloita Prolla',
    highlight: false,
  },
]

export default function KoivuChatPage() {
  return (
    <main className="min-h-screen bg-slate-950 overflow-x-hidden">

      {/* Hero */}
      <section className="relative pt-40 pb-32 px-6 md:px-12 lg:px-24">
        {/* Decorative glows */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold tracking-[0.3em] uppercase mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            Koivu Labs — AI Product / KoivuChat
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-100 mb-6 italic leading-tight">
            <span className="text-teal-400">KoivuChat</span> —<br />
            botti joka tietää<br />
            yrityksestäsi kaiken.
          </h1>

          <p className="text-xl md:text-2xl text-slate-400 font-light leading-relaxed max-w-2xl mb-4">
            Asiakkaasi saavat vastaukset heti — yöllä, viikonloppuna, ruuhka-aikana.
            Botti oppii yrityksesi tiedoista ja on käyttövalmis 48 tunnissa.
          </p>
          <p className="text-sm text-slate-500 mb-10 tracking-wide">
            EU-data · GDPR-valmis · Suomenkielinen tuki
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="mailto:hello@koivulabs.com?subject=KoivuChat — haluan aloittaa"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all duration-200 hover:scale-105 shadow-lg shadow-teal-500/20"
            >
              Aloita nyt
              <span>→</span>
            </a>
            <a
              href="#hinnoittelu"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700 hover:border-teal-500/50 text-slate-300 hover:text-teal-400 font-medium text-sm transition-all duration-200"
            >
              Katso hinnat
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 md:px-12 lg:px-24 pb-24">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '48h', label: 'Käyttövalmis' },
            { value: 'EU', label: 'Data Euroopassa' },
            { value: '24/7', label: 'Vastaa aina' },
            { value: '100%', label: 'Brändisi näköinen' },
          ].map((stat) => (
            <div key={stat.label} className="tree-glass p-6 text-center">
              <div className="text-3xl font-black text-teal-400 mb-1">{stat.value}</div>
              <div className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-12 lg:px-24 pb-32">
        <div className="max-w-5xl mx-auto">
          <header className="mb-16">
            <div className="inline-block px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold tracking-[0.3em] uppercase mb-6">
              Mitä saat / What You Get
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-100 italic">
              Kaikki mitä tarvitset,<br />
              <span className="text-teal-400">ei mitään turhaa.</span>
            </h2>
          </header>

          <div className="space-y-6">
            {features.map((feature) => (
              <section
                key={feature.number}
                className="tree-glass p-8 md:p-12 group hover:border-teal-500/30 transition-all duration-500"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                  <div>
                    <div className="flex items-baseline gap-4 mb-4">
                      <span className="text-teal-400/30 font-black text-4xl">{feature.number}</span>
                      <div>
                        <h3 className="text-2xl font-bold italic text-slate-100 group-hover:text-teal-400 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-[10px] text-teal-400/60 font-bold tracking-[0.3em] uppercase mt-1">
                          {feature.subtitle}
                        </p>
                      </div>
                    </div>
                    <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-4">Sisältää</h4>
                    <ul className="space-y-3">
                      {feature.capabilities.map((cap) => (
                        <li key={cap} className="flex items-center gap-3 text-slate-300 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500/50 shrink-0" />
                          {cap}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 md:px-12 lg:px-24 pb-32">
        <div className="max-w-5xl mx-auto">
          <header className="mb-16">
            <div className="inline-block px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold tracking-[0.3em] uppercase mb-6">
              Prosessi / How It Works
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-100 italic">
              Kolme askelta<br />
              <span className="text-teal-400">valmiiseen bottiin.</span>
            </h2>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step) => (
              <div key={step.step} className="tree-glass p-8 group hover:border-teal-500/30 transition-all duration-500">
                <div className="text-5xl font-black text-teal-400/20 mb-4 group-hover:text-teal-400/40 transition-colors">
                  {step.step}
                </div>
                <h3 className="text-lg font-bold italic text-slate-100 mb-3">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="hinnoittelu" className="px-6 md:px-12 lg:px-24 pb-32">
        <div className="max-w-5xl mx-auto">
          <header className="mb-16">
            <div className="inline-block px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold tracking-[0.3em] uppercase mb-6">
              Hinnoittelu / Pricing
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-100 italic mb-4">
              Selkeä hinta,<br />
              <span className="text-teal-400">ei yllätyksiä.</span>
            </h2>
            <p className="text-slate-400 max-w-xl">
              Kaikki hinnat sisältävät setup-maksun (kertaluonteinen) ja kuukausimaksun.
              Vuosimaksulla säästät kaksi kuukautta. Hinnat ALV 0%.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`tree-glass p-8 flex flex-col transition-all duration-500 ${
                  plan.highlight
                    ? 'border-teal-500/40 nordic-glow'
                    : 'hover:border-teal-500/20'
                }`}
              >
                {plan.highlight && (
                  <div className="inline-block px-2 py-0.5 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-400 text-[9px] font-bold tracking-[0.2em] uppercase mb-4 self-start">
                    Suosituin
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold italic text-slate-100 mb-0.5">{plan.name}</h3>
                  <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase">{plan.nameEn}</p>
                </div>

                <div className="mb-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-teal-400">{plan.price}€</span>
                    <span className="text-slate-500 text-sm">/kk</span>
                  </div>
                  <p className="text-slate-600 text-xs mt-0.5">tai {plan.priceAnnual}€/kk vuosimaksulla</p>
                </div>

                <div className="mb-6 pb-6 border-b border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase">Setup-maksu: </span>
                  <span className="text-sm text-slate-300 font-semibold">{plan.setup}€</span>
                  <span className="text-xs text-slate-600"> kertaluonteinen</span>
                </div>

                <p className="text-slate-400 text-sm leading-relaxed mb-6">{plan.description}</p>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-slate-300 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500/50 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <a
                  href={`mailto:hello@koivulabs.com?subject=KoivuChat ${plan.name} — haluan aloittaa`}
                  className={`w-full text-center py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                    plan.highlight
                      ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 hover:scale-105 shadow-lg shadow-teal-500/20'
                      : 'border border-slate-700 hover:border-teal-500/50 text-slate-300 hover:text-teal-400'
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>

          {/* Sivu + Botti -paketti */}
          <div className="tree-glass p-8 md:p-10 border-teal-500/20 nordic-glow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
                  Bundle / Pakettitarjous
                </div>
                <h3 className="text-2xl md:text-3xl font-bold italic text-slate-100 mb-3">
                  Kotisivu + <span className="text-teal-400">KoivuChat</span>
                </h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  Ei verkkosivustoa? Ei hätää. Rakennamme yksisivuisen modernin kotisivun
                  ja asennamme KoivuChatin valmiiksi. Botti oppii sivun sisällöstä automaattisesti.
                  Kaksi asiaa, yksi kauppa.
                </p>
              </div>
              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-black text-teal-400">990€</span>
                  <span className="text-slate-500 text-sm">setup</span>
                </div>
                <p className="text-slate-500 text-sm mb-6">+ 49€/kk ylläpito (KoivuChat Startti)</p>
                <ul className="space-y-2 mb-6">
                  {[
                    'Yksisivuinen kotisivu (Next.js tai Webflow)',
                    'KoivuChat asennettuna valmiiksi',
                    'Botti oppii sivun sisällöstä',
                    'Mobiiliresponsiivinen',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-slate-300 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500/50 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:hello@koivulabs.com?subject=Kotisivu + KoivuChat -paketti"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all duration-200 hover:scale-105"
                >
                  Kysy lisää →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 md:px-12 lg:px-24 pb-32">
        <div className="max-w-5xl mx-auto">
          <header className="mb-12">
            <div className="inline-block px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold tracking-[0.3em] uppercase mb-6">
              UKK / FAQ
            </div>
            <h2 className="text-3xl font-bold italic text-slate-100">Usein kysyttyä.</h2>
          </header>

          <div className="space-y-4">
            {[
              {
                q: 'Miten botti saa tietoa yrityksestäni?',
                a: 'Lataat PDF-tiedostoja tai annat verkkosivujesi URL:it. KoivuChat lukee sisällön ja tallentaa sen EU-alueen vektoritietokantaan. Botti vastaa vain tähän tietoon pohjautuen — ei keksi eikä arvaile.',
              },
              {
                q: 'Missä data sijaitsee?',
                a: 'Kaikki data sijaitsee EU-alueella (Google Cloud europe-west3). GDPR-vaatimukset täyttyvät automaattisesti.',
              },
              {
                q: 'Toimiiko botti suomeksi?',
                a: 'Kyllä. KoivuChat on optimoitu suomenkieliseen asiakaspalveluun, mutta vastaa myös muilla kielillä jos asiakas kirjoittaa niin.',
              },
              {
                q: 'Mitä jos viestikiintiö täyttyy?',
                a: 'Botti ilmoittaa asiakkaalle kohteliaasti kiintiön ylittymisestä ja ohjaa ottamaan yhteyttä suoraan. Kiintiötä voi korottaa tai päivittää pakettia milloin tahansa.',
              },
              {
                q: 'Voiko botin asentaa WordPressiin tai Webflowhin?',
                a: 'Kyllä. Embed-koodi on yksi JavaScript-rivi joka toimii kaikilla sivustoalustoilla — WordPress, Webflow, Next.js, pelkkä HTML.',
              },
            ].map((faq) => (
              <div key={faq.q} className="tree-glass p-6 hover:border-teal-500/20 transition-all duration-300">
                <h3 className="text-slate-100 font-semibold mb-2 text-sm">{faq.q}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Contact */}
      <section className="px-6 md:px-12 lg:px-24 pb-32">
        <div className="max-w-5xl mx-auto">
          <div className="tree-glass p-8 md:p-12 border-teal-500/20 nordic-glow">
            <div className="mb-10">
              <div className="inline-block px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
                Aloita / Get Started
              </div>
              <h2 className="text-3xl md:text-4xl font-bold italic text-slate-100 mb-3">
                Valmis kokeilemaan?
              </h2>
              <p className="text-slate-400 max-w-lg">
                Lähetä viesti — kerrotaan miten KoivuChat sopii juuri sinun yrityksellesi.
                Vastauksesi tulee saman päivän aikana.
              </p>
            </div>
            <ContactForm />
          </div>

          <div className="mt-12 text-center">
            <Link href="/" className="text-slate-600 hover:text-teal-400 text-[10px] tracking-widest uppercase transition-colors">
              ← Takaisin / Return to Hub
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
