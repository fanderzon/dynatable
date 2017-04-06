# Dynatable
A DynamoDB table wrapper with a promise wrapped simplified API for the AWS SDK's DynamoDB.DocumentClient.

## Why?
DynamoDB.DocumentClient is the official way to talk to your DynamoDB databases, but the API is a little clunky and not very JavaScripty.

Dynatable gives you an easier to use API which borrows a little inspiration from MongoDB.

## Usage
```
const AWS = require('aws-sdk');
const dynatable = require('dynatable');

AWS.config.update({
  region: "eu-west-1",
  accessKeyId: "AKIAJX24PKMIEKUZBY3Q",
  secretAccessKey: "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"
});
const docClient = new AWS.DynamoDB.DocumentClient();

// Imagine you have a table called `users`, which is set up with an `id` key in DynamoDB
const users = dynatable(docClient, 'users', { id: 'N' });

// You now have
users.get({ id: 1 })
  .then(users => console.log(users));
// [{ id: 1, name: 'Dynatable', interests: 'API wrapping, getting, putting, updating and deleting'}]
```

Or the way I use it, define (and export) all tables of your project in one file, and then import them where needed:

**tables.js**
```
// all the setup from the previous example here

export const userTable = dynatable(docClient, 'users', { id: 'N' });
export const postTable = dynatable(docClient, 'users', { id: 'N' });
```

**posts.js**
```
import { userTable, postTable } from './tables';

// Get user details
const userDetails = userTable.findOne({ id: userId });

// Get user's post
const userPosts = postTable.find({ userId });

Promise.all([ userDetails, userPosts ])
  .then(([details, posts]) => {
    // Do something with details and posts here
  });
```
