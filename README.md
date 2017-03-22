# Dynatable
A wrapper for DynamoDB tables, with a promise wrapped simplified API for the AWS SDK's DynamoDB.DocumentClient.



## Usage
```
const AWS = require('aws-sdk');
const dynatable = require('dynatable');
const docClient = new AWS.DynamoDB.DocumentClient();

// Imagine you have a DynamoDB table called `users`
const users = dynatable(docClient, 'users');
users.get({ id: 1 })
  .then(users => console.log(users));
// [{ id: 1, name: 'Dynatable', interests: 'API wrapping, getting, putting, updating and deleting'}]
```
