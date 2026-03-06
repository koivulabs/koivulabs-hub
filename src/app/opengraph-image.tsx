import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Koivu Labs — Pragmatic Intelligence';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: '#020817',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    padding: '80px',
                    position: 'relative',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* Top accent line */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#2dd4bf' }} />

                {/* Grid texture */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'radial-gradient(circle, #2dd4bf 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

                {/* Label */}
                <div style={{ color: '#2dd4bf', fontSize: '16px', fontWeight: 900, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '28px', display: 'flex' }}>
                    Finnish Software Studio / Saarijärvi
                </div>

                {/* Main title */}
                <div style={{ color: '#f8fafc', fontSize: '100px', fontWeight: 900, fontStyle: 'italic', lineHeight: 1, marginBottom: '32px', display: 'flex' }}>
                    KOIVU&nbsp;<span style={{ color: '#2dd4bf' }}>LABS</span>
                </div>

                {/* Tagline */}
                <div style={{ color: '#475569', fontSize: '22px', fontWeight: 400, maxWidth: '580px', lineHeight: 1.6, display: 'flex' }}>
                    Pragmatic Intelligence. Bridging human common sense with AI power.
                </div>

                {/* Bottom URL */}
                <div style={{ position: 'absolute', bottom: '44px', left: '80px', color: '#1e293b', fontSize: '14px', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', display: 'flex' }}>
                    koivulabs.com
                </div>

                {/* Bottom right — version */}
                <div style={{ position: 'absolute', bottom: '44px', right: '80px', color: '#1e293b', fontSize: '14px', fontWeight: 700, letterSpacing: '0.2em', display: 'flex' }}>
                    EST. 2026
                </div>
            </div>
        ),
        { ...size }
    );
}
