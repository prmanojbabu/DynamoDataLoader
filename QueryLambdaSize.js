var AWS = require("aws-sdk");
const { Console, timeStamp } = require("console");
var fs = require('fs');
var _ = require('lodash');
var sizeof = require('object-sizeof');

async function  testLambdaSize()
{
    var lambda = 'STA_Feedback_Dynamo_CreateTest';

    var SampleEvent = [ {"DBName": "STA_FeedBack_Main_5_400_2000", "orgID": "8962f5c3-94a1-4a7a-a305-07963767f95f", "toZip": true},
                        {"DBName": "STA_FeedBack_Main_5_400_2000", "orgID": "8962f5c3-94a1-4a7a-a305-07963767f95f", "toZip": false},
                        {"DBName": "STA_FeedBack_Main_5_4000_20000", "orgID": "2b1c98e1-5031-4736-b3c9-e6ca70aa993e", "toZip": true},
                        {"DBName": "STA_FeedBack_Main_5_4000_20000", "orgID": "2b1c98e1-5031-4736-b3c9-e6ca70aa993e", "toZip": false},
                        {"DBName": "STA_FeedBack_Main_20_1000_20000", "orgID": "589717af-cbc7-468b-8da0-1cf96d997dc1", "toZip": true},
                        {"DBName": "STA_FeedBack_Main_20_1000_20000", "orgID": "589717af-cbc7-468b-8da0-1cf96d997dc1", "toZip": false},
                        {"DBName": "STA_FeedBack_Main_20_2000_40000", "orgID": "d75c8a68-98bd-48d4-b647-f4feb6b64c4f", "toZip": true},
                        {"DBName": "STA_FeedBack_Main_20_2000_40000", "orgID": "d75c8a68-98bd-48d4-b647-f4feb6b64c4f", "toZip": false},
                        {"DBName": "STA_FeedBack_Main_100_1000_100000", "orgID": "fdac3aba-6cba-4a5f-92f4-fdf61f38f6ae", "toZip": true},
                        {"DBName": "STA_FeedBack_Main_100_1000_100000", "orgID": "fdac3aba-6cba-4a5f-92f4-fdf61f38f6ae", "toZip": false},
                        {"DBName": "STA_FeedBack_Main_100_2000_200000", "orgID": "533dec9d-546f-421c-9eb7-ea3d37ecdff5", "toZip": true},
                        {"DBName": "STA_FeedBack_Main_100_2000_200000", "orgID": "533dec9d-546f-421c-9eb7-ea3d37ecdff5", "toZip": false},
                        {"DBName": "STA_FeedBack_Main_100_3000_300000", "orgID": "938b9ced-9ab3-4b43-86ae-b74f95893c47", "toZip": true},
                        {"DBName": "STA_FeedBack_Main_100_3000_300000", "orgID": "938b9ced-9ab3-4b43-86ae-b74f95893c47", "toZip": false},
                        {"DBName": "STA_FeedBack_Main_500_2000_1000000", "orgID": "7699067e-6d1f-485a-8db9-c21a8b088b91", "toZip": true},
                        {"DBName": "STA_FeedBack_Main_500_2000_1000000", "orgID": "7699067e-6d1f-485a-8db9-c21a8b088b91", "toZip": false},
                        {"DBName": "STA_FeedBack_Main_500_3000_1500000", "orgID": "348497ea-d499-4489-b4f6-84ea319489cc", "toZip": true},
                        {"DBName": "STA_FeedBack_Main_500_3000_1500000", "orgID": "348497ea-d499-4489-b4f6-84ea319489cc", "toZip": false}, ];


    for (const element of SampleEvent) {
        const params = {
            FunctionName: lambda, 
            Payload: JSON.stringify(element)
        };
        AWS.config.update({
            region: "us-east-1"
        });
        const result = await (new AWS.Lambda().invoke(params).promise().catch((res) => console.log(res)));
        
        console.log(`${element.DBName} : ${element.toZip}`);
        console.log(`${sizeof(result)/1024/1024} MB`);
    }
}
module.exports = {testLambdaSize};
