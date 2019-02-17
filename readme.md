<h1 align="center">
	<img width="900" src="https://file-tcmlvkdbgm.now.sh/" alt="jdown">
	<br>
</h1>

If you're creating content in markdown or use a CMS like
[NetlifyCMS](https://www.netlifycms.org/) which outputs markdown files jdown can
transform the content into JSON containing HTML at build time ready to be
consumed within templates.

## Install

```console
$ npm install jdown --save-dev
```

## Basic Usage

<img width="900" src="https://file-oenazxmmfv.now.sh/" alt="Content to JSON">

```js
const jdown = require('jdown');
jdown('path/to/content').then(content => console.log(content));
```

Call jdown with the path to your markdown content (relative to the project root)
and it will convert your content to JSON.

## Structuring Content

The structure of the JSON that jdown outputs depends on how files within the
content folder are structured.

### Top Level Files

Will be turned into a top level object.

<img width="900" src="https://file-idqlisfaef.now.sh/" alt="Top Level Files">

### Folders

Files within folders will be turned into objects and grouped under a top level
object that has the same name as the parent folder (don't go more than one level
deep).

<img width="900" src="https://file-uxsybvnpyw.now.sh/" alt="Folders">

### Collections

The collections folder should only contain sub folders, each sub folder will be
turned into an array of objects. There will be an object for each file in the
sub folder.

<img width="900" src="https://file-fcczhgecrv.now.sh/" alt="Collections">

### File Contents

YAML frontmatter can be included at the top of any files throughout and it will
be added to the generated JSON as individual properties.

```md
---
title: Example frontmatter
---

Example Markdown Content
```

## API

### jdown([path], [options])

#### path

Type: `string`<br> Required

Path to a folder containing markdown files with a folder structure that matches
the guidelines above. The path should be relative to the project root so if your
content was in `/Users/username/project/src/content`, you would use
`jdown('src/content')`.

#### options

Type: `object`

##### markdown

Type: `object`

Options to pass to [marked](https://github.com/markedjs/marked), jdown supports
[all the available marked options](https://marked.js.org/#/USING_ADVANCED.md#options)
which can be used to control how the markdown is parsed.

##### assets

Type: `object`

Asset parsing options. Using jdown to parse assets is completely optional, but
comes with a few benefits including:

- Ability to organise assets alongside markdown content
- Auto minification of image files using
  [imagemin](https://github.com/imagemin/imagemin)
- Cache busting, using the last modified time (mtime) of the asset to change
  it's file name and avoid the old version of the asset being served

All static assets must be placed within `/assets` folders. Assets folders can be
placed in the top level content directory and/or it's sub directories. Within
the markdown content assets can then be referenced using
`![](./assets/my-asset.png)` where `my-asset.png` is an asset placed within an
`/assets` folder.

The assets options object can contain the following properties:

| Property | Type   | Default   | Description                                                                               |
| -------- | ------ | --------- | ----------------------------------------------------------------------------------------- |
| output   | string | ./public  | Directory jdown will output processed assets to                                           |
| path     | string | /         | Publically accessible path jdown will prepend to output file names                        |
| png      | object | undefined | Options to pass into [imagemin-pngquant](https://www.npmjs.com/package/imagemin-pngquant) |
| jpg      | object | undefined | Options to pass into [imagemin-jpegtran](https://www.npmjs.com/package/imagemin-jpegtran) |
| svg      | object | undefined | Options to pass into [imagemin-svgo](https://www.npmjs.com/package/imagemin-svgo)         |
| gif      | object | undefined | Options to pass into [imagemin-svgo](https://www.npmjs.com/package/imagemin-svgo)         |

##### parseMd

Type: `boolean`<br> Default: `true`

Set this to `false` to disable markdown parsing and just recieve structured JSON
containing markdown instead of HTML.

##### fileInfo

Type: `boolean`<br> Default: `false`

Set this to `true` to include file info objects in the output JSON which contain
the files path, name, created at date and modified at date.

## Examples

The [example](example/) directory of this repository contains use of jdown
including asset parsing and custom [marked](https://github.com/markedjs/marked)
render options.

### In The Wild

- [danwebb.co](https://danwebb.co)
  ([source](https://github.com/DanWebb/danwebb.co)) is built using jdown and
  [React Static](https://github.com/nozzle/react-static). See the
  [static.config.js file](https://github.com/DanWebb/danwebb.co/blob/master/static.config.js)
  for a real world example.
- If you have an example please share by submitting a pull request to add it to
  this list so others can learn from it.

## Contributing

Any pull requests are welcome and will be reviewed.

## License

MIT
