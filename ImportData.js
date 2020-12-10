var AWS = require("aws-sdk");
var fs = require('fs');
require('dotenv').config();
AWS.config.update({
    region: process.env.region
});

function generateResultDir()
{
    var dir = './ResultInsert';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    else
    {
        fs.rmdirSync(dir, { recursive: true });
        fs.mkdirSync(dir);
    }
}
function ImportDir(){
    var dir = './dataFiles';
    var files = [];
    fs.stat(dir, async (err, stat) => {
        if(err == null) {
            console.log("Importing sample data into DynamoDB. Please wait.");
            console.log('FeedBack Data folder exist');
            files = fs.readdirSync(dir);
            await Promise.all(files.map(async (file) => { await ImportFile(dir,file); }));
        } else if(err.code === 'ENOENT') {
            console.log('FeedBack Data File doesn\'t exists');
            process.exit(1);
        } else {
            console.log('Some other error: ', err.code);
            process.exit(1);
        }
    });
}

async function ImportFile(dir, file)
{
    if(file.startsWith('feedBack_'))
    {
        await ImportData(dir+'/'+file);
    }
}

async function ImportData(file)
{
    console.log(`Importing the File ${file}`);
    var allfeedback = JSON.parse(fs.readFileSync(file, 'utf8'));
    await Promise.all(allfeedback.map(async (dataItem) => { await putData(file,dataItem); }));
}

async function putData(file, dataItem)
{
    var docClient = new AWS.DynamoDB.DocumentClient();
    var params = {
        TableName:process.env.dbName,
        Item: dataItem,
        ReturnConsumedCapacity: "INDEXES",
        ConditionExpression: 'attribute_not_exists(ID) AND attribute_not_exists(OrgID)'  
    };
    await docClient.put(params, (err, data) => {
       if (err) {
           console.error(`Unable to add feeds in file ${file}`, params.Item.ID, ". Error JSON:", JSON.stringify(err, null, 2));
       } else {
           console.log("File :"+ file+ " Success: "+ params.Item.ID );
           fs.writeFileSync(`./ResultInsert/Insert_Output_${params.Item.ID}.json`, JSON.stringify(data, null, "\t"), 'utf8');
       }
    });
}

generateResultDir();
ImportDir();



