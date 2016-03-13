/*
 * cli.js
 * contains the command-line options for the bookmarks-tool
 */

const program = require("commander")
const chalk = require("chalk")
const Table = require("cli-table2")
const _ = require("lodash")

const bookmarker = require("./lib/bookmarker")

program
	.version("1.0")

// option to add the url to the list
program
	.command("add <url>")
	.description("adds the given url to the bookmarks list")
	.option("-o, --offline", "Store the url offline without requesting metadata")
	.action(function (url, options) {
		bookmarker.storeBookmark(url, {
			offline: options.offline || false
		}, (error, fileData) => {
			if (error) {
				console.error(chalk.red(error))
				return;
			}
			else {
				console.log()
				console.log(chalk.green("Bookmark added! 😄😄😁😄😄"))
				console.log("Details:")
				console.log("\tID:\t\t" + fileData.id)
				if (fileData.meta.title) {
					console.log("\tTitle:\t\t" + fileData.meta.title)
				}
				console.log("\tCreated At:\t" + new Date(fileData.created_at))
				console.log()

				console.log("In order to access more details, Type: ")
				console.log(chalk.bgGreen("bookmarker details " + fileData.id))
			}
		})
	})


// list command
// lists all the given bookmarks 
// uses cli-table for the formatting of the table 
program
	.command("list")
	.description("lists all the given bookmarks")
	.option("-c, --compact, output a compact table")
	.action(function (options) {
		var index = bookmarker.getIndex()	

		if (_.isEmpty(index.items)) {
			displayError("Sorry no bookmarks found to list! 😢😢😢")
		}
		else {
			var x = new Table({
				head: ["ID", "URL", "TITLE"],
				style: {
					head: ["yellow"],
					border: ["rainbow"],
					compact: options.compact || false
				}
			}) 


			index.items.forEach(function (bookmark) {
				x.push([bookmark.id != undefined ? bookmark.id : chalk.red("ID MISSING"), 
						bookmark.url || chalk.red("URL MISSING"), 
						bookmark.title || chalk.red("TITLE MISSING")])
			})

			console.log(x.toString())
			console.log()
			console.log("Type following to access the details of any bookmark")
			console.log()
			console.log("=========================================") 
			console.log("=========================================")
			console.log("=========================================")
			console.log()
			console.log(chalk.magenta("\tbookmarker details <id>"))
			console.log()
			console.log("=========================================")
			console.log("=========================================")
			console.log("=========================================")

		}

	})


// details command in order to access the details of the application
program
	.command("details <id>")
	.description("gives the details of the given command")
	.action(function (id, options) {
		var bookmarkId = parseInt(id)

		if (bookmarkId == undefined || bookmarkId < 0) {
			displayError("Sorry! Please enter a valid bookmark id")
		}
		else {
			var details = bookmarker.readBookmark(bookmarkId)
			if (!details) {
				console.log(chalk["cyan"]("No details found for the given id"))
			}
			else {
				detailsFormatter(details)
				console.log("")
				console.log("Type bookmarker --help in order to access the help")
			}
		}
	})

// delete command to delete the bookmarks
// -a option deletes all the bookmarks
program
	.command("delete [id]")
	.description("delete the bookmarks from the application")
	.option("-a, --all, delete all the bookmarks from the application")
	.option("-i, --info, outputs information regarding the deleting bookmark (works only without -a flag)")
	.option("-d, --debug, run the command in debug mode")
	.action(function (id, options) {
		try {
			if (options.all) {
				bookmarker.clearBookmarks()
				console.log(chalk.green("All the bookmarks have been successfully deleted"))
			}
			else if (!options.all && parseInt(id) != undefined) {
				var bookmarkId = parseInt(id)
				var bookmarkDetails = bookmarker.readBookmark(id)
				if (bookmarker.deleteBookmark(bookmarkId)) {
					console.log(chalk.green("Bookmark with ID " + bookmarkId + " has been successfully deleted"))
					
					if (options.info) {
						console.log("\nDetails regarding the deleted bookmark\n")
						console.log("")
						detailsFormatter(bookmarkDetails)
					}
				}
				else {
					console.log(chalk.blue("Bookmark with ID " + bookmarkId + " was not deleted"))
				}
			}
			else {
				console.log(chalk.red("\nerror: missing required argument `id'\n"))
			}
		}
		catch (error) {
			if (options.debug) {
				console.error(error)
			}
			displayError(`Error occured while deleting ${options.all ? "all the " : ""}bookmark${options.all ? "s" : ""}`)
		}
	})



// helper functions
function displayError(msg) {
	if (!msg) {
		msg = ""
	}

	var x = new Table({
		wordwrap: true,
		colWidths: [50]
	})
	x.push([chalk.red(msg)])

	console.log(x.toString())
}

function detailsFormatter (details) {
	var generalDetails = new Table({
		style: {
			head: ["yellow"],
			border: ["america"]
		},
		wordWrap: true
	})

	var metaDetails = new Table({
		colWidths: [20, 80],
		wordWrap: true,
		style: {
			border: ["rainbow"]
		}
	})

	generalDetails.push([{
			colSpan: 2, content: chalk.magenta("General Details for the Bookmark")
		}])

	metaDetails.push([{colSpan: 2, content: chalk.green("Meta Details for the given Bookmark")}])

	var generalDetailsArray = [
		{"ID": chalk.blue(details.id)},
		{"Filename": details.filename},
		{"Created At": new Date(details.created_at).toString()},
		{"Updated At": new Date(details.updated_at).toString()}
	]

	// general details
	generalDetailsArray.forEach(function (detail) {
		generalDetails.push(detail)
	})

	// adding meta data details
	Object.keys(details.meta).forEach(function (detail) {
		var x = {}
		x[detail] = details.meta[detail]
		metaDetails.push(x)
	})


	console.log(generalDetails.toString())
	console.log(metaDetails.toString())
}

program.parse(process.argv)