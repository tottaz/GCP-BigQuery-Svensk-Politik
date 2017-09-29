TwitterStream, Translate, Natural Language, BigQuery Svensk Politik

To do the social media data scraping, we use the Twitter Streaming API. The application code is written in JavaScript for Node.js.

This demo will contain the following technical pieces:

Machine Learning APIs - To use Natural Language API to understand the context of the data,
and since our data is in Dutch (and the Natural Language API doesn’t support the Dutch language yet), we will need the Translate API to translate.
BigQuery - To collect a lot of data. To analyze this data we use BigQuery and run some queries on it.
I wrote a blog post about this demo here: - https://www.leeboonstra.com/developer/analyzing-data-with-bigquery-and-machine-learning-apis/

To visualize our result set, we will make use of Google’s Data Studio (6). We can use some nice charts!
