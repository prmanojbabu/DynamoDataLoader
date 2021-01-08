var DataGenerator = require('./DataGenerator');
var CreateTable = require('./CreateTable');
var DeleteTable = require('./DeleteTable');
var config = require('./ReadConfig');

//DataGenerator.GenerateDB(config);
//CreateTable.CreateSampleTables(config);
DeleteTable.DeleteSampleTables(config);