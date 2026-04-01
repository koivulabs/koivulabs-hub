import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: '#020817',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                    border: '1px solid #1e293b',
                    fontFamily: 'serif',
                }}
            >
                <div style={{ color: '#2dd4bf', fontSize: '20px', fontWeight: 900, fontStyle: 'italic', display: 'flex' }}>
                    K
                </div>
            </div>
        ),
        { ...size }
    );
}
