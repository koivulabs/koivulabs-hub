// Firebase Admin SDK — server-side only (webhook handler, cron jobs)
// Admin SDK bypasses Firestore security rules, so writes work
// even when rules require authentication.

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let adminApp: App;
let adminDb: Firestore;

function getAdminApp(): App {
  if (!adminApp) {
    if (getApps().length === 0) {
      const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (!serviceAccountJson) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY env var not set');
      }
      const serviceAccount = JSON.parse(serviceAccountJson);
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } else {
      adminApp = getApps()[0];
    }
  }
  return adminApp;
}

export function getAdminDb(): Firestore {
  if (!adminDb) {
    adminDb = getFirestore(getAdminApp());
  }
  return adminDb;
}
