const cheerio = require('cheerio')
const async = require('async')
const puppeteer = require('puppeteer')
const charset = require('superagent-charset')
const superagent = require('superagent')
const { connect, disconnect, Anim } = require('./db')

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

const getVideo = () => {
  return new Promise((resolve, reject) => {
    const videos = []
    const q = async.queue(async (url, done) => {
      const $ = await parse(url)
      $('.fire li').each((i, e) => {
        const item = $(e).find('a').eq(1)
        videos.push({
          title: item.text(),
          url: baseUrl + item.attr('href'),
          count: 0,
          links: [],
        })
      })
      done()
    }, 10)

    for (let i = 0; i < 1; i++) {
      q.push(searchUrl + (i + 1), () => {
        console.log(`完成抓取动画入口页： ${searchUrl + (i + 1)}`)
      })
    }

    q.drain(() => {
      resolve(videos)
      console.log('------------------ 动画入口页爬取完成 ------------------')
    })
  })
}

const getDetail = videos => {
  return new Promise((resolve, reject) => {
    const q = async.queue(
      async ({ title: videoTitle, url: videoUrl, links, count }) => {
        const $ = await parse(videoUrl)
        $('#play_0 li').each((i, e) => {
          const item = $(e).find('a').eq(0)
          const linkName = item.text()
          const linkUrl = baseUrl + item.attr('href')
          links.push({ name: linkName, url: linkUrl })
          console.log(
            `爬取完成------${videoTitle}------${linkName}------${linkUrl}`
          )
        })
      },
      10
    )

    q.drain(() => {
      resolve(videos)
      console.log('------------------ 视频列表页爬取完成 ------------------')
    })

    q.push(videos)
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
      console.log(`爬取完成：${link.name}--------${link.src}`)
    }, 1)

    q.drain(async () => {
      await browser.close()
      list = list.filter(i => (i.links[0].src ? true : false))
      resolve(list)
      console.log('------------------ 视频源文件页爬取完成 ------------------')
    })

    // for (let i = 0; i < list.length; i++) {
    //   q.push(list[i].links, () => console.log(`当前爬取目标：${list[i].title}`))
    // }

    q.push(list[0].links, () => console.log(`当前爬取目标：${list[0].title}`))
    q.push(list[1].links, () => console.log(`当前爬取目标：${list[1].title}`))
    q.push(list[2].links, () => console.log(`当前爬取目标：${list[2].title}`))
  })
}

const saveToDb = async list => {
  for (let i = 0; i < list.length; i++) {
    list[i].count = list[i].links.length
    await Anim.findOneAndUpdate({ url: list[i].url }, list[i], { upsert: true })
  }
  return true
}

async function bootstrap() {
  connect()
  browser = await puppeteer.launch()
  const videos = await getVideo()
  const videoList = await getDetail(videos)
  const final = await getSrc(videoList)
  const flag = await saveToDb(final)
  if (flag) {
    disconnect()
  }
}

bootstrap()
