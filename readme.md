> Convert a directory of markdown files to structured and usable JSON

jdown will turn a directory of markdown files into JSON following these transformation rules:  
📄 Top level files will turned into an object  
📁 Files contained within top level directories will be grouped into an object  
🗂 Files contained within folders of the collections directory will be turned into an array of objects.  
🐫 File names will be transformed to [camelCase](https://github.com/sindresorhus/camelcase) and used as property names  
✍️ Markdown will be parsed as HTML using [Metalsmith Markdown](https://github.com/segmentio/metalsmith-markdown) and output within a `contents` property.  
🕹 Frontmatter will be added as properties of the generated objects.

## Install

```console
$ npm install jdown
```

## Usage

```js
const jdown = require('jdown');
jdown('path/to/markdown/content').then(content => console.log('content'));
```

Use the generated JSON however you like, I recommend with a static site generator like [React Static](https://github.com/nozzle/react-static)!

## Examples

See the [examples](example/) directory of this repository. To test it yourself clone this repo, install the dependancies with `npm install`, modify some content and run `npm run example`.

## License

MIT
