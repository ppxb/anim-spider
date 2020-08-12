const cheerio = require('cheerio')
const async = require('async')
const charset = require('superagent-charset')
const superagent = require('superagent')

charset(superagent)

const baseUrl = 'http://www.imomoe.in'
const searchUrl = 'http://www.imomoe.in/so.asp?page='

const parse = url => {
  return new Promise(function (resolve, reject) {
    superagent
      .get(url)
      .buffer(true)
      .charset('gb2312')
      .end((err, res) => {
        err ? reject(err) : resolve(cheerio.load(res.text))
      })
  })
}

const getEntry = function () {
  return new Promise(function (resolve, reject) {
    const entries = []
    const q = async.queue(async function (url, callback) {
      const $ = await parse(url)
      $('.fire li').each((i, e) => {
        entries.push(baseUrl + $(e).find('a').eq(0).attr('href'))
      })
      callback()
    }, 10)

    for (let i = 0; i <= 1; i++) {
      q.push(searchUrl + (i + 1), function () {
        console.log(`完成抓取入口页： ${searchUrl + (i + 1)}`)
      })
    }

    q.drain(function () {
      resolve(entries)
      console.log('------------------ 入口页爬取完成 ------------------')
    })
  })
}

const getVideo = function (entries) {
  return new Promise(function (resolve, reject) {
    const videos = []
    const q = async.queue(async function (url, callback) {
      const $ = await parse(url)
      const videoLinks = []
      const videoTitle = $('.names').text()
      $('#play_0 li').each((i, e) => {
        const video = $(e).find('a').eq(0)
        const videoName = video.text()
        const videoUrl = baseUrl + video.attr('href')
        videoLinks.push({ name: videoName, url: videoUrl })
      })

      videos.push({ title: videoTitle, links: videoLinks })
      callback()
    }, 10)

    q.drain(function () {
      resolve(videos)
      console.log('------------------ 视频列表页爬取完成 ------------------')
    })

    for (let i = 0; i < entries.length; i++) {
      q.push(entries[i], function () {
        console.log(`完成抓取视频列表页： ${entries[i]}`)
      })
    }
  })
}

async function bootstrap() {
  const entriesList = await getEntry()
  const videoList = await getVideo(entriesList)
  console.log(videoList[0].title, videoList[0].links)
}

bootstrap()
