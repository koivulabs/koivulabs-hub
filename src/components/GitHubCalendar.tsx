'use client';

import GitHubCalendarLib from 'react-github-calendar';

export default function GitHubCalendar() {
    return (
        <GitHubCalendarLib
            username="akkkrrr"
            colorScheme="dark"
            theme={{
                dark: ['#0f172a', '#134e4a', '#0d9488', '#14b8a6', '#2dd4bf'],
            }}
            style={{ width: '100%' }}
            fontSize={11}
            blockSize={12}
            blockMargin={3}
        />
    );
}
