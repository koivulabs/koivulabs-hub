// Edge-runtime safe Firebase ID token verification.
//
// Verifies the JWT against Google's JWKS, then checks issuer, audience, exp,
// and the `admin` custom claim. firebase-admin SDK does not run in Next.js
// edge middleware, so we use jose + the public JWKS endpoint instead.

import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
function getJWKS() {
    if (!jwks) jwks = createRemoteJWKSet(new URL(JWKS_URL));
    return jwks;
}

export interface AdminTokenPayload extends JWTPayload {
    email?: string;
    admin?: boolean;
}

export async function verifyAdminToken(token: string, projectId: string): Promise<AdminTokenPayload | null> {
    try {
        const { payload } = await jwtVerify(token, getJWKS(), {
            issuer: `https://securetoken.google.com/${projectId}`,
            audience: projectId,
        });

        const claims = payload as AdminTokenPayload;
        if (claims.admin !== true) return null;
        return claims;
    } catch {
        return null;
    }
}
