const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
    console.error("Usage: node scripts/create-admin.js <email> <password>");
    process.exit(1);
}

const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
    console.error("No .env.local file found at", envPath);
    process.exit(1);
}
const content = fs.readFileSync(envPath, 'utf8');
const match = content.match(/^FIREBASE_SERVICE_ACCOUNT_KEY\s*=\s*"([\s\S]*?)"\s*$/m);
if (!match) {
    console.error("No service account key found in .env.local");
    process.exit(1);
}

// Parse service account
const jsonStr = match[1].replace(/\\n/g, '\n').replace(/"private_key":\s*"([^"]+)"/, (m, key) => {
    return `"private_key": "${key.replace(/\n/g, '\\n')}"`;
});
const serviceAccount = JSON.parse(jsonStr);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();

async function run() {
    let user;
    try {
        // Check if user already exists
        user = await auth.getUserByEmail(email);
        console.log(`User ${email} already exists. Updating password...`);
        user = await auth.updateUser(user.uid, { password });
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            console.log(`User ${email} not found. Creating new user...`);
            user = await auth.createUser({
                email,
                password,
                emailVerified: true
            });
        } else {
            throw error;
        }
    }

    // Set custom claim admin: true
    await auth.setCustomUserClaims(user.uid, { admin: true });
    console.log(`SUCCESS: Admin claims (admin: true) set for ${email}.`);
    console.log(`You can now log in using this email and password!`);
}

run().catch(err => {
    console.error("Error creating/updating admin user:", err);
    process.exit(1);
});
