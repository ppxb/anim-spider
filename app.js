const cheerio = require('cheerio')
const async = require('async')
const puppeteer = require('puppeteer')
const charset = require('superagent-charset')
const superagent = require('superagent')

charset(superagent)

let browser = null
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

    for (let i = 0; i < 1; i++) {
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

const getVideo = entries => {
  return new Promise((resolve, reject) => {
    const videos = []
    const q = async.queue(async function (url, done) {
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
      done()
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

const getSrc = async list => {
  const page = await browser.newPage()
  return new Promise((resolve, reject) => {
    const q = async.queue(async link => {
      await page.goto(link.url)
      const url = await page.frames()[1]._url
      const modifiedUrl = url.split('=')[1]
      if (
        modifiedUrl.substring(modifiedUrl.lastIndexOf('.') + 1) === 'mp4' ||
        modifiedUrl.indexOf('quan.qq.com') > -1
      ) {
        link.src = modifiedUrl
      }

      console.log(`${link.name}--------${link.src}`)
    }, 1)

    q.drain(async () => {
      await browser.close()
      list = list.filter(i => (i.links[0].src ? true : false))
      resolve(list)
      console.log('------------------ 视频源文件页爬取完成 ------------------')
    })

    for (let i = 0; i < list.length; i++) {
      q.push(list[i].links, () => {
        console.log(`完成抓取视频源文件页：${list[i].title}`)
      })
    }
  })
}

const saveToDb = list => {}

async function bootstrap() {
  browser = await puppeteer.launch()
  const entriesList = await getEntry()
  const videoList = await getVideo(entriesList)
  const final = await getSrc(videoList)
  for (let i = 0; i < final.length; i++) {
    console.log(final[i].links)
  }

  await browser.close()
}

bootstrap()
