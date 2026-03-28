// Server-side Firestore reads/writes via REST API (no client SDK needed)

import { LogbookPost } from './koivuVoice';

// ─────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────

function firestoreBaseUrl(): { projectId: string; apiKey: string } {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!projectId || !apiKey) throw new Error('Firebase env vars not set');
    return { projectId, apiKey };
}

function docUrl(collection: string, docId: string): string {
    const { projectId, apiKey } = firestoreBaseUrl();
    return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}?key=${apiKey}`;
}

export async function saveLogToFirestore(post: LogbookPost): Promise<void> {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (!projectId || !apiKey) {
        throw new Error('Firebase env vars not set');
    }

    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/logs/${post.slug}?key=${apiKey}`;

    const body = {
        fields: {
            id:              { stringValue: post.slug },
            title:           { stringValue: post.title },
            content:         { stringValue: post.content },
            status:          { stringValue: 'Published' },
            publishedAt:     { timestampValue: new Date().toISOString() },
            metaDescription: { stringValue: post.meta_description },
            tags: {
                arrayValue: {
                    values: post.tags.map(t => ({ stringValue: t })),
                },
            },
        },
    };

    const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(`Firestore REST error: ${JSON.stringify(err)}`);
    }
}

// ─────────────────────────────────────────────
// Now page
// ─────────────────────────────────────────────

export interface NowPageData {
    building: string[];
    learning: string[];
    reading: string[];
    notDoing: string[];
    location: string;
    updatedAt: string;
}

/** Back up current Now page before overwriting */
export async function backupNowPage(): Promise<void> {
    const current = await getNowPage();
    if (!current) return; // nothing to back up

    const url = docUrl('siteContent', 'now_backup');
    const toArray = (items: string[]) => ({
        arrayValue: { values: items.map(s => ({ stringValue: s })) },
    });

    const body = {
        fields: {
            building:  toArray(current.building),
            learning:  toArray(current.learning),
            reading:   toArray(current.reading),
            notDoing:  toArray(current.notDoing),
            location:  { stringValue: current.location },
            updatedAt: { stringValue: current.updatedAt },
        },
    };

    const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(`Firestore backup now error: ${JSON.stringify(err)}`);
    }
}

/** Restore Now page from backup */
export async function restoreNowBackup(): Promise<NowPageData | null> {
    const url = docUrl('siteContent', 'now_backup');

    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const f = data.fields;
    if (!f) return null;

    const toStrings = (field: { arrayValue?: { values?: Array<{ stringValue: string }> } }) =>
        field?.arrayValue?.values?.map(v => v.stringValue) ?? [];

    const backup: NowPageData = {
        building:  toStrings(f.building),
        learning:  toStrings(f.learning),
        reading:   toStrings(f.reading),
        notDoing:  toStrings(f.notDoing),
        location:  f.location?.stringValue ?? '',
        updatedAt: f.updatedAt?.stringValue ?? '',
    };

    // Restore: save backup as current
    await saveNowPage(backup);
    return backup;
}

export async function saveNowPage(data: NowPageData): Promise<void> {
    const url = docUrl('siteContent', 'now');

    const toArray = (items: string[]) => ({
        arrayValue: { values: items.map(s => ({ stringValue: s })) },
    });

    const body = {
        fields: {
            building:  toArray(data.building),
            learning:  toArray(data.learning),
            reading:   toArray(data.reading),
            notDoing:  toArray(data.notDoing),
            location:  { stringValue: data.location },
            updatedAt: { stringValue: data.updatedAt },
        },
    };

    const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(`Firestore save now error: ${JSON.stringify(err)}`);
    }
}

export async function getNowPage(): Promise<NowPageData | null> {
    const url = docUrl('siteContent', 'now');

    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const f = data.fields;
    if (!f) return null;

    const toStrings = (field: { arrayValue?: { values?: Array<{ stringValue: string }> } }) =>
        field?.arrayValue?.values?.map(v => v.stringValue) ?? [];

    return {
        building:  toStrings(f.building),
        learning:  toStrings(f.learning),
        reading:   toStrings(f.reading),
        notDoing:  toStrings(f.notDoing),
        location:  f.location?.stringValue ?? '',
        updatedAt: f.updatedAt?.stringValue ?? '',
    };
}

// ─────────────────────────────────────────────
// Delete published log
// ─────────────────────────────────────────────

