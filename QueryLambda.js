var AWS = require("aws-sdk");
AWS.config.update({region: 'us-east-1'});
const EventValue = {"DBName": "STA_FeedBack_Test_Table_100_1000","orgID": "d68ac6f1-7402-410f-a164-ba521b8b220c"};

async function InvokeLambda(SampleEvent)
{
  const params = {
    FunctionName: 'STA_Feedback_Dynamo_Test', 
    Payload: JSON.stringify(SampleEvent),
  };
  const result = await (new AWS.Lambda().invoke(params).promise());
  console.log(result);
};

InvokeLambda(EventValue).catch(error => console.error(error));