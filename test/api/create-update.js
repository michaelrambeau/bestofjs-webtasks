/*
Test if a user can create and update an item.
Trigger 3 API calls: 2 valid and on invalid (update by an other user)
Parameters:
- `app`: the Express application
- `options`: {
    token: '2',
    data0: data used to create the item,
    data1: data used to update the item
    endPoint: 'reviews' or 'links'
  }
*/

const test = require('tape')
const request = require('supertest')
const getUserProfile = require('../sample/getUserProfile')
const getErrorMessage = require('../../user-content-api/src/lib/helpers/getErrorMessage')

module.exports = function createAndUpdate (app, options) {
  const username = getUserProfile(options.token).nickname
  var _id = ''
  test(options.endPoint + ' / creation by ' + username, t => {
    console.log('>> STEP1 create')
    request(app)
      .post('/' + options.endPoint)
      .send(options.data0)
      .set('token', options.token)
      .expect(200)
      .end(function (err, result) {
        if (err) return t.end()
        const json = result.body
        _id = json._id
        t.ok(_id, 'The POST response should contain an _id')
        t.equal(_id.length, 24, 'The _id should be a valid mongo id')
        t.equal(json.createdBy, username, `The creator should be ${username}`)
        t.end()
      })
  })

  // Edit the item that just has been created, by the same user
  test(options.endPoint + ' / update by ' + username, t => {
    console.log('>> STEP2 update')
    request(app)
      .put('/' + options.endPoint + '/' + _id)
      .send(options.data1)
      .set('token', options.token)
      .expect(200)
      .end(function (err, result) {
        if (err) return t.end()
        const json = result.body
        Object.keys(options.data1).forEach(key => {
          t.equal(json[key], options.data1[key], key + ' field should have been updated')
        })
        t.end()
      })
  })

  // Try to edit the same item, but by an other user
  test(options.endPoint + ' / try to update by a user who is not the creator', t => {
    console.log('>> STEP3 update error')
    request(app)
      .put('/' + options.endPoint + '/' + _id)
      .send(options.data1)
      .set('token', 'X') // pass an other token
      .expect(400)
      .end(function (err, result) {
        if (err) return t.end()
        const json = result.body
        t.equal(json.message, getErrorMessage('CREATOR_ONLY'), 'Should return CREATOR_ONLY error message')
        t.end()
      })
  })
}
