import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Nav, Card, Button } from '@/components';

// UI helper components (local to this page)
function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '6px 10px',
      borderRadius: 9999,
      fontSize: 13,
      fontWeight: 600,
      color,
      background: bg,
    }}>{label}</span>
  );
}

function StatusPill({ success, exitCode }: { success: boolean; exitCode: number }) {
  return (
    <div style={{ marginTop: 8 }}>
      <Badge
        label={`${success ? 'Success' : 'Failure'} (exit code ${exitCode})`}
        color={success ? '#166534' : '#991b1b'}
        bg={success ? '#dcfce7' : '#fee2e2'}
      />
    </div>
  );
}

function ExpandableCard({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <Card variant="outlined" padding="large">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <Button variant="outline" size="small" onClick={() => setOpen(!open)}>
          {open ? 'Hide' : 'Show'}
        </Button>
      </div>
      {open && <div style={{ marginTop: 12 }}>{children}</div>}
    </Card>
  );
}

function Spinner() {
  return (
    <svg width="18" height="18" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" stroke="#6b7280" aria-label="Loading">
      <g fill="none" fillRule="evenodd">
        <g transform="translate(1 1)" strokeWidth="2">
          <circle strokeOpacity=".3" cx="18" cy="18" r="18" />
          <path d="M36 18c0-9.94-8.06-18-18-18">
            <animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="1s" repeatCount="indefinite" />
          </path>
        </g>
      </g>
    </svg>
  );
}

function BadgeDefinitions() {
  // Placeholder to enable consistent styles via global CSS, if needed later
  return null;
}

interface RunResponse {
  success: boolean;
  exit_code: number;
  stdout: string;
  stderr: string;
  results: any | null;
}

