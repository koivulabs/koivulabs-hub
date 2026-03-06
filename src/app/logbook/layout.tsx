import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Founder's Log | Koivu Labs",
    description: "Raw technical insights and studio updates from Koivu Labs. The pragmatic journey of building AI-driven tools from Saarijärvi, Finland.",
};

export default function LogbookLayout({ children }: { children: React.ReactNode }) {
    return children;
}
