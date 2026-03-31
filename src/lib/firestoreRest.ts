// Server-side Firestore reads/writes via Firebase Admin SDK
// Admin SDK bypasses security rules — only server-side code can use this.

import { LogbookPost } from './koivuVoice';
import { getAdminDb } from './firebaseAdmin';

// ─────────────────────────────────────────────
// Helper: get Firestore instance
// ─────────────────────────────────────────────
function db() {
  return getAdminDb();
}

// ─────────────────────────────────────────────
// Logbook
// ─────────────────────────────────────────────
export async function saveLogToFirestore(post: LogbookPost): Promise<void> {
  await db().doc(`logs/${post.slug}`).set({
    id: post.slug,
    title: post.title,
    content: post.content,
    status: 'Published',
    publishedAt: new Date().toISOString(),
    metaDescription: post.meta_description,
    tags: post.tags,
  });
}

export async function deleteLogFromFirestore(slug: string): Promise<void> {
  await db().doc(`logs/${slug}`).delete();
}

export interface PublishedLog {
  slug: string;
  title: string;
  publishedAt: string;
}

export async function listPublishedLogs(): Promise<PublishedLog[]> {
  const snap = await db().collection('logs').limit(50).get();
  return snap.docs
    .map(doc => {
      const d = doc.data();
      return {
        slug: d.id ?? '',
        title: d.title ?? '',
        publishedAt: d.publishedAt ?? '',
      };
    })
    .filter(log => log.slug)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
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
  if (!current) return;

  await db().doc('siteContent/now_backup').set({
    building: current.building,
    learning: current.learning,
    reading: current.reading,
    notDoing: current.notDoing,
    location: current.location,
    updatedAt: current.updatedAt,
  });
}

/** Restore Now page from backup */
export async function restoreNowBackup(): Promise<NowPageData | null> {
  const snap = await db().doc('siteContent/now_backup').get();
  if (!snap.exists) return null;

  const d = snap.data()!;
  const backup: NowPageData = {
    building: d.building ?? [],
    learning: d.learning ?? [],
    reading: d.reading ?? [],
    notDoing: d.notDoing ?? [],
    location: d.location ?? '',
    updatedAt: d.updatedAt ?? '',
  };

  await saveNowPage(backup);
  return backup;
}

export async function saveNowPage(data: NowPageData): Promise<void> {
  await db().doc('siteContent/now').set({
    building: data.building,
    learning: data.learning,
    reading: data.reading,
    notDoing: data.notDoing,
    location: data.location,
    updatedAt: data.updatedAt,
  });
}

export async function getNowPage(): Promise<NowPageData | null> {
  const snap = await db().doc('siteContent/now').get();
  if (!snap.exists) return null;

  const d = snap.data()!;
  return {
    building: d.building ?? [],
    learning: d.learning ?? [],
    reading: d.reading ?? [],
    notDoing: d.notDoing ?? [],
    location: d.location ?? '',
    updatedAt: d.updatedAt ?? '',
  };
}

// ─────────────────────────────────────────────
// Invoice Settings (own company info)
// ─────────────────────────────────────────────
export interface InvoiceSettings {
  companyName: string;
  businessId: string;
  address: string;
  iban: string;
  email: string;
  phone: string;
  defaultHourlyRate: number;
}

export async function saveInvoiceSettings(data: InvoiceSettings): Promise<void> {
  await db().doc('siteContent/invoiceSettings').set({
    companyName: data.companyName,
    businessId: data.businessId,
    address: data.address,
    iban: data.iban,
    email: data.email,
    phone: data.phone,
    defaultHourlyRate: data.defaultHourlyRate,
  });
}

export async function getInvoiceSettings(): Promise<InvoiceSettings | null> {
  const snap = await db().doc('siteContent/invoiceSettings').get();
  if (!snap.exists) return null;

  const d = snap.data()!;
  return {
    companyName: d.companyName ?? '',
    businessId: d.businessId ?? '',
    address: d.address ?? '',
    iban: d.iban ?? '',
    email: d.email ?? '',
    phone: d.phone ?? '',
    defaultHourlyRate: d.defaultHourlyRate ?? 0,
  };
}

// ─────────────────────────────────────────────
// Clients
// ─────────────────────────────────────────────
export interface ClientInfo {
  id: string;
  name: string;
  businessId: string;
  address: string;
  email: string;
  contactPerson: string;
  pricingModel: 'hourly' | 'fixed' | 'none';
  defaultHourlyRate: number;
  createdAt: string;
}

export async function saveClient(client: ClientInfo): Promise<void> {
  await db().doc(`clients/${client.id}`).set({
    id: client.id,
    name: client.name,
    businessId: client.businessId,
    address: client.address,
    email: client.email,
    contactPerson: client.contactPerson,
    pricingModel: client.pricingModel,
    defaultHourlyRate: client.defaultHourlyRate,
    createdAt: client.createdAt,
  });
}

