var DataGeneratorV1 = require('./DataGeneratorV1');
var CreateTable = require('./CreateTable');
var DeleteTable = require('./DeleteTable');
var QueryLambda = require('./QueryLambda');
var config = require('./ReadConfig');
// CreateTable.CreateSampleTables(config);
// DataGeneratorV1.GenerateTable(config);
// DeleteTable.DeleteSampleTables(config);
QueryLambda.ImportDataSample(config);
