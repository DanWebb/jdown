import test from 'ava';
import jdown from '..';
import marked from 'marked';

test.before(async t => {
	const renderer = new marked.Renderer();
	renderer.heading = (text, level) => `<h${level} class="a-header">${text}</h${level}>`;
	t.context.content = await jdown('test/content', {renderer});
	return Promise.resolve(true);
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
	t.is(t.context.content.about.contents, '<h1 class="a-header">parsed markdown</h1>');
});

test('Supports disabling markdown parsing', async t => {
	const content = await jdown('test/content', {parseMd: false});
	t.false(/<[a-z][\s\S]*>/i.test(content.about.contents));
	t.true(content.about.contents.indexOf('#') > -1);
});
