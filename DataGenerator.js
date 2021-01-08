var faker = require('faker');
var _ = require('lodash');
var fs = require('fs');
var stemmer_es = require('stemmer_es');
var langDetect = require('langdetect');
const { promises } = require('dns');
var SentimentEnum = ["Positive", "Negative","Neutral"];
var maxCount = 50000;

function generateDir(TableNamePrefix)
{
    var dir = `./SampleDataFiles/${TableNamePrefix}`;
    if (!fs.existsSync(dir)){
        console.log(`Creating Directory ${dir}`);
        fs.mkdirSync(dir,{ recursive: true });
    }
    else
    {
        fs.rmdirSync(dir, { recursive: true });
        fs.mkdirSync(dir);
    }
    return dir;
}

async function GenerateDB(config)
{
    maxCount = config.MaxCountPerFile;
    const createJobs = []
    config.DBSampling.forEach(element => {
        createJobs.push(
            new Promise((resolve, reject) =>
            {
            resolve(GenerateTableSample(config.MainTableNamePrefix, element.OrganizationCount, element.TotalRecordPerOrg));
            }));
        });
    await Promise.all(createJobs);
}
 
async function GenerateTableSample(MainTableNamePrefix, OrganizationCount,TotalRecordPerOrg)
{
    var TableSamples = [];
    var TableNamePrefix = `${MainTableNamePrefix}_Main_${OrganizationCount}_${TotalRecordPerOrg}_${OrganizationCount*TotalRecordPerOrg}`;
    var dir = generateDir(TableNamePrefix);
    var FileCounter = 0;
    var FilePath = `${dir}/${FileCounter}.json`;
    var loopCounter = 0;
    for(var k =1; k <= OrganizationCount; k++)
    {
        var items = await GenerateOrgData(TotalRecordPerOrg);
        items.forEach((element, index)=> 
        {
            TableSamples.push(element);
            loopCounter++;
            if(loopCounter % maxCount === 0 || loopCounter === OrganizationCount*TotalRecordPerOrg )
            {
                FileCounter  = FileCounter +1;
                FilePath = `${dir}/${FileCounter}.json`;
                console.log(`Creating File ${FilePath}`);
                fs.writeFileSync(FilePath, JSON.stringify(TableSamples, null, "\t"), 'utf8');
                TableSamples = [];
            }
        });
    }
}

async function GenerateOrgData(TotalRecordPerOrg)
{
    const createJobs = [];
    var OrgId = faker.random.uuid();
    for(var i=1; i<=TotalRecordPerOrg; i++)
    {
        createJobs.push(
            new Promise((resolve, reject) =>
            {
                resolve(GenerateSingleFeedback(OrgId));
            }));
    }
    return await Promise.all(createJobs);
}

function GenerateSingleFeedback(OrgId)
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

// GenerateTableSample('STA_FeedBack',3,16);
// GenerateOrgData(3);
// GenerateSingleFeedback('Test');
module.exports = {GenerateDB};