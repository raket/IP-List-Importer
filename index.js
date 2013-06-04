function dot2num(dot) {
	var d = dot.split('.');
	return ((((((+d[0]) * 256) + (+d[1])) * 256) + (+d[2])) * 256) + (+d[3]);
}

var request = require('request'),
	csv = require('csv'),
	fs = require('fs'),
	mongoose = require('mongoose'),
	ipListImporter,
	countryList,
	schema;

schema = new mongoose.Schema({
	rangeStart:  Number,
	rangeEnd:    Number,
	countryCode: String,
	countryName: String
});
schema.index({ rangeStart: 1, rangeEnd: -1 });
countryList = mongoose.model("Ip2CountryList", schema);

ipListImporter = {
	countryList:  countryList,
	init:         function () {
	},
	importList:   function (pathOrRequest) {
		var csvPath;
		if (pathOrRequest) {
			csvPath = pathOrRequest
		}
		else {
			csvPath = path.resolve(__dirname, '/files/GeoIP-108.csv');
		}
		this.truncateList().on("complete", function () {
			var count = 0;
			csv()
				.from.stream(csvPath)
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
							console.log("Row saved " + count);
						}
					});
				})
				.on('error', function (error) {
					console.log(error.message);
					process.exit();
				});
		});
	},
	truncateList: function () {
		return this.countryList.find().remove().exec();
	},
	resolveIp:    function (myIp) {
		return this.countryList.findOne({
			rangeStart: {$lte: myIp},
			rangeEnd:   {$gte: myIp}
		}).exec();
	}
};
module.exports = ipListImporter;