export async function deleteLogFromFirestore(slug: string): Promise<void> {
    const url = docUrl('logs', slug);

    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok && res.status !== 404) {
        const err = await res.json();
        throw new Error(`Firestore delete log error: ${JSON.stringify(err)}`);
    }
}

export interface PublishedLog {
    slug: string;
    title: string;
    publishedAt: string;
}

export async function listPublishedLogs(): Promise<PublishedLog[]> {
    const { projectId, apiKey } = firestoreBaseUrl();
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/logs?key=${apiKey}&pageSize=50`;

    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    if (!data.documents) return [];

    return data.documents
        .map((doc: { fields: Record<string, { stringValue?: string; timestampValue?: string }> }) => {
            const f = doc.fields;
            return {
                slug: f.id?.stringValue ?? '',
                title: f.title?.stringValue ?? '',
                publishedAt: f.publishedAt?.timestampValue ?? '',
            };
        })
        .filter((log: PublishedLog) => log.slug)
        .sort((a: PublishedLog, b: PublishedLog) => b.publishedAt.localeCompare(a.publishedAt));
}

// ─────────────────────────────────────────────
// Time tracking — entries, invoices, clients
// ─────────────────────────────────────────────

export interface TimeEntry {
    id: string;
    invoiceId: string;
    client: string;
    description: string;
    location: string;
    date: string;
    hours: number;
    pricingModel: 'hourly' | 'fixed' | 'none';
    hourlyRate: number;
    fixedPrice: number;
    totalPrice: number;
    createdAt: string;
}

export interface Invoice {
    id: string;
    client: string;
    clientId: string;
    status: 'open' | 'closed';
    createdAt: string;
    closedAt: string;
    entries: string[];   // entry IDs
    totalHours: number;
    totalPrice: number;
}

export interface ClientInfo {
    id: string;
    name: string;
    businessId: string;  // y-tunnus
    address: string;
    email: string;
    contactPerson: string;
    pricingModel: 'hourly' | 'fixed' | 'none';
    defaultHourlyRate: number;
    createdAt: string;
}

export interface InvoiceSettings {
    companyName: string;
    businessId: string;
    address: string;
    iban: string;
    email: string;
    phone: string;
    defaultHourlyRate: number;
}

// ── Generic Firestore field helpers ──

type FirestoreFields = Record<string, unknown>;

function toFirestoreString(val: string) { return { stringValue: val }; }
function toFirestoreNumber(val: number) { return { doubleValue: val }; }
function toFirestoreStringArray(items: string[]) {
    return { arrayValue: { values: items.map(s => ({ stringValue: s })) } };
}

function fromFirestoreString(field: { stringValue?: string } | undefined): string {
    return field?.stringValue ?? '';
}
function fromFirestoreNumber(field: { doubleValue?: number; integerValue?: string } | undefined): number {
    if (field?.doubleValue !== undefined) return field.doubleValue;
    if (field?.integerValue !== undefined) return parseInt(field.integerValue, 10);
    return 0;
}
function fromFirestoreStringArray(field: { arrayValue?: { values?: Array<{ stringValue: string }> } } | undefined): string[] {
    return field?.arrayValue?.values?.map(v => v.stringValue) ?? [];
}

// ── Collection URL helper ──

function collectionUrl(collection: string): string {
    const { projectId, apiKey } = firestoreBaseUrl();
    return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}?key=${apiKey}`;
}

// ── Invoice Settings (own company info) ──

export async function saveInvoiceSettings(data: InvoiceSettings): Promise<void> {
    const url = docUrl('siteContent', 'invoiceSettings');
    const body = {
        fields: {
            companyName:       toFirestoreString(data.companyName),
            businessId:        toFirestoreString(data.businessId),
            address:           toFirestoreString(data.address),
            iban:              toFirestoreString(data.iban),
            email:             toFirestoreString(data.email),
            phone:             toFirestoreString(data.phone),
            defaultHourlyRate: toFirestoreNumber(data.defaultHourlyRate),
        },
    };
    const res = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) { const err = await res.json(); throw new Error(`Save invoice settings error: ${JSON.stringify(err)}`); }
}

