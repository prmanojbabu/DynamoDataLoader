var fs = require('fs');

// Load the Lambda client
const {
    LambdaClient,
    CreateFunctionCommand
  } = require("@aws-sdk/client-lambda");
  
  //Set the AWS Region
  const REGION = "us-east-1"; //e.g. "us-east-1"
  
  // Instantiate a Lambda client
  const lambda = new LambdaClient({ region: REGION });
  
  //Set the parameters
  const params = {
    Code: {
        ZipFile: fs.readFileSync('ReadLambda.zip') /* Strings will be Base-64 encoded on your behalf */
    },
    FunctionName: "STA_Feedback_Dynamo_CreateTest",
    Handler: "index.handler",
    Role: "arn:aws:iam::490606849374:role/lambda_dynamo", // IAM_ROLE_ARN; e.g., arn:aws:iam::650138640062:role/v3-lambda-tutorial-lambda-role
    Runtime: "nodejs12.x",
    Description: "DB evaluation",
    MemorySize: 1024,
  };
  
  const run = async () => {
    try {
      const data = await lambda.send(new CreateFunctionCommand(params));
      console.log("Success", data); // successful response
    } catch (err) {
      console.log("Error", err); // an error occurred
    }
  };
  
  run();