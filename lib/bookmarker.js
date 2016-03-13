/*
 * bookmarker.js
 * bookmarker is main module for managing the application bookmarks
 * bookmarker is interface independent module and the interface can be created for it
 */

const _ = require("lodash")

const fetcher = require("./fetcher")
const fileStorage = require("./fileStorage")


/*
 * storeBookmark
 * requests the meta data by default and stores it in the file
 * options can be used to not fetch the bookmark
 * 
 * @param url - string (required)
 * @param options - object (optional)
 * @param callback - function (optional)
 * 
 *
 *
 * options are one of the following
 * - fetch (boolean) - true by default - if false the data for the bookmark is not fetched
 * - ...options - all other options specify the data to be stored
 */

function storeBookmark(url, options, cb) {
	console.log(options)
	if (!cb) {
		cb = () => {}
	}
	fetcher.getMeta(url, (error, metaData) => {
		if (error) {
			cb(error)
		}
		else {
			var fileData = fileStorage.storeBookmark(metaData)
			cb(null, fileData)
		}
	})
}

/*
 * readBookmark
 * gets the bookmark data for the given id
 */
function readBookmark(id) {
	return fileStorage.readBookmark(id)
}

/*
 * getIndex
 * a wrapper around fileStorage.getIndex
 */
function getIndex() {
	return fileStorage.getIndex()
}

/*
 * searchIndex
 * searches the index for the searchTerm
 * this throws an error if the searchTerm is not provided
 * @param - searchTerm (required) - given searchTerm
 */
function searchIndex(searchTerm) {
	if (!searchTerm) {
		throw new Error("parameter - title - missing")
	}

	var index = getIndex()
	
	return _.filter(index.items, (obj) => {
		return obj.title && obj.title.match(new RegExp(searchTerm, "ig"))
	})
}

/*
 * a wrapper around fileStorage.clearBookmarks function for clearing 
 * all the bookmarks stored
 */
function clearBookmarks() {
	fileStorage.clearBookmarks()
}

/*
 * delete the given bookmark using id
 */
function deleteBookmark(bookmarkId) {
	return fileStorage.deleteBookmark(bookmarkId)
}

module.exports = {
	clearBookmarks: clearBookmarks,
	deleteBookmark: deleteBookmark,
	searchIndex: searchIndex,
	getIndex: getIndex,
	storeBookmark: storeBookmark,
	readBookmark: readBookmark
}