var AWS = require("aws-sdk");
AWS.config.update({
    region:"us-east-1"
});

exports.handler = async (event) => {
    return await QueryDataByOrgId(event.DBName, event.orgID);
};

async function QueryDataByOrgId(dbName,OrgId)
{
    
    var params = {
        TableName : dbName,
        KeyConditionExpression: "OrgId = :orgval",
        ExpressionAttributeValues: {
            ":orgval": {S: OrgId}
        },
       Limit: '2000',
       ReturnConsumedCapacity: 'INDEXES', 
       ProjectionExpression:"OrgId, ID, Phrase, SentimentFeedbackValue,SentimentInitialValue,SourceInteractionID,CreatedBy,CreatedDate"
    };
    var hrstart = process.hrtime();
    var res = await executeQuery(params);
    const hrend = process.hrtime(hrstart);
    const timer= hrend[1] / 1000000 + ' ms';
    return  { DBName: dbName,
                     ORGID : OrgId,
                     DynamoDBTimeConsumed: timer,
                     Count :res.Count,
                     ScannedCount: res.ScannedCount,
                     ItemsCount: res.Items.length,
                     ConsumedCapacity:  res.ConsumedCapacity,
                     LastEvaluatedKey: res.LastEvaluatedKey
                    };
}
 
 async function executeQuery(input)
 {      
        const Items = [];
        let Count = 0,ScannedCount = 0, ConsumedCapacity = 0;
        var awsdynamo = new AWS.DynamoDB();
        let LastEvaluatedKey = undefined;
        do {
            const queryResponse = await awsdynamo.query({
                ...input,
                ExclusiveStartKey: LastEvaluatedKey,
            }).promise();
            Count = Count + queryResponse.Count;
            ScannedCount = ScannedCount + queryResponse.ScannedCount;
            ConsumedCapacity = ConsumedCapacity+ queryResponse.ConsumedCapacity.CapacityUnits;
            if (queryResponse.Items) {
                Items.push(...queryResponse.Items);
            }
            LastEvaluatedKey = queryResponse.LastEvaluatedKey;
        }
        while (LastEvaluatedKey);
        return {ConsumedCapacity,Count,ScannedCount,LastEvaluatedKey,Items};
}