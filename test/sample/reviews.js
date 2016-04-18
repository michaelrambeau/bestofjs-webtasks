const mongodb = require('mongodb');
const ObjectId = mongodb.ObjectId;
module.exports = {
  "results": [
    {
      "_id": ObjectId("56ae781dad54d8381af193f2"),
      "project": "55723c9f4140883353bc773e",
      "rating": 4,
      "createdBy": "michaelrambeau",
      "createdAt": "2016-01-31T21:09:49.136Z",
      "comment": {
        "md": "This is my comment: good!"
      }
    },
    {
      "_id": ObjectId("56b25fedacc5b3640932d68e"),
      "project": "56a95b5843bdc81100111331",
      "rating": 5,
      "createdBy": "michaelrambeau",
      "createdAt": "2016-02-03T20:15:41.567Z",
      "comment": {
        "md": "Here is an other comment: great!"
      }
    }
  ]
}
