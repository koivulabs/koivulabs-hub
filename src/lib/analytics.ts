/**
 * Koivu Labs Analytics Boilerplate
 * Generic wrapper for event tracking. 
 * Swap with PostHog, Plausible, or Google Analytics as needed.
 */

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[Analytics] ${eventName}`, properties);
    }

    // Example PostHog / GA trigger
    // if (typeof window !== 'undefined' && (window as any).posthog) {
    //     (window as any).posthog.capture(eventName, properties);
    // }
};

export const trackProjectClick = (projectId: string) => {
    trackEvent('project_click', { projectId });
};
