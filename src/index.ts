import path from 'path';
import util from 'util';
import metalsmith from 'metalsmith';
import markdown from 'metalsmith-markdown';
import {Options, AssetOptions} from './types/options';
import transformBufferToString from './transform-buffer-to-string';
import transformAssets from './transform-assets';
import transformContent from './transform-content';

const defaultOptions: Options = {
  parseMd: true,
  fileInfo: false,
  markdown: {}
};

const defaultAssetOptions: AssetOptions = {
  output: `.${path.sep}public`,
  path: path.sep
};

/**
 * Transform a directory of markdown files to JSON.
 *
 * @param dir - A file path to the content directory, relative to the projects root.
 * @returns A `Promise` for JSON
 *
 * @example jdown('path/to/content').then(content => console.log(content));
 *
 */
const jdown = (dir: string, options: Options = defaultOptions) => {
  options = {...defaultOptions, ...options};
  const content = metalsmith(path.resolve()).source(dir);

  if (options.parseMd) {
    content.use(markdown(options.markdown));
  }

  content.use(transformBufferToString());

  if (options.assets) {
    content.use(
      transformAssets(dir, {...defaultAssetOptions, ...options.assets})
    );
  }

  content.use(transformContent(options));

  const process = util.promisify(content.process.bind(content));
  return process();
};

export = jdown;
