var fs = require('fs');
const stat = require('fs').statSync;
const AdmZip = require('adm-zip');

async function createZipFile(zipFileName, pathNames)
{
    const zip = new AdmZip();
    pathNames.forEach(path => {
        const p = stat(path);
        if (p.isFile()) {
            zip.addLocalFile(path);
        } else if (p.isDirectory()) {
            zip.addLocalFolder(path, path);
        }
    });
    zip.writeZip(zipFileName);
    console.log("Zip File Created.")
}

async function createLambdaRun()
{
    createZipFile(`ReadLambda.zip`, ['index.js']); 
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
        Tags: {
            "Owner": "Dev-CloudSTAFeedbackService@genesys.com"
        }, 
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
}

module.exports = {createLambdaRun};