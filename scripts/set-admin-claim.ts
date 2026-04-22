// One-time script: grant { admin: true } custom claim to a Firebase Auth user.
//
// Usage (from repo root, with FIREBASE_SERVICE_ACCOUNT_KEY env var set):
//   npx tsx scripts/set-admin-claim.ts <email>
//
// After running, the user must sign out and sign back in for the claim to
// appear in their ID token. Firestore rules then grant write access.

import * as fs from 'fs';
import * as path from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Manually parse .env.local to avoid dotenv's newline-expansion turning
// the escaped \n inside FIREBASE_SERVICE_ACCOUNT_KEY into real newlines
// (which makes JSON.parse choke on control chars inside strings).
function loadServiceAccountFromEnvFile(): string | null {
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) return null;
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/^FIREBASE_SERVICE_ACCOUNT_KEY\s*=\s*"([\s\S]*?)"\s*$/m);
    return match ? match[1] : null;
}

async function main() {
    const email = process.argv[2];
    if (!email) {
        console.error('Usage: tsx scripts/set-admin-claim.ts <email>');
        process.exit(1);
    }

    const serviceAccountJson =
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY || loadServiceAccountFromEnvFile();
    if (!serviceAccountJson) {
        console.error('FIREBASE_SERVICE_ACCOUNT_KEY not found in env or .env.local');
        process.exit(1);
    }

    if (getApps().length === 0) {
        initializeApp({ credential: cert(JSON.parse(serviceAccountJson)) });
    }

    const auth = getAuth();
    const user = await auth.getUserByEmail(email);
    await auth.setCustomUserClaims(user.uid, { admin: true });

    console.log(`Admin claim set for ${email} (uid=${user.uid}).`);
    console.log('User must sign out and sign back in to receive a new ID token.');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
