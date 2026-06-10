import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const base = 'https://koivulabs.com';

    return [
        { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
        { url: `${base}/references`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
        { url: `${base}/services`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
        { url: `${base}/logbook`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
        { url: `${base}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
        { url: `${base}/now`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
        { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    ];
}
