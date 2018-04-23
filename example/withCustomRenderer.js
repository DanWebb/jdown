const jdown = require('..');
const fs = require('fs');
const path = require('path');

const outputFile = path.join(__dirname, 'contents.json');

const customRender = {
	link: (href, title, text) => {
	  return `<a target="_blank" href="${href}" title="${title}">${text}</a>`
	}
};

jdown('example/content', customRender).then(content => {
	fs.writeFileSync(outputFile, JSON.stringify(content, null, 2), 'utf8');
});