export default function TestResultsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RunResponse | null>(null);

  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<any | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [avgDurationMs, setAvgDurationMs] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const v = window.localStorage.getItem('e2e_avg_duration_ms');
      return v ? parseInt(v, 10) : 90_000; // default 90s
    }
    return 90_000;
  });

  // Keep timer refs to clean up
  const timerRef = React.useRef<number | null>(null);
  const pollRef = React.useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, []);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);
    setJobId(null);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      // Start background job
      const startRes = await fetch(`${base}/api/v1/e2e-tests/start`, { method: 'POST' });
      if (!startRes.ok) {
        // Fallback: if background endpoint not available (404), run synchronously
        if (startRes.status === 404) {
          const runRes = await fetch(`${base}/api/v1/e2e-tests/run`, { method: 'POST' });
          if (!runRes.ok) {
            let message = `Run failed (${runRes.status})`;
            try {
              const errJson = await runRes.json();
              if (errJson?.detail) message += `: ${errJson.detail}`;
            } catch {
              const text = await runRes.text();
              if (text) message += `: ${text}`;
            }
            throw new Error(message);
          }
          const runJson = await runRes.json();
          setData(runJson);
          setLoading(false);
          return;
        }
        let message = `Start failed (${startRes.status})`;
        try {
          const errJson = await startRes.json();
          if (errJson?.detail) message += `: ${errJson.detail}`;
        } catch {
          const text = await startRes.text();
          if (text) message += `: ${text}`;
        }
        throw new Error(message);
      }
      const startJson = await startRes.json();
      const newJobId = startJson.job_id as string;
      setJobId(newJobId);

      // Poll for status
      const startTime = Date.now();
      setElapsedMs(0);
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => setElapsedMs(Date.now() - startTime), 1000);

      const poll = async (): Promise<void> => {
        const statusRes = await fetch(`${base}/api/v1/e2e-tests/status/${newJobId}`);
        if (!statusRes.ok) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          throw new Error(`Status failed (${statusRes.status})`);
        }
        const statusJson = await statusRes.json();
        setJobStatus(statusJson);
        if (statusJson.status === 'queued' || statusJson.status === 'running') {
          // schedule next poll
          pollRef.current = window.setTimeout(poll, 2000) as unknown as number;
          return;
        }
        // finished
        if (timerRef.current) window.clearInterval(timerRef.current);
        if (pollRef.current) window.clearTimeout(pollRef.current);
        setData(statusJson);
        setLoading(false);
        // update rolling avg
        if (statusJson.started_at && statusJson.finished_at) {
          try {
            const duration = new Date(statusJson.finished_at).getTime() - new Date(statusJson.started_at).getTime();
            const newAvg = Math.round((0.7 * avgDurationMs) + (0.3 * duration));
            setAvgDurationMs(newAvg);
            if (typeof window !== 'undefined') window.localStorage.setItem('e2e_avg_duration_ms', String(newAvg));
          } catch {}
        }
      };

      // Kick off polling loop without awaiting
      poll();
      return;
    } catch (err: any) {
      setError(err?.message || 'Failed to run tests');
    } finally {
      // if completed, fetchResults sets loading false; keep true during queue/running
    }
  }, []);

  const startedRef = React.useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    fetchResults();
  }, [fetchResults]);

  const summary = useMemo(() => {
    const r = data?.results;
    if (!r) return null;

    // Attempt to derive stats in a version-tolerant way
    let total = 0;
    let passed = 0;
    let failed = 0;
    let skipped = 0;

    function visitSuite(suite: any) {
      if (!suite) return;
      // Playwright JSON can have specs/tests under suites
      if (Array.isArray(suite.specs)) {
        for (const spec of suite.specs) {
          if (Array.isArray(spec.tests)) {
            for (const t of spec.tests) {
              total += 1;
              const status = t.outcome || t.status || t.result?.status;
              if (status === 'skipped' || status === 'timedOut' || status === 'interrupted') {
                skipped += 1;
              } else if (status === 'passed') {
                passed += 1;
              } else if (status === 'failed') {
                failed += 1;
              } else {
                // unknown statuses -> count as failed to be conservative
                failed += 1;
              }
            }
          }
        }
      }
      if (Array.isArray(suite.suites)) {
        for (const child of suite.suites) visitSuite(child);
      }
    }

    if (Array.isArray(r.suites)) {
      for (const s of r.suites) visitSuite(s);
    } else if ((r as any).suite) {
      visitSuite((r as any).suite);
    }

    return { total, passed, failed, skipped };
  }, [data]);

  const failures = useMemo(() => {
    const r = data?.results;
    if (!r) return [] as Array<{ title: string; file?: string; error?: string; durationMs?: number }>;
    const out: Array<{ title: string; file?: string; error?: string; durationMs?: number }> = [];

    function collectFailuresFromTest(test: any, spec?: any) {
      const title = test.title || spec?.title || 'Unnamed test';
      const file = spec?.file || spec?.location?.file || test.location?.file;
      const status = test.outcome || test.status || test.result?.status;
      if (status === 'failed') {
        let error: string | undefined;
        let durationMs: number | undefined;
        if (Array.isArray(test.results) && test.results.length) {
          for (const res of test.results) {
            if (res.status === 'failed' && res.error) {
              error = res.error.message || JSON.stringify(res.error);
              durationMs = res.duration;
              break;
            }
          }
        }
        out.push({ title, file, error, durationMs });
      }
    }

    function visitSuiteForFailures(suite: any) {
      if (!suite) return;
      if (Array.isArray(suite.specs)) {
        for (const spec of suite.specs) {
          if (Array.isArray(spec.tests)) {
            for (const t of spec.tests) collectFailuresFromTest(t, spec);
          }
        }
      }
      if (Array.isArray(suite.suites)) {
        for (const child of suite.suites) visitSuiteForFailures(child);
      }
    }

    if (Array.isArray(r.suites)) {
      for (const s of r.suites) visitSuiteForFailures(s);
    } else if ((r as any).suite) {
      visitSuiteForFailures((r as any).suite);
    }

    return out;
  }, [data]);

  return (
    <div>
      {/* Local UI helpers for formatting */}
      <BadgeDefinitions />
      <Nav
        items={[
          { label: 'Home', href: '/', active: false },
          { label: 'API Docs', href: 'http://localhost:8000/docs', active: false },
          { label: 'Test Results', href: '/test-results', active: true },
        ]}
      />
      <div style={{ padding: '32px 20px', maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: 12 }}>E2E Test Results</h1>
        <p style={{ color: '#6b7280', marginBottom: 20 }}>Run Playwright tests against the backend and view results. This may take a minute.</p>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '12px 0 24px' }}>
          <Button onClick={fetchResults} disabled={loading}>
            {loading ? 'Running tests…' : 'Re-run E2E tests'}
          </Button>
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#6b7280' }}>
              <Spinner />
              <span>
                {jobStatus?.status === 'queued' ? 'Queued' : 'Running'} · Elapsed {Math.floor(elapsedMs / 1000)}s · ETA {Math.max(0, Math.ceil((avgDurationMs - elapsedMs) / 1000))}s
              </span>
            </div>
          )}
        </div>

        {error && (
          <Card variant="outlined" padding="medium" className="error-card">
            <h2 style={{ marginTop: 0 }}>Error</h2>
            <p style={{ color: '#991b1b' }}>{error}</p>
          </Card>
        )}

        {data && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            <Card title="Summary" variant="elevated" padding="large">
              {summary ? (
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <Badge label={`Total ${summary.total}`} color="#1f2937" bg="#e5e7eb" />
                  <Badge label={`Passed ${summary.passed}`} color="#166534" bg="#dcfce7" />
                  <Badge label={`Failed ${summary.failed}`} color="#991b1b" bg="#fee2e2" />
                  <Badge label={`Skipped ${summary.skipped}`} color="#92400e" bg="#fef3c7" />
                </div>
              ) : (
                <p>No structured summary available. See raw output below.</p>
              )}
              <div style={{ marginTop: 8 }}>
                <StatusPill success={(data as any)?.success ?? ((data as any)?.status === 'succeeded')} exitCode={(data as any)?.exit_code ?? -1} />
              </div>
            </Card>

            <ExpandableCard title="Stdout" defaultOpen>
              <pre style={{ whiteSpace: 'pre-wrap', background: '#f9fafb', padding: 12, borderRadius: 8, maxHeight: 400, overflow: 'auto', margin: 0 }}>{data.stdout || '—'}</pre>
            </ExpandableCard>

            {data.stderr && (
              <ExpandableCard title="Stderr">
                <pre style={{ whiteSpace: 'pre-wrap', background: '#fff7ed', padding: 12, borderRadius: 8, maxHeight: 300, overflow: 'auto', margin: 0 }}>{data.stderr}</pre>
              </ExpandableCard>
            )}

            {failures.length > 0 && (
              <Card title={`Failures (${failures.length})`} variant="outlined" padding="large">
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
                  {failures.map((f, i) => (
                    <li key={i} style={{ border: '1px solid #fecaca', background: '#fff1f2', borderRadius: 8, padding: 12 }}>
                      <div style={{ fontWeight: 600, color: '#991b1b' }}>{f.title}</div>
                      {f.file && <div style={{ color: '#6b7280', fontSize: 13 }}>{f.file}</div>}
                      {typeof f.durationMs === 'number' && (
                        <div style={{ color: '#6b7280', fontSize: 13 }}>Duration: {f.durationMs}ms</div>
                      )}
                      {f.error && (
                        <pre style={{ whiteSpace: 'pre-wrap', background: '#fef2f2', padding: 10, borderRadius: 6, marginTop: 8 }}>{f.error}</pre>
                      )}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            <ExpandableCard title="Raw JSON Results">
              <pre style={{ whiteSpace: 'pre-wrap', background: '#eef2ff', padding: 12, borderRadius: 8, maxHeight: 500, overflow: 'auto', margin: 0 }}>{JSON.stringify(data.results, null, 2)}</pre>
            </ExpandableCard>
          </div>
        )}

        {!data && !loading && !error && (
          <Card variant="outlined" padding="large">
            <p>No results to display yet. Click "Re-run E2E tests" to start.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
