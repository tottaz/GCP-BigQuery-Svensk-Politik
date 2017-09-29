//require the google-cloud npm package
//setup the API keyfile, so your local environment can
//talk to the Google Cloud Platform
const gcloud = require('google-cloud')({
  projectId: process.env.GCLOUD_PROJECT,
  keyFilename: process.env.GCLOUD_KEY_FILE
});

//We will make use of the bigquery() API
const bq = gcloud.bigquery();

//Make use of a dataset called: svenskpolitiktweets
const dataset = bq.dataset('svenskpolitiktweets');
//Make use of a BigQuery table called: svenskpolitik
const table = dataset.table('svenskpolitik');

//If the dataset doesn't exist, let's create it.
dataset.exists(function(err, exists) {
  if(!exists){
    dataset.create({
      id: 'svenskpolitiktweets'
    }).then(function(data) {
      console.log("dataset created");
    });
  }
});

//If the table doesn't exist, let's create it.
//Note the schema that we will pass in.
table.exists(function(err, exists) {
  if(!exists){
    table.create({
      id: 'svenskpolitik',
      schema: 'TEXT, CREATED:TIMESTAMP, PARTY, COORDINATES, SCORE:FLOAT:, MAGNITUDE:FLOAT, HASHTAGS'
    }).then(function(data) {
      console.log("table created");
    });
  }
});

//Insert rows in BigQuery
var insertInBq = function(row){
  table.insert(row, function(err, apiResponse){
    if (!err) {
      console.log("[BIGQUERY] - Saved.");
    }
  });
};

module.exports.insertInBq = insertInBq;