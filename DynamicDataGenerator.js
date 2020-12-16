var faker = require('faker');
var _ = require('lodash');
var prompt = require('prompt-sync')({sigint: true});
var fs = require('fs');
var PromptSync = require('prompt-sync');
require('dotenv').config();
const stemmer_es = require('stemmer_es');
var langdetect = require('langdetect');
var feedbackSentiment = ["Positive", "Negative", "Neutral"] ;
var initialSentiment = ["Positive", "Negative","Neutral"] ;
var BooleanIsDeleted = ["False"] ;
var feedBackData = [];
var orgIDS = [];

var RecordCount = prompt('Enter Total Record required to load(Default :20000):', 20000);
var maxOrgCount = prompt('Enter Maximum records per Organization((Default :2000)):', 2000);
var maxRecordPerFile = prompt('Enter Maximum records per File((Default :20000)):', 20000);
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
    if(!isNaN(maxRecordPerFile) && Number(maxRecordPerFile) >0)
    {
        maxRecordPerFile = Number(maxRecordPerFile);
    }
    else {
        console.log('Invalid Max Record per file, setting it default value');
        maxRecordPerFile = 20000;
    }

    console.log('Total Records: '+ RecordCount);
    console.log('Total Records per Org: '+ maxOrgCount);
    console.log('Total Records per file: '+ maxRecordPerFile);
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
        var FlagIsDeleted= _.sample(BooleanIsDeleted);
        var phrase = faker.random.words(faker.random.number({min: 3, max: 20}))
        var item = {
                "OrgID":  orgId,
                "ID": faker.random.uuid(),
                "Phrase":  phrase,
                "StemmedPhrase": stemmer_es.stem(phrase),
                "Language": langdetect.detectOne(phrase),
                "TranscriptId":  _.sample([faker.random.uuid(), undefined]),
                "SentimentFeedbackValue" : feedbackValue,
                "SentimentInitialValue" : initialValue,
                "ModifiedBy": faker.random.uuid(),
                "ModifiedDate": faker.date.between('2000-01-01T00:00:00.000Z', '2020-12-01T00:00:00.000Z'),
                "IsDeleted": FlagIsDeleted,
                "SortKey" : `Lang_${langdetect.detectOne(phrase)}|StemmedPhrase_${stemmer_es.stem(phrase)}`
                };
    feedBackData.push(item);
    }
}
function chunkArray(myArray, chunk_size){
    var chunks = [], i = 0, n = myArray.length;
    while (i < n) {
      chunks.push(myArray.slice(i, i += chunk_size));
    }
    return chunks;
}


function generateJSONFiles()
{
    var dir = './dataFiles';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    else
    {
        fs.rmdirSync(dir, { recursive: true });
        fs.mkdirSync(dir);
    }
    var chunksFeedback = chunkArray(feedBackData, maxRecordPerFile);
    var chunksOrg = chunkArray(orgIDS, maxRecordPerFile/10);
    chunksFeedback.forEach((x, index) => {fs.writeFileSync(`./dataFiles/feedBack_${index}.json`, JSON.stringify(x, null, "\t"), 'utf8');});
    chunksOrg.forEach((x, index) => {fs.writeFileSync(`./dataFiles/org_${index}.json`, JSON.stringify(x, null, "\t"), 'utf8');});
    console.log('Files Created Successfully');
}


validateInput();
generateData();
generateJSONFiles();