var AWS = require("aws-sdk");
var faker = require('faker');
var _ = require('lodash');
var fs = require('fs');
var stemmer_es = require('stemmer_es');
var langDetect = require('langdetect');
const { promises } = require('dns');
var SentimentEnum = ["Positive", "Negative","Neutral"];

function generateDir(dir)
{
    if (!fs.existsSync(dir)){
        console.log(`Creating Directory ${dir}`);
        fs.mkdirSync(dir,{ recursive: true });
    }
    else
    {
        console.log(`Deleting Directory ${dir}`);
        fs.rmdirSync(dir, { recursive: true });
        console.log(`Creating Directory ${dir}`);
        fs.mkdirSync(dir);
    }
    return dir;
}

async function GenerateTable(config)
{
    AWS.config.update({
        region: config.Region
    });
    const createJobs = []
    config.DBSampling.forEach(element => {
    
        createJobs.push(GenerateTableSample(config.MainTableNamePrefix, element.OrganizationCount, element.TotalRecordPerOrg));
    }); 
    await Promise.all(createJobs);
}
 
async function GenerateTableSample(MainTableNamePrefix, OrganizationCount,TotalRecordPerOrg)
{
    var Jobs = [];
    var TableNamePrefix = `${MainTableNamePrefix}_Main_${OrganizationCount}_${TotalRecordPerOrg}_${OrganizationCount*TotalRecordPerOrg}`;
    var TestDir = generateDir(`./SampleTestDataFiles/${TableNamePrefix}`);
    for(var k =1; k <= OrganizationCount; k++)
    {
        Jobs.push(GenerateOrgData(TotalRecordPerOrg, TestDir,TableNamePrefix));
            
    }
    var result = await Promise.all(Jobs);
    console.log(`Shooting ${result.length} orgs, So wait till completes`);
    _.forEach(result,(async (elm, index) => {
        await new Promise(r => setTimeout(r, 3000));
        await putData(elm, TableNamePrefix, index);
    } ));
}

async function GenerateOrgData(TotalRecordPerOrg, TestDir,MainTableName)
{
    const createJobs = [];
    var OrgId = faker.random.uuid();
    fs.appendFileSync(TestDir+'/LambdaOrgId.json',JSON.stringify(OrgId, null, 4)+ ",\n",'utf8');
    for(var i=1; i<=TotalRecordPerOrg; i++)
    {
        createJobs.push(GenerateSingleFeedback(OrgId, TestDir,MainTableName));
            
    }
    return await Promise.all(createJobs);
}
 
function GenerateSingleFeedback(OrgId, TestDir,MainTableName)
{
    var SentimentFeedbackValue = _.sample(SentimentEnum);
    var SentimentInitialValue =  _.sample((_.filter(SentimentEnum, (x)=> {return x!=SentimentFeedbackValue;})));
    var Phrase = faker.random.words(faker.random.number({min: 18, max: 20}));
    var Language = langDetect.detectOne(Phrase);
    var StemmedPhrase = stemmer_es.stem(Phrase);
    var Id = faker.random.uuid();
    var TranscriptId= _.sample([faker.random.uuid(), undefined]);
    var CreatedBy = faker.random.uuid();
    var CreatedDate = faker.date.between('2000-01-01T00:00:00.000Z', '2021-12-01T00:00:00.000Z').toISOString();
    // writeLambdaFile(TestDir,OrgId,Id,TranscriptId);
    var item = {
                "OrgId":  OrgId,
                "SortKey" : `SentimentFeedback|Lang_${Language}|StemmedPhrase_${StemmedPhrase}`,
                "Id": Id,
                "TranscriptId": TranscriptId ,
                "Phrase":  Phrase,
                "StemmedPhrase": StemmedPhrase,
                "Language": Language,
                "SentimentFeedbackValue" : SentimentFeedbackValue,
                "SentimentInitialValue" : SentimentInitialValue,
                "CreatedBy": CreatedBy,
                "CreatedDate": CreatedDate,
                };
    return item;
}

async function writeLambdaFile(TestDir,OrgId,Id,TranscriptId)
{
    fs.appendFileSync(TestDir+'/LambdaOrgId_Id.json',JSON.stringify({OrgId, Id}, null, 4)+ ",\n",'utf8');
    if(TranscriptId)
    fs.appendFileSync(TestDir+'/LambdaOrgId_TranscriptId.json',JSON.stringify({OrgId, TranscriptId}, null, 4)+ ",\n",'utf8');
}

async function putData(dataItems, MainTableName,index)
{
    console.log(`Current Org Count ${index}`);
    const chunk = _.chunk(dataItems, 10);
    _.forEach(chunk, async (elements) => {
        const TransactItems = _.map(elements, (element)=>  {return {
            Put: {
                Item: element,
                TableName: MainTableName,
                ConditionExpression: '(attribute_not_exists(OrgId) AND attribute_not_exists(SortKey)) AND (attribute_not_exists(OrgId) AND attribute_not_exists(ID))',
                ReturnValuesOnConditionCheckFailure: "ALL_OLD"
            }
        };});
        var params = {TransactItems : TransactItems, ReturnConsumedCapacity: "INDEXES"};
        await WriteTransaction(params);
    });
}

async function WriteTransaction(params, index = 1)
{
    var docClient = new AWS.DynamoDB.DocumentClient();
      await docClient.transactWrite(params, async (err, data) => {
        if (err) {
            console.error(`Unable to add data for ${index} time`, params, ". Error JSON:", JSON.stringify(err, null, 2));
            // wait and repost
            await new Promise(r => setTimeout(r, 4000));
            index = index + 1;
            await WriteTransaction(params, index);
        }
        if(data) {
            // do Nothing
        }
    });
}

module.exports = {GenerateTable};