var AWS = require("aws-sdk");
var fs = require('fs');

function ImportData()
{
    console.log("Importing sample data into DynamoDB. Please wait.");
    AWS.config.update({
        region: "us-east-1"
    });
    var docClient = new AWS.DynamoDB.DocumentClient();
    var allfeedback = JSON.parse(fs.readFileSync('./dataFiles/feedBack.json', 'utf8'));
    allfeedback.forEach(function(dataItem) {
        var params = {
            TableName: "STA_FeedBack_Test1",
            Item: dataItem
        };
    
        docClient.put(params, function(err, data) {
           if (err) {
               console.error("Unable to add feeds", dataItem.title, ". Error JSON:", JSON.stringify(err, null, 2));
           } else {
               console.log("PutItem succeeded:", dataItem.ID);
           }
        });
    });
}

fs.stat('./dataFiles/feedBack.json', function(err, stat) {
    if(err == null) {
        console.log('FeedBack Data File exist');
        ImportData();
    } else if(err.code === 'ENOENT') {
        console.log('FeedBack Data File doesn\'t exists');
        process.exit(1);
    } else {
        console.log('Some other error: ', err.code);
        process.exit(1);
    }
});



