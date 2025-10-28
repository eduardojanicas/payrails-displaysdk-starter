"use client";

import { useEffect, useState } from 'react';
import { DisplaySDK, DisplaySDKOptions, DisplayElementType } from '@payrails/display-sdk';

// --- Display SDK Getting Started Example ----------------------------------
// 1. Collect ONE of: instrumentId, recordId, recordAlias, or aliases (comma separated).
// 2. Call your backend route (/api/init) to obtain the initialization payload
//    returned from Payrails /token/client/init (it forwards whichever identifier you provided).
// 3. Initialize the SDK with that payload and optional configuration.
// 4. Create the elements you need and mount them into containers.
// 5. Destroy the SDK instance on unmount or when re-initializing.
// ---------------------------------------------------------------------------

// Optional styling & translations.
const options: DisplaySDKOptions = {
  styles: {
    base: {
      fontSize: '16px',
      fontFamily: "ui-sans-serif, system-ui, 'Helvetica Neue', Arial, sans-serif",
    },
  },
  translations: {
    base: { loading: 'Loading…' },
  },
};

export default function Home() {
  // Identifier inputs (only one is required for a basic reveal)
  const [instrumentId, setInstrumentId] = useState('');
  const [recordId, setRecordId] = useState('');
  const [recordAlias, setRecordAlias] = useState('');
  const [aliases, setAliases] = useState(''); // comma separated
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sdk, setSdk] = useState<DisplaySDK | null>(null);

  async function initialize() {
  // Require at least one identifier
  const hasId = instrumentId || recordId || recordAlias || aliases.trim();
  if (!hasId) return;
    setLoading(true);
    setError(null);
    try {
      // Destroy previous instance if re-running with a different instrument.
      if (sdk) {
        try { sdk.destroy(); } catch { /* ignore double-destroy */ }
        setSdk(null);
        // Do not manually clear container innerHTML to avoid removing nodes SDK will attempt to clean up.
      }

      const res = await fetch('/api/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instrumentId: instrumentId || undefined,
          recordId: recordId || undefined,
            recordAlias: recordAlias || undefined,
          aliases: aliases.trim() ? aliases : undefined,
        }),
      });
      if (!res.ok) throw new Error('Init request failed');
      const initResponse = await res.json();

      const instance = DisplaySDK.init(initResponse, options);
      setSdk(instance);

      // Create and mount elements. Mount accepts the container id (string).
      instance.createElement(DisplayElementType.CardNumber).mount('#card-number');
      instance.createElement(DisplayElementType.ExpiryMonth).mount('#expiry-month');
      instance.createElement(DisplayElementType.ExpiryYear).mount('#expiry-year');
      instance.createElement(DisplayElementType.SecurityCode).mount('#security-code');
      instance.createElement(DisplayElementType.CardHolderName).mount('#card-holder-name');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      if (sdk) {
        try { sdk.destroy(); } catch { /* ignore */ }
      }
    };
  }, [sdk]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="w-full space-y-4">
          <fieldset className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="instrumentId" className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">instrumentId</label>
              <input id="instrumentId" value={instrumentId} onChange={e => setInstrumentId(e.target.value)} placeholder="inst_..." className="mt-1 w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100" />
            </div>
            <div>
              <label htmlFor="recordId" className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">recordId</label>
              <input id="recordId" value={recordId} onChange={e => setRecordId(e.target.value)} placeholder="rec_..." className="mt-1 w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100" />
            </div>
            <div>
              <label htmlFor="recordAlias" className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">recordAlias</label>
              <input id="recordAlias" value={recordAlias} onChange={e => setRecordAlias(e.target.value)} placeholder="customer_primary" className="mt-1 w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100" />
            </div>
            <div>
              <label htmlFor="aliases" className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">aliases (comma separated)</label>
              <input id="aliases" value={aliases} onChange={e => setAliases(e.target.value)} placeholder="alias1, alias2" className="mt-1 w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100" />
            </div>
          </fieldset>
          <button
            type="button"
            disabled={loading || !(instrumentId || recordId || recordAlias || aliases.trim())}
            onClick={initialize}
            className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-400 dark:bg-zinc-200 dark:text-black"
          >
            {loading ? 'Initializing…' : 'Initialize SDK'}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        {/* Containers the SDK will mount into. IDs referenced in initialize(). */}
        <div className="mt-8 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">Card Number</h2>
            <div id="card-number" className="rounded border border-zinc-300 p-2 dark:border-zinc-700" />
          </div>
          <div>
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">Expiry Month</h2>
            <div id="expiry-month" className="rounded border border-zinc-300 p-2 dark:border-zinc-700" />
          </div>
          <div>
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">Expiry Year</h2>
            <div id="expiry-year" className="rounded border border-zinc-300 p-2 dark:border-zinc-700" />
          </div>
          <div>
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">Security Code</h2>
            <div id="security-code" className="rounded border border-zinc-300 p-2 dark:border-zinc-700" />
          </div>
          <div>
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">Cardholder Name</h2>
            <div id="card-holder-name" className="rounded border border-zinc-300 p-2 dark:border-zinc-700" />
          </div>
        </div>
      </main>
    </div>
  );
}
