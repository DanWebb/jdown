const path = require('path');
const metalsmith = require('metalsmith');
const markdown = require('metalsmith-markdown');
const camelCase = require('camelcase');
const transformAssets = require('./transform-assets');

const transformFileContents = (files, file) => {
	files[file].contents = files[file].contents.toString('utf8');
	delete files[file].mode;
	delete files[file].stats;
};

const transformFileNames = (files, file) => {
	const parts = file.split(/\\|\//);
	let fileName = camelCase(parts.pop().replace('.html', '').replace('.md', ''));

	if (parts[0]) {
		fileName = `${parts.join('/')}/${fileName}`;
	}

	files[fileName] = files[file];
	delete files[file];
	return fileName;
};

const addToCollection = (files, file) => {
	const parts = file.split(/\\|\//);

	if (parts[0] !== 'collections' || !parts[1] || !parts[2]) {
		return false;
	}

	if (!files[parts[1]]) {
		files[parts[1]] = [];
	}

	files[parts[1]].push(files[file]);
	delete files[file];
	return true;
};

const addToGroup = (files, file) => {
	const parts = file.split(/\\|\//);

	if (!parts[1] || parts[2]) {
		return false;
	}

	if (!files[parts[0]]) {
		files[parts[0]] = {};
	}

	files[parts[0]][parts[1]] = files[file];
	delete files[file];
	return true;
};

const transform = ({dir, assets}) => async (files, metalsmith, done) => {
	const asset = transformAssets(dir, assets);

	Object.keys(files).forEach(file => {
		if (file.indexOf('.DS_Store') > -1) {
			delete files[file];
			return;
		}

		if (file.indexOf(`assets${path.sep}`) > -1) {
			asset.add(file);
			delete files[file];
			return;
		}

		transformFileContents(files, file);
		file = transformFileNames(files, file);

		const isCollection = addToCollection(files, file);

		if (!isCollection) {
			addToGroup(files, file);
		}
	});

	if (asset.found) {
		files = await asset.process(files);
	}

	done();
};

const defaultOptions = {
	smartypants: true,
	smartLists: true,
	gfm: true,
	tables: true,
	breaks: false,
	sanitize: false,
	parseMd: true,
	assets: {
		output: `.${path.sep}public`,
		path: path.sep,
		png: {quality: '65-80'}
	}
};

const jdown = (dir, options = {}) => new Promise((resolve, reject) => {
	const content = metalsmith(path.resolve()).source(dir);
	options = {...defaultOptions, ...options};
	options.assets = {...defaultOptions.assets, ...options.assets};

	if (options.parseMd) {
		delete options.parseMd;
		content.use(markdown(options));
	}

	content
		.use(transform({dir, ...options}))
		.process((err, files) => {
			if (err) {
				return reject(err);
			}

			return resolve(files);
		});
});

module.exports = jdown;
