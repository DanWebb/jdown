import {MarkedOptions} from 'marked';
import {Options as ImageminPngquantOptions} from 'imagemin-pngquant';
import {Options as ImageminJpegtranOptions} from 'imagemin-jpegtran';
import {Options as ImageminSvgoOptions} from 'imagemin-svgo';
import {Options as ImageminGifsicleOptions} from 'imagemin-gifsicle';

export interface AssetOptions {
  /**
   * Directory jdown will output processed assets to
   *
   * @default ./public
   */
  output?: string;

  /**
   * Publically accessible path jdown will prepend to output file names.
   *
   * @default /
   */
  path?: string;

  /**
   * Options to pass to [imagemin-pngquant](https://github.com/imagemin/imagemin-pngquant)
   */
  png?: ImageminPngquantOptions;

  /**
   * Options to pass into [imagemin-jpegtran](https://github.com/imagemin/imagemin-jpegtran)
   */
  jpg?: ImageminJpegtranOptions;

  /**
   * Options to pass into [imagemin-svgo](https://github.com/imagemin/imagemin-svgo)
   */
  svg?: ImageminSvgoOptions;

  /**
   * Options to pass into [imagemin-gifsicle](https://github.com/imagemin/imagemin-gifsicle)
   */
  gif?: ImageminGifsicleOptions;
}

export interface Options {
  /**
   * Options to pass to [marked](https://github.com/markedjs/marked).
   */
  markdown?: MarkedOptions;

  /**
   * Asset parsing options.
   */
  assets?: AssetOptions;

  /**
   * Parse markdown as HTML.
   *
   * @default true
   */
  parseMd?: boolean;
}
