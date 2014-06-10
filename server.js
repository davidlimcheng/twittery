var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

var sendError = function(res, errorMessage) {
  res.send({
    'type': 'error',
    'message': errorMessage
  });
};

var parseTweets = function(body) {
  var $ = cheerio.load(body);

  var tweets = [];

  $('.js-tweet').each(function(i, element) {
    var id = $(this).attr('data-tweet-id');
    var time = $('.js-short-timestamp', this).attr('data-time');
    var text = $('.js-tweet-text', this).text();
    text = text.replace('…', '');
    text = text.trim();
    tweets.push({
      createdAt: parseInt(time, 10),
      id: id,
      text: text
    });
  });

  return tweets;
};

var getTweets = function(res, id) {
  request({
    url: 'http://twitter.com/' + id
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var tweets = parseTweets(body);
      res.send({
        id: id,
        tweets: tweets
      });
    }
  });
};

app.get('/:id?', function(req, res){
  var id = req.params.id;
  var tweets = [];

  if (!id) {
    sendError(res, 'Please send a valid id');
  } else {
    tweets = getTweets(res, id);
  }

});

var port = process.env.PORT || 3000;
app.listen(port);