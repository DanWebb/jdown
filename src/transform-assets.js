const {promisify} = require('util');
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminGifsicle = require('imagemin-gifsicle');
const imageminSvgo = require('imagemin-svgo');
const camelCase = require('camelcase');

const mkdir = promisify(fs.mkdir);
const stat = promisify(fs.stat);
const writeFile = promisify(fs.writeFile);
const rmrf = promisify(rimraf);

const transformAssets = (contentDir, asset) => {
	const paths = [];

	const add = path => paths.push(`${contentDir}/${path}`);

	const found = () => paths.length > 0;

	const clean = async () => {
		const outputPath = path.join(path.resolve(), asset.output, 'content');
		await rmrf(outputPath);
		return mkdir(outputPath);
	};

	const minify = () => imagemin(paths, '', {
		plugins: [
			imageminPngquant(asset.png),
			imageminJpegtran(asset.jpg),
			imageminGifsicle(asset.gif),
			imageminSvgo(asset.svg)
		]
	});

	const createFile = async (file, index) => {
		const {name, ext} = path.parse(paths[index]);
		const {mtime} = await stat(paths[index]);
		const subFolderPrefix = paths[index].replace(contentDir, '').replace('assets/', '').split('/').reverse()[1];
		const fileName = `${subFolderPrefix ? subFolderPrefix + '-' : ''}${name}-${mtime.getTime()}${ext}`;
		const filePath = `${asset.output}/content/${fileName}`;

		await writeFile(filePath, file.data, 'binary');

		return {
			name: `${name}${ext}`,
			newPath: `${asset.path}/${fileName}`,
			prefix: subFolderPrefix || ''
		};
	};

	const replacePath = (content, filePaths, prefix = '') => {
		if (content.indexOf('./assets') === -1) {
			return content;
		}

		filePaths.forEach(filePath => {
			const pathMatch = new RegExp(`./assets/${filePath.name}`, 'g');
			const hasDuplicates = filePaths.filter(fp => fp.name === filePath.name).length > 1;

			if (hasDuplicates && prefix !== camelCase(filePath.prefix)) {
				return;
			}

			content = content.replace(pathMatch, filePath.newPath);
		});

		return content;
	};

	const process = async contents => {
		if (paths.length === 0) {
			return;
		}

		await clean();
		const files = await minify();
		const filePaths = await Promise.all(files.map(createFile));

		const processPage = page => {
			contents[page].contents = replacePath(contents[page].contents, filePaths);
		};

		const processCollection = collection => {
			contents[collection] = contents[collection].map(article => {
				article.contents = replacePath(article.contents, filePaths, collection);
				return article;
			});
		};

		const processSections = sections => {
			Object.keys(contents[sections]).forEach(section => {
				contents[sections][section].contents = replacePath(contents[sections][section].contents, filePaths, sections);
			});
		};

		Object.keys(contents).forEach(key => {
			if (contents[key].contents) {
				processPage(key);
			} else if (Array.isArray(contents[key])) {
				processCollection(key);
			} else {
				processSections(key);
			}
		});

		return contents;
	};

	return {add, found, process};
};

module.exports = transformAssets;
