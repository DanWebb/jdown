<h1 align="center">
	<br>
	<br>
	<img width="200" src="https://raw.githubusercontent.com/DanWebb/jdown/2b4d38b7c56103a38b74c4c49ad8e6f576744c26/media/logo.png" alt="jdown">
	<br>
	<br>
</h1>

> Convert a directory of markdown files to structured and usable JSON

## Features
📄 Top level files will be turned into an object  
📁 Files contained within top level directories will be grouped into an object  
🗂 Files contained within folders of the collections directory will be turned into an array of objects  
🖼 Assets will be automatically minified and cache busted  
🐫 File names will be transformed to [camelCase](https://github.com/sindresorhus/camelcase) and used as property names  
✍️ Markdown will be parsed as HTML using [Metalsmith Markdown](https://github.com/segmentio/metalsmith-markdown) and output within a `contents` property  
🕹 Frontmatter will be added as properties of the generated objects.  
💅 Custom elements can be used in the markdown parsing with renderer options  
🔧 Markdown parsing can be disabled to just recieve structured JSON containing markdown  

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

## Placing assets inside the content directory
Using jdown to parse assets is completely optional, but comes with a few benefits including:

- Ability to organise assets alongside markdown content
- Auto minification of image files using [imagemin](https://github.com/imagemin/imagemin)
- Cache busting - uses the last modified time (mtime) of the asset to change it's file name and avoid the old version of the asset being served

To get started using assets in jdown you can create a `/assets` folder in your contents directory, reference it in your markdown like `![](./assets/my-asset.png)` then specific an existing directory for jdown to put processed assets into using an assets options object like:

```js
jdown(
  'path/to/markdown/content',
  {assets: {output: './example/public'}}
).then(content => console.log(content));
```

All static assets must be placed within `/assets` folders. Assets folders can be placed in the top level content directory and/or it's sub directories. Within markdown the assets can then be referenced using `./assets/filename.png`. A couple of examples of potential directory structures can be found below.

**Single assets folder**
```
|- contents
| |- assets 
| | |- my-asset.png
| |- collections
| | |- blog
| | | |- post.md <- can access ./assets/my-asset.png
```

**Multiple assets folders**
```
|- contents
| |- assets 
| | |- my-asset.png
| |- collections
| | |- blog
| | | |- assets
| | | | |- my-asset.png
| | | |- post.md <- ./assets/my-asset.png will reference the asset in the blog assets directory
```

The assets options object can contain the following properties:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| output | string | ./public | Directory jdown will output processed assets to |
| path | string | /public | Publically accessible path jdown will prepend to output file names |
| png | object | `{quality: '65-80'}` | Options to pass into [imagemin-pngquant](https://www.npmjs.com/package/imagemin-pngquant) |
| jpg | object | undefined | Options to pass into [imagemin-jpegtran](https://www.npmjs.com/package/imagemin-jpegtran) |
| svg | object | undefined | Options to pass into [imagemin-svgo](https://www.npmjs.com/package/imagemin-svgo) |
| gif | object | undefined | Options to pass into [imagemin-svgo](https://www.npmjs.com/package/imagemin-svgo)

## Custom render options

By default, jdown uses the default [marked](https://github.com/markedjs/marked) render options, but you may pass in your own custom overrides to customize the built html. This can be useful for adding custom ids or CSS classes. In the example below you can see how you can make your links open in a new tab by default, by adding target="\_blank" to anchor tags.

```js
const jdown = require('jdown');
const marked = require('marked');
const renderer = new marked.Renderer();
renderer.link = (href, title, text) => `<a target="_blank" href="${href}" title="${title}">${text}</a>`;

jdown('path/to/markdown/content', {renderer}).then(content => console.log(content));
```
See the [advanced configurations](https://github.com/markedjs/marked/blob/master/docs/USING_ADVANCED.md) and [extensibility](https://github.com/markedjs/marked/blob/master/docs/USING_PRO.md) sections of the marked documentation for the full list of possible options you may use here.

## Disabling markdown parsing

In some cases you may wish to disable markdown parsing to just recieve structured JSON containing markdown instead of HTML. You can accomplish this using the `parseMd` option like so:
```js
jdown('path/to/markdown/content', {parseMd: false}).then(content => console.log(content));
```

## Examples

See the [examples](example/) directory of this repository. To test it yourself clone this repo, install the dependancies with `npm install`, modify some content and run `npm run example`.

[danwebb.co](https://danwebb.co) is built using jdown and [React Static](https://github.com/nozzle/react-static) so see the static.config.js file in the [websites github repo](https://github.com/DanWebb/danwebb.co) for a real world example.

There is also an example built into React Static that you can use to quickly get up and running  [here](https://github.com/nozzle/react-static/tree/master/examples/markdown).

## Contributing

Any pull requests are welcome and will be reviewed. Please use `npm run test` to test your changes are working before submitting any changes.

## License

MIT
