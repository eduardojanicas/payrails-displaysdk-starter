import { NextResponse } from 'next/server';

// Minimal init route used by the Display SDK getting-started example.
// 1. Exchange client credentials for an access token.
// 2. Call Payrails /token/client/init with the instrument to reveal.
// 3. Return the JSON straight to the frontend.

export async function POST(request: Request) {
    const baseUrl = process.env.PAYRAILS_BASE_URL || 'https://api.payrails.com';
    const clientId = requiredEnv('PAYRAILS_CLIENT_ID');
    const clientSecret = requiredEnv('PAYRAILS_CLIENT_SECRET');

    // Accept any of: instrumentId, recordId, recordAlias, aliases[] (comma separated list) per docs
    let body: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
    try { body = await request.json(); } catch { /* ignore */ }

    const { instrumentId, recordId, recordAlias } = body;
    const aliases: string[] = Array.isArray(body.aliases)
        ? body.aliases
        : (typeof body.aliases === 'string' && body.aliases.trim().length
                ? body.aliases.split(',').map((s: string) => s.trim()).filter(Boolean)
                : []);

    // Build minimal payload including only provided identifiers.
    const initPayload: Record<string, unknown> = { type: 'reveal', auditData: 'demo' };
    if (instrumentId) initPayload.instrumentId = instrumentId;
    if (recordId) initPayload.recordId = recordId;
    if (recordAlias) initPayload.recordAlias = recordAlias;
    if (aliases.length) initPayload.aliases = aliases;

    try {
        // Step 1: OAuth token
        const tokenRes = await fetch(`${baseUrl}/auth/token/${clientId}`, {
            method: 'POST',
            headers: { Accept: 'application/json', 'x-api-key': clientSecret },
        });
        if (!tokenRes.ok) return fail('Failed to fetch access token', 502, await tokenRes.text());
        const { access_token } = await tokenRes.json() as { access_token: string };

        // Step 2: Display init
        const initRes = await fetch(`${baseUrl}/token/client/init`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${access_token}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'x-idempotency-key': crypto.randomUUID(),
            },
            body: JSON.stringify(initPayload),
        });
        if (!initRes.ok) return fail('Init request failed', 502, await initRes.text());

        const config = await initRes.json();
        return NextResponse.json(config);
    } catch (err) {
        return fail('Server error', 500, (err as Error).message);
    }
}

function requiredEnv(name: string) {
    const v = process.env[name];
    if (!v) throw new Error(`Missing required env var: ${name}`);
    return v;
}

function fail(message: string, status: number, details?: string) {
    return NextResponse.json({ error: message, details }, { status });
}
