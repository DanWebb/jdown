import fs from 'fs';
import path from 'path';
import {promisify} from 'util';
import {Plugin} from 'metalsmith';
import imagemin from 'imagemin';
import rimraf from 'rimraf';
import imageminPngquant from 'imagemin-pngquant';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminGifsicle from 'imagemin-gifsicle';
import imageminSvgo from 'imagemin-svgo';
import {AssetOptions} from './types/options';
import Files from './types/files';

const mkdir = promisify(fs.mkdir);
const stat = promisify(fs.stat);
const writeFile = promisify(fs.writeFile);
const rmrf = promisify(rimraf);

interface Asset {
  name: string;
  assetPath: string;
  folder: string;
}

const cleanup = async (outputDirectory: string) => {
  const dir = path.join(path.resolve(), outputDirectory, 'content');
  await rmrf(dir);
  return mkdir(dir);
};

const minify = (
  paths: string[],
  options: AssetOptions
): Promise<imagemin.Result[]> => {
  const assets = paths.map(async assetPath => {
    const asset = await imagemin([assetPath], '', {
      plugins: [
        imageminPngquant(options.png),
        imageminJpegtran(options.jpg),
        imageminGifsicle(options.gif),
        imageminSvgo(options.svg)
      ]
    });
    asset[0].path = assetPath;
    return asset[0];
  });

  return Promise.all(assets);
};

const assetPaths = (dir: string, files: Files): string[] => {
  return Object.keys(files)
    .filter(file => {
      return file.includes(`assets${path.sep}`) && !file.includes('.DS_Store');
    })
    .map(file => {
      return path.join(dir, file);
    });
};

const output = (
  contentDirectory: string,
  outputDirectory: string,
  assets: imagemin.Result[]
): Promise<Asset[]> => {
  const dir = contentDirectory.split(path.sep).pop();
  const outputAssets = assets.map(async asset => {
    const {name, ext} = path.parse(asset.path);
    const {mtime} = await stat(asset.path);
    const parts = asset.path.split(path.sep);
    const parent = parts.reverse()[2];
    const hasFolder = parent !== dir && parent !== 'assets';
    const folder = hasFolder ? parent : '';
    const fileName = hasFolder
      ? `${folder}-${name}-${mtime.getTime()}${ext}`
      : `${name}-${mtime.getTime()}${ext}`;
    const assetPath = path.join(outputDirectory, 'content', fileName);
    await writeFile(assetPath, asset.data, 'binary');
    return {name: `${name}${ext}`, assetPath, folder};
  });

  return Promise.all(outputAssets);
};

const rewriteAssetPaths = (
  files: Files,
  assets: Asset[],
  contentDirectory: string
) => {
  const dir = contentDirectory.split(path.sep).pop();

  const rewrite = (assetRef: string, folder: string = '', file: string) => {
    const name = assetRef.replace('./assets/', '');
    let asset = assets.find(a => a.folder === folder && a.name === name);

    // Even if there is a folder it's possible this is referencing a top level asset
    if (folder && !asset) {
      asset = assets.find(a => a.name === name);
    }

    if (asset) {
      return (files[file].contents = files[file].contents.replace(
        assetRef,
        asset.assetPath
      ));
    }
  };

  Object.keys(files).forEach(file => {
    const content = files[file].contents;

    if (!content.includes('./assets/')) {
      return;
    }

    const parent = file.split(path.sep).reverse()[1];
    const folder = parent !== dir ? parent : '';
    const assetRefs: string[] = content.match(/.\/assets\/.+?(?="|\))/g);
    assetRefs.forEach(assetRef => rewrite(assetRef, folder, file));
  });

  return files;
};

/**
 * Minify assets and rewrite asset paths
 *
 * @param dir - The content directory where the assets are stored
 * @returns A metalsmith Plugin
 */
const transformAssets = (dir: string, options: AssetOptions) => {
  const transform: Plugin = async (files, _, done) => {
    const outputDirectory = options.output || `.${path.sep}static`;
    await cleanup(outputDirectory);
    const paths = assetPaths(dir, files);
    const minifiedAssets = await minify(paths, options);
    const assets = await output(dir, outputDirectory, minifiedAssets);
    rewriteAssetPaths(files, assets, dir);
    return Promise.resolve(done());
  };

  return transform;
};

export default transformAssets;
