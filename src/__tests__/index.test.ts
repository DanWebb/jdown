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

test('JSON is generated based on the content files in the directory', t => {
  t.is(typeof t.context.content.about, 'object');
  t.is(typeof t.context.content.home, 'object');
  t.is(typeof t.context.content.home.anotherSection, 'object');
  t.is(typeof t.context.content.home.introduction, 'object');
  t.true(Array.isArray(t.context.content.journal));
  t.true(Array.isArray(t.context.content.work));
  t.is(typeof t.context.content.journal[0], 'object');
  t.is(typeof t.context.content.home.anotherSection, 'object');
  t.is(typeof t.context.content.home['another-section'], 'undefined');
});

test('Markdown is parsed as HTML and output within a contents property', t => {
  t.true(/<[a-z][\s\S]*>/i.test(t.context.content.about.contents));
  t.true(/<[a-z][\s\S]*>/i.test(t.context.content.journal[0].contents));
});

test('Frontmatter is added as properties of the generated objects', t => {
  t.is(typeof t.context.content.about.title, 'string');
  t.is(typeof t.context.content.journal[0].createdAt, 'string');
  t.is(typeof t.context.content.journal[0].bool, 'boolean');
});

test('Custom renderers are supported', t => {
  t.true(t.context.content.about.contents.indexOf('h1 class="a-header"') > -1);
});

test('Disabling markdown parsing is supported', async t => {
  const content = await jdown('src/__tests__/content', {
    parseMd: false
  });
  t.false(/<[a-z][\s\S]*>/i.test(content.about.contents));
  t.true(content.about.contents.indexOf('#') > -1);
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
