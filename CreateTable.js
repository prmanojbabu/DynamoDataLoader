
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

var params_main = {
    TableName : process.env.dbName,
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
                "IsDeleted"
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
    TableName : process.env.dbMetaDataName,
    BillingMode: "PAY_PER_REQUEST",
    AttributeDefinitions: [
        { AttributeName: "OrgId", AttributeType: "S" },
    ],
    KeySchema: [       
        { AttributeName: "OrgId", KeyType: "HASH"},  //Partition key

    ],
    Tags: [{ Key: "Owner" , Value: "Dev-CloudSTAFeedbackService@genesys.com"}],
    
};

dynamodb.createTable(params_main, function(err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        console.log("Main Table Created Successfully");
    }
});

dynamodb.createTable(params_Metadata, function(err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        console.log("Meta Data Created Successfully");
    }
});