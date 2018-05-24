const jdown = require('..');
const fs = require('fs');
const path = require('path');

const outputFile = path.join(__dirname, 'contents.json');

jdown('example/content', {parseMd: false}).then(content => {
	fs.writeFileSync(outputFile, JSON.stringify(content, null, 2), 'utf8');
});
