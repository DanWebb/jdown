const jdown = require('../dist');
const marked = require('marked');

// See https://marked.js.org/#/USING_PRO.md#renderer
const renderer = new marked.Renderer();
renderer.heading = (text, level) =>
  `<h${level} class="heading">${text}</h${level}>`;

jdown('example/content', {
  markdown: {renderer},
  assets: {output: 'example/public', path: '/'}
}).then(content => console.log(content));
