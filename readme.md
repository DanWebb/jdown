<h1 align="center">
	<br>
	<br>
	<img width="200" src="https://raw.githubusercontent.com/DanWebb/jdown/2b4d38b7c56103a38b74c4c49ad8e6f576744c26/media/logo.png" alt="chalk">
	<br>
	<br>
</h1>

> Convert a directory of markdown files to structured and usable JSON

## Features
📄 Top level files will turned into an object  
📁 Files contained within top level directories will be grouped into an object  
🗂 Files contained within folders of the collections directory will be turned into an array of objects.  
🐫 File names will be transformed to [camelCase](https://github.com/sindresorhus/camelcase) and used as property names  
✍️ Markdown will be parsed as HTML using [Metalsmith Markdown](https://github.com/segmentio/metalsmith-markdown) and output within a `contents` property.  
🕹 Frontmatter will be added as properties of the generated objects.

<br>
<img src="https://raw.githubusercontent.com/DanWebb/jdown/2b4d38b7c56103a38b74c4c49ad8e6f576744c26/media/example.jpg" alt="" width="900">

## Install

```console
$ npm install jdown
```

## Usage

```js
const jdown = require('jdown');
jdown('path/to/markdown/content').then(content => console.log(content));
```

Where "path/to/markdown/content" is a directory containing markdown files or folders as described under the "Features" header above. The file path will be relative to the project root so if your content was in /Users/username/project/src/content, you would use `jdown('src/content')`.

Use the generated JSON however you like, I recommend with a static site generator like [React Static](https://github.com/nozzle/react-static)! This way you can use the markdown files as a CMS and use the JSON in the build stage.

## Custom renderers

By default, jdown uses the default [marked](https://github.com/markedjs/marked) renderer, but you may pass in your own custom overrides to customize the built html. This can be useful for adding custom ids or CSS classes. In the example below you can see how you can make your links open in a new tab by default, by adding target="\_blank" to anchor tags.

```js
const jdown = require('jdown');
const marked = require('marked');
const renderer = new marked.Renderer();
renderer.link = (href, title, text) => `<a target="_blank" href="${href}" title="${title}">${text}</a>`;

jdown('path/to/markdown/content', {renderer}).then(content => console.log(content));
```
See the [advanced configurations](https://github.com/markedjs/marked/blob/master/docs/USING_ADVANCED.md) and [extensibility](https://github.com/markedjs/marked/blob/master/docs/USING_PRO.md) sections of the marked documentation for the full list of possible options you may use here.

## Examples

See the [examples](example/) directory of this repository. To test it yourself clone this repo, install the dependancies with `npm install`, modify some content and run `npm run example`.

[danwebb.co](https://danwebb.co) is built using jdown and [React Static](https://github.com/nozzle/react-static) so see the static.config.js file in the [websites github repo](https://github.com/DanWebb/danwebb.co) for a real world example.

There is also an example built into React Static that you can use to quickly get up and running  [here](https://github.com/nozzle/react-static/tree/master/examples/markdown).

## License

MIT
