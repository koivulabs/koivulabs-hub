'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { leadService, Lead } from '@/lib/leadService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    Zap, 
    Smartphone, 
    FileText, 
    TrendingDown, 
    CheckCircle, 
    AlertTriangle, 
    Download, 
    Copy, 
    RotateCcw, 
    Play, 
    Sparkles, 
    Building2,
    DollarSign,
    ArrowRight,
    MessageSquareCode,
    Phone,
    Share2
} from 'lucide-react';

export default function AuditStudioPage() {
    const [authChecked, setAuthChecked] = useState(false);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [cityInput, setCityInput] = useState('Helsinki');
    const [nicheInput, setNicheInput] = useState('catering');
    const [searching, setSearching] = useState(false);
    const [auditingId, setAuditingId] = useState<string | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'audit' | 'pitch'>('audit');

    // Lost Euros Calculator Tweaks
    const [trafficTweak, setTrafficTweak] = useState(1500);
    const [bookingTweak, setBookingTweak] = useState(150);

    const router = useRouter();

    // 1. Auth Guard Checks
    useEffect(() => {
        let isMounted = true;
        const checkSession = async () => {
            try {
                const res = await fetch('/api/auth/session');
                if (res.ok) {
                    const data = await res.json();
                    if (data.ok) {
                        if (isMounted) setAuthChecked(true);
                        return;
                    }
                }
            } catch (err) {
                console.error("Session verification failed:", err);
            }
            if (isMounted) {
                router.push('/admin/login');
            }
        };
        checkSession();
        return () => {
            isMounted = false;
        };
    }, [router]);


    // 2. Fetch Leads on Load
    const loadLeads = useCallback(async () => {
        try {
            const data = await leadService.getAllLeads();
            setLeads(data);
            if (data.length > 0 && !selectedLead) {
                setSelectedLead(data[0]);
                if (data[0].auditData) {
                    setTrafficTweak(1500);
                    setBookingTweak(data[0].niche === 'catering' ? 250 : 80);
                }
            }
        } catch (error) {
            console.error("Failed to load leads from Firestore:", error);
        }
    }, [selectedLead]);

    useEffect(() => {
        if (authChecked) {
            loadLeads();
        }
    }, [authChecked, loadLeads]);

    // Update slider defaults when lead selection changes
    useEffect(() => {
        if (selectedLead) {
            setTrafficTweak(1500);
            setBookingTweak(selectedLead.niche === 'catering' ? 250 : 80);
        }
    }, [selectedLead]);

    // 3. Google Maps Search Trigger
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cityInput || !nicheInput) return;
        setSearching(true);
        try {
            const res = await fetch('/api/admin/audit-studio/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ city: cityInput, niche: nicheInput })
            });

            if (res.ok) {
                const data = await res.json();
                
                // Save discovered leads to Firestore
                for (const lead of data.leads) {
                    await leadService.saveLead(lead);
                }
                
                await loadLeads();
                if (data.leads.length > 0) {
                    setSelectedLead(data.leads[0]);
                }
            }
        } catch (error) {
            console.error("Discovery search failed:", error);
        } finally {
            setSearching(false);
        }
    };

    // 4. Run Crawler + PSI Technical Audit
    const handleAudit = async (lead: Lead) => {
        setAuditingId(lead.id);
        try {
            const res = await fetch('/api/admin/audit-studio/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    leadId: lead.id,
                    name: lead.name,
                    website: lead.website,
                    city: lead.city,
                    niche: lead.niche,
                    phone: lead.phone,
                    address: lead.address
                })
            });

            if (res.ok) {
                const data = await res.json();
                // Update state
                setLeads(prev => prev.map(l => l.id === lead.id ? data.lead : l));
                setSelectedLead(data.lead);
            }
        } catch (error) {
            console.error("Technical audit failed:", error);
        } finally {
            setAuditingId(null);
        }
    };

    // 5. Update Status (e.g. mark pitch sent)
    const handleUpdateStatus = async (leadId: string, newStatus: Lead['status']) => {
        setUpdatingStatus(leadId);
        try {
            await leadService.updateLead(leadId, { status: newStatus });
            setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
            if (selectedLead?.id === leadId) {
                setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
            }
        } catch (error) {
            console.error("Status update failed:", error);
        } finally {
            setUpdatingStatus(null);
        }
    };

    // 6. Delete Lead
    const handleDeleteLead = async (leadId: string) => {
        if (!confirm('Haluatko varmasti poistaa tämän liidin tietokannasta?')) return;
        try {
            await leadService.deleteLead(leadId);
            setLeads(prev => prev.filter(l => l.id !== leadId));
            if (selectedLead?.id === leadId) {
                setSelectedLead(null);
            }
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    // Calculate dynamically tweaked lost revenue
    const getTweakedLostRevenue = () => {
        if (!selectedLead || !selectedLead.auditData) return 0;
        
        const data = selectedLead.auditData;
        let dropoffFactor = 0;
        if (!data.mobileResponsive) dropoffFactor += 0.15;
        if (data.pdfMenusDetected) dropoffFactor += 0.12;
        if (data.pageSpeedScore < 50) dropoffFactor += 0.18;
        else if (data.pageSpeedScore < 80) dropoffFactor += 0.08;
        if (!data.hasChatbot) dropoffFactor += 0.10;
        if (!data.seoMetaDescPresent) dropoffFactor += 0.05;
        if (!data.hasH1Heading) dropoffFactor += 0.04;
        if (!data.openGraphTagsPresent) dropoffFactor += 0.03;
        if (!data.hasTelOrMailtoLinks) dropoffFactor += 0.05;
        if (!data.hasSitemap) dropoffFactor += 0.04;
        if (!data.hasSchemaOrg) dropoffFactor += 0.05;
        if (!data.hasGoogleMapsEmbed) dropoffFactor += 0.04;

        const actualDropoff = Math.max(0.10, Math.min(0.55, dropoffFactor));
        return Math.round(trafficTweak * actualDropoff * bookingTweak * 0.20);
    };

    const getAuditScore = (lead: Lead) => {
        if (!lead.auditData) return { passed: 0, total: 12 };
        const data = lead.auditData;
        let score = 0;
        if (data.pageSpeedScore >= 70) score += 1;
        if (data.mobileResponsive) score += 1;
        if (data.hasChatbot) score += 1;
        if (data.seoTitlePresent) score += 1;
        if (data.seoMetaDescPresent) score += 1;
        if (data.hasH1Heading) score += 1;
        if (data.detectedTechStack !== 'WordPress' && data.detectedTechStack !== 'Wix' && data.detectedTechStack !== 'Squarespace') score += 1;
        if (data.hasContactForm) score += 1;
        if (data.hasTelOrMailtoLinks) score += 1;
        if (data.hasSitemap) score += 1;
        if (data.hasSchemaOrg) score += 1;
        if (data.hasGoogleMapsEmbed) score += 1;
        return { passed: score, total: 12 };
    };

    const getAuditItems = (lead: Lead) => {
        if (!lead.auditData) return [];
        const data = lead.auditData;
        return [
            {
                key: 'speed',
                name: 'Mobiilin latausnopeus (PageSpeed)',
                passed: data.pageSpeedScore >= 70,
                icon: Zap,
                desc: `Nykyiset suorituskykypisteet ovat ${data.pageSpeedScore}/100. LCP latausaika on ${data.lcpSeconds}s.`
            },
            {
                key: 'responsive',
                name: 'Mobiiliresponsiivisuus',
                passed: data.mobileResponsive,
                icon: Smartphone,
                desc: data.mobileResponsive 
                    ? 'Sivusto skaalautuu oikein ja siinä on määritelty mobiili viewport.' 
                    : 'Viewport-määrittelyt puuttuvat tai ovat virheelliset. Sivusto on vaikeakäyttöinen puhelimella.'
            },
            {
                key: 'chatbot',
                name: 'Myyntiautomaatio: Chat & FAQ',
                passed: data.hasChatbot,
                icon: MessageSquareCode,
                desc: data.hasChatbot 
                    ? `Sivustolla on live-chatbot / FAQ-automaatio (${data.chatbotType || 'Havaittu'}).` 
                    : 'Sivustolta puuttuu reaaliaikainen chatbot vastaamassa kyselyihin iltaisin ja viikonloppuisin.'
            },
            {
                key: 'seoTitle',
                name: 'Hakukonelöydettävyys: Meta Title',
                passed: data.seoTitlePresent,
                icon: Search,
                desc: data.seoTitlePresent 
                    ? 'Otsikkotunniste löytyi. Google osaa näyttää sivun nimen oikein.' 
                    : 'Sivustolta puuttuu <title>-tagi, mikä heikentää dramaattisesti Google-näkyvyyttä.'
            },
            {
                key: 'seoDesc',
                name: 'Hakukoneseloste: Meta Description',
                passed: data.seoMetaDescPresent,
                icon: Search,
                desc: data.seoMetaDescPresent 
                    ? 'Meta-kuvaus määritelty. Hakutulosten esittelyteksti kunnossa.' 
                    : 'Sivustolta puuttuu meta-kuvausteksti. Google joutuu arpomaan hakutulostekstin.'
            },
            {
                key: 'h1',
                name: 'Semanttinen H1-pääotsikko',
                passed: data.hasH1Heading,
                icon: Sparkles,
                desc: data.hasH1Heading 
                    ? 'H1-otsikko löytyi. Hakukone ymmärtää sivun pääsisällön aiheen.' 
                    : 'Sivulta puuttuu H1-pääotsikko, mikä sekoittaa hakukoneiden indeksointia.'
            },
            {
                key: 'sitemap',
                name: 'XML-sivukartta (Sitemap.xml)',
                passed: data.hasSitemap,
                icon: FileText,
                desc: data.hasSitemap 
                    ? 'Sivukarttaviitteet löytyivät sivustolta. Google-botit löytävät uudet sivut heti.' 
                    : 'Sivustolta puuttuu XML-sivukartta. Hakukoneen indeksointi voi viivästyä merkittävästi.'
            },
            {
                key: 'schema',
                name: 'AI & LLM-tekoälyvalmius (Schema)',
                passed: data.hasSchemaOrg,
                icon: Sparkles,
                desc: data.hasSchemaOrg 
                    ? 'JSON-LD Schema -tietorakenne havaittu. ChatGPT ja Gemini osaavat suositella kohdetta.' 
                    : 'JSON-LD skeema puuttuu. Yritys on näkymätön moderneille tekoälyhakukoneille.'
            },
            {
                key: 'maps',
                name: 'Google Maps & Paikallinen SEO (GEO)',
                passed: data.hasGoogleMapsEmbed,
                icon: Building2,
                desc: data.hasGoogleMapsEmbed 
                    ? 'Google Maps -paikkalinkitys upotettu sivulle. Nostaa sijoitusta Maps-hauissa.' 
                    : 'Sivustolta puuttuu Google Maps -integraatio, mikä heikentää sijoitusta karttahauissa.'
            },
            {
                key: 'contactLinks',
                name: 'Mobiiliystävälliset pikayhteyslinkit',
                passed: data.hasTelOrMailtoLinks,
                icon: Phone,
                desc: data.hasTelOrMailtoLinks 
                    ? 'Suorat mobiilisopeutuvat pikalinkit (puhelu / sähköposti) löytyivät sivulta.' 
                    : 'Käyttäjien on vaikea soittaa tai mailata: suorat tel: ja mailto: linkit puuttuvat.'
            },
            {
                key: 'contactForm',
                name: 'Asiakasyhteydenottolomake',
                passed: data.hasContactForm,
                icon: FileText,
                desc: data.hasContactForm 
                    ? 'Yhteydenottoon soveltuva lomakerakenne havaittu sivustolla.' 
                    : 'Sivustolta ei löytynyt lomaketta nopeaa tarjouspyyntöä tai yhteydenottoa varten.'
            },
            {
                key: 'techStack',
                name: `Teknologia-alustan tietoturva (${data.detectedTechStack})`,
                passed: data.detectedTechStack !== 'WordPress' && data.detectedTechStack !== 'Wix' && data.detectedTechStack !== 'Squarespace',
                icon: Zap,
                desc: (data.detectedTechStack === 'WordPress' || data.detectedTechStack === 'Wix')
                    ? `Käytössä hidas ja tietoturvaltaan haavoittuva ${data.detectedTechStack} verrattuna moderniin Next.js -sovellukseen.`
                    : `Sivusto käyttää modernia tai kevyttä alustaa (${data.detectedTechStack}).`
            }
        ];
    };


    const estimatedLostRevenue = getTweakedLostRevenue();

    // Copy Email Draft to Clipboard
    const copyEmailToClipboard = () => {
        if (!selectedLead || !selectedLead.pitchData) return;
        const bodyText = selectedLead.pitchData.draftEmailBody.replace(/\d+\s*euroa/gi, `${estimatedLostRevenue} euroa`).replace(/menettää arviolta\s*\d+\s*€/gi, `menettää arviolta ${estimatedLostRevenue} €`);
        navigator.clipboard.writeText(bodyText);
        alert('Sähköpostiluonnos kopioitu leikepöydälle!');
    };

    // Trigger Browser Print/PDF Download
    const downloadPdf = () => {
        window.print();
    };

    if (!authChecked) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-teal-500 animate-pulse font-black italic text-2xl tracking-widest">
                    AUTHENTICATING AGENT...
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 md:p-6 overflow-x-hidden">
            {/* HUB HEADER (Hidden on print) */}
            <header className="no-print w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-900 pb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-ping"></span>
                        <h1 className="text-3xl font-black italic tracking-tight text-slate-100">
                            LEAD AUDIT <span className="text-teal-400">STUDIO</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-black">
                        B2B Revenue Generation Control & Pitch Machine
                    </p>
                </div>
                
                <div className="flex gap-3">
                    <button
                        onClick={() => router.push('/admin')}
                        className="px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-400 text-xs font-black tracking-widest uppercase rounded-xl hover:text-teal-400 hover:border-teal-400/40 transition-all"
                    >
                        &larr; Back to Lab
                    </button>
                </div>
            </header>

            {/* THREE-COLUMN WORKSPACE */}
            <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* COLUMN 1: LEAD SEARCH & Vertical Scroller (Width: 25%) */}
                <section className="no-print lg:col-span-3 flex flex-col gap-6">
                    {/* SEARCH CONTROLS */}
                    <div className="tree-glass p-5 border border-slate-800">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                            <Search className="w-4 h-4 text-teal-400" />
                            Etsi kohteita
                        </h3>
                        <form onSubmit={handleSearch} className="flex flex-col gap-3">
                            <div>
                                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Kaupunki</label>
                                <select 
                                    value={cityInput}
                                    onChange={(e) => setCityInput(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                                >
                                    <option value="Helsinki">Helsinki</option>
                                    <option value="Espoo">Espoo</option>
                                    <option value="Tampere">Tampere</option>
                                    <option value="Oulu">Oulu</option>
                                    <option value="Turku">Turku</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Toimiala / Hakusana</label>
                                <input 
                                    type="text" 
                                    value={nicheInput}
                                    onChange={(e) => setNicheInput(e.target.value)}
                                    placeholder="esim. catering, ravintola"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500 placeholder-slate-700 font-medium"
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={searching}
                                className="w-full mt-2 py-3 bg-teal-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-teal-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {searching ? 'ETSITÄÄN...' : 'KÄYNNISTÄ HAKU'}
                                <Play className="w-3.5 h-3.5 fill-current" />
                            </button>
                        </form>
                    </div>

                    {/* LIIDI-LISTA */}
                    <div className="tree-glass p-5 flex flex-col gap-4 border border-slate-800 max-h-[500px] overflow-y-auto">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                                Löydetyt liidit ({leads.length})
                            </h3>
                            {leads.length === 0 && (
                                <span className="text-[10px] bg-red-950 text-red-400 px-2 py-0.5 rounded font-bold uppercase">
                                    Tyhjä
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            {leads.map((lead) => {
                                const isSelected = selectedLead?.id === lead.id;
                                const hasAudit = !!lead.auditData;
                                return (
                                    <div
                                        key={lead.id}
                                        onClick={() => setSelectedLead(lead)}
                                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                                            isSelected 
                                                ? 'bg-slate-900 border-teal-500/50 shadow-md' 
                                                : 'bg-slate-950/40 border-slate-800/60 hover:bg-slate-900 hover:border-slate-800'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs font-black text-slate-200 line-clamp-1 flex-1">
                                                {lead.name}
                                            </span>
                                            <span className={`w-2 h-2 rounded-full mt-1.5 ml-2 ${
                                                lead.status === 'sent' 
                                                    ? 'bg-teal-400' 
                                                    : hasAudit 
                                                        ? 'bg-amber-400' 
                                                        : 'bg-slate-600'
                                            }`} title={lead.status}></span>
                                        </div>
                                        
                                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                                            {lead.city} &bull; {lead.niche}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* COLUMN 2: DETAILED WORKROOM (Width: 45%) */}
                <section className="no-print lg:col-span-5">
                    <AnimatePresence mode="wait">
                        {selectedLead ? (
                            <motion.div
                                key={selectedLead.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col gap-6"
                            >
                                {/* PÄÄ-KORTTI */}
                                <div className="tree-glass p-6 border border-slate-800">
                                    <div className="flex justify-between items-start gap-4 mb-4">
                                        <div>
                                            <h2 className="text-2xl font-black italic text-slate-100">{selectedLead.name}</h2>
                                            <a 
                                                href={selectedLead.website} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="text-xs text-teal-400 hover:underline flex items-center gap-1.5 mt-1 font-semibold"
                                            >
                                                {selectedLead.website}
                                                <Sparkles className="w-3 h-3" />
                                            </a>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDeleteLead(selectedLead.id)}
                                                className="text-[10px] bg-red-950/20 text-red-500 border border-red-500/20 px-2.5 py-1.5 rounded-lg hover:bg-red-950/40 transition-colors uppercase font-black"
                                            >
                                                POISTA
                                            </button>
                                        </div>
                                    </div>

                                    {/* YHTEYSTIEDOT */}
                                    <div className="grid grid-cols-2 gap-4 bg-slate-950/50 p-3.5 rounded-xl border border-slate-900 text-xs mb-6 font-medium">
                                        <div>
                                            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Puhelin</span>
                                            {selectedLead.phone || 'Ei tiedossa'}
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Osoite</span>
                                            {selectedLead.address || 'Ei tiedossa'}
                                        </div>
                                    </div>

                                    {/* TRIGGER AUDIT OR SHOW AUDIT */}
                                    {!selectedLead.auditData ? (
                                        <div className="text-center py-8 flex flex-col items-center justify-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-teal-400 border border-slate-800 animate-pulse">
                                                <Zap className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold">Tälle liidille ei ole vielä tehty auditointia</h4>
                                                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                                                    Klikkaa alla olevaa painiketta ajaaksesi automaattisen rinnakkaistestauksen verkkosivuston suorituskyvylle, PDF-valikoille ja chat-analytiikalle.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleAudit(selectedLead)}
                                                disabled={auditingId === selectedLead.id}
                                                className="px-6 py-3 bg-teal-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-teal-400 transition-all disabled:opacity-50"
                                            >
                                                {auditingId === selectedLead.id ? 'AUDITOIDAAN...' : 'KÄYNNISTÄ AUTOMAATTINEN AUDIT'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-6">
                                            {/* AUDIT TIMELINE STATS */}
                                            <div className="grid grid-cols-3 gap-4">
                                                {/* Pagespeed Gauge */}
                                                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-900 flex flex-col items-center justify-center text-center">
                                                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-2">PAGESPEED</span>
                                                    <div className="relative w-16 h-16 flex items-center justify-center">
                                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                            <path
                                                                className="text-slate-800"
                                                                strokeWidth="3.5"
                                                                stroke="currentColor"
                                                                fill="transparent"
                                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                            />
                                                            <path
                                                                className={selectedLead.auditData.pageSpeedScore >= 90 ? 'text-teal-400' : selectedLead.auditData.pageSpeedScore >= 50 ? 'text-amber-400' : 'text-red-500'}
                                                                strokeDasharray={`${selectedLead.auditData.pageSpeedScore}, 100`}
                                                                strokeWidth="3.5"
                                                                strokeLinecap="round"
                                                                stroke="currentColor"
                                                                fill="transparent"
                                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                            />
                                                        </svg>
                                                        <span className="absolute text-sm font-black italic">
                                                            {selectedLead.auditData.pageSpeedScore}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-slate-500 mt-2 font-bold">
                                                        LCP: {selectedLead.auditData.lcpSeconds}s
                                                    </span>
                                                </div>

                                                {/* Mobile Responsiveness */}
                                                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-900 flex flex-col items-center justify-center text-center">
                                                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-2">RESPONSIIVISUUS</span>
                                                    <div className="w-16 h-16 flex items-center justify-center">
                                                        <Smartphone className={`w-8 h-8 ${selectedLead.auditData.mobileResponsive ? 'text-teal-400' : 'text-red-500'}`} />
                                                    </div>
                                                    <span className={`text-[10px] font-black uppercase mt-2 tracking-wide ${selectedLead.auditData.mobileResponsive ? 'text-teal-400' : 'text-red-500'}`}>
                                                        {selectedLead.auditData.mobileResponsive ? 'Mobiili OK' : 'Virheellinen'}
                                                    </span>
                                                </div>

                                                {/* Lead capture status */}
                                                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-900 flex flex-col items-center justify-center text-center">
                                                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-2">CHAT & FAQ</span>
                                                    <div className="w-16 h-16 flex items-center justify-center">
                                                        <MessageSquareCode className={`w-8 h-8 ${selectedLead.auditData.hasChatbot ? 'text-teal-400' : 'text-red-500 animate-pulse'}`} />
                                                    </div>
                                                    <span className={`text-[10px] font-black uppercase mt-2 tracking-wide ${selectedLead.auditData.hasChatbot ? 'text-teal-400' : 'text-red-500'}`}>
                                                        {selectedLead.auditData.hasChatbot ? (selectedLead.auditData.chatbotType || 'Havaittu') : 'Ei havaittu'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* CHECKLIST BREAKDOWN */}
                                            {(() => {
                                                const score = getAuditScore(selectedLead);
                                                const scorePercentage = Math.round((score.passed / score.total) * 100);
                                                const auditItems = getAuditItems(selectedLead);

                                                return (
                                                    <div className="flex flex-col gap-4">
                                                        {/* SCORE SUMMARY RADIAL */}
                                                        <div className="tree-glass p-4 border border-slate-800 flex items-center justify-between gap-4">
                                                            <div className="flex flex-col gap-0.5">
                                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">AUDITOINTITULOS</h4>
                                                                <span className="text-sm font-black text-slate-200">{score.passed} / {score.total} Vaatimusta kunnossa</span>
                                                                <p className="text-[10px] text-slate-500 font-medium max-w-xs mt-1 leading-normal">
                                                                    {score.passed >= 9 
                                                                        ? '✓ Sivuston laatu on erinomainen! Vain pieniä modernisointitarpeita.' 
                                                                        : score.passed >= 5 
                                                                            ? '⚠ Kohtalainen laatu, mutta merkittäviä mobiili- ja tekoälykonversiohukkia.' 
                                                                            : '✗ Kriittisiä puutteita suorituskyvyssä, SEO:ssa ja AI-hakukonenäkyvyydessä.'}
                                                                </p>
                                                            </div>
                                                            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                                                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                                    <path
                                                                        className="text-slate-900"
                                                                        strokeWidth="3.5"
                                                                        stroke="currentColor"
                                                                        fill="transparent"
                                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                                    />
                                                                    <path
                                                                        className={score.passed >= 9 ? 'text-teal-400' : score.passed >= 5 ? 'text-amber-400' : 'text-red-500'}
                                                                        strokeDasharray={`${scorePercentage}, 100`}
                                                                        strokeWidth="3.5"
                                                                        strokeLinecap="round"
                                                                        stroke="currentColor"
                                                                        fill="transparent"
                                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                                    />
                                                                </svg>
                                                                <span className="absolute text-xs font-black italic">
                                                                    {scorePercentage}%
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* 12-POINT SCROLLABLE LIST */}
                                                        <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                                                            {auditItems.map((item) => {
                                                                const IconComp = item.icon;
                                                                return (
                                                                    <div 
                                                                        key={item.key} 
                                                                        className={`p-3 rounded-xl border flex gap-3 transition-colors ${
                                                                            item.passed 
                                                                                ? 'bg-slate-950/20 border-slate-900/60 hover:bg-slate-900/30' 
                                                                                : item.key === 'chatbot' || item.key === 'contactForm' || item.key === 'techStack'
                                                                                    ? 'bg-amber-950/10 border-amber-500/10 hover:bg-amber-950/15'
                                                                                    : 'bg-red-950/10 border-red-500/10 hover:bg-red-950/15'
                                                                        }`}
                                                                    >
                                                                        <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${
                                                                            item.passed 
                                                                                ? 'bg-teal-950/40 text-teal-400' 
                                                                                : item.key === 'chatbot' || item.key === 'contactForm' || item.key === 'techStack'
                                                                                    ? 'bg-amber-950/40 text-amber-500'
                                                                                    : 'bg-red-950/40 text-red-500'
                                                                        }`}>
                                                                            <IconComp className="w-4 h-4" />
                                                                        </div>
                                                                        <div className="text-[11px] leading-relaxed flex-1">
                                                                            <div className="flex justify-between items-center mb-0.5">
                                                                                <span className="font-bold text-slate-200">{item.name}</span>
                                                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                                                                    item.passed 
                                                                                        ? 'bg-teal-950/80 text-teal-400 border border-teal-500/10' 
                                                                                        : item.key === 'chatbot' || item.key === 'contactForm' || item.key === 'techStack'
                                                                                            ? 'bg-amber-950/80 text-amber-500 border border-amber-500/10'
                                                                                            : 'bg-red-950/80 text-red-400 border border-red-500/10'
                                                                                }`}>
                                                                                    {item.passed ? 'KUNNOSSA' : 'HEIKKO / PUUTTUU'}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-slate-500 font-medium">{item.desc}</p>
                                                                            
                                                                            {item.key === 'speed' && selectedLead.auditData && (
                                                                                <div className="mt-1.5 flex gap-2 font-mono text-[9px] text-slate-400">
                                                                                    <span>Speed Index: {selectedLead.auditData.pageSpeedScore}/100</span>
                                                                                    <span>&bull;</span>
                                                                                    <span>LCP viive: {selectedLead.auditData.lcpSeconds}s</span>
                                                                                </div>
                                                                            )}
                                                                            
                                                                            {item.key === 'techStack' && selectedLead.auditData && (selectedLead.auditData.detectedTechStack === 'WordPress' || selectedLead.auditData.detectedTechStack === 'Wix') && (
                                                                                <span className="mt-1 block text-[9px] font-bold text-amber-400">⚡ Pitchaa Next.js siirtymää suorituskyvyn parantamiseksi!</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                                {/* RETEST BUTTON */}
                                                <button
                                                    onClick={() => handleAudit(selectedLead)}
                                                    disabled={auditingId === selectedLead.id}
                                                    className="py-2.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-teal-400 hover:border-teal-400/40 text-xs font-black uppercase tracking-widest rounded-xl transition-all"
                                                >
                                                    {auditingId === selectedLead.id ? 'AUDITOIDAAN...' : 'UUDISTA AUDITOINTI'}
                                                </button>

                                            {/* LOST EUROS INTERACTIVE SLIDER */}
                                            <div className="tree-glass p-5 border border-slate-800/80">
                                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                                    <TrendingDown className="w-4 h-4 text-red-500" />
                                                    MENETETYT EUROT LASKURI
                                                </h4>
                                                
                                                <div className="flex flex-col gap-4">
                                                    <div>
                                                        <div className="flex justify-between text-xs font-bold mb-1">
                                                            <span className="text-slate-400">Arvioitu kuukausittainen kävijämäärä</span>
                                                            <span className="text-teal-400">{trafficTweak} kävijää</span>
                                                        </div>
                                                        <input 
                                                            type="range" 
                                                            min="500" 
                                                            max="10000" 
                                                            step="100" 
                                                            value={trafficTweak}
                                                            onChange={(e) => setTrafficTweak(parseInt(e.target.value))}
                                                            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                                                        />
                                                    </div>

                                                    <div>
                                                        <div className="flex justify-between text-xs font-bold mb-1">
                                                            <span className="text-slate-400">Keskimääräinen tilaus/varausarvo</span>
                                                            <span className="text-teal-400">{bookingTweak} €</span>
                                                        </div>
                                                        <input 
                                                            type="range" 
                                                            min="20" 
                                                            max="1000" 
                                                            step="10" 
                                                            value={bookingTweak}
                                                            onChange={(e) => setBookingTweak(parseInt(e.target.value))}
                                                            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                                                        />
                                                    </div>

                                                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mt-2 flex items-center justify-between">
                                                        <div>
                                                            <span className="text-[10px] text-red-400 font-black block uppercase tracking-wider">Menetys kuukaudessa</span>
                                                            <span className="text-2xl font-black text-red-500 tracking-tight">-{estimatedLostRevenue} €</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-[10px] text-slate-500 block font-bold uppercase">Mobiili-dropoff</span>
                                                            <span className="text-sm font-black text-slate-300">~22%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* PIPELINE CONTROL STATUS */}
                                            <div className="flex items-center justify-between p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Prosessin tila</span>
                                                    <span className={`text-xs font-black uppercase ${
                                                        selectedLead.status === 'sent' 
                                                            ? 'text-teal-400' 
                                                            : 'text-amber-500'
                                                    }`}>
                                                        {selectedLead.status === 'sent' ? 'PITCH LÄHETETTY' : 'VALMIS AUDIT'}
                                                    </span>
                                                </div>

                                                <div className="flex gap-2">
                                                    {selectedLead.status !== 'sent' ? (
                                                        <button
                                                            onClick={() => handleUpdateStatus(selectedLead.id, 'sent')}
                                                            disabled={updatingStatus === selectedLead.id}
                                                            className="px-4 py-2 bg-teal-500 text-slate-950 font-black text-[10px] tracking-widest uppercase rounded-lg hover:bg-teal-400 transition-colors"
                                                        >
                                                            Merkitse lähetetyksi &bull; ✓
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleUpdateStatus(selectedLead.id, 'audited')}
                                                            disabled={updatingStatus === selectedLead.id}
                                                            className="px-4 py-2 bg-slate-800 text-slate-400 hover:text-slate-200 text-[10px] tracking-widest uppercase rounded-lg transition-colors border border-slate-700"
                                                        >
                                                            Palauta luonnokseksi
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="tree-glass p-8 border border-slate-800 text-center py-16 flex flex-col items-center justify-center gap-4">
                                <Building2 className="w-12 h-12 text-slate-700" />
                                <div>
                                    <h3 className="text-lg font-bold text-slate-300">Ei valittua yritystä</h3>
                                    <p className="text-xs text-slate-500 mt-1 max-w-xs">
                                        Valitse vasemmalta jokin haetuista yrityksistä, tai tee uusi haku aloittaaksesi liidien generoinnin.
                                    </p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </section>

                {/* COLUMN 3: PDF PITCH STUDIO & SALES GENERATOR (Width: 30%) */}
                <section className="no-print lg:col-span-4 flex flex-col gap-6">
                    {/* TAB SELECTOR */}
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-xl p-1.5 flex gap-2 w-full">
                        <button
                            onClick={() => setActiveTab('audit')}
                            className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                                activeTab === 'audit' 
                                    ? 'bg-teal-500 text-slate-950' 
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            PDF Pitch Esikatselu
                        </button>
                        <button
                            onClick={() => setActiveTab('pitch')}
                            className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                                activeTab === 'pitch' 
                                    ? 'bg-teal-500 text-slate-950' 
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Sähköpostiluonnos
                        </button>
                    </div>

                    <div className="tree-glass p-6 border border-slate-800 flex flex-col gap-6">
                        {selectedLead && selectedLead.auditData && selectedLead.pitchData ? (
                            activeTab === 'audit' ? (
                                <div className="flex flex-col gap-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">PDF Tulostusesikatselu</h3>
                                        <button
                                            onClick={downloadPdf}
                                            className="px-3.5 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-teal-400 hover:border-teal-400/40 text-[10px] tracking-widest font-black uppercase rounded-lg transition-all flex items-center gap-1.5"
                                        >
                                            Tulosta / PDF
                                            <Download className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* VISUAL PITCH CONTAINER (Printed exactly like this) */}
                                    <div className="w-full bg-white text-slate-950 p-6 rounded-xl border border-slate-200 shadow-inner flex flex-col gap-4 text-xs font-sans overflow-hidden">
                                        {/* PRINT HEADER */}
                                        <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                                            <div>
                                                <h1 className="text-base font-black tracking-tight leading-none uppercase text-teal-600">KoivuLabs</h1>
                                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Digital Audit Studio</span>
                                            </div>
                                            <span className="text-[8px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-black uppercase">
                                                {new Date().toLocaleDateString('fi-FI')}
                                            </span>
                                        </div>

                                        {/* CLIENT INFO */}
                                        <div>
                                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Raportti laadittu yritykselle</span>
                                            <h2 className="text-sm font-black leading-tight text-slate-900">{selectedLead.name}</h2>
                                            <span className="text-[9px] text-slate-500 font-medium break-all">{selectedLead.website}</span>
                                        </div>

                                        {/* BIG LOST EUROS HIGHLIGHT */}
                                        <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-center flex flex-col gap-1.5">
                                            <span className="text-[9px] text-red-600 font-bold uppercase tracking-wider">Menetetyt eurot kuukaudessa</span>
                                            <span className="text-3xl font-black text-red-600 tracking-tight">-{estimatedLostRevenue} €</span>
                                            <p className="text-[8px] text-slate-500 font-medium leading-relaxed max-w-[200px] mx-auto">
                                                Teknisten mobiiliongelmien ja FAQ-chatbotin puutteen vuoksi menetetty liikevaihto.
                                            </p>
                                        </div>

                                        {/* FINDINGS BULLETS */}
                                        <div className="flex flex-col gap-2">
                                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Kriittiset ongelmakohdat ({getAuditItems(selectedLead).filter(item => !item.passed).length} puutetta)</span>
                                            <div className="flex flex-col gap-1.5 text-[9px] font-medium text-slate-700">
                                                {getAuditItems(selectedLead).filter(item => !item.passed).map((item) => (
                                                    <div key={item.key} className="flex gap-2 items-start">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 shrink-0"></span>
                                                        <div>
                                                            <strong>{item.name}:</strong> {item.desc}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* SOLUTION FOOTER */}
                                        <div className="border-t border-slate-100 pt-3 flex flex-col gap-1.5 text-[8px] text-slate-500">
                                            <strong className="text-[9px] text-slate-800 uppercase tracking-wide">Meidän ehdottamamme ratkaisu</strong>
                                            Päivitetään verkkosivusto huippunopealle Next.js/Tailwind v4 -alustalle, rakennetaan täysin responsiivinen hinnasto ja asennetaan Call2u 24/7 -FAQ-chatbot keräämään pöytävaraukset ja tilaukset automaattisesti.
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Sähköpostiluonnos</h3>
                                        <button
                                            onClick={copyEmailToClipboard}
                                            className="px-3.5 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-teal-400 hover:border-teal-400/40 text-[10px] tracking-widest font-black uppercase rounded-lg transition-all flex items-center gap-1.5"
                                        >
                                            Kopioi
                                            <Copy className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 text-xs font-mono select-all flex flex-col gap-2 max-h-[350px] overflow-y-auto text-slate-400 leading-relaxed whitespace-pre-wrap">
                                        <div className="text-[10px] font-black text-slate-600 uppercase border-b border-slate-900 pb-2 mb-2">
                                            Aihe: Huomio: {selectedLead.name} verkkosivusto menettää arviolta {estimatedLostRevenue} € kuukaudessa
                                        </div>
                                        {selectedLead.pitchData.draftEmailBody.replace(/\d+\s*euroa/gi, `${estimatedLostRevenue} euroa`).replace(/menettää arviolta\s*\d+\s*€/gi, `menettää arviolta ${estimatedLostRevenue} €`)}
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="text-center py-12 flex flex-col items-center justify-center gap-3">
                                <FileText className="w-10 h-10 text-slate-800" />
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400">Ei raporttidataa saatavilla</h4>
                                    <p className="text-[10px] text-slate-600 mt-1 max-w-xs mx-auto">
                                        Ole hyvä ja aja tekninen auditointi valitulle yritykselle keskimmäisestä paneelista.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

            </div>

            {/* PRINT-ONLY SALES SHEET SECTION (Rendered only on print layout) */}
            <div className="only-print hidden print:flex flex-col gap-6 p-8 bg-white text-slate-950 min-h-screen font-sans">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-950 pb-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-950 tracking-tight uppercase">KOIVULABS</h1>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Digital Audit &amp; Technical Commercial Proposal</span>
                    </div>
                    <div className="text-right">
                        <span className="text-xs font-black text-slate-950 bg-slate-100 px-3 py-1 rounded border border-slate-200 block">
                            PÄIVÄMÄÄRÄ: {new Date().toLocaleDateString('fi-FI')}
                        </span>
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block mt-1">Luottamuksellinen &bull; B2B-Analyysi</span>
                    </div>
                </div>

                {selectedLead && selectedLead.auditData && (
                    <div className="flex flex-col gap-6">
                        {/* Target Info & High-Level Summary */}
                        <div className="flex justify-between items-end bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div>
                                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Raportti laadittu yritykselle</span>
                                <h2 className="text-xl font-black text-slate-900 leading-none">{selectedLead.name}</h2>
                                <span className="text-xs text-slate-500 font-medium break-all">{selectedLead.website}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Kokonaistulos</span>
                                <div className="text-lg font-black text-slate-900 leading-none">
                                    {getAuditScore(selectedLead).passed} / 12 Kunnossa
                                </div>
                                <span className="text-[9px] text-slate-500 font-bold">
                                    Valmiusaste: {Math.round((getAuditScore(selectedLead).passed / 12) * 100)}%
                                </span>
                            </div>
                        </div>

                        {/* Two-Column Grid */}
                        <div className="grid grid-cols-12 gap-6 items-start">
                            {/* Left Column: 12-Point Technical Scorecard Grid (7 cols) */}
                            <div className="col-span-7 flex flex-col gap-3">
                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1">
                                    12 LAATUPISTEEN TEKNINEN KUNTOTARKASTUS
                                </h3>
                                
                                <div className="grid grid-cols-1 gap-2">
                                    {getAuditItems(selectedLead).map((item) => (
                                        <div 
                                            key={item.key} 
                                            className={`p-2.5 rounded-lg border flex justify-between items-start gap-3 transition-colors ${
                                                item.passed 
                                                    ? 'bg-slate-50/50 border-slate-200' 
                                                    : 'bg-red-50/30 border-red-200/50'
                                            }`}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <span className="font-bold text-[10px] text-slate-900 truncate">{item.name}</span>
                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded leading-none shrink-0 ${
                                                        item.passed 
                                                            ? 'bg-emerald-100 text-emerald-800 font-bold' 
                                                            : 'bg-red-100 text-red-800 font-bold'
                                                    }`}>
                                                        {item.passed ? '✓ KUNNOSSA' : '✗ PUUTTUU'}
                                                    </span>
                                                </div>
                                                <p className="text-[8.5px] text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Column: Commercial Impact & Tailored Proposals (5 cols) */}
                            <div className="col-span-5 flex flex-col gap-5">
                                {/* Commercial Loss Callout */}
                                <div className="bg-red-50 border-2 border-red-200 p-4.5 rounded-xl text-center flex flex-col gap-1.5 shadow-sm">
                                    <span className="text-[9px] text-red-700 font-black uppercase tracking-widest">KUUKAUSITTAINEN LIIKEVAIHTOHUKKA</span>
                                    <span className="text-4xl font-black text-red-600 tracking-tight">-{estimatedLostRevenue} €</span>
                                    <p className="text-[8.5px] text-slate-500 leading-relaxed font-semibold">
                                        Perustuu puuttuviin automaatioihin, GEO/karttanäkyvyyden esteisiin sekä heikkoon mobiilikonversioon.
                                    </p>
                                </div>

                                {/* Deep-Dive Analysis */}
                                <div className="flex flex-col gap-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <h4 className="text-[9px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1">
                                        LIIKEVAIHTOHUKAN LÄHTEET (GEO, LLM &amp; SEO)
                                    </h4>
                                    
                                    <div className="flex flex-col gap-2 text-[9px] font-medium text-slate-700 leading-normal">
                                        {!selectedLead.auditData.hasSchemaOrg && (
                                            <div className="flex gap-1.5 items-start">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1 shrink-0"></span>
                                                <div>
                                                    <strong>AI-hakukoneiden näkymättömyys (Schema.org):</strong> Sivustolta puuttuu JSON-LD semanttinen tietorakenne. ChatGPT Search ja Google Gemini eivät pysty tehokkaasti poimimaan tai suosittelemaan yritystänne modernien tekoälyhakujen kautta.
                                                </div>
                                            </div>
                                        )}
                                        {!selectedLead.auditData.hasGoogleMapsEmbed && (
                                            <div className="flex gap-1.5 items-start">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1 shrink-0"></span>
                                                <div>
                                                    <strong>Heikko GEO-hakunäkyvyys (Local Maps SEO):</strong> Suora Google Maps -upotus puuttuu sivustolta, mikä laskee yrityksen painoarvoa Googlen paikallisissa hakutuloksissa (Google Local Pack).
                                                </div>
                                            </div>
                                        )}
                                        {!selectedLead.auditData.hasSitemap && (
                                            <div className="flex gap-1.5 items-start">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1 shrink-0"></span>
                                                <div>
                                                    <strong>Indeksointiongelmat (XML Sitemap):</strong> Sivustolla ei ole havaittu toimivaa XML-sivukarttaa. Tämä hidastaa hakukonebotteja havaitsemasta uusia sivujanne ja päivitettyjä tuotteita/hintoja.
                                                </div>
                                            </div>
                                        )}
                                        {selectedLead.auditData.pageSpeedScore < 70 && (
                                            <div className="flex gap-1.5 items-start">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1 shrink-0"></span>
                                                <div>
                                                    <strong>Konversiovuoto (Mobiilinopeus):</strong> Suorituskykypisteet ovat {selectedLead.auditData.pageSpeedScore}/100. Pitkä LCP-latausaika ({selectedLead.auditData.lcpSeconds}s) aiheuttaa sen, että huomattava osa mobiilivierailijoista sulkee sivun ennen latautumista.
                                                </div>
                                            </div>
                                        )}
                                        {!selectedLead.auditData.hasChatbot && (
                                            <div className="flex gap-1.5 items-start">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1 shrink-0"></span>
                                                <div>
                                                    <strong>Automaation puute:</strong> Sivustolla ei ole 24/7 lead-keräystä tai chatbotia. Ilta-aikaan ja viikonloppuisin tapahtuvat sivustokäynnit valuvat tyhjiöön ilman välitöntä konversioreittiä.
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Proposed Solutions & Action Plan */}
                                <div className="flex flex-col gap-2.5 bg-slate-900 text-white p-4 rounded-xl border border-slate-900 shadow">
                                    <h4 className="text-[9px] font-black text-teal-400 uppercase tracking-widest border-b border-teal-500/20 pb-1">
                                        EHDOTETTU TEKNOLOGIAPÄIVITYS
                                    </h4>
                                    <p className="text-[8.5px] text-slate-300 leading-relaxed font-semibold">
                                        Ehdotamme sivuston päivittämistä uuden sukupolven arkkitehtuuriin liikevaihdon palauttamiseksi:
                                    </p>
                                    <div className="flex flex-col gap-1.5 text-[8.5px] font-medium text-slate-300">
                                        <div className="flex gap-1.5 items-start">
                                            <span className="text-teal-400 font-bold font-mono">1.</span>
                                            <div>
                                                <strong>Next.js 15 &amp; Tailwind CSS v4:</strong> Täysin räätälöity, huippunopea alusta (PageSpeed 95+), joka latautuu mobiilissa sekunnin murto-osassa ja minimoi poistumisprosentin.
                                            </div>
                                        </div>
                                        <div className="flex gap-1.5 items-start">
                                            <span className="text-teal-400 font-bold font-mono">2.</span>
                                            <div>
                                                <strong>GEO &amp; AI Meta-Optimointi:</strong> Rakennetaan täydellinen JSON-LD skeemarakenne yritystiedoille ja tuotteille, lisätään sitemapit ja GEO-linkitykset tekoälyhakukoneita ja paikallista näkyvyyttä varten.
                                            </div>
                                        </div>
                                        <div className="flex gap-1.5 items-start">
                                            <span className="text-teal-400 font-bold font-mono">3.</span>
                                            <div>
                                                <strong>24/7 Call2u Tehtäväautomaatio:</strong> Asennetaan sivuille älykäs tekoälyavustaja hoitamaan ajanvaraukset, vastaamaan asiakaskysymyksiin ja keräämään liidit automaattisesti kellonajasta riippumatta.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="border-t border-slate-200 pt-5 mt-4 flex justify-between items-center text-[9px] text-slate-500 font-semibold">
                            <div>
                                <span className="block font-black text-slate-900">KOIVULABS OY</span>
                                <a href="https://koivulabs.fi" target="_blank" rel="noreferrer" className="underline hover:text-teal-600">https://koivulabs.fi</a>
                            </div>
                            <div className="text-right">
                                <span className="block font-black text-slate-900">YHTEYDENOTOT &amp; SUUNNITTELU</span>
                                <span>sales@koivulabs.fi</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </main>
    );
}
