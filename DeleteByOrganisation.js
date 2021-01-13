var AWS = require("aws-sdk");
require('dotenv').config();
var prompt = require('prompt-sync')({sigint: true});

AWS.config.update({
    region: process.env.region
});


var InputOrgId = prompt('Enter The Organization Id: ', null);

getSortKey(InputOrgId);
async function getSortKey(InputOrgId)
{
    var params = {
        TableName: process.env.dbName,
        KeyConditionExpression: 'OrgId = :hkey',
        ExpressionAttributeValues: {
          ':hkey': InputOrgId
        }
      };
      
      var documentClient = new AWS.DynamoDB.DocumentClient();
      
      documentClient.query(params, function(err, data) {
         if (err) console.log(err);
         else chunkArray(data.Items,data.Items.length)
      });
}

function chunkArray(myArray, n){
    
    var chunks = [], i = 0;
    while (i < n) {
      chunks.push(myArray[i].SortKey);
      i++;
    }
    deleteByOrgId(chunks,InputOrgId);
}


async function deleteByOrgId(chunks,InputOrgId)
{
    i=0;
    while(i<chunks.length){
        
        var docClient = new AWS.DynamoDB.DocumentClient();
        var params = {
            RequestItems: {
                [process.env.dbName] : [
                {
                    DeleteRequest: {
                    Key: { 
                        OrgId: InputOrgId,
                        SortKey: chunks[i]
                        }
                    }
                }
                
                ]
            }
        };
        var timeSpan= "Time for "+i;
        console.time(timeSpan);
        docClient.batchWrite(params, (err, data) => {
            if (err) {
                console.error(JSON.stringify(err, null, 2));
            } else {
                console.timeEnd(timeSpan);
            }
        });
        i++;
    }
}



