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
    var allOrgID = JSON.parse(fs.readFileSync(file, 'utf8'));
    await Promise.all(allOrgID.map(async (orgID) => { await GetDataByOrgID(orgID); }));
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

async function GetDataByOrgID(orgID)
{
    var awsdynamo = new AWS.DynamoDB();
    params = {
        TableName : process.env.dbName,
        IndexName : "OrgID",
        KeyConditionExpression: "OrgID = :orgval",
        ExpressionAttributeValues: {
            ":orgval": {S: orgID}
        },
       Limit: '2000',
       Select: 'ALL_PROJECTED_ATTRIBUTES',
       ReturnConsumedCapacity: 'INDEXES', // | TOTAL | NONE,
    };
    console.log(`Quering for Org : ${orgID}`);
    console.time(orgID);
    awsdynamo.query(params, function(err, data) {
        if (err) {
            console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
            console.timeEnd(orgID);
            fs.writeFileSync(`./ResultFiles/query_${orgID}.json`, JSON.stringify(data, null, "\t"), 'utf8');
        }
    });
}
generateDir();
ImportDir();

