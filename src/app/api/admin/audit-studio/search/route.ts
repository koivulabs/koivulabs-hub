import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/sessionToken';

// Simulated database of Finnish leads for high-quality sandbox fallback
const MOCK_LEADS_DATABASE = [
    {
        name: "Helsinki Juhla & Catering Oy",
        website: "https://helsinkicatering.fi",
        city: "Helsinki",
        niche: "catering",
        phone: "+358 9 123456",
        address: "Mannerheimintie 10, 00100 Helsinki"
    },
    {
        name: "Ravintola Savotta",
        website: "https://ravintolasavotta.fi",
        city: "Helsinki",
        niche: "ravintola",
        phone: "+358 9 7425 5588",
        address: "Aleksanterinkatu 22, 00170 Helsinki"
    },
    {
        name: "Espoon Pitopalvelu & Lounas",
        website: "https://espoonpitopalvelu.fi",
        city: "Espoo",
        niche: "catering",
        phone: "+358 40 876 5432",
        address: "Länsiväylä 5, 02100 Espoo"
    },
    {
        name: "Bistro Oula & Juhlatila",
        website: "https://bistro-oula-mock.fi",
        city: "Oulu",
        niche: "ravintola",
        phone: "+358 8 999 1111",
        address: "Kirkkokatu 4, 90100 Oulu"
    },
    {
        name: "Tampereen Juhlapalvelu Kruunu",
        website: "https://tampereenjuhlapalvelu.fi",
        city: "Tampere",
        niche: "catering",
        phone: "+358 3 555 4321",
        address: "Hämeenkatu 12, 33100 Tampere"
    },
    {
        name: "Oulun Pitomestarit",
        website: "https://pitomestarit.fi",
        city: "Oulu",
        niche: "catering",
        phone: "+358 44 123 4567",
        address: "Isokatu 15, 90100 Oulu"
    },
    {
        name: "Ravintola Nokka",
        website: "https://ravintolanokka.fi",
        city: "Helsinki",
        niche: "ravintola",
        phone: "+358 9 6128 5600",
        address: "Kanavaranta 7 F, 00160 Helsinki"
    },
    {
        name: "Turun Juhlatila & Pitopalvelu",
        website: "https://turunjuhlapalvelu.fi",
        city: "Turku",
        niche: "catering",
        phone: "+358 2 888 7777",
        address: "Aurakatu 3, 20100 Turku"
    }
];

