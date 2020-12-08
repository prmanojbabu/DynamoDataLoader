var AWS = require("aws-sdk");
var fs = require('fs');
AWS.config.update({
    region: "us-east-1"
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

async function GetDataByOrgID(orgID)
{
    var awsdynamo = new AWS.DynamoDB();
    params = {
        TableName : "STA_FeedBack_Test1",
        IndexName : "OrgID-Phrase",
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
            console.log("Query succeeded.");
            fs.writeFileSync(`./dataFiles/query.json`, JSON.stringify(data, null, "\t"), 'utf8');
        }
    
    });

}
GetDataByOrgID("60a871c4-0936-4439-b532-e386df577a94");

