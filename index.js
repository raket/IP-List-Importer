function dot2num(dot) {
	var d = dot.split('.');
	return ((((((+d[0]) * 256) + (+d[1])) * 256) + (+d[2])) * 256) + (+d[3]);
}

var request = require('request'),
	csv = require('csv'),
	fs = require('fs'),
	mongoose = require('mongoose'),
	ipListImporter,
	countryList;

var schema = new mongoose.Schema({
	rangeStart:  Number,
	rangeEnd:    Number,
	countryCode: String,
	countryName: String
});
schema.index({ rangeStart: 1, rangeEnd: -1 });

countryList = mongoose.model("Ip2CountryList", schema);

ipListImporter = {
	countryList: countryList,
	importList: function(pathOrRequest) {
		this.truncateList().on("complete", function () {
			var count = 0;
			csv()
				.from.stream(path.resolve(__dirname, '/files/GeoIP-108.csv'))
				.on('record', function (row, index) {
					//console.log(JSON.stringify(row));
					var countryRow = new countryList({
						rangeStart:  row[2],
						rangeEnd:    row[3],
						countryCode: row[4],
						countryName: row[5]
					});
					countryRow.save(function (err, row) {
						if (err) // TODO handle the error
							console.log("Row error");
						else {
							count++;
							console.log("Row saved "+count);
						}
					});
				})
				.on('error', function (error) {
					console.log(error.message);
					process.exit();
				});
		});
	},
	truncateList: function() {
		return countryList.find().remove().exec();
	}
};
module.exports = ipListImporter;