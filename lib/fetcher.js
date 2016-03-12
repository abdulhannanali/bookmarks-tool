// fetcher.js
// fetches the meta data about the file

const request = require("request")
const cheerio = require("cheerio")

// meta props to search for after fetching the page and their link with corresponding
// data property
// preferable same value in meta props should not be repeated
const metaprops = {
	"og:type": "type",
	"og:url": "url",
	"og:image": "image",
	"og:description": "description"
}


function getMeta(url, cb) {
	request({
		url: url,
		headers: {
			"User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:44.0) Gecko/20100101 Firefox/44.0"
		}
	}, function (error, response, body) {
		if (error) {
			cb(error)
		}
		else {
			var parsedMeta = parseMeta(body)
			parseMeta.url = url

			cb(null, parsedMeta)
		}
	})
}

/*
 * parseMeta
 * parses the meta data and stuff such as title out of the html
 */
function parseMeta(data) {
	var meta = {}
	var $ = cheerio.load(data)

 	meta.title = $("title").text()

 	var metaTags = $("meta")
 	
	// fetching the other props
 	Object.keys(metaprops).forEach((value) => {
 		
 		// goes over the each meta tag to check for the desired attributes
 		metaTags.each((idx, elem) => {
 			var attributes = elem.attribs
 			if (attributes &&
 				attributes.property &&
 				attributes.property == value) {
 				meta[metaprops[value]] = attributes.content
 			}
 		})
 	})

 	return meta
}

module.exports = {
	getMeta: getMeta
}