var fs = require('fs');
var _ = require('lodash');


function ImportDir(dir){
    var files = [];
    fs.stat(dir, async (err, stat) => {
        if(err == null) {
            console.log("Importing sample data into DynamoDB. Please wait.");
            console.log(`Reading directory ${dir}`);
            files = fs.readdirSync(dir);
            await Promise.all(files.map(async (file) => { await ImportFile(dir,file); }));
        } else if(err.code === 'ENOENT') {
            console.log('Lambda Test Data File doesn\'t exists');
            process.exit(1);
        } else {
            console.log('Some other error: ', err.code);
            process.exit(1);
        }
    });
  }

async function ImportFile(dir, file)
{
    if(file.includes(`STA_FeedBack_Main`))
    {
        await ImportData(dir+'/'+file, file.replace(`_Output.json`, ''));
    }
}

async function ImportData(File, DbName)
{
    console.log(`Importing the File ${File}`);
    var times = fs.readFileSync(File, 'utf8').split('\n').filter(Boolean);
    times = times.map(Number);
    console.log(`Sampling ${File} with ${times.length} orgIds`);
    var data = {DB: DbName, maxValue : _.maxBy(times), MinValue: _.min(times), AvgValue:_.mean(times), TotalSample: times.length};
    WriteStats(data);
}

async function WriteStats(data)
{
  fs.appendFileSync(`./LambdaResultInsert/Result_Output.json`, JSON.stringify(data) + "\n", 'utf8');
}

function CalculateDataSample()
{
    ImportDir(`./LambdaResultInsert`);
}

module.exports = {CalculateDataSample};