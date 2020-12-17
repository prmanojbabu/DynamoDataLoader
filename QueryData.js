var AWS = require("aws-sdk");
var fs = require('fs');
require('dotenv').config();
AWS.config.update({
    region: process.env.region
});


function ImportDir(){
    var dir = './dataFiles';
    var files = [];
    fs.stat(dir, async (err, stat) => {
        if(err == null) {
            console.log("Importing sample data into DynamoDB. Please wait.");
            console.log('Feedback Data folder exist');
            files = fs.readdirSync(dir);
            await Promise.all(files.map(async (file) => { await ImportFile(dir,file); }));
        } else if(err.code === 'ENOENT') {
            console.log('Org Data File doesn\'t exists');
            process.exit(1);
        } else {
            console.log('Some other error: ', err.code);
            process.exit(1);
        }
    });
}

async function ImportFile(dir, file)
{
    if(file.startsWith('org_'))
    {
        await ImportData(dir+'/'+file);
    }
}

async function ImportData(file)
{
    console.log(`Importing the File ${file}`);
    var allOrgId = JSON.parse(fs.readFileSync(file, 'utf8'));
    await Promise.all(allOrgId.map(async (OrgId) => { await QueryDataByOrgId(OrgId); }));
}

function generateDir()
{
    var dir = './ResultFiles';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    else
    {
        fs.rmdirSync(dir, { recursive: true });
        fs.mkdirSync(dir);
    }
}

async function QueryDataByOrgId(OrgId)
{
    var awsdynamo = new AWS.DynamoDB();
    params = {
        TableName : process.env.dbName,
        KeyConditionExpression: "OrgId = :orgval",
        ExpressionAttributeValues: {
            ":orgval": {S: OrgId}
        },
       Limit: '2000',
       ReturnConsumedCapacity: 'TOTAL', 
       ProjectionExpression:"OrgId, ID, Phrase, SentimentFeedbackValue,SentimentInitialValue,SourceInteractionID,CreatedBy,CreatedDate",
       
    };
    console.log(`Quering for Org : ${OrgId}`);
    console.time(OrgId);
    awsdynamo.query(params, function(err, data) {
        if (err) {
            console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
            console.timeEnd(OrgId);
            fs.writeFileSync(`./ResultFiles/query_${OrgId}.json`, JSON.stringify(data, null, "\t"), 'utf8');
        }
    });
}

async function GetDataByOrgId(OrgId)  // Dont Use it
{
    var awsdynamo = new AWS.DynamoDB();
    params = {
        TableName : process.env.dbName,
        Key: {
            "OrgId": {
              S: OrgId
             },
             "ID":{
              S: "1f7a0d2d-9faf-4307-bea9-ca43caf60929"   
             }
           }, 
       ReturnConsumedCapacity: 'TOTAL', // | TOTAL | NONE,
       ProjectionExpression:"OrgId, ID, Phrase, SentimentFeedbackValue,SentimentInitialValue,SourceInteractionID,CreatedBy,CreatedDate",
       // Select: "COUNT", //Select: ALL_ATTRIBUTES | ALL_PROJECTED_ATTRIBUTES | SPECIFIC_ATTRIBUTES | COUNT
    };
    console.log(`Get for Org : ${OrgId}`);
    console.time(OrgId);
    awsdynamo.getItem(params, function(err, data) {
        if (err) {
            console.log("Unable to Get. Error:", JSON.stringify(err, null, 2));
        } else {
            console.timeEnd(OrgId);
            fs.writeFileSync(`./ResultFiles/Get_${OrgId}.json`, JSON.stringify(data, null, "\t"), 'utf8');
        }
    });
}
generateDir();
ImportDir();

