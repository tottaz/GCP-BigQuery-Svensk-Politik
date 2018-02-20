TwitterStream, Translate, Natural Language, BigQuery, Svensk Politik

To do the social media data scraping, I used the Twitter Streaming API. The application code is written in JavaScript for Node.js.

This demo will contain the following technical pieces:

Machine Learning APIs - To use Natural Language API to understand the context of the data,
and since the data is in Swedish (and the Natural Language API doesn't support the Swedish language yet), I will need the Google Translate API to translate from Swedish to English and then doing the Natural Language API to get sentiment.
BigQuery - To collect a lot of data. To analyze this data we use BigQuery and run some queries on it.
I wrote a blog post about this demo here: - https://torbjornzetterlund.com/using-tweets-predict-sentiment-popularity-swedish-political-parties/

To visualize our result set, I made use of the Google’s Data Studio. I use some nice charts!
