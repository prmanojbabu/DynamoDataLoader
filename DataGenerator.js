var faker = require('faker');
var _ = require('lodash');
var fs = require('fs');
var stemmer_es = require('stemmer_es');
var langDetect = require('langdetect');
var SentimentEnum = ["Positive", "Negative","Neutral"];

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


function GenerateSampleData(){
    var config = ReadConfig;
}
module.exports = {GenerateSingleFeedback};