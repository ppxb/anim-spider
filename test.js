const { connect, Cache } = require('./db')

const start = async () => {
  await Cache.insertMany([
    {
      base: 'http://www.imomoe.in/view/7663.html',
      url: 'http://www.imomoe.in/player/7663-0-0.html',
    },
    {
      base: 'http://www.imomoe.in/view/7663.html',
      url: 'http://www.imomoe.in/player/7663-0-1.html',
    },
    {
      base: 'http://www.imomoe.in/view/7663.html',
      url: 'http://www.imomoe.in/player/7663-0-2.html',
    },
    {
      base: 'http://www.imomoe.in/view/7663.html',
      url: 'http://www.imomoe.in/player/7663-0-3.html',
    },
  ])
}

start()
