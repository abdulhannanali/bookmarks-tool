/*
 * fileStorage.js
 * deals with filestorage of the bookmarks
 */

const path = require("path")
const fs = require("fs")

const mkdirp = require("mkdirp")
const rimraf = require("rimraf")
const _ = require("lodash")

var DATA_DIR = process.env.BOOKMARK_DATA_DIR || "./dataBookmarks"
var index;

function buildIndex() {
	var indexFilename = "index.json"
	if (fs.existsSync(path.join(DATA_DIR, indexFilename))) {
		readIndex(indexFilename)
	}
	else {
		initializeIndex(indexFilename)
	}
}

function initializeIndex(indexFilename) {
	var initData = {
		count: 0,
		items: []
	}

	try {
		mkdirp.sync(DATA_DIR)
		fs.writeFileSync(path.join(DATA_DIR, indexFilename), JSON.stringify(initData))		
		readIndex(indexFilename)
	}
	catch (error) {
		throw error
	}
}

function readIndex(indexFilename) {
	try {
		index = JSON.parse(fs.readFileSync(path.join(DATA_DIR, indexFilename)))
	}
	catch (error) {
		throw new Error("Error occured while reading from the index")
	}
}

function updateIndex(indexFilename) {
	if (!index) {
		throw new Error("Index should be built first")
		return;
	}

	try {	
		fs.writeFileSync(path.join(DATA_DIR, indexFilename), JSON.stringify(index))
	}
	catch (error) {
		throw new Error("Error occured while updating the index")
	}
}

/*
 * createBookmark
 * @params
 * 	- meta: metadata for the bookmark
 */
function createBookmark(meta) {
	buildIndex();

	var obj = {}
	var filename = `${index.count}.json`

	obj.filename = filename
	obj.meta = meta

	var date = Date.now()

	obj.created_at = date
	obj.updated_at = date
	obj.id = index.count

	try {
		var metaString = JSON.stringify(obj)
		fs.writeFileSync(path.join(DATA_DIR, filename), metaString)


		// updating the index
		index.items.push({
			filename: filename,
			title: meta.title || "",
			id: index.count,
			url: meta.url || ""
		})

		index.count++

		updateIndex("index.json")

		return obj

	}
	catch (error) {
		throw error
		throw new Error("Error while storing the bookmark in database")
	}
}


function readBookmark(fileId) {
	var fileDir = path.join(DATA_DIR, `${fileId}.json`)

	try {
		if (fs.existsSync(fileDir)) {
			return JSON.parse(fs.readFileSync(fileDir).toString())
		}
		else {
			return 
		}
	}
	catch (error) {
		throw new Error("An error occured while reading the bookmark")
	}
}

/*
 * clearBookmarks
 * deletes all the given bookmarks and rebuilds the index from a pristine state
 * no parameters
 */
function clearBookmarks () {
	console.log(rimraf.sync(DATA_DIR))
	buildIndex()
}

/*
 * deleteBookmark
 * deletes the bookmark with the given id
 */
function deleteBookmark (bookmarkId) {
	buildIndex()
	var isRemoved = false
	var fileDir = path.join(DATA_DIR, `${bookmarkId}.json`)

	var oldLength = index.items.length
	index.items = index.items.filter((item) => {
		return item.id != bookmarkId 
	})

	try {
		if (oldLength != index.items.length) {
			rimraf.sync(fileDir)
			isRemoved = true
		}
	}
	catch (error) {
		throw error
	}

	updateIndex("index.json")
	return isRemoved
}

function getIndex() {
	buildIndex()
	return index
}

module.exports = {
	storeBookmark: createBookmark,
	readBookmark: readBookmark,
	updateIndex: updateIndex,
	getIndex: getIndex,
	clearBookmarks: clearBookmarks,
	deleteBookmark: deleteBookmark
}

