'use strict'

const https = require('https')
const ratingModel = require('./pokerbot').ratingModel
const jiraTimestampModel = require('./pokerbot').jiraTimestampModel
const channelName = require('./config/channel-name.json').name
// const auth = require('./auth')
let util = {}

/**
 * We are asking the slack server to give us channel information
 * @param {String} token - token id issued to us by slack-server
 * @returns {Promise} promise - channel info issued to us by slack-server
 */
util.setChannelInfo = function (token) {
  let extServerOptions = {
    hostname: 'slack.com',
    path: '/api/channels.list?token=' + token,
    method: 'GET'
  }
  console.log(extServerOptions)
  return new Promise((resolve, reject) => {
    let req = https.request(extServerOptions, (res) => {
      res.on('data', (d) => {
        process.stdout.write(d)
        let allchannels = JSON.parse(d.toString()).channels
        console.log('Number of channels : ' + allchannels.length)
        let channel
        for (let index = 0; index < allchannels.length; index++) {
          channel = allchannels[index]
          if (channel.name === channelName) {
            console.log('Found our channel detail.')
            // auth.channel = channel
            console.log(channel)
            resolve(channel)
          }
        }
      })
    })
    req.end()
    req.on('error', (error) => {
      console.error(error)
      // return JSON.parse(error)
      reject(error)
    })
  })
}

/**
 * We are asking the slack server to give us channel information
 * @param {String} token - token id issued to us by slack-server
 * @param {String} channelId -  channelId for the channel
*/
util.postMessageToChannel = function () {
  // const token = require('./config/oauth.json').access_token
  // const channelId = 'C1MKJE5PY'
  const access_token = require('./auth').oauthToken.access_token
  const channelId = require('./auth').channel.id
  const message = encodeURIComponent('Voting finished. Thanks for voting.')
  console.log('posting message to channel')
  const queryParams = 'token=' + access_token + '&channel=' + channelId + '&text=' + message
  let extServerOptions = {
    hostname: 'slack.com',
    path: '/api/chat.postMessage?' + queryParams,
    method: 'GET'
  }
  console.log(extServerOptions)
  let req = https.request(extServerOptions, (res) => {
    res.on('data', (d) => {
      process.stdout.write(d)
      return JSON.parse(d)
    })
  })
  req.end()
  req.on('error', (error) => {
    console.error(error)
    return JSON.parse(error)
  })
}

/**
 * Sorting the array of objects based on object property
  * @param {object} items - array of objects
 * @param {String} prop -   property name on bases of which sorting will be done
 * @returns {Array} - sorted array
*/
util.sortArrayBasedOnObjectProperty = function (items, prop) {
  let sortedArray = items.sort(function (a, b) {
    if (a.prop > b.prop) {
      return 1
    }
    if (a.prop < b.prop) {
      return -1
    }
   // a must be equal to b
    return 0
  })
  return sortedArray
}

util.runSchedularForInProgressJira = function () {
  let that = this
  setInterval(function () {
    let currentEpocTime = (new Date()).getTime()
    console.log('Running schedular to see all live planning. Current time : ' + currentEpocTime)
    let startedTimeOfJira, differenceTravel, seconds
    for (let prop in jiraTimestampModel) {
      startedTimeOfJira = jiraTimestampModel[prop]
      differenceTravel = currentEpocTime - startedTimeOfJira
      seconds = Math.floor((differenceTravel) / (1000))
      // console.log('Difference : ' + seconds)
      if (seconds > 60) {
        console.log(ratingModel)
        console.log(jiraTimestampModel)
        delete ratingModel[prop]
        delete jiraTimestampModel[prop]
        console.log(ratingModel)
        console.log(jiraTimestampModel)
        that.postMessageToChannel()
      }
    }
  }, 30000)
}

module.exports = util