export async function getInvoiceSettings(): Promise<InvoiceSettings | null> {
    const url = docUrl('siteContent', 'invoiceSettings');
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const f = data.fields as FirestoreFields;
    if (!f) return null;
    return {
        companyName:       fromFirestoreString(f.companyName as { stringValue?: string }),
        businessId:        fromFirestoreString(f.businessId as { stringValue?: string }),
        address:           fromFirestoreString(f.address as { stringValue?: string }),
        iban:              fromFirestoreString(f.iban as { stringValue?: string }),
        email:             fromFirestoreString(f.email as { stringValue?: string }),
        phone:             fromFirestoreString(f.phone as { stringValue?: string }),
        defaultHourlyRate: fromFirestoreNumber(f.defaultHourlyRate as { doubleValue?: number; integerValue?: string }),
    };
}

// ── Clients ──

function clientToFields(c: ClientInfo) {
    return {
        id:                toFirestoreString(c.id),
        name:              toFirestoreString(c.name),
        businessId:        toFirestoreString(c.businessId),
        address:           toFirestoreString(c.address),
        email:             toFirestoreString(c.email),
        contactPerson:     toFirestoreString(c.contactPerson),
        pricingModel:      toFirestoreString(c.pricingModel),
        defaultHourlyRate: toFirestoreNumber(c.defaultHourlyRate),
        createdAt:         toFirestoreString(c.createdAt),
    };
}

function fieldsToClient(f: FirestoreFields): ClientInfo {
    return {
        id:                fromFirestoreString(f.id as { stringValue?: string }),
        name:              fromFirestoreString(f.name as { stringValue?: string }),
        businessId:        fromFirestoreString(f.businessId as { stringValue?: string }),
        address:           fromFirestoreString(f.address as { stringValue?: string }),
        email:             fromFirestoreString(f.email as { stringValue?: string }),
        contactPerson:     fromFirestoreString(f.contactPerson as { stringValue?: string }),
        pricingModel:      (fromFirestoreString(f.pricingModel as { stringValue?: string }) || 'hourly') as 'hourly' | 'fixed' | 'none',
        defaultHourlyRate: fromFirestoreNumber(f.defaultHourlyRate as { doubleValue?: number; integerValue?: string }),
        createdAt:         fromFirestoreString(f.createdAt as { stringValue?: string }),
    };
}

export async function saveClient(client: ClientInfo): Promise<void> {
    const url = docUrl('clients', client.id);
    const body = { fields: clientToFields(client) };
    const res = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) { const err = await res.json(); throw new Error(`Save client error: ${JSON.stringify(err)}`); }
}

export async function getClient(clientId: string): Promise<ClientInfo | null> {
    const url = docUrl('clients', clientId);
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.fields) return null;
    return fieldsToClient(data.fields);
}

export async function listClients(): Promise<ClientInfo[]> {
    const url = collectionUrl('clients') + '&pageSize=50';
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.documents) return [];
    return data.documents
        .map((doc: { fields: FirestoreFields }) => fieldsToClient(doc.fields))
        .filter((c: ClientInfo) => c.id);
}

// ── Invoices ──

function invoiceToFields(inv: Invoice) {
    return {
        id:         toFirestoreString(inv.id),
        client:     toFirestoreString(inv.client),
        clientId:   toFirestoreString(inv.clientId),
        status:     toFirestoreString(inv.status),
        createdAt:  toFirestoreString(inv.createdAt),
        closedAt:   toFirestoreString(inv.closedAt),
        entries:    toFirestoreStringArray(inv.entries),
        totalHours: toFirestoreNumber(inv.totalHours),
        totalPrice: toFirestoreNumber(inv.totalPrice),
    };
}

function fieldsToInvoice(f: FirestoreFields): Invoice {
    return {
        id:         fromFirestoreString(f.id as { stringValue?: string }),
        client:     fromFirestoreString(f.client as { stringValue?: string }),
        clientId:   fromFirestoreString(f.clientId as { stringValue?: string }),
        status:     (fromFirestoreString(f.status as { stringValue?: string }) || 'open') as 'open' | 'closed',
        createdAt:  fromFirestoreString(f.createdAt as { stringValue?: string }),
        closedAt:   fromFirestoreString(f.closedAt as { stringValue?: string }),
        entries:    fromFirestoreStringArray(f.entries as { arrayValue?: { values?: Array<{ stringValue: string }> } }),
        totalHours: fromFirestoreNumber(f.totalHours as { doubleValue?: number; integerValue?: string }),
        totalPrice: fromFirestoreNumber(f.totalPrice as { doubleValue?: number; integerValue?: string }),
    };
}

export async function saveInvoice(inv: Invoice): Promise<void> {
    const url = docUrl('invoices', inv.id);
    const body = { fields: invoiceToFields(inv) };
    const res = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) { const err = await res.json(); throw new Error(`Save invoice error: ${JSON.stringify(err)}`); }
}

