/* eslint-disable quotes */
const mongodb = require('mongodb')
const ObjectId = mongodb.ObjectId

module.exports = {
  "results": [
    {
      "_id": ObjectId("56ad8b90f6a3e89c08b88ca2"),
      "title": "ES6 promises in depth",
      "url": "https://ponyfoo.com/articles/es6-promises-in-depth",
      "projects": [
        ObjectId("55723c9f4140883353bc773e")
      ],
      "comment": {
        "md": "Everything you need to know about promises."
      },
      "createdBy": "usertest1",
      "createdAt": "2016-01-31T04:20:32.186Z"
    },
    {
      "_id": ObjectId("56ad80027703eee4132d48e2"),
      "title": "My link about 4 projects",
      "url": "http://development.bestofjs.divshot.io",
      "projects": [
        ObjectId("56a95b5843bdc81100111331"),
        ObjectId("55fbaf4dc0b48f03006c6c98"),
        ObjectId("55aba39b8f937d03008d41c8"),
        ObjectId("55723c9f4140883353bc774e")
      ],
      "createdBy": "michaelrambeau",
      "createdAt": "2016-01-31T03:31:14.572Z",
      "comment": {
        "md": "This is a link about 4 projects:\n\n* preact\n* React Native\n* ..."
      }
    },
    {
      "_id": ObjectId("56adf53426d6e7181453e1bb"),
      "title": "Bootstrap is cool",
      "url": "https://bestofjs.herokuapp.com/keystone/",
      "projects": [
        ObjectId("55723c9f4140883353bc773e")
      ],
      "createdBy": "michaelrambeau",
      "createdAt": "2016-01-31T11:51:16.132Z",
      "comment": {
        "md": "I am going to tell you why Bootstrap is cool."
      }
    }
  ]
}
