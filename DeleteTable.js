var AWS = require("aws-sdk");

async function DeleteSampleTables(config)
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
            resolve(DeleteTable(config.MainTableNamePrefix, Suffix));
            }));
        });
    await Promise.all(createJobs);
}

async function DeleteTable(Prefix, Suffix)
{
    var params_Main = {TableName : `${Prefix}_Main_${Suffix}`};
    var params_Metadata = {TableName : `${Prefix}_MetaData_${Suffix}`};
    DeleteDynamoTable(params_Main);
    // DeleteDynamoTable(params_Metadata);
}

async function DeleteDynamoTable(params)
{
    var dynamodb = new AWS.DynamoDB();
    console.log('Deleting '+ params.TableName);
    await dynamodb.deleteTable(params, function(err, data) {
        if (err) {
            console.error("Unable to delete table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Deleted table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
}


// AWS.config.update({
//     region: "us-east-1"
// });

// DeleteDynamoTable({TableName : `STA_FeedBack_MetaData_5_400_2000`});
// DeleteDynamoTable({TableName : `STA_FeedBack_MetaData_5_4000_20000`});
// DeleteDynamoTable({TableName : `STA_FeedBack_MetaData_20_1000_20000`});
// DeleteDynamoTable({TableName : `STA_FeedBack_MetaData_20_2000_40000`});
// DeleteDynamoTable({TableName : `STA_FeedBack_MetaData_100_1000_100000`});
// DeleteDynamoTable({TableName : `STA_FeedBack_MetaData_500_2000_1000000`});
// DeleteDynamoTable({TableName : `STA_FeedBack_MetaData_500_3000_1500000`});
// DeleteDynamoTable({TableName : `STA_FeedBack_MetaData_500_4000_2000000`});
// DeleteDynamoTable({TableName : `STA_FeedBack_MetaData_2000_2000_4000000`});

module.exports = {DeleteSampleTables};