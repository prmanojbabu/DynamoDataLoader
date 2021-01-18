var fs = require('fs');
function ReadConfig()
{
     try {
        var data = fs.readFileSync('Config.Json')
        return JSON.parse(data);
      } catch (err) {
        // If the type is not what you want, then just throw the error again.
        if (err.code !== 'ENOENT') throw err;
        // Handle a file-not-found error
        else{
            console.error('Config File Not Found');
            throw err;
        }
      }
}

module.exports = ReadConfig();