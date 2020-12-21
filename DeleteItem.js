var AWS = require("aws-sdk");
require('dotenv').config();
var prompt = require('prompt-sync')({sigint: true});

AWS.config.update({
    region: process.env.region
});

var InputOrgId = prompt('Enter The Organization Id: ', null);
var InputId = prompt('Enter The Id: ', null);


async function getSortKey(InputOrgId,InputId)
{
    
    var awsdynamo = new AWS.DynamoDB();
    params = {
        TableName : process.env.dbName,
        IndexName: 'Index-OrgId-Id',
        KeyConditionExpression: "OrgId = :orgval AND Id = :rowid",
        ExpressionAttributeValues: {
            ":orgval": {S: InputOrgId},
            ":rowid": {S: InputId},
        },
       Limit: '1',
       ReturnConsumedCapacity: 'NONE',
       ProjectionExpression:"SortKey",
    };
    
    awsdynamo.query(params, function(err, data) {
        if (err) {
            console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
            console.log(JSON.stringify(data.Items[0].SortKey.S));
            deleteItem(InputOrgId,data.Items[0].SortKey.S);
        }
    });
}

async function deleteItem(InputOrgId, InputSortKey)
{
    var docClient = new AWS.DynamoDB.DocumentClient();
    var params = {
        TransactItems: [
            {
                Update: {
                    Key: {
                        'OrgId': InputOrgId,
                        'SortKey':  InputSortKey
                    },
                    TableName: process.env.dbName,
                    UpdateExpression: 'Set IsDeleted = :del',
                    
                    ExpressionAttributeValues: {
                        ':del': true,
                    },
                    ReturnValuesOnConditionCheckFailure: "ALL_OLD",
                }
            },
            {
                Update: {
                    Key: {
                        'OrgId': InputOrgId,
                    },
                    TableName: process.env.dbMetaDataName,
                    UpdateExpression: 'ADD SentimentFeedbackItemCount :incr SET LastUpdateDate = :currentdate',
                    ExpressionAttributeValues: {
                        ':incr': -1,
                        ':currentdate' : new Date().toUTCString()
                    },
                    ReturnValuesOnConditionCheckFailure: "NONE",
                }
            }
    
        ],
    
        ReturnConsumedCapacity: "INDEXES"
    };
    console.time("deletetime")
    docClient.transactWrite(params, (err, data) => {
        if (err) {
            console.error(JSON.stringify(err, null, 2));
        } else {
            console.timeEnd("deletetime");
            console.log(" Success: ");
    
        }
    });
}

getSortKey(InputOrgId,InputId);



