import { defineSecret } from 'firebase-functions/v2/params';
import { TwitterClient } from 'twitter-api-client';

const twitterConsumerKey = defineSecret('TWITTER_CONSUMER_KEY');
const twitterConsumerSecret = defineSecret('TWITTER_CONSUMER_SECRET');
const twitterAccessToken = defineSecret('TWITTER_ACCESS_TOKEN');
const twitterAccessTokenSecret = defineSecret('TWITTER_ACCESS_TOKEN_SECRET');

export const twitterSecrets = [
  twitterConsumerKey,
  twitterConsumerSecret,
  twitterAccessToken,
  twitterAccessTokenSecret,
];

export function getTwitterClient() {
  return new TwitterClient({
    apiKey: twitterConsumerKey.value(),
    apiSecret: twitterConsumerSecret.value(),
    accessToken: twitterAccessToken.value(),
    accessTokenSecret: twitterAccessTokenSecret.value(),
  });
}
