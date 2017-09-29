var express = require('express'),
  router = express.Router(),
  Stream = require('user-stream');

var path = require('path');
var machinelearning = require( path.resolve( __dirname, "ml.js" ) ); //added in a later step
var bigquery = require( path.resolve( __dirname, "bigQuery.js" ) );//added in a later step

//setup the twitter stream API, and provide your consumer and access tokens
const stream = new Stream({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

//these will be the political parties to search for
//const search_terms = ['Centerpartiet', 'Kristdemokraterna', 
//  'Liberalerna', 'Miljöpartiet', 'Nya_Moderaterna', 'Socialdemokraterna', 'Sverigedemokraterna',
//  'vansterpartiet', 'Djurensparti'];

const search_terms = ['Centerpartiet', 'annieloof',
  'Kristdemokraterna', 'BuschEbba',
  'Liberalerna', 'bjorklundjan',
  'Miljopartiet', 'IsabellaLovin',
  'Nya_Moderaterna', 
  'Socialdemokraterna', 
  'vansterpartiet', 'jsjostedt', 
  'socialdemokrat', 
  'Sverigedemokraterna', 'sdriks',
  'Feministerna'];
 
//  'vansterpartiet', 'Djurensparti'
//for totalscores, let's rather work with full numbers
//than floats with lots of decimals. We will also only
//need 2 decimals.
var createNiceNumber = function(num){
  var x = parseInt(num);
  x = (num * 100).toFixed(2);
  return x;
}


//extract all political parties from a tweet
var getAllMatches = function(text) { 
    var matches = [];
    search_terms.forEach(function(term) {
        var regex = `(?:${term})`;
        var re = new RegExp(regex);
        var result  = re.exec(text);
        if(result) matches.push(result[0]);
    });

    return matches;
}

//Once we get tweets, we want to make sure,
//they all get sorted based on the political party shortcode.
//We will extract all the political parties
//it will return an array.
var getParties = function(tweettxt){

  var matches = getAllMatches(tweettxt);

  //make sure we return the short notation of the party
  if(matches[0] === "Centerpartiet") matches[0] = "C";
  if(matches[0] === "annieloof") matches[0] = "C";
  if(matches[0] === "Kristdemokraterna") matches[0] = "KD";
  if(matches[0] === "BuschEbba") matches[0] = "KD";
  if(matches[0] === "Liberalerna") matches[0] = "L";
  if(matches[0] === "bjorklundjan") matches[0] = "L";
  if(matches[0] === "Miljopartiet") matches[0] = "MP";
  if(matches[0] === "IsabellaLovin") matches[0] = "MP";
  if(matches[0] === "Nya_Moderaterna") matches[0] = "M";
  if(matches[0] === "Socialdemokraterna") matches[0] = "S";
  if(matches[0] === "Sverigedemokraterna") matches[0] = "SD";
  if(matches[0] === "sdriks") matches[0] = "SD";  
  if(matches[0] === "vansterpartiet") matches[0] = "V";
  if(matches[0] === "jsjostedt") matches[0] = "V";
  if(matches[0] === "socialdemokrat") matches[0] = "S";
  if(matches[0] === "Feministerna") matches[0] = "F!/FI/Fi";
  
  return matches;
}

var openTwitterStream = function(){

  //We will need to work with Regex, since we don't want to collect spam.
  var regex ='', pRegex='';
  for (term of search_terms) {
    regex += `\\#${term}|\\@${term}|${term}\\s+|\\s+${term}|`
  };

  regex = regex.slice(0,regex.length-1);
  var re = new RegExp(regex);

  //We will only track tweets with the political parties as provided
  //by the search_terms array. Also the language of the tweet needs
  //to be Sweden.
  var params = {
    track: search_terms,
    language: 'sv'
  };

  //this method will open the twitter stream
  stream.stream(params);
  stream.on('data', function(tweet) {

    //Let's not collect return tweets, and tweets need to
    //match our regular expression.
    if (tweet.text.substring(0,2) != 'RT' 
      && re.test(tweet.text)){

        //IIFE? Yeah, we're putting a callback in a callback in callback...
        //..and we need to bind to the original tweet scope.
        machinelearning.getTranslation(tweet.text, function(translation){
          (function(translation){

            machinelearning.getSentiment(translation, function(sentiment){
              (function(sentiment){

                var entities = [];
                var mentions = JSON.stringify(tweet.entities.user_mentions);
                var hashtags = JSON.stringify(tweet.entities.hashtags);
                entities = hashtags.concat(mentions);
        
                //let's normalize the data as much on the JS side.
                //get the parties, based on this clean tweet.
                var parties = getParties(tweet.text);
                //Tweets might not contain multiple parties.
                //For the scope of this blogpost, we will ignore tweets
                //that talk about multiple parties.
                if(parties.length > 1) return; 
               
                var row = {
                  text: tweet.text,
                  created: (parseInt(tweet.timestamp_ms)/1000),
                  coordinates: tweet.coordinates,
                  party: parties[0],
                  score: createNiceNumber(sentiment.documentSentiment.score),
                  magnitude: createNiceNumber(sentiment.documentSentiment.magnitude),
                  hashtags: entities
                };

                console.log("-----");
                console.log(row);
                console.log("-----");
                
                bigquery.insertInBq(row);

              })(sentiment, tweet);
            });

          })(translation, tweet);
        });

    }
  });
  stream.on('error', function(error) {
    console.error(error);
  });
} 

openTwitterStream();
