var AWS = require("aws-sdk");
var fs = require('fs');

AWS.config.update({
    region: "us-east-1"
});

var docClient = new AWS.DynamoDB.DocumentClient();

console.log("Importing sample data into DynamoDB. Please wait.");

var allfeedback = JSON.parse(fs.readFileSync('sample.json', 'utf8'));
allfeedback.forEach(function(feed) {
    var params = {
        TableName: "STA_FeedBack_Test1",
        Item: {
            "OrgID":  feed.OrgID,
            "ID": feed.ID,
            "Phrase":  feed.Phrase,
            "SentimentFeedBackValue" : feed.SentimentFeedBackValue,
            "SentimentOriginalValue" : feed.SentimentOriginalValue,
            "SourceInteractionID": feed.SourceInteractionID,
            "CreatedBy": feed.CreatedBy,
            "CreatedDate": feed.CreatedDate
        }
    };

    docClient.put(params, function(err, data) {
       if (err) {
           console.error("Unable to add feeds", feed.title, ". Error JSON:", JSON.stringify(err, null, 2));
       } else {
           console.log("PutItem succeeded:", feed.ID);
       }
    });
});