export async function getClient(clientId: string): Promise<ClientInfo | null> {
  const snap = await db().doc(`clients/${clientId}`).get();
  if (!snap.exists) return null;

  const d = snap.data()!;
  return {
    id: d.id ?? '',
    name: d.name ?? '',
    businessId: d.businessId ?? '',
    address: d.address ?? '',
    email: d.email ?? '',
    contactPerson: d.contactPerson ?? '',
    pricingModel: (d.pricingModel || 'hourly') as 'hourly' | 'fixed' | 'none',
    defaultHourlyRate: d.defaultHourlyRate ?? 0,
    createdAt: d.createdAt ?? '',
  };
}

export async function listClients(): Promise<ClientInfo[]> {
  const snap = await db().collection('clients').limit(50).get();
  return snap.docs
    .map(doc => {
      const d = doc.data();
      return {
        id: d.id ?? '',
        name: d.name ?? '',
        businessId: d.businessId ?? '',
        address: d.address ?? '',
        email: d.email ?? '',
        contactPerson: d.contactPerson ?? '',
        pricingModel: (d.pricingModel || 'hourly') as 'hourly' | 'fixed' | 'none',
        defaultHourlyRate: d.defaultHourlyRate ?? 0,
        createdAt: d.createdAt ?? '',
      };
    })
    .filter(c => c.id);
}

// ─────────────────────────────────────────────
// Invoices
// ─────────────────────────────────────────────
export interface Invoice {
  id: string;
  client: string;
  clientId: string;
  status: 'open' | 'closed';
  createdAt: string;
  closedAt: string;
  entries: string[];
  totalHours: number;
  totalPrice: number;
}

export async function saveInvoice(inv: Invoice): Promise<void> {
  await db().doc(`invoices/${inv.id}`).set({
    id: inv.id,
    client: inv.client,
    clientId: inv.clientId,
    status: inv.status,
    createdAt: inv.createdAt,
    closedAt: inv.closedAt,
    entries: inv.entries,
    totalHours: inv.totalHours,
    totalPrice: inv.totalPrice,
  });
}

export async function getInvoice(invoiceId: string): Promise<Invoice | null> {
  const snap = await db().doc(`invoices/${invoiceId}`).get();
  if (!snap.exists) return null;

  const d = snap.data()!;
  return {
    id: d.id ?? '',
    client: d.client ?? '',
    clientId: d.clientId ?? '',
    status: (d.status || 'open') as 'open' | 'closed',
    createdAt: d.createdAt ?? '',
    closedAt: d.closedAt ?? '',
    entries: d.entries ?? [],
    totalHours: d.totalHours ?? 0,
    totalPrice: d.totalPrice ?? 0,
  };
}

export async function listInvoices(statusFilter?: 'open' | 'closed'): Promise<Invoice[]> {
  const snap = await db().collection('invoices').limit(50).get();
  const all = snap.docs
    .map(doc => {
      const d = doc.data();
      return {
        id: d.id ?? '',
        client: d.client ?? '',
        clientId: d.clientId ?? '',
        status: (d.status || 'open') as 'open' | 'closed',
        createdAt: d.createdAt ?? '',
        closedAt: d.closedAt ?? '',
        entries: d.entries ?? [],
        totalHours: d.totalHours ?? 0,
        totalPrice: d.totalPrice ?? 0,
      };
    })
    .filter(inv => inv.id);

  if (statusFilter) return all.filter(inv => inv.status === statusFilter);
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

// ─────────────────────────────────────────────
// Time entries
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

export async function saveTimeEntry(entry: TimeEntry): Promise<void> {
  await db().doc(`timeEntries/${entry.id}`).set({
    id: entry.id,
    invoiceId: entry.invoiceId,
    client: entry.client,
    description: entry.description,
    location: entry.location,
    date: entry.date,
    hours: entry.hours,
    pricingModel: entry.pricingModel,
    hourlyRate: entry.hourlyRate,
    fixedPrice: entry.fixedPrice,
    totalPrice: entry.totalPrice,
    createdAt: entry.createdAt,
  });
}

export async function listTimeEntriesByInvoice(invoiceId: string): Promise<TimeEntry[]> {
  const snap = await db().collection('timeEntries').limit(100).get();
  return snap.docs
    .map(doc => {
      const d = doc.data();
      return {
        id: d.id ?? '',
        invoiceId: d.invoiceId ?? '',
        client: d.client ?? '',
        description: d.description ?? '',
        location: d.location ?? '',
        date: d.date ?? '',
        hours: d.hours ?? 0,
        pricingModel: (d.pricingModel || 'none') as 'hourly' | 'fixed' | 'none',
        hourlyRate: d.hourlyRate ?? 0,
        fixedPrice: d.fixedPrice ?? 0,
        totalPrice: d.totalPrice ?? 0,
        createdAt: d.createdAt ?? '',
      };
    })
    .filter(e => e.invoiceId === invoiceId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function deleteTimeEntry(entryId: string): Promise<void> {
  await db().doc(`timeEntries/${entryId}`).delete();
}
