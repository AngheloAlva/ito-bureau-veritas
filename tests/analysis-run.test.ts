import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSeed } from '../src/data/seed.ts';
import { analyze } from '../src/domain/core.ts';
import { createAnalysisRun, type Scheduler } from '../src/lib/analysis-run.ts';

const AT = '2026-10-08T12:00:00.000Z';
function fixture() {
  let now = 0;
  const jobs: { at: number; callback: () => void; cancelled: boolean }[] = [];
  const scheduler: Scheduler = {
    schedule(callback, delay) {
      const job = { at: now + delay, callback, cancelled: false };
      jobs.push(job);
      return () => { job.cancelled = true; };
    },
  };
  const saved: ReturnType<typeof analyze>[] = [];
  const controller = createAnalysisRun(scheduler, (_key, result) => saved.push(result), () => AT);
  const data = createSeed();
  controller.setContext('p1', data.version);
  function advance(ms: number) {
    now += ms;
    for (const job of jobs.filter(job => !job.cancelled && job.at <= now)) {
      job.cancelled = true;
      job.callback();
    }
  }
  return { controller, data, saved, jobs, advance };
}

test('ordered stages reveal one captured deterministic result and save only on completion', () => {
  const f = fixture();
  const original = structuredClone(f.data);
  const stages: number[] = [];
  f.controller.subscribe(() => stages.push(f.controller.getSnapshot().stage));
  f.controller.start(f.data, 'p1');
  assert.equal(f.controller.getSnapshot().stage, 0);
  f.advance(800);
  assert.equal(f.controller.getSnapshot().stage, 1);
  assert.deepEqual(f.controller.getSnapshot().result, analyze(original, 'p1', AT));
  f.advance(800);
  f.advance(800);
  assert.equal(f.saved.length, 0);
  f.advance(800);
  assert.deepEqual(stages, [0, 1, 2, 3, 4]);
  assert.deepEqual(f.saved, [analyze(original, 'p1', AT)]);
  assert.deepEqual(f.data, original);
});

for (const reason of ['cancel', 'dispose', 'scope', 'version'] as const) {
  test(`${reason} invalidates timers, including already queued late callbacks`, () => {
    const f = fixture();
    f.controller.start(f.data, 'p1');
    if (reason === 'cancel') f.controller.cancel();
    if (reason === 'dispose') f.controller.dispose();
    if (reason === 'scope') f.controller.setContext('p2', f.data.version);
    if (reason === 'version') f.controller.setContext('p1', f.data.version + 1);
    assert.ok(f.jobs.every(job => job.cancelled));
    for (const job of f.jobs) job.callback();
    assert.equal(f.saved.length, 0);
    assert.equal(f.controller.getSnapshot().running, false);
    if (reason === 'version') assert.equal(f.controller.getSnapshot().reason, 'changed');
  });
}

test('superseding run rejects late completion without mutating prior cached analysis', () => {
  const f = fixture();
  f.controller.start(f.data, 'p1');
  f.advance(3200);
  const prior = structuredClone(f.saved[0]);
  f.controller.start(f.data, 'p1');
  const oldJobs = [...f.jobs];
  f.controller.start(f.data, 'p1');
  for (const job of oldJobs) job.callback();
  assert.equal(f.saved.length, 1);
  f.advance(3200);
  assert.equal(f.saved.length, 2);
  assert.deepEqual(f.saved[0], prior);
});

test('snapshot is isolated from later input mutation and explicit empty scope means portfolio', () => {
  const f = fixture();
  f.controller.setContext('cartera', f.data.version);
  const original = structuredClone(f.data);
  f.controller.start(f.data, '');
  f.data.findings[0].title = 'Later input';
  f.advance(3200);
  assert.deepEqual(f.saved[0], analyze(original, undefined, AT));
  assert.equal(f.saved[0].projectId, undefined);
});

test('persistent owner invalidates version without an active page and rejects mismatched start', () => {
  const f = fixture();
  f.controller.start(f.data, 'p2');
  assert.equal(f.jobs.length, 0);
  f.controller.start(f.data, 'p1');
  f.controller.invalidateVersion(f.data.version + 1);
  assert.equal(f.controller.getSnapshot().reason, 'changed');
  f.controller.start(f.data, 'p1');
  for (const job of f.jobs) job.callback();
  assert.equal(f.saved.length, 0);
});

test('duplicate and out-of-order callbacks cannot regress progress or publish twice', () => {
  const f = fixture();
  f.controller.start(f.data, 'p1');
  f.jobs[2].callback();
  f.jobs[0].callback();
  assert.equal(f.controller.getSnapshot().stage, 3);
  f.jobs[3].callback();
  f.jobs[3].callback();
  assert.equal(f.saved.length, 1);
  assert.equal(f.controller.getSnapshot().stage, 4);
});
