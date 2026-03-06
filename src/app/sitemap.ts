import { MetadataRoute } from 'next';
import { projects } from '@/constants/projects';

export default function sitemap(): MetadataRoute.Sitemap {
    const base = 'https://koivulabs.com';

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
        { url: `${base}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
        { url: `${base}/logbook`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
        { url: `${base}/registry`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    ];

    const projectRoutes: MetadataRoute.Sitemap = projects.map(project => ({
        url: `${base}/${project.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
    }));

    return [...staticRoutes, ...projectRoutes];
}
