const metalsmith = require('metalsmith');
const markdown = require('metalsmith-markdown');
const camelCase = require('camelcase');

const transformFileContents = (files, file) => {
	files[file].contents = files[file].contents.toString('utf8');
	delete files[file].mode;
	delete files[file].stats;
};

const transformFileNames = (files, file) => {
	const parts = file.split('/');
	let fileName = camelCase(parts.pop().replace('.html', ''));

	if (parts[0]) {
		fileName = `${parts.join('/')}/${fileName}`;
	}

	files[fileName] = files[file];
	delete files[file];
	return fileName;
};

const addToCollection = (files, file) => {
	const parts = file.split('/');

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
	const parts = file.split('/');

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
		transformFileContents(files, file);
		file = transformFileNames(files, file);

		const isCollection = addToCollection(files, file);

		if (!isCollection) {
			addToGroup(files, file);
		}
	});

	done();
};

const jdown = dir => new Promise((resolve, reject) => {
	metalsmith(__dirname)
		.source(dir)
		.use(markdown())
		.use(transform())
		.process((err, files) => {
			if (err) {
				return reject(err);
			}

			return resolve(files);
		});
});

module.exports = jdown;
