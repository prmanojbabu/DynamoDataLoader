var AWS = require("aws-sdk");
var fs = require('fs');


function generateResultDir()
{
    console.log('Generating Result Insert');
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

async function ImportDataSample(config)
{
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
            var dir = `./SampleDataFiles/${TableName}`;
            resolve(ImportDir(dir));
            }));
        });
    await Promise.all(createJobs);
}


function ImportDir(dir){
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
    await ImportData(dir+'/'+file);
}

async function ImportData(MainTableName,MetaDataTable,File)
{
    console.log(`Importing the File ${file}`);
    var allfeedback = JSON.parse(fs.readFileSync(File, 'utf8'));
    await Promise.all(allfeedback.map(async (dataItem) => { await putData(dataItem, MainTableName, MetaDataTable); }));
}

async function putData(dataItem, MainTableName, MetaDataTable)
{
    var params = {
        TransactItems: [
            // {
            //     ConditionCheck: {
            //         ConditionExpression: 'SentimentFeedbackItemCount < :MAX',
            //         Key: {
            //             'OrgId': dataItem.OrgId,
            //             'SortKey': 'SentimentFeedbackItemCount'
            //         },
            //         TableName: MetaDataTable,
            //         ExpressionAttributeValues: {
            //             ':MAX': 2000
            //         },
            //         ReturnValuesOnConditionCheckFailure: "ALL_OLD",
            //     },
            // }, 
            {
                Put: {
                    Item: dataItem,
                    TableName: MainTableName,
                    ConditionExpression: '(attribute_not_exists(OrgId) AND attribute_not_exists(SortKey)) AND (attribute_not_exists(OrgId) AND attribute_not_exists(ID))',
                    ReturnValuesOnConditionCheckFailure: "ALL_OLD",
                }
            }
            // ,{
            //     Update: {
            //         Key: {
            //             'OrgId': dataItem.OrgId,
            //         },
            //         TableName: MetaDataTable,
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
await WriteTransaction(param);
}

async function WriteTransaction(params)
{
    var docClient = new AWS.DynamoDB.DocumentClient();
    await docClient.transactWrite(params, (err, data) => {
        if (err) {
            console.error(`Unable to add feeds in file`, params, ". Error JSON:", JSON.stringify(err, null, 2));
        }
        if(data) {
            fs.appendFileSync(`./ResultInsert/Insert_Output.json`, JSON.stringify(data, null, "\t") + ",\n", 'utf8');
        }
    });
}

module.exports = {ImportDataSample};