var zlib = require("zlib");
var sizeof = require('object-sizeof');
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
var feedBackData = [];
var OrgIdS = [];

// var RecordCount = prompt('Enter Total Record required to load(Default :20000):', 1);
// var maxOrgCount = prompt('Enter Maximum records per Organization((Default :2000)):', 1);
// var maxRecordPerFile = prompt('Enter Maximum records per File((Default :20000)):', 20000);
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
function generateData(phraseSize=10)
{
    var OrgId = faker.random.uuid();
    
        var feedbackValue = _.sample(feedbackSentiment);
        var initialValue =  _.sample((_.filter(initialSentiment, (x)=> {return x!=feedbackValue;})));
        var phrase = faker.random.words(phraseSize);
        var item = {
                "OrgId":  OrgId,
                "Id": faker.random.uuid(),
                "Phrase":  phrase,
                "StemmedPhrase": stemmer_es.stem(phrase),
                "Language": langdetect.detectOne(phrase),
                "TranscriptId":  _.sample([faker.random.uuid(), undefined]),
                "SentimentFeedbackValue" : feedbackValue,
                "SentimentInitialValue" : initialValue,
                "CreatedBy": faker.random.uuid(),
                "CreatedDate": faker.date.between('2000-01-01T00:00:00.000Z', '2020-12-01T00:00:00.000Z'),
                "SortKey" : `SentimentFeedback|Lang_${langdetect.detectOne(phrase)}|StemmedPhrase_${stemmer_es.stem(phrase)}`
                };
    return item;
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
    var chunksOrg = chunkArray(OrgIdS, maxRecordPerFile/10);
    chunksFeedback.forEach((x, index) => {fs.writeFileSync(`./dataFiles/feedBack_${index}.json`, JSON.stringify(x, null, "\t"), 'utf8');});
    chunksOrg.forEach((x, index) => {fs.writeFileSync(`./dataFiles/org_${index}.json`, JSON.stringify(x, null, "\t"), 'utf8');});
    console.log('Files Created Successfully');
    sizeCalculate();
    
}

function sizeCalculate(){
    // var stats = fs.statSync(`./dataFiles/feedBack_0.json`);
    // var fileSizeInBytes = stats.size;
    // var fileSizeInKilobytes = fileSizeInBytes / (1024);
    // console.log(`File Size: ${fileSizeInKilobytes} KB`);

    const dataview = JSON.stringify((JSON.parse(fs.readFileSync(`./dataFiles/feedBack_0.json`,'utf8'))[0]));
    console.log(`Data size: ${sizeof(dataview)/1024} KB`);
    const compressedResponse =  zlib.gzipSync(dataview);   
    console.log(`Compressed Data size: ${sizeof(compressedResponse)/1024} KB`);
}


// validateInput();
// generateData();
// generateJSONFiles();

function test()
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

    for(var i=3; i<=20; i++)
    {
        const obj = [];
        for(var k=0; k<=2000; k++)
        {
            const item = generateData(i);
            obj.push(item);
        }
        const compressedResponse =  zlib.gzipSync(JSON.stringify(obj));
        fs.writeFileSync(`./dataFiles/feedBack_${i}_NonCompressed`, JSON.stringify(obj), 'utf8');
        fs.writeFileSync(`./dataFiles/feedBack_${i}_Compressed`, compressedResponse, 'binary');
        var _NonCompressed = fs.statSync(`./dataFiles/feedBack_${i}_NonCompressed`).size/1024/1024;
        var _Compressed = fs.statSync(`./dataFiles/feedBack_${i}_Compressed`).size/1024/1024;
        console.log(`PhraseWordslength: ${i}\tDatasize: ${_NonCompressed}\tMB \tCompressedDatasize: ${_Compressed}\tMB\tPhraselength : ${obj[0].Phrase.length}\tPhrase: ${obj[0].Phrase}`);
    }
}
test();