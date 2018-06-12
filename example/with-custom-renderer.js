const fs = require('fs');
const path = require('path');
const marked = require('marked');
const jdown = require('../src');

const outputFile = path.join(__dirname, 'contents.json');
const renderer = new marked.Renderer();
renderer.link = (href, title, text) => `<a target="_blank" href="${href}" title="${title}">${text}</a>`;
const options = {renderer, asset: {output: './example/public'}};

jdown('example/content', options).then(content => {
	fs.writeFileSync(outputFile, JSON.stringify(content, null, 2), 'utf8');
});
