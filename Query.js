
                        
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
var prompt = require('prompt-sync')({sigint: true});
var PromptSync = require('prompt-sync');

var InputOrgID = prompt('Enter The Organization ID: ', null);
var InputID = prompt('Enter The ID: ', null);
var InputPhrase=prompt('Enter The Phrase: ', null);

AWS.config.update({
    region: "us-east-1"
});

function InputAnalysis()
{
    if(InputOrgID&&InputID&&!InputPhrase)
    {
        QueryWithBaseTableIndex();
    }
    else if(InputOrgID&&!InputID&&!InputPhrase)
    {
        QueryWithOrgID();
    }
    else if(InputOrgID&&!InputID&&InputPhrase)
    {
        QueryWithGlobalSecondaryIndexOrgIDPhrase();
    }
    else if(!InputOrgID&&!InputID&&!InputPhrase)
    {
        QueryTheWholeTable();
    }
}
InputAnalysis();


var docClient = new AWS.DynamoDB();

var params;
function QueryWithBaseTableIndex()
{
    console.log("Querying With Base Table Index");
    params = {
        TableName : "STA_FeedBack_Test1",
        KeyConditionExpression: "#OrgID = :OrgID and #ID = :ID",
        ExpressionAttributeNames:{
            "#OrgID": "OrgID",
            "#ID": "ID"
        },
        ExpressionAttributeValues: {
            ":OrgID": { S: InputOrgID},
            ":ID": { S: InputID}
        }
    };
}
function QueryWithOrgID()
{
    console.log("Querying On The Basis Of Organisation");
    params = {
        TableName : "STA_FeedBack_Test1",
        KeyConditionExpression: "#OrgID = :OrgID",
        ExpressionAttributeNames:{
            "#OrgID": "OrgID",
        },
        ExpressionAttributeValues: {
            ":OrgID": { S: InputOrgID}
        }
    };
}
function QueryWithGlobalSecondaryIndexOrgIDPhrase()
{
    console.log("Querying by GSI");
    params = {
        TableName : "STA_FeedBack_Test1",
        IndexName : "OrgID-Phrase",
        KeyConditionExpression: "#OrgID = :OrgID and #Phrase = :Phrase",
        ExpressionAttributeNames:{
            "#OrgID": "OrgID",
            "#Phrase": "Phrase"
        },
        ExpressionAttributeValues: {
            ":OrgID": { S: InputOrgID},
            ":Phrase": { S : InputPhrase}
        }
    };
}
function QueryTheWholeTable()
{
    console.log("Querying The Whole Table")
    params = {
        TableName : "STA_FeedBack_Test1"
    }
}


   console.time("query");
    docClient.query(params, function(err, data) {
    if (err) {
        console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
        
        console.log("Query succeeded.");
        // data.Items.forEach(function(item) {
        //     console.log(item);
        // });
        console.log(data.Items.length);
    }
    console.timeEnd("query");
});



                    