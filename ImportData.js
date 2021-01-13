var AWS = require("aws-sdk");
var fs = require('fs');
require('dotenv').config();
AWS.config.update({
    region: process.env.region
});

function generateResultDir()
{
    var dir = './ResultInsert';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    else
    {
        fs.rmdirSync(dir, { recursive: true });
        fs.mkdirSync(dir);
    }
}
function ImportDir(){
    var dir = './dataFiles';
    var files = [];
    fs.stat(dir, async (err, stat) => {
        if(err == null) {
            console.log("Importing sample data into DynamoDB. Please wait.");
            console.log('FeedBack Data folder exist');
            files = fs.readdirSync(dir);
            await Promise.all(files.map(async (file) => { await ImportFile(dir,file); }));
        } else if(err.code === 'ENOENT') {
            console.log('FeedBack Data File doesn\'t exists');
            process.exit(1);
        } else {
            console.log('Some other error: ', err.code);
            process.exit(1);
        }
    });
}

async function ImportFile(dir, file)
{
    if(file.startsWith('feedBack_'))
    {
        await ImportData(dir+'/'+file);
    }
}

async function ImportData(file)
{
    console.log(`Importing the File ${file}`);
    var allfeedback = JSON.parse(fs.readFileSync(file, 'utf8'));
    await Promise.all(allfeedback.map(async (dataItem) => { await putData(file,dataItem); }));
}

async function putData(file, dataItem)
{
    var docClient = new AWS.DynamoDB.DocumentClient();
    var params = {
        TransactItems: [
            // {
            //     ConditionCheck: {
            //         ConditionExpression: 'SentimentFeedbackItemCount < :MAX',
            //         Key: {
            //             'OrgId': dataItem.OrgId,
            //             'SortKey': 'SentimentFeedbackItemCount'
            //         },
            //         TableName: process.env.dbName,
            //         ExpressionAttributeValues: {
            //             ':MAX': 2000
            //         },
            //         ReturnValuesOnConditionCheckFailure: "ALL_OLD",
            //     },
            // }, 
            {
                Put: {
                    Item: dataItem,
                    TableName: process.env.dbName,
                    ConditionExpression: '(attribute_not_exists(OrgId) AND attribute_not_exists(SortKey)) AND (attribute_not_exists(OrgId) AND attribute_not_exists(ID))',
                    ReturnValuesOnConditionCheckFailure: "ALL_OLD",
                }
            },
            // {
            //     Update: {
            //         Key: {
            //             'OrgId': dataItem.OrgId,
            //         },
            //         TableName: process.env.dbMetaDataName,
            //         UpdateExpression: 'ADD SentimentFeedbackItemCount :incr SET LastUpdateDate = :currentdate',
            //         ExpressionAttributeValues: {
            //             ':incr': 1,
            //             ':currentdate' : new Date().toUTCString()
            //         },
            //         ReturnValuesOnConditionCheckFailure: "NONE",
            //     }
            // }
                
        ],

    ReturnConsumedCapacity: "INDEXES"
};
await docClient.transactWrite(params, (err, data) => {
    if (err) {
        console.error(`Unable to add feeds in file ${file}`, params, ". Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("File :" + file + " Success: " + params.TransactItems);
        fs.appendFileSync(`./ResultInsert/Insert_Output_${params.TransactItems}.json`, JSON.stringify(params.TransactItems.Put, null, "\t") + ",\n", 'utf8');

    }
});
}

generateResultDir();
ImportDir();



