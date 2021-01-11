var AWS = require("aws-sdk");
const { Console } = require("console");
var fs = require('fs');
var _ = require('lodash');
// AWS.config.update({region: 'us-east-1'});
// const EventValue = {"DBName": "STA_FeedBack_Test_Table_100_1000","orgID": "d68ac6f1-7402-410f-a164-ba521b8b220c"};
var lambda = 'STA_Feedback_Dynamo_Test';
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
    console.log('Lambda Function name: ' + lambda)
    generateResultDir();
    AWS.config.update({
        region: config.Region
    });
    const createJobs = []
    config.DBSampling.forEach(element => {
        createJobs.push(
            new Promise((resolve, reject) =>
            {
            const TableName = `${config.MainTableNamePrefix}_Main_${element.OrganizationCount}_${element.TotalRecordPerOrg}_${element.OrganizationCount*element.TotalRecordPerOrg}`;
            const MetaTableName = `${config.MainTableNamePrefix}_Main_${element.OrganizationCount}_${element.TotalRecordPerOrg}_${element.OrganizationCount*element.TotalRecordPerOrg}`;
            var dir = `./SampleTestDataFiles/${TableName}`;
            resolve(ImportDir(dir,TableName));
            }));
        });
    await Promise.all(createJobs);
}

function ImportDir(dir,TableName){
  var files = [];
  fs.stat(dir, async (err, stat) => {
      if(err == null) {
          console.log(`Reading directory ${dir}`);
          files = fs.readdirSync(dir);
          await Promise.all(files.map(async (file) => { await ImportFile(dir,file,TableName); }));
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
    await ImportData(dir+'/'+file,TableName);
}

async function ImportData(File,MainTableName)
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
    await Promise.allSettled(PromiseJob);
}

async function InvokeLambda(SampleEvent)
{
  const params = {
    FunctionName: lambda, 
    Payload: JSON.stringify(SampleEvent),
  };
  const result = await (new AWS.Lambda().invoke(params).promise());
  const Payload = JSON.parse(result.Payload);
  
  var countItems = Payload.ItemsCount;
  var dbTime= Payload.DynamoDBTimeConsumed;
  if(dbTime && countItems > 0){
  WriteStats(dbTime.replace(' ms',''),SampleEvent.DBName);
  }
  
}

async function WriteStats(data,MainTableName)
{
  fs.appendFileSync(`./LambdaResultInsert/${MainTableName}_Output.json`, data + "\n", 'utf8');
}



module.exports = {ImportDataSample};