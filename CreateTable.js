
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
require('dotenv').config();

AWS.config.update({
    region: process.env.region
});

var dynamodb = new AWS.DynamoDB();

var params = {
    TableName : process.env.dbName,
    BillingMode: "PAY_PER_REQUEST",
    AttributeDefinitions: [
        { AttributeName: "OrgID", AttributeType: "S" },
        { AttributeName: "ID", AttributeType: "S" },
        { AttributeName: "Phrase", AttributeType: "S" },
    ],
    KeySchema: [       
        { AttributeName: "OrgID", KeyType: "HASH"},  //Partition key
        { AttributeName: "ID", KeyType: "RANGE" }  //Sort key
    ],
    GlobalSecondaryIndexes: [
        {
          IndexName: 'OrgID-Phrase', 
          KeySchema: [ 
            {
              AttributeName: 'OrgID', 
              KeyType: "HASH"
            },
            {
                AttributeName: 'Phrase', 
                KeyType: "RANGE"
              },
          ],
          Projection: {
            NonKeyAttributes: [
              'CreatedBy',
              'CreatedDate',
              "SourceInteractionID",
              "SentimentInitialValue",
              "SentimentFeedBackValue",
            ],
            ProjectionType: "INCLUDE"
          }
        },
        {
          IndexName: 'OrgID', 
          KeySchema: [ 
            {
              AttributeName: 'OrgID', 
              KeyType: "HASH"
            }
          ],
          Projection: {
            NonKeyAttributes: [
              'CreatedBy',
              'CreatedDate',
              "SourceInteractionID",
              "SentimentInitialValue",
              "SentimentFeedBackValue",
            ],
            ProjectionType: "INCLUDE"
          }
        },
    ],
    Tags: [{ Key: "Owner" , Value: "Dev-CloudSTAFeedbackService@genesys.com"}] 
};

dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
    }
});
