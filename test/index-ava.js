// simple tests with "ava": "^0.14.0",

import test from 'ava';
console.log('Start AVA tests!');

test.after('cleanup', t => {
  console.log('The end!');
});

test('bar', async t => {
  const bar = Promise.resolve('bar');
  t.is(await bar, 'bar');
});

test('foo', t => {
  t.pass();
});
