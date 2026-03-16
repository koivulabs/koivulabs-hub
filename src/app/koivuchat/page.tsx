import { Metadata } from 'next'
import Link from 'next/link'
import ContactForm from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'KoivuChat — AI-chatbotti suomalaiselle yritykselle | Koivu Labs',
  description: 'KoivuChat oppii yrityksesi tiedoista ja vastaa asiakkaidesi kysymyksiin — ympäri vuorokauden. Käyttövalmis 48 tunnissa. EU-data, GDPR-valmis, täysin brändisi näköinen.',
  keywords: [
    'AI chatbotti', 'chatbot suomi', 'AI asiakaspalvelu', 'tekoäly asiakaspalvelu',
    'chatbotti yritykselle', 'AI botti suomeksi', 'automaattinen asiakaspalvelu',
    'KoivuChat', 'Koivu Labs', 'RAG chatbot', 'verkkosivuchatbot',
  ],
  openGraph: {
    title: 'KoivuChat — AI-chatbotti suomalaiselle yritykselle',
    description: 'Oppii yrityksesi tiedoista. Käyttövalmis 48 tunnissa. EU-data, GDPR-valmis.',
    url: 'https://koivulabs.com/koivuchat',
    type: 'website',
    siteName: 'Koivu Labs',
    images: [
      {
        url: 'https://koivulabs.com/images/birch_tech_tree.png',
        width: 1200,
        height: 630,
        alt: 'KoivuChat — AI-chatbotti suomalaiselle yritykselle',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KoivuChat — AI-chatbotti suomalaiselle yritykselle',
    description: 'Oppii yrityksesi tiedoista. Käyttövalmis 48 tunnissa. EU-data.',
    images: ['https://koivulabs.com/images/birch_tech_tree.png'],
  },
  alternates: {
    canonical: 'https://koivulabs.com/koivuchat',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'KoivuChat',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://koivulabs.com/koivuchat',
  description: 'AI-chatbotti suomalaiselle yritykselle. Oppii yrityksesi tiedoista ja vastaa asiakkaidesi kysymyksiin ympäri vuorokauden. EU-data, GDPR-valmis.',
  offers: [
    {
      '@type': 'Offer',
      name: 'Startti',
      price: '49',
      priceCurrency: 'EUR',
      priceSpecification: {
        '@type': 'RecurringChargeSpecification',
        billingDuration: 'P1M',
        price: '49',
        priceCurrency: 'EUR',
      },
    },
    {
      '@type': 'Offer',
      name: 'Kasvu',
      price: '99',
      priceCurrency: 'EUR',
      priceSpecification: {
        '@type': 'RecurringChargeSpecification',
        billingDuration: 'P1M',
        price: '99',
        priceCurrency: 'EUR',
      },
    },
    {
      '@type': 'Offer',
      name: 'Pro',
      price: '199',
      priceCurrency: 'EUR',
      priceSpecification: {
        '@type': 'RecurringChargeSpecification',
        billingDuration: 'P1M',
        price: '199',
        priceCurrency: 'EUR',
      },
    },
  ],
  provider: {
    '@type': 'Organization',
    name: 'Koivu Labs',
    url: 'https://koivulabs.com',
    email: 'hello@koivulabs.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Saarijärvi',
      addressCountry: 'FI',
    },
  },
  inLanguage: 'fi',
  featureList: [
    'RAG-pohjainen tietohaku',
    'PDF-lataus ja verkkosivujen crawl',
    'Täysi brändäys',
    'Liidinkeräys',
    'Analytiikka ja keskusteluhistoria',
    'JavaScript embed kaikille alustoille',
    'EU-data ja GDPR-yhteensopivuus',
  ],
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

interface Plan {
  name: string; nameEn: string; price: string; priceAnnual: string
  setup: string; description: string; features: string[]; note: string; cta: string; highlight: boolean
}

const plans: Plan[] = [
  {
    name: 'Startti',
    nameEn: 'Starter',
    price: '49',
    priceAnnual: '39',
    setup: '499',
    description: 'Täydellinen aloitukseen. Sopii yritykselle jolla on kohtuullinen kävijämäärä — esim. ravintola, kampaamo tai paikallinen palveluyritys.',
    features: [
      '200 asiakasviestiä / kk',
      '→ noin 6–7 keskustelua päivässä',
      '1 chatbotti',
      '3 tietolähdettä (URL tai PDF)',
      'Perusbrändäys (väri, nimi)',
      'Demo-linkki',
      'Email-tuki',
    ],
    note: 'Kiintiön täytyttyä botti ohjaa asiakkaan ottamaan yhteyttä suoraan. Kiintiötä voi korottaa tai päivittää pakettia milloin tahansa.',
    cta: 'Aloita Starttilla',
    highlight: false,
  },
  {
    name: 'Kasvu',
    nameEn: 'Growth',
    price: '99',
    priceAnnual: '79',
    setup: '799',
    description: 'Aktiiviselle yritykselle. Sopii verkkokaupalle, kiinteistönvälittäjälle tai yritykselle jolla on jatkuva asiakasvirta.',
    features: [
      '1 000 asiakasviestiä / kk',
      '→ noin 33 keskustelua päivässä',
      '1 chatbotti',
      'Rajattomat tietolähteet',
      'Täysi brändäys (avatar, pikavalinnat)',
      'Liidinkeräys & yhteydenottolomake',
      'Analytiikka & historia',
      'Prioriteettituki',
    ],
    note: 'Kiintiön täyttyessä botti ohjaa asiakkaan ottamaan yhteyttä suoraan — asiakaskokemus ei katkea äkisti.',
    cta: 'Aloita Kasvulla',
    highlight: true,
  },
  {
    name: 'Pro',
    nameEn: 'Pro',
    price: '199',
    priceAnnual: '159',
    setup: '1 490',
    description: 'Useammalle botille tai suurelle volyymille. Ketju, franchise tai useampi toimipiste yhdessä paketissa.',
    features: [
      '5 000 asiakasviestiä / kk',
      '→ noin 165 keskustelua päivässä',
      '3 chatbottia',
      'Rajattomat tietolähteet',
      'White-label (ei KoivuLabs-brändäystä)',
      'Liidinkeräys & yhteydenottolomake',
      'Analytiikka & historia',
      'SLA + dedikoitu tuki',
    ],
    note: 'Jokaisella botilla on oma tietopohja, brändäys ja analytiikka — hallinta yhdestä paikasta.',
    cta: 'Aloita Prolla',
    highlight: false,
  },
]

export default function KoivuChatPage() {
  return (
    <main className="min-h-screen bg-slate-950 overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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

      {/* ROI / Arvolupaus */}
      <section className="px-6 md:px-12 lg:px-24 pb-32">
        <div className="max-w-5xl mx-auto">
          <header className="mb-12">
            <div className="inline-block px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold tracking-[0.3em] uppercase mb-6">
              Miksi KoivuChat / The Case
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-100 italic">
              Yksi botti,<br />
              <span className="text-teal-400">kolme roolia.</span>
            </h2>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                role: 'Asiakaspalvelija',
                icon: '💬',
                description: 'Vastaa samoihin kysymyksiin tuhat kertaa ilman väsymistä. Aukioloajat, hinnat, palvelut, ohjeet — heti, oikein, aina.',
                note: 'Osa-aikainen asiakaspalvelija: ~1 800€/kk\nKoivuChat Kasvu: 99€/kk',
              },
              {
                role: 'Liidien kerääjä',
                icon: '🎯',
                description: 'Kävijä saapuu sivulle klo 23. Kukaan ei vastaa — ja liidi menetetään. KoivuChat pitää kiinnostuneen mukana ja ohjaa ottamaan yhteyttä.',
                note: 'Yksikin ylimääräinen asiakas kuussa kattaa kuukausimaksun.',
              },
              {
                role: 'Tietopankki',
                icon: '📚',
                description: 'Henkilöstö kysyy toistuvasti samoja asioita? Botti voi toimia myös sisäisenä tietopankkina — tuotekortit, prosessit, ohjeet.',
                note: 'Sama botti, eri tietopohja. Kaksi käyttöä yhdellä hinnalla.',
              },
            ].map((item) => (
              <div key={item.role} className="tree-glass p-8 group hover:border-teal-500/30 transition-all duration-500 flex flex-col">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold italic text-slate-100 mb-3 group-hover:text-teal-400 transition-colors">{item.role}</h3>
                <p className="text-slate-400 text-sm leading-relaxed flex-1 mb-4">{item.description}</p>
                <p className="text-[11px] text-teal-400/60 leading-relaxed border-t border-slate-800 pt-4 whitespace-pre-line">{item.note}</p>
              </div>
            ))}
          </div>

          {/* Kustannusvertailu */}
          <div className="tree-glass p-8 md:p-10 border-teal-500/20">
            <h3 className="text-[10px] text-slate-500 font-bold tracking-[0.3em] uppercase mb-6">Kustannusvertailu / Cost Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-3">
                {[
                  { label: 'Osa-aikainen asiakaspalvelija', value: '~1 800€ / kk', muted: false },
                  { label: 'Palkka + sivukulut + lomarahat', value: '~22 000€ / vuosi', muted: false },
                  { label: 'Sairauspäivät, vaihtuvuus, perehdytys', value: 'Ei arvioitavissa', muted: true },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className={`text-sm ${row.muted ? 'text-slate-600' : 'text-slate-400'}`}>{row.label}</span>
                    <span className={`text-sm font-semibold ${row.muted ? 'text-slate-600' : 'text-red-400/70'}`}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {[
                  { label: 'KoivuChat Kasvu', value: '99€ / kk', highlight: true },
                  { label: 'Setup-maksu (kertaluonteinen)', value: '799€', highlight: false },
                  { label: 'Vastaa 1 500 kysymykseen / kk', value: 'Väsymättä, 24/7', highlight: true },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-sm text-slate-400">{row.label}</span>
                    <span className={`text-sm font-semibold ${row.highlight ? 'text-teal-400' : 'text-slate-300'}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-6">
              * KoivuChat ei korvaa ihmistä kaikessa — mutta se hoitaa toistuvat kysymykset, jotta ihminen voi keskittyä siihen mikä oikeasti vaatii ihmistä.
            </p>
          </div>
        </div>
      </section>

      {/* Knowledge Base kasvu */}
      <section className="px-6 md:px-12 lg:px-24 pb-32">
        <div className="max-w-5xl mx-auto">
          <div className="tree-glass p-8 md:p-12 border-teal-500/20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold tracking-[0.3em] uppercase mb-6">
                  Orgaaninen kasvu / Living Knowledge Base
                </div>
                <h2 className="text-3xl md:text-4xl font-bold italic text-slate-100 mb-4">
                  Paras botti ei ole<br />
                  <span className="text-teal-400">valmis — se kehittyy.</span>
                </h2>
                <p className="text-slate-400 leading-relaxed mb-4">
                  Useimmat yrittäjät epäilevät: <em className="text-slate-300">"Ei botti tiedä meidän asioista mitään."</em> Oikeasti asia menee toisin.
                </p>
                <p className="text-slate-400 leading-relaxed">
                  Botti aloittaa sillä mitä sille syötetään. Mutta paras tapahtuu sen jälkeen: näet suoraan adminpaneelista mitä asiakkaat oikeasti kysyvät. Puuttuuko tieto hinnoittelusta? Lisäät sen. Kysytäänkö toimitusajasta? Lisäät sen. Kahden kuukauden päästä sinulla on tarkempi botti kuin kilpailijalla, joka osti valmiiksi pakatun ratkaisun.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  { step: '01', text: 'Asiakas kysyy jotain mitä botti ei osaa', sub: 'Näet sen keskusteluhistoriasta' },
                  { step: '02', text: 'Lisäät tiedon tietopohjaan', sub: 'URL, PDF tai manuaalinen kirjaus' },
                  { step: '03', text: 'Botti osaa vastata seuraavalle', sub: 'Ilman manuaalista ohjelmointia' },
                  { step: '04', text: 'Tietopohja kasvaa orgaanisesti', sub: 'Puolen vuoden päästä botti on eri luokkaa' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <span className="text-teal-400/30 font-black text-2xl leading-none mt-0.5">{item.step}</span>
                    <div>
                      <p className="text-slate-200 text-sm font-medium">{item.text}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
            <p className="text-slate-500 text-sm max-w-xl mt-3">
              Sopimukset tehdään vuodeksi kerrallaan. Pakettia voi päivittää ylöspäin milloin tahansa — sopimuskauden päättyessä räätälöimme uuden sopimuksen tarpeidesi mukaan.
              Otamme mielellään myös referenssiasiakkaita — <a href="mailto:hello@koivulabs.com?subject=Referenssiasiakas" className="text-teal-400/70 hover:text-teal-400 transition-colors">kysy erikoisehdoista</a>.
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

                {plan.note && (
                  <p className="text-[11px] text-slate-600 leading-relaxed mb-4 border-t border-slate-800 pt-4">
                    {plan.note}
                  </p>
                )}

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

      {/* Tulossa */}
      <section className="px-6 md:px-12 lg:px-24 pb-32">
        <div className="max-w-5xl mx-auto">
          <header className="mb-12">
            <div className="inline-block px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-bold tracking-[0.3em] uppercase mb-6">
              Roadmap / Tulossa
            </div>
            <h2 className="text-3xl md:text-4xl font-bold italic text-slate-100 mb-3">
              Kehitämme jatkuvasti.
            </h2>
            <p className="text-slate-500 max-w-xl text-sm">
              KoivuChat on aktiivisessa kehityksessä. Nämä ominaisuudet ovat tulossa lähikuukausina — kaikki nykyiset asiakkaat saavat ne automaattisesti käyttöön.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'Liidinkeräys',
                description: 'Botti pyytää yhteystiedot kiinnostuneelta kävijältä — suoraan chat-ikkunassa, juuri oikeaan aikaan. Liidit tallentuvat automaattisesti ja saat sähköposti-ilmoituksen välittömästi.',
                status: 'Valmis',
              },
              {
                title: 'Asiakasportaali',
                description: 'Oma kirjautuminen asiakkaalle. Hallitse tietopohjaa, brändäystä ja tilastoja itse — ilman KoivuLabs-kontaktia.',
                status: 'Suunnitteilla',
              },
              {
                title: 'Kuukausiraportti',
                description: 'Automaattinen yhteenveto: mitä kysyttiin, mihin vastattiin, mihin ei. Tunnista mitä tietoa tietopohjaasi vielä puuttuu.',
                status: 'Suunnitteilla',
              },
              {
                title: 'Sivukartta-crawl',
                description: 'Anna vain verkkosivustosi osoite — KoivuChat indeksoi kaikki sivut automaattisesti sitemap.xml:n kautta. Ei enää URL kerrallaan.',
                status: 'Valmis',
              },
            ].map((item) => (
              <div key={item.title} className="tree-glass p-6 flex gap-4 items-start opacity-80 hover:opacity-100 transition-opacity">
                <div className="mt-0.5">
                  <span className={`text-[9px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 rounded-full border ${
                    item.status === 'Kehityksessä' || item.status === 'Valmis'
                      ? 'text-teal-400/70 border-teal-500/20 bg-teal-500/5'
                      : 'text-slate-500 border-slate-700 bg-slate-800/50'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-slate-200 font-semibold text-sm mb-1">{item.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
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
                q: 'Mitä yksi "viesti" tarkoittaa?',
                a: 'Yksi viesti = yksi asiakkaan lähettämä kysymys botille. Botin vastaus ei kuluta kiintiötä. Esimerkki: asiakas kirjoittaa "Milloin olette auki?" — se on yksi viesti. Pitkäkin keskustelu kuluttaa vain sen verran viestejä kuin asiakas on kirjoittanut. Kiintiön täytyttyä botti ilmoittaa kohteliaasti ja ohjaa ottamaan yhteyttä suoraan — asiakaskokemus ei katkea äkisti.',
              },
              {
                q: 'Miten paljon 200 tai 1 000 viestiä käytännössä on?',
                a: '200 viestiä / kk tarkoittaa noin 6–7 asiakaskysymystä päivässä — riittää hyvin pienelle yritykselle, jonka sivustolla käy muutamia kävijöitä päivittäin. 1 000 viestiä / kk on noin 33 päivässä — sopii aktiiviselle verkkokaupalle tai palveluyritykselle. Tarvitsetko enemmän? Räätälöimme kiintiön tarpeidesi mukaan.',
              },
              {
                q: 'Kuinka pitkä sopimus tehdään?',
                a: 'Sopimukset tehdään vuodeksi kerrallaan. Pakettia voi päivittää ylöspäin milloin tahansa — sopimuskauden päättyessä katsotaan yhdessä mikä sopii jatkoon parhaiten. Otamme myös referenssiasiakkaita erityisehdoin — kysy lisää.',
              },
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
