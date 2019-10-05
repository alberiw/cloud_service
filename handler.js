'use strict';

const AWS = require('aws-sdk');

module.exports = {
  create: async (event, context) => {
      let bodyObj = {};
      try {
          bodyObj = JSON.parse(event.body)
      } catch (jsonError) {
          console.log('There was an error parsing the body', jsonError);
          return {
              statusCode: 400
          }
      }

      if (
          typeof bodyObj.name === 'undefined' ||
          typeof bodyObj.url === 'undefined'
      ) {
          console.log('Missing parameters');
          return {
              statusCode: 400
          }
      }

      const putParams = {
          TableName: process.env.DB_CONNECTIONS_TABLE,
          Item: {
              name: bodyObj.name,
              url: bodyObj.url
          }
      };

      try {
          const dynamodb = new AWS.DynamoDB.DocumentClient();
          dynamodb.put(putParams).promise()
      } catch (putError) {
          console.log('There was problem putting the connections');
          console.log('putParams', putParams);
          return {
              statusCode: 500
          }
      }

      return {
          statusCode: 201
      }
  },
  list: async (event, context) => {
      const scanParams = {
          TableName: process.env.DB_CONNECTIONS_TABLE,
      };

      let scanResult = {};
      try {
          const dynamodb = new AWS.DynamoDB.DocumentClient();
          scanResult = await dynamodb.scan(scanParams).promise()
      } catch (scanError) {
          console.log('There was problem scanning the connections');
          console.log('scanError', scanError);
          return {
              statusCode: 500
          }
      }

      if (
          scanResult.Items === null ||
          !Array.isArray(scanResult.Items) ||
          scanResult.Items.length === 0
      ) {
          return {
              statusCode: 404
          }
      }

      return {
          statusCode: 200,
          body: JSON.stringify(scanResult.Items.map(e => ({
              name: e.name,
              url: e.url
          })))
      }
  },
  get: async (event, context) => {
      const getParams = {
          TableName: process.env.DB_CONNECTIONS_TABLE,
          Key: {
              id: event.pathParameters.id
          }
      };

      let getResult = {};
      try {
          const dynamodb = new AWS.DynamoDB.DocumentClient();
          getResult = dynamodb.get(getParams).promise()
      } catch (getError) {
          console.log('There was problem getting the connections');
          console.log('getError', getError);
          return {
              statusCode: 500
          }
      }

      if (getResult.Item === null) {
          return {
              statusCode: 404
          }
      }

      return {
          statusCode: 200,
          body: JSON.stringify({
              name: getResult.Item.name,
              url: getResult.Item.url
          })
      }
  },
  update: async (event, context) => {
      let bodyObj = {};
      try {
          bodyObj = JSON.parse(event.body)
      } catch (jsonError) {
          console.log('There was an error parsing the body', jsonError);
          return {
              statusCode: 400
          }
      }

      if (typeof bodyObj.url === 'undefined') {
          console.log('Missing parameters');
          return {
              statusCode: 400
          }
      }

      const updateParams = {
          TableName: process.env.DB_CONNECTIONS_TABLE,
          Key: {
              id: event.pathParameters.id
          },
          UpdateExpression: 'set #url = :url',
          ExpressionAttributeName: {
              '#url': 'url'
          },
          ExpressionAttributeValue: {
              ':url': bodyObj.c
          }
      };

      try {
          const dynamodb = new AWS.DynamoDB.DocumentClient();
          dynamodb.update(updateParams).promise()
      } catch (updateError) {
          console.log('There was problem updating the connections');
          console.log('updateError', updateError);
          return {
              statusCode: 500
          }
      }

      return {
          statusCode: 200
      }
  },
  delete: async (event, context) => {
      const deleteParams = {
          TableName: process.env.DB_CONNECTIONS_TABLE,
          Key: {
              id: event.pathParameters.id
          }
      };

      try {
          const dynamodb = new AWS.DynamoDB.DocumentClient();
          dynamodb.delete(deleteParams).promise()
      } catch (deleteError) {
          console.log('There was problem deleting the connections');
          console.log('deleteError', deleteError);
          return {
              statusCode: 500
          }
      }

      return {
          statusCode: 200
      }
  }
};
