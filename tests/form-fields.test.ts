import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { parseCalendarDate, serializeCalendarDate, calendarLabel } from '../src/lib/date-fields.ts';
import { formValue, validateFields } from '../src/lib/form-validation.ts';

test('calendar dates round-trip local components without UTC conversion', () => {
  for (const value of ['2026-10-08', '2024-02-29', '2026-09-06', '2026-01-01']) {
    const date = parseCalendarDate(value)!;
    assert.equal(date.getFullYear(), Number(value.slice(0, 4)));
    assert.equal(date.getMonth() + 1, Number(value.slice(5, 7)));
    assert.equal(date.getDate(), Number(value.slice(8)));
    assert.equal(serializeCalendarDate(date), value);
  }
  assert.equal(serializeCalendarDate(new Date(2026, 9, 8, 23, 59)), '2026-10-08');
});

test('calendar serialization is unchanged west and east of UTC and at DST boundaries', () => {
  const moduleUrl = new URL('../src/lib/date-fields.ts', import.meta.url).href;
  const source = `import {parseCalendarDate,serializeCalendarDate} from ${JSON.stringify(moduleUrl)};
    for (const value of ['2026-09-06', '2026-04-05', '2026-01-01']) {
      if (serializeCalendarDate(parseCalendarDate(value)) !== value) process.exit(1);
    }
    if (serializeCalendarDate(new Date(2026, 9, 8, 23, 59)) !== '2026-10-08') process.exit(2);`;
  for (const TZ of ['America/Santiago', 'Pacific/Kiritimati', 'America/Los_Angeles']) {
    const result = spawnSync(process.execPath, ['--experimental-strip-types', '--input-type=module', '-e', source], {
      env: { ...process.env, TZ }, encoding: 'utf8',
    });
    assert.equal(result.status, 0, `${TZ}: ${result.stderr}`);
  }
});

test('empty and malformed dates never roll over into another calendar day', () => {
  for (const value of ['', '2026-02-29', '2026-04-31', '2026-13-01', '2026-00-01', '2026-10-00', '26-10-08', '2026-10-08T00:00:00Z']) {
    assert.equal(parseCalendarDate(value), undefined, value);
  }
  assert.equal(serializeCalendarDate(undefined), '');
  assert.equal(serializeCalendarDate(new Date(NaN)), '');
  assert.equal(calendarLabel(''), 'Seleccione fecha');
  assert.equal(calendarLabel('invalid'), 'Seleccione fecha');
  assert.match(calendarLabel('2026-10-08'), /octubre/);
});

test('serialization preserves existing names, trim behavior and null placeholders', () => {
  const data = new FormData();
  data.set('project', ' p1 ');
  data.set('due', '2026-10-08');
  data.set('responsible', '');
  assert.equal(formValue(data, 'project'), 'p1');
  assert.equal(formValue(data, 'due'), '2026-10-08');
  assert.equal(formValue(data, 'responsible'), '');
  assert.equal(formValue(data, 'missing'), '');
  assert.deepEqual([...data.keys()], ['project', 'due', 'responsible']);
});

test('required custom controls reject empty/whitespace, invalid dates and unchecked confirmation', () => {
  const rules = [
    { name: 'project', label: 'Proyecto', required: true },
    { name: 'due', label: 'Fecha', required: true, date: true },
    { name: 'confirmed', label: 'Confirmación', required: true, checkbox: true },
  ];
  assert.deepEqual(Object.keys(validateFields({ project: ' ', due: '2026-02-29', confirmed: false }, rules)), ['project', 'due', 'confirmed']);
  assert.deepEqual(validateFields({ project: 'p1', due: '2026-10-08', confirmed: true }, rules), {});
  assert.ok(validateFields({ confirmed: 'true' }, [rules[2]]).confirmed);
  assert.deepEqual(validateFields({ due: '' }, [{ name: 'due', label: 'Desde', date: true }]), {});
  assert.ok(validateFields({ due: 'invalid' }, [{ name: 'due', label: 'Desde', date: true }]).due);
});
