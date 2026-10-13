import test from 'node:test';
import assert from 'node:assert/strict';
import { computeTotals } from '../../src/core/pricing';
import { addDays, isValidIsoDate, time12h, shortTime } from '../../src/core/dates';
import { parseBookingError } from '../../src/core/errors';
import { availableDates, groupSlotsByDate } from '../../src/core/slots';
import { parseBlocks } from '../../src/core/blocks';
import { formatMoney } from '../../src/core/money';

test('computeTotals suma precio y viajeros', () => {
  const opts = [
    { id: 'a', priceCents: 290000, travelersPerUnit: 1, maxQuantity: 5 },
    { id: 'b', priceCents: 390000, travelersPerUnit: 2, maxQuantity: 5 },
  ];
  const t = computeTotals(opts, [{ optionId: 'a', quantity: 1 }, { optionId: 'b', quantity: 2 }]);
  assert.equal(t.totalCents, 290000 + 780000);
  assert.equal(t.travelers, 5);
});
test('computeTotals ignora opciones desconocidas y limita cantidad', () => {
  const opts = [{ id: 'a', priceCents: 100, travelersPerUnit: 1, maxQuantity: 2 }];
  const t = computeTotals(opts, [{ optionId: 'x', quantity: 3 }, { optionId: 'a', quantity: 9 }]);
  assert.deepEqual(t, { totalCents: 200, travelers: 2 });
});
test('fechas', () => {
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addDays('2026-03-01', -1), '2026-02-28');
  assert.ok(isValidIsoDate('2026-10-13'));
  assert.ok(!isValidIsoDate('2026-02-30'));
  assert.equal(time12h('09:00'), '9:00 AM');
  assert.equal(time12h('13:30'), '1:30 PM');
  assert.equal(time12h('00:15'), '12:15 AM');
  assert.equal(shortTime('09:00:00'), '09:00');
});
test('parseBookingError', () => {
  assert.equal(parseBookingError('P0001: sold_out'), 'sold_out');
  assert.equal(parseBookingError('boom'), 'unknown');
  assert.equal(parseBookingError(null), 'unknown');
});
test('slots', () => {
  const s = [
    { date: '2026-10-20', time: '11:00', scheduleId: '1', capacity: 10, booked: 9, remaining: 1 },
    { date: '2026-10-20', time: '09:00', scheduleId: '2', capacity: 10, booked: 0, remaining: 10 },
    { date: '2026-10-21', time: '09:00', scheduleId: '2', capacity: 10, booked: 10, remaining: 0 },
  ];
  assert.equal(groupSlotsByDate(s).get('2026-10-20')![0].time, '09:00');
  assert.deepEqual([...availableDates(s, 2)], ['2026-10-20']);
  assert.deepEqual([...availableDates(s, 1)], ['2026-10-20']);
});
test('parseBlocks filtra basura', () => {
  const b = parseBlocks([{ type: 'p', text: 'hola' }, { type: 'list', items: ['a', 3, 'b'] }, null, { type: 'x' }]);
  assert.equal(b.length, 2);
  assert.deepEqual((b[1] as any).items, ['a', 'b']);
});
test('formatMoney', () => {
  assert.match(formatMoney(290000), /2,900/);
});

import { textToBlocks, blocksToText } from '../../src/core/blocks';
test('texto <-> bloques (ida y vuelta)', () => {
  const src = 'Hola mundo\n\n## Subtítulo\n\nQué vas a vivir:\n- Uno\n- Dos\n\nCierre';
  const blocks = textToBlocks(src);
  assert.equal(blocks.length, 4);
  assert.deepEqual(blocks[2], { type: 'list', title: 'Qué vas a vivir', items: ['Uno', 'Dos'] });
  assert.equal(blocksToText(blocks), src);
  assert.deepEqual(textToBlocks('  \n\n '), []);
});
