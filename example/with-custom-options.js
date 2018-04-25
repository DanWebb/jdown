const jdown = require('..');
const fs = require('fs');
const path = require('path');
const marked = require('marked');

const outputFile = path.join(__dirname, 'contents.json');
const renderer = new marked.Renderer();
renderer.link = (href, title, text) => `<a target="_blank" href="${href}" title="${title}">${text}</a>`;

jdown('example/content', {renderer}).then(content => {
	fs.writeFileSync(outputFile, JSON.stringify(content, null, 2), 'utf8');
});
