import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Koivu Labs',
        short_name: 'KoivuLabs',
        description: 'A Finnish Software Studio focused on AI-driven utility.',
        start_url: '/',
        display: 'standalone',
        background_color: '#020817',
        theme_color: '#2dd4bf',
        icons: [
            { src: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
        ],
    };
}
