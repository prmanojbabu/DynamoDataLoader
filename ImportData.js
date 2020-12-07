var AWS = require("aws-sdk");
var fs = require('fs');
AWS.config.update({
    region: "us-east-1"
});

function ImportData(file)
{
    var docClient = new AWS.DynamoDB.DocumentClient();
    console.log(`Importing the File ${file}`);
    var allfeedback = JSON.parse(fs.readFileSync(file, 'utf8'));
        allfeedback.forEach(function(dataItem) {
        var params = {
            TableName: "STA_FeedBack_Test1",
            Item: dataItem
        };
        docClient.put(params, function(err, data) {
           if (err) {
               console.error(`Unable to add feeds in file ${file}`, dataItem.ID, ". Error JSON:", JSON.stringify(err, null, 2));
           } else {
               console.log(`file ${file} PutItem succeeded: ${dataItem.ID}`);
           }
        });
    });
}
var dir = './dataFiles';
fs.stat(dir, function(err, stat) {
    if(err == null) {
        console.log("Importing sample data into DynamoDB. Please wait.");
        console.log('FeedBack Data folder exist');
        fs.readdirSync(dir).forEach(file => {
            if(file.startsWith('feedBack_'))
            {
                ImportData(dir+'/'+file);
            }
          });
        
    } else if(err.code === 'ENOENT') {
        console.log('FeedBack Data File doesn\'t exists');
        process.exit(1);
    } else {
        console.log('Some other error: ', err.code);
        process.exit(1);
    }
});



