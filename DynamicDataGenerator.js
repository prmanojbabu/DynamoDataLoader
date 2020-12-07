var faker = require('faker');
var _ = require('lodash');
var prompt = require('prompt-sync')({sigint: true});
var fs = require('fs');
var PromptSync = require('prompt-sync');
var feedbackSentiment = ["Positive", "Negative", "Neutral"] ;
var initialSentiment = ["Positive", "Negative",undefined] ;
var feedBackData = [];
var orgIDS = [];

var RecordCount = prompt('Enter Total Record required to load(Default :20000):', 20000);
var maxOrgCount = prompt('Enter Maximum records per Organization((Default :2000)):', 2000);
function  validateInput() {
    if(!isNaN(RecordCount) && Number(RecordCount) >0)
    {
        RecordCount = Number(RecordCount);
    }
    else {
        console.log('Invalid Total Record, setting it default value');
        RecordCount = 20000;
    }
    if(!isNaN(maxOrgCount) && Number(maxOrgCount) >0 && Number(maxOrgCount) <= RecordCount)
    {
        maxOrgCount = Number(maxOrgCount);
    }
    else {
        console.log('Invalid Maximum records per Organization, setting it default value');
        maxOrgCount = 2000;
    }

    console.log('Total Records: '+ RecordCount);
    console.log('Total Records per Org: '+ maxOrgCount);
}
function generateData()
{
    var orgId = faker.random.uuid();
    for(i=0; i<RecordCount; i++)
    {
        if(i % maxOrgCount === 0)    
        {
            orgId=faker.random.uuid();
            orgIDS.push(orgId);    
        }
        var feedbackValue = _.sample(feedbackSentiment);
        var initialValue =  _.sample((_.filter(initialSentiment, (x)=> {return x!=feedbackValue;})));
        var item = {
                "OrgID":  orgId,
                "ID": faker.random.uuid(),
                "Phrase":  faker.random.words(faker.random.number({min: 3, max: 20})),
                "SentimentFeedBackValue" : feedbackValue,
                "SentimentInitialValue" : initialValue,
                "SourceInteractionID": _.sample([faker.random.uuid(), undefined]),
                "CreatedBy": faker.random.uuid(),
                "CreatedDate": faker.date.between('2000-01-01T00:00:00.000Z', '2020-12-01T00:00:00.000Z')
                };
    feedBackData.push(item);
    }
}
function generateJSONFiles()
{
    var dir = './dataFiles';
    var feedBackDataJson = JSON.stringify(feedBackData, null, "\t");
    var orgIDSJson = JSON.stringify(orgIDS, null, "\t");
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    fs.writeFileSync('./dataFiles/feedBack.json', feedBackDataJson, 'utf8');
    fs.writeFileSync('./dataFiles/orgID.json', orgIDSJson, 'utf8');
    console.log('Files Created Successfully');
}


validateInput();
generateData();
generateJSONFiles();