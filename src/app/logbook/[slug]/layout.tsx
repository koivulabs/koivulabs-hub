import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Founder's Log | Koivu Labs",
    description: 'Dev log entry from Koivu Labs — a Finnish software studio.',
};

export default function SlugLayout({ children }: { children: React.ReactNode }) {
    return children;
}
