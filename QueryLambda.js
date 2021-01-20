var AWS = require("aws-sdk");
const { Console } = require("console");
var fs = require('fs');
var _ = require('lodash');
// AWS.config.update({region: 'us-east-1'});
// const EventValue = {"DBName": "STA_FeedBack_Test_Table_100_1000","orgID": "d68ac6f1-7402-410f-a164-ba521b8b220c"};
var lambda = 'STA_Feedback_Dynamo_CreateTest';
var lambdaCount = 20000
function generateResultDir()
{
    console.log('Generating Result Insert Lambada');
    var dir = './LambdaResultInsert';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    else
    {
        fs.rmdirSync(dir, { recursive: true });
        fs.mkdirSync(dir);
    }
}

async function ImportDataSample(config)
{
    lambda = config.Lambda;
    lambdaCount = config.LambdaCount;
    console.log('Lambda Function name: ' + lambda);
    generateResultDir();
    AWS.config.update({
        region: config.Region
    });
    const createJobs = []
    config.DBSampling.forEach(element => {
        const TableName = `${config.MainTableNamePrefix}_Main_${element.OrganizationCount}_${element.TotalRecordPerOrg}_${element.OrganizationCount*element.TotalRecordPerOrg}`;
        const MetaTableName = `${config.MainTableNamePrefix}_Main_${element.OrganizationCount}_${element.TotalRecordPerOrg}_${element.OrganizationCount*element.TotalRecordPerOrg}`;
        var dir = `./SampleTestDataFiles/${TableName}`;
        createJobs.push(ImportDir(dir,TableName));
        });
    await Promise.all(createJobs);
}

function ImportDir(dir,TableName){
  var files = [];
  fs.stat(dir, async (err, stat) => {
      if(err == null) {
          console.log(`Reading directory ${dir}`);
          files = fs.readdirSync(dir);
          files.forEach((file) => ImportFile(dir,file,TableName));
      } else if(err.code === 'ENOENT') {
          console.log('Lambda Test Data File doesn\'t exists');
          process.exit(1);
      } else {
          console.log('Some other error: ', err.code);
          process.exit(1);
      }
  });
}

async function ImportFile(dir, file, TableName)
{
    if(file === `LambdaOrgId.json`)
    ImportOrgDataForTable(dir+'/'+file,TableName);
}

async function ImportOrgDataForTable(File,MainTableName)
{
    const PromiseJob = []
    console.log(`Importing the File ${File}`);
    var orgIDs = fs.readFileSync(File, 'utf8').replace(/"/g,'').replace(/,/g,'').split('\n').filter(Boolean);
    console.log(`Sampling ${MainTableName} with ${orgIDs.length} orgIds with ${lambdaCount} process`);
    for (var i = 0; i < lambdaCount ;i++)
    {
      const SampleEvent = {"DBName": MainTableName, "orgID": _.sample(orgIDs)};
      PromiseJob.push(InvokeLambda(SampleEvent).catch(error => console.error(error)));
    }
    var result = await Promise.all(PromiseJob);
    console.log(`Completed Sampling ${MainTableName} with ${orgIDs.length} orgIds with ${lambdaCount} process`);
    calculateResult(result);
}

function calculateResult(result)
{
    const TotalSample = result.length;
    const DbName = _.first(result).DBName;

    const MinDBConsumedTime = _.minBy(result, 'DBConsumedTime').DBConsumedTime;
    const MaxDBConsumedTime = _.maxBy(result, 'DBConsumedTime').DBConsumedTime;
    const AvgDBConsumedTime = _.meanBy(result, 'DBConsumedTime');

    const MinDBCapacityUnit = _.minBy(result, 'DBCapacityUnit').DBCapacityUnit;
    const MaxDBCapacityUnit = _.maxBy(result, 'DBCapacityUnit').DBCapacityUnit;
    const AvgDBCapacityUnit = _.meanBy(result, 'DBCapacityUnit');

    const MinMaxMemory = _.minBy(result, 'MaxMemory').MaxMemory;
    const MaxMaxMemory = _.maxBy(result, 'MaxMemory').MaxMemory;
    const AvgMaxMemory = _.meanBy(result, 'MaxMemory');

    return  {
        DbName,
        DBConsumedTime:{Min: MinDBConsumedTime, Max: MaxDBConsumedTime, Avg: AvgDBConsumedTime},
        DBCapacityUnit: { Min:MinDBCapacityUnit, Max: MaxDBCapacityUnit, Avg: AvgDBCapacityUnit},
        MaxMemory:{Min: MinMaxMemory,Max: MaxMaxMemory, Avg:AvgMaxMemory},
        TotalSample
    };
    
}

async function InvokeLambda(SampleEvent)
{
  const params = {
    FunctionName: lambda, 
    Payload: JSON.stringify(SampleEvent),
    LogType: 'Tail'
  };
  const result = await (new AWS.Lambda().invoke(params).promise().catch((res) => console.log(res)));
  const Payload = JSON.parse(result.Payload);
  var countItems = Payload.ItemsCount;
  var dbTime= Payload.DynamoDBTimeConsumed;
  var log = Buffer.from(result.LogResult, 'base64').toString('ascii');
  var MaxMemoryUsed = Number(log.substring(log.indexOf('Max Memory Used: ') + 'Max Memory Used: '.length, log.length-5));
  if(MaxMemoryUsed === NaN)
  {
    MaxMemoryUsed = 0;
  }
  if(dbTime && countItems > 0){
    return {DBName:SampleEvent.DBName, DBConsumedTime: Number(dbTime.replace(' ms','')), DBCapacityUnit: Number(Payload.ConsumedCapacity) , MaxMemory: MaxMemoryUsed};
  }
}

function WriteStats(data)
{
  fs.appendFileSync(`./LambdaResultInsert/Stats.json`, JSON.stringify(data,null, "\t") + "\n", 'utf8');
}



module.exports = {ImportDataSample};