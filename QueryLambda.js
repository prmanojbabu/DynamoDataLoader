var AWS = require("aws-sdk");
const { Console } = require("console");
var fs = require('fs');
AWS.config.update({region: 'us-east-1'});
const EventValue = {"DBName": "STA_FeedBack_Test_Table_100_1000","orgID": "d68ac6f1-7402-410f-a164-ba521b8b220c"};
var lambda = 'STA_Feedback_Dynamo_Test';
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
          console.log("Importing sample data into DynamoDB. Please wait.");
          console.log(`Reading directory ${dir}`);
          files = fs.readdirSync(dir);
          await Promise.all(files.map(async (file) => { await ImportFile(dir,file,TableName,MetaTableName); }));
      } else if(err.code === 'ENOENT') {
          console.log('Lambda Test Data File doesn\'t exists');
          process.exit(1);
      } else {
          console.log('Some other error: ', err.code);
          process.exit(1);
      }
  });
}

async function ImportFile(dir, file, TableName,MetaTableName)
{
    if(file.equal('LambdaOrgID.json'));
    await ImportData(dir+'/'+file,TableName,MetaTableName);
}

async function ImportData(File,MainTableName,MetaDataTable)
{
    console.log(`Importing the File ${File}`);
    var orgID = JSON.parse(fs.readFileSync(File, 'utf8'));
    Console.log(orgID);
}

// async function InvokeLambda(SampleEvent)
// {
//   const params = {
//     FunctionName: lambda, 
//     Payload: JSON.stringify(SampleEvent),
//   };
//   const result = await (new AWS.Lambda().invoke(params).promise());
//   console.log(result);
// };

// InvokeLambda(EventValue).catch(error => console.error(error));