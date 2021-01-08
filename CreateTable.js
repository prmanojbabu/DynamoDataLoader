
var AWS = require("aws-sdk");

async function CreateSampleTables(config)
{
    AWS.config.update({
        region: config.Region
    });
    const createJobs = []
    config.DBSampling.forEach(element => {
        createJobs.push(
            new Promise((resolve, reject) =>
            {
            const Suffix = `${element.OrganizationCount}_${element.TotalRecordPerOrg}_${element.OrganizationCount*element.TotalRecordPerOrg}`;
            resolve(CreateTable(config.MainTableNamePrefix, Suffix));
            }));
        });
    await Promise.all(createJobs);
}

async function CreateTable(Prefix, Suffix)
{
    var params_Main = {
        TableName : `${Prefix}_Main_${Suffix}`,
        BillingMode: "PAY_PER_REQUEST",
        AttributeDefinitions: [
            { AttributeName: "OrgId", AttributeType: "S" },
            { AttributeName: "SortKey", AttributeType: "S" },
            { AttributeName: "TranscriptId", AttributeType: "S"},
            { AttributeName: "Id", AttributeType: "S"}
        ],
        KeySchema: [       
            { AttributeName: "OrgId", KeyType: "HASH"},  //Partition key
            { AttributeName: "SortKey", KeyType: "RANGE" }, //Sort key

        ],
        Tags: [{ Key: "Owner" , Value: "Dev-CloudSTAFeedbackService@genesys.com"}],
        LocalSecondaryIndexes: [
            {
            IndexName: 'Index-OrgId-TranscriptId',
            KeySchema: [ 
                { AttributeName: "OrgId", KeyType: "HASH"}, 
                { AttributeName: "TranscriptId", KeyType: "RANGE"},
            ],
            Projection: {
                NonKeyAttributes: [
                    "Phrase",
                    "SentimentFeedbackValue", 
                    "SentimentInitialValue",
                    "CreatedBy",
                    "CreatedDate",
                    "StemmedPhrase",
                    "Language",
                ],
                ProjectionType: "INCLUDE"
            }
            },
            {
                IndexName: 'Index-OrgId-Id',
                KeySchema: [
                    { AttributeName: "OrgId", KeyType: "HASH" },
                    { AttributeName: "Id", KeyType: "RANGE" },
                ],
                Projection: {
                    ProjectionType: "KEYS_ONLY"
                }
            },
        ]
    };

    var params_Metadata = {
        TableName : `${Prefix}_MetaData_${Suffix}`,
        BillingMode: "PAY_PER_REQUEST",
        AttributeDefinitions: [
            { AttributeName: "OrgId", AttributeType: "S" },
        ],
        KeySchema: [       
            { AttributeName: "OrgId", KeyType: "HASH"},  //Partition key

        ],
        Tags: [{ Key: "Owner" , Value: "Dev-CloudSTAFeedbackService@genesys.com"}],
        
    };
    CreateDynamoTable(params_Main);
    CreateDynamoTable(params_Metadata);
}

async function CreateDynamoTable(params)
{
    var dynamodb = new AWS.DynamoDB();
    console.log('Creating '+ params.TableName);
    await dynamodb.createTable(params, function(err, data) {
        if (err) {
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
}

module.exports = {CreateSampleTables};