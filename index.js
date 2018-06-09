const path = require('path');
const metalsmith = require('metalsmith');
const markdown = require('metalsmith-markdown');
const camelCase = require('camelcase');

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

const transform = () => (files, metalsmith, done) => {
	Object.keys(files).forEach(file => {
		if (file.indexOf('.DS_Store') > -1) {
			delete files[file];
			return;
		}

		if (file.indexOf('/images/') > -1) {
			return;
		}

		transformFileContents(files, file);
		file = transformFileNames(files, file);

		const isCollection = addToCollection(files, file);

		if (!isCollection) {
			addToGroup(files, file);
		}
	});

	done();
};

const defaultOptions = {
	smartypants: true,
	smartLists: true,
	gfm: true,
	tables: true,
	breaks: false,
	sanitize: false,
	parseMd: true
};

/**
 * IMAGES ---
 * It should be possible to add an images folder in each directory so /content/images,
 * /content/collections/journal/images, /content/home/images then within the md the
 * image files can be referenced like ./images/image.jpg the image will then be auto
 * minified cache busted and added to a specified output folder.
 *
 * To accomplish this I can use https://github.com/imagemin/imagemin which can take
 * images, minify them then output them somewhere. After the images are output they
 * will need to have their file paths changed in the json by replacing any occurances of
 * ./images/ with the specified base dir.
 *
 * Notes:
 * - By default metalsmith gives me the buffer of each image
 * - Cache busting means the images need a new file name each time they change.
 *   So to avoid duplicates the image folders will need to be cleared each time the
 *   content generates.
 * - The cache busting could be based on the buffer? This way if an image with the same file
 *   name exists we know the image is the same and don't have to re-minify, etc.
 */

const jdown = (dir, options = {}) => new Promise((resolve, reject) => {
	const content = metalsmith(path.resolve()).source(dir);
	options = Object.assign(defaultOptions, options);

	if (options.parseMd) {
		delete options.parseMd;
		content.use(markdown(options));
	}

	content
		.use(transform())
		.process((err, files) => {
			if (err) {
				return reject(err);
			}

			return resolve(files);
		});
});

module.exports = jdown;