export async function getInvoice(invoiceId: string): Promise<Invoice | null> {
    const url = docUrl('invoices', invoiceId);
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.fields) return null;
    return fieldsToInvoice(data.fields);
}

export async function listInvoices(statusFilter?: 'open' | 'closed'): Promise<Invoice[]> {
    const url = collectionUrl('invoices') + '&pageSize=50';
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.documents) return [];
    const all = data.documents
        .map((doc: { fields: FirestoreFields }) => fieldsToInvoice(doc.fields))
        .filter((inv: Invoice) => inv.id);
    if (statusFilter) return all.filter((inv: Invoice) => inv.status === statusFilter);
    return all;
}

/** Find or create an open invoice for a client */
export async function getOrCreateOpenInvoice(clientId: string, clientName: string): Promise<Invoice> {
    const open = await listInvoices('open');
    const existing = open.find(inv => inv.clientId === clientId);
    if (existing) return existing;

    const inv: Invoice = {
        id: `inv_${clientId}_${Date.now()}`,
        client: clientName,
        clientId,
        status: 'open',
        createdAt: new Date().toISOString(),
        closedAt: '',
        entries: [],
        totalHours: 0,
        totalPrice: 0,
    };
    await saveInvoice(inv);
    return inv;
}

// ── Time entries ──

function entryToFields(e: TimeEntry) {
    return {
        id:           toFirestoreString(e.id),
        invoiceId:    toFirestoreString(e.invoiceId),
        client:       toFirestoreString(e.client),
        description:  toFirestoreString(e.description),
        location:     toFirestoreString(e.location),
        date:         toFirestoreString(e.date),
        hours:        toFirestoreNumber(e.hours),
        pricingModel: toFirestoreString(e.pricingModel),
        hourlyRate:   toFirestoreNumber(e.hourlyRate),
        fixedPrice:   toFirestoreNumber(e.fixedPrice),
        totalPrice:   toFirestoreNumber(e.totalPrice),
        createdAt:    toFirestoreString(e.createdAt),
    };
}

function fieldsToEntry(f: FirestoreFields): TimeEntry {
    return {
        id:           fromFirestoreString(f.id as { stringValue?: string }),
        invoiceId:    fromFirestoreString(f.invoiceId as { stringValue?: string }),
        client:       fromFirestoreString(f.client as { stringValue?: string }),
        description:  fromFirestoreString(f.description as { stringValue?: string }),
        location:     fromFirestoreString(f.location as { stringValue?: string }),
        date:         fromFirestoreString(f.date as { stringValue?: string }),
        hours:        fromFirestoreNumber(f.hours as { doubleValue?: number; integerValue?: string }),
        pricingModel: (fromFirestoreString(f.pricingModel as { stringValue?: string }) || 'none') as 'hourly' | 'fixed' | 'none',
        hourlyRate:   fromFirestoreNumber(f.hourlyRate as { doubleValue?: number; integerValue?: string }),
        fixedPrice:   fromFirestoreNumber(f.fixedPrice as { doubleValue?: number; integerValue?: string }),
        totalPrice:   fromFirestoreNumber(f.totalPrice as { doubleValue?: number; integerValue?: string }),
        createdAt:    fromFirestoreString(f.createdAt as { stringValue?: string }),
    };
}

export async function saveTimeEntry(entry: TimeEntry): Promise<void> {
    const url = docUrl('timeEntries', entry.id);
    const body = { fields: entryToFields(entry) };
    const res = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) { const err = await res.json(); throw new Error(`Save time entry error: ${JSON.stringify(err)}`); }
}

export async function listTimeEntriesByInvoice(invoiceId: string): Promise<TimeEntry[]> {
    const url = collectionUrl('timeEntries') + '&pageSize=100';
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.documents) return [];
    return data.documents
        .map((doc: { fields: FirestoreFields }) => fieldsToEntry(doc.fields))
        .filter((e: TimeEntry) => e.invoiceId === invoiceId)
        .sort((a: TimeEntry, b: TimeEntry) => a.date.localeCompare(b.date));
}

export async function deleteTimeEntry(entryId: string): Promise<void> {
    const url = docUrl('timeEntries', entryId);
    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok && res.status !== 404) {
        const err = await res.json();
        throw new Error(`Delete time entry error: ${JSON.stringify(err)}`);
    }
}
