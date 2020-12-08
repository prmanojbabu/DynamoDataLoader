
                        
/**
 * Copyright 2010-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * This file is licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License. A copy of
 * the License is located at
 *
 * http://aws.amazon.com/apache2.0/
 *
 * This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
*/
var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-east-1"
});

var docClient = new AWS.DynamoDB.DocumentClient();

console.log("Querying by OrgID");

var params = {
    ExpressionAttributeNames:{
        "#OrgID": "OrgID",
        "#ID": "ID",
        "#Phrase": "Phrase",
        "#SourceInteractionID": "SourceInteractionID",
        "#SentimentFeedBackValue": "SentimentFeedBackValue",
        "#SentimentInitialValue": "SentimentInitialValue",
        "#CreatedBy": "CreatedBy",
        "#CreatedDate": "CreatedDate"
        
    },
    ExpressionAttributeValues: {
        ":a": ""
    },
    KeyConditionExpression: "#OrgID= :a", 
    ProjectionExpression: "#OrgID, #ID, #Phrase, #SourceInteractionID, #SentimentFeedBackValue, #SentimentInitialValue, #CreatedBy, #CreatedDate", 
    TableName: "STA_FeedBack_Test1"
   };
   console.time("query");
docClient.query(params, function(err, data) {
    if (err) {
        console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
        
        console.log("Query succeeded.");
        data.Items.forEach(function(item) {
            console.log(item);
        });
        
    }
    console.timeEnd("query");
});



                    