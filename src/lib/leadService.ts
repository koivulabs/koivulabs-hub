export interface Lead {
    id: string;
    name: string;
    website: string;
    city: string;
    niche: string;
    phone?: string;
    address?: string;
    status: 'discovered' | 'audited' | 'pitch_ready' | 'sent';
    createdAt: number;
    auditData?: {
        pageSpeedScore: number;
        lcpSeconds: number;
        pdfMenusDetected: boolean;
        pdfUrls: string[];
        mobileResponsive: boolean;
        hasChatbot: boolean;
        chatbotType?: string;
        seoTitlePresent: boolean;
        seoMetaDescPresent: boolean;
        hasH1Heading: boolean;
        openGraphTagsPresent: boolean;
        hasContactForm: boolean;
        hasTelOrMailtoLinks: boolean;
        detectedTechStack: string;
        hasSitemap: boolean;
        hasSchemaOrg: boolean;
        hasGoogleMapsEmbed: boolean;
        auditedAt: number;
    };
    pitchData?: {
        estimatedLostRevenue: number;
        draftEmailSubject: string;
        draftEmailBody: string;
        pdfReportUrl?: string;
    };
}

export const leadService = {
    async getAllLeads(): Promise<Lead[]> {
        const res = await fetch("/api/admin/leads");
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || "Failed to load leads");
        }
        return res.json();
    },

    async getLeadsByCityAndNiche(city: string, niche: string): Promise<Lead[]> {
        const res = await fetch(`/api/admin/leads?city=${encodeURIComponent(city)}&niche=${encodeURIComponent(niche)}`);
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || "Failed to load leads");
        }
        return res.json();
    },

    async getLead(leadId: string): Promise<Lead | null> {
        const leads = await this.getAllLeads();
        return leads.find(l => l.id === leadId) || null;
    },

    async saveLead(lead: Lead): Promise<void> {
        const res = await fetch("/api/admin/leads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(lead)
        });
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || "Failed to save lead");
        }
    },

    async updateLead(leadId: string, data: Partial<Lead>): Promise<void> {
        const res = await fetch(`/api/admin/leads?id=${leadId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || "Failed to update lead");
        }
    },

    async deleteLead(leadId: string): Promise<void> {
        const res = await fetch(`/api/admin/leads?id=${leadId}`, {
            method: "DELETE"
        });
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || "Failed to delete lead");
        }
    }
};
