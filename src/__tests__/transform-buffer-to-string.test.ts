import test from 'ava';
import sinon from 'sinon';
import transformBufferToString from '../transform-buffer-to-string';

test('All content buffers are transformed into a string', t => {
  const buffer = Buffer.from('test', 'utf8');
  const done = sinon.spy();
  const transform = transformBufferToString();
  const files = {file: {contents: buffer}};
  transform(files, '' as any, done);
  t.true((files.file.contents as any) === 'test');
  t.true(done.called);
});

test('Ignored files do not have their content transformed', t => {
  const buffer = Buffer.from('test', 'utf8');
  const done = sinon.spy();
  const transform = transformBufferToString();
  const files = {
    '.DS_Store': {contents: buffer},
    'assets/test.jpg': {contents: buffer},
    file: {contents: buffer}
  };
  transform(files, '' as any, done);
  t.true(files['.DS_Store'].contents === buffer);
  t.true(files['assets/test.jpg'].contents === buffer);
  t.true((files.file.contents as any) === 'test');
  t.true(done.called);
});
