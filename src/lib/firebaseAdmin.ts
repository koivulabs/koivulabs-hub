// Firebase Admin SDK — server-side only (webhook handler, cron jobs)
// Admin SDK bypasses Firestore security rules, so writes work
// even when rules require authentication.

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth as AdminAuth } from 'firebase-admin/auth';

let adminApp: App;
let adminDb: Firestore;
let adminAuth: AdminAuth;

function getAdminApp(): App {
  if (!adminApp) {
    if (getApps().length === 0) {
      const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (!serviceAccountJson) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY env var not set');
      }

      let serviceAccount;
      try {
        serviceAccount = JSON.parse(serviceAccountJson);
      } catch (err) {
        // Dotenv expands \n in double-quoted env vars to actual newlines.
        // We escape actual newlines inside the private_key value to make it valid JSON.
        const sanitized = serviceAccountJson.replace(
          /("private_key"\s*:\s*")([\s\S]*?)"/g,
          (match, p1, p2) => p1 + p2.replace(/\r?\n/g, '\\n') + '"'
        );
        serviceAccount = JSON.parse(sanitized);
      }

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

export function getAdminAuth(): AdminAuth {
  if (!adminAuth) {
    adminAuth = getAuth(getAdminApp());
  }
  return adminAuth;
}

