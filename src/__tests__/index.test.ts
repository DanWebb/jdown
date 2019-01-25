import anyTest, {TestInterface} from 'ava';
import fs from 'fs';
import util from 'util';
import marked from 'marked';
import jdown from '..';

const readDir = util.promisify(fs.readdir);

const test = anyTest as TestInterface<{content: {[index: string]: any}}>;

test.before(async t => {
  const renderer = new marked.Renderer();

  renderer.heading = (text, level) => {
    return `<h${level} class="a-header">${text}</h${level}>`;
  };

  t.context.content = await jdown('src/__tests__/content', {
    markdown: {renderer},
    assets: {output: './src/__tests__/public'}
  });

  return;
});

test('Top level files will turned into an object', t => {
  t.is(typeof t.context.content.about, 'object');
});

test('Files contained within top level directories will be grouped into an object', t => {
  t.is(typeof t.context.content.home, 'object');
  t.is(typeof t.context.content.home.anotherSection, 'object');
  t.is(typeof t.context.content.home.introduction, 'object');
});

test('Files contained within folders of the collections directory will be turned into an array of objects', t => {
  t.true(Array.isArray(t.context.content.journal));
  t.true(Array.isArray(t.context.content.work));
  t.is(typeof t.context.content.journal[0], 'object');
});

test('File names will be transformed to camelCase and used as property names', t => {
  t.is(typeof t.context.content.home.anotherSection, 'object');
  t.is(typeof t.context.content.home['another-section'], 'undefined');
});

test('Markdown will be parsed as HTML using Metalsmith Markdown and output within a contents property', t => {
  t.true(/<[a-z][\s\S]*>/i.test(t.context.content.about.contents));
  t.true(/<[a-z][\s\S]*>/i.test(t.context.content.journal[0].contents));
});

test('Frontmatter will be added as properties of the generated objects', t => {
  t.is(typeof t.context.content.about.title, 'string');
  t.is(typeof t.context.content.journal[0].createdAt, 'string');
  t.is(typeof t.context.content.journal[0].bool, 'boolean');
});

test('Supports custom renderers', t => {
  t.true(t.context.content.about.contents.indexOf('h1 class="a-header"') > -1);
});

test('Supports disabling markdown parsing', async t => {
  const content = await jdown('src/__tests__/content-without-images', {
    parseMd: false
  });
  t.false(/<[a-z][\s\S]*>/i.test(content.about.contents));
  t.true(content.about.contents.indexOf('#') > -1);
});

test('Assets are optional', async t => {
  const content = await jdown('src/__tests__/content-without-images');
  t.true(/<[a-z][\s\S]*>/i.test(content.about.contents));
});

test('All assets are created with expected names', async t => {
  const assets = await readDir('./src/__tests__/public/content');
  const totalExpectedAssets = 6;
  let actualAssets = 0;
  const logoPng = /logo-\d+.png/;
  const logoSvg = /logo-\d+.svg/;
  const workLogo = /work-logo-\d+.png/;
  const homeLogo = /home-logo-\d+.png/;
  const example = /journal-example-\d+.jpg/;
  const workExample = /work-example-\d+.jpg/;

  assets.forEach(asset => {
    if (
      asset.match(logoPng) ||
      asset.match(logoSvg) ||
      asset.match(workLogo) ||
      asset.match(homeLogo) ||
      asset.match(example) ||
      asset.match(workExample)
    ) {
      actualAssets += 1;
    }
  });

  t.true(totalExpectedAssets === actualAssets);
});

test('Assets are output with correct file paths', t => {
  const {about, home, journal, work} = t.context.content;
  const hasPath = (content: string, path: RegExp) => {
    return content.match(path) || [];
  };

  t.true(hasPath(about.contents, /\/content\/logo-\d+.png/g).length === 1);
  t.true(hasPath(about.contents, /\/content\/logo-\d+.svg/g).length === 1);
  t.true(
    hasPath(home.anotherSection.contents, /\/content\/home-logo-\d+.png/g)
      .length === 2
  );
  t.true(
    hasPath(home.introduction.contents, /\/content\/logo-\d+.svg/g).length === 1
  );
  t.true(
    hasPath(journal[0].contents, /\/content\/journal-example-\d+.jpg/g)
      .length === 1
  );
  t.true(
    hasPath(work[0].contents, /\/content\/work-example-\d+.jpg/g).length === 1
  );
  t.true(
    hasPath(work[0].contents, /\/content\/work-logo-\d+.png/g).length === 1
  );
});
