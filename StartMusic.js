var DataGenerator = require('./DataGenerator');
var CreateTable = require('./CreateTable');
var DeleteTable = require('./DeleteTable');
var ImportData = require('./ImportData');
var config = require('./ReadConfig');
DataGenerator.GenerateDB(config);
// CreateTable.CreateSampleTables(config);
// ImportData.ImportDataSample(config);
// DeleteTable.DeleteSampleTables(config);