import path from 'path';
import test from 'ava';
import sinon from 'sinon';
import transformContent, {
  removeUnwanted,
  rename,
  formatProperties,
  group
} from '../transform-content';

test('Unwanted files get removed', t => {
  const files = removeUnwanted({
    file: {},
    '.DS_Store': {},
    [`assets${path.sep}file.jpg`]: {},
    [`folder${path.sep}assets${path.sep}file.jpg`]: {}
  });
  t.deepEqual(files, {file: {}});
});

test('Files are renamed to follow the JSON naming format', t => {
  const files = rename({
    'file.html': {},
    'file-name': {},
    [`Folder${path.sep}file name.md`]: {}
  });
  t.deepEqual(files, {
    file: {},
    fileName: {},
    [`folder${path.sep}fileName`]: {}
  });
});

test('Files properties get correctly formatted', t => {
  const files = formatProperties({
    file: {
      contents: '',
      otherProps: '',
      mode: {},
      stats: {}
    }
  });
  t.deepEqual(files, {
    file: {
      contents: '',
      otherProps: ''
    }
  });
});

test('Files get grouped into sections and collections', t => {
  const files = group({
    file: {},
    [`section${path.sep}file`]: {},
    [`section${path.sep}fileTwo`]: {},
    [`sectionTwo${path.sep}file`]: {},
    [`sectionTwo${path.sep}fileTwo`]: {},
    [`collections${path.sep}collection${path.sep}file`]: {file: true},
    [`collections${path.sep}collection${path.sep}fileTwo`]: {fileTwo: true},
    [`collections${path.sep}collectionTwo${path.sep}file`]: {file: true},
    [`collections${path.sep}collectionTwo${path.sep}fileTwo`]: {fileTwo: true}
  });
  t.deepEqual(files, {
    file: {},
    section: {file: {}, fileTwo: {}},
    sectionTwo: {file: {}, fileTwo: {}},
    collection: [{file: true}, {fileTwo: true}],
    collectionTwo: [{file: true}, {fileTwo: true}]
  });
});

test('Content files get correctly transformed', async t => {
  const done = sinon.spy();
  const transform = transformContent({fileInfo: false});
  const files = {
    'file.md': {contents: '', mode: {}, stats: {}},
    '.DS_Store': {},
    [`assets${path.sep}file.jpg`]: {},
    [`section${path.sep}file.md`]: {},
    [`section${path.sep}file-two.md`]: {},
    [`collections${path.sep}collection${path.sep}file.html`]: {file: true},
    [`collections${path.sep}collection${path.sep}file-two.md`]: {fileTwo: true}
  };
  await transform(files, '' as any, done);
  t.deepEqual(files, {
    file: {contents: ''},
    section: {file: {}, fileTwo: {}},
    collection: [{file: true}, {fileTwo: true}]
  } as any);
  t.true(done.called);
});