export async function POST(req: NextRequest) {
    // 1. Session check
    const token = req.cookies.get('__koivu_session')?.value;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!token || !projectId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const claims = await verifyAdminToken(token, projectId);
    if (!claims) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request parameters
    try {
        const body = await req.json();
        const city = (body.city || '').trim();
        const niche = (body.niche || '').trim();

        if (!city || !niche) {
            return NextResponse.json({ error: 'Missing city or niche' }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

        // If API key is present and not dummy, try real Google Places Text Search (New)
        if (apiKey && !apiKey.startsWith('AIzaSyDummy')) {
            try {
                const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Goog-Api-Key': apiKey,
                        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber'
                    },
                    body: JSON.stringify({
                        textQuery: `${niche} in ${city}, Finland`
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.places && data.places.length > 0) {
                        const leads = data.places
                            .filter((p: any) => p.websiteUri) // Only keep those with websites
                            .map((p: any) => ({
                                id: p.id,
                                name: p.displayName?.text || 'Tuntematon yritys',
                                website: p.websiteUri,
                                city: city.charAt(0).toUpperCase() + city.slice(1).toLowerCase(),
                                niche: niche.toLowerCase(),
                                phone: p.nationalPhoneNumber || '',
                                address: p.formattedAddress || '',
                                status: 'discovered',
                                createdAt: Date.now()
                            }));

                        return NextResponse.json({ leads, source: 'google_places' });
                    }
                } else {
                    console.warn(`Google Places API returned status ${response.status}. Falling back to organic discovery...`);
                }
            } catch (err) {
                console.error("Google Places Search failed, falling back to organic discovery:", err);
            }
        }

        // Try DuckDuckGo Organic Discovery for 100% real business websites
        try {
            console.log(`Starting organic business discovery for: ${niche} ${city}`);
            const query = encodeURIComponent(`${niche} ${city}`);
            const ddgUrl = `https://html.duckduckgo.com/html/?q=${query}`;
            
            const ddgRes = await fetch(ddgUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            if (ddgRes.ok) {
                const html = await ddgRes.text();
                const matches = html.matchAll(/<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g);
                const leads: any[] = [];
                const seenDomains = new Set<string>();
                
                const excludedDomains = [
                    'duckduckgo.com', 'wikipedia.org', 'facebook.com', 'instagram.com', 'tripadvisor.com', 
                    'yelp.com', 'linkedin.com', 'youtube.com', 'twitter.com', 'google.com', 'finder.fi', 
                    'asiakastieto.fi', 'yritystele.fi', 'eniro.fi', 'fonecta.fi', 'fonectainfo.fi', 'suomi.fi',
                    'eat.fi', 'toptaste.fi', 'lounasvahti.fi', 'lounaat.info', 'tableonline.fi', 'sales.fi',
                    'reddit.com', 'pinterest.com', 'kauppalehti.fi', 'talouselama.fi', 'is.fi', 'hs.fi'
                ];

                const cleanTitle = (title: string, domain: string) => {
                    let clean = title.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim();
                    const separators = [' - ', ' | ', ' • ', ' – ', ' : ', ' › '];
                    for (const sep of separators) {
                        if (clean.includes(sep)) {
                            clean = clean.split(sep)[0].trim();
                        }
                    }
                    clean = clean.replace(/\s*(Oy|Ab|Ky|Oyj|Tmi)\b.*/i, ' $1');
                    if (!clean || clean.length < 3 || /^(kotisivu|etusivu|welcome|tervetuloa|avoinna)/i.test(clean)) {
                        const parts = domain.replace('www.', '').split('.');
                        clean = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
                    }
                    return clean;
                };

                let idx = 0;
                for (const m of matches) {
                    let link = m[1];
                    const text = m[2].replace(/<[^>]+>/g, '').trim();
                    
                    if (link.includes('uddg=')) {
                        const parts = link.split('uddg=');
                        if (parts[1]) {
                            link = decodeURIComponent(parts[1].split('&')[0]);
                        }
                    } else {
                        continue;
                    }
                    
                    if (!link.startsWith('http')) continue;
                    
                    try {
                        const urlObj = new URL(link);
                        const hostname = urlObj.hostname.toLowerCase();
                        const domain = hostname.replace('www.', '');
                        
                        if (excludedDomains.some(d => domain.includes(d))) continue;
                        if (seenDomains.has(domain)) continue;
                        
                        if (text && text.length > 2) {
                            seenDomains.add(domain);
                            const cleanName = cleanTitle(text, domain);
                            
                            leads.push({
                                id: `organic-${domain.replace(/[^a-zA-Z0-9]/g, '-')}`,
                                name: cleanName,
                                website: `${urlObj.protocol}//${urlObj.hostname}`,
                                city: city.charAt(0).toUpperCase() + city.slice(1).toLowerCase(),
                                niche: niche.toLowerCase(),
                                phone: '',
                                address: '',
                                status: 'discovered',
                                createdAt: Date.now() - (idx * 60000)
                            });
                            idx++;
                        }
                    } catch (e) {
                        // Skip invalid URLs
                    }
                }

                if (leads.length > 0) {
                    console.log(`Organic discovery succeeded. Found ${leads.length} real leads.`);
                    return NextResponse.json({ leads, source: 'organic_search' });
                }
            }
        } catch (ddgErr) {
            console.error("DuckDuckGo organic discovery failed:", ddgErr);
        }

        // Final safety fallback to mock database
        console.warn("Organic discovery found no results, falling back to mock database safety net...");
        const normalizedCity = city.toLowerCase();
        const normalizedNiche = niche.toLowerCase();

        const filteredMockLeads = MOCK_LEADS_DATABASE
            .filter(lead => 
                lead.city.toLowerCase() === normalizedCity && 
                lead.niche.toLowerCase() === normalizedNiche
            )
            .map((lead, idx) => ({
                id: `mock-lead-${normalizedCity}-${normalizedNiche}-${idx}`,
                name: lead.name,
                website: lead.website,
                city: lead.city,
                niche: lead.niche,
                phone: lead.phone,
                address: lead.address,
                status: 'discovered' as const,
                createdAt: Date.now() - (idx * 60000)
            }));

        // If no strict matches, return mock list matching just the city, or just general mocks
        const leads = filteredMockLeads.length > 0 
            ? filteredMockLeads 
            : MOCK_LEADS_DATABASE
                .filter(lead => lead.city.toLowerCase() === normalizedCity)
                .map((lead, idx) => ({
                    id: `mock-lead-${normalizedCity}-${normalizedNiche}-${idx}`,
                    name: lead.name,
                    website: lead.website,
                    city: lead.city,
                    niche: lead.niche,
                    phone: lead.phone,
                    address: lead.address,
                    status: 'discovered' as const,
                    createdAt: Date.now() - (idx * 60000)
                }));

        return NextResponse.json({ leads: leads.length > 0 ? leads : [], source: 'mock_database_sandbox' });

    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid request' }, { status: 500 });
    }
}
