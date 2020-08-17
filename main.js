const superagent = require('superagent')
const cheerio = require('cheerio')
const async = require('async')
const charset = require('superagent-charset')
const { connect, Anime, disconnect } = require('./db')

charset(superagent)

const BASE_URL = 'http://www.imomoe.in'
const ENTRY_URL = 'http://www.imomoe.in/so.asp?page='
const PAGE_SIZE = 5

const parse = url => {
  return new Promise((resolve, reject) => {
    superagent
      .get(url)
      .buffer(true)
      .charset('gb2312')
      .end((err, res) => {
        err ? reject(err) : resolve(cheerio.load(res.text))
      })
  })
}

const parseJson = url => {
  return new Promise((resolve, reject) => {
    superagent
      .get(url)
      .buffer(true)
      .set('Accept', 'application/javascript')
      .end((err, res) => {
        err ? reject(err) : resolve(res.text)
      })
  })
}

const create = () => {
  console.log('------------------ 开始创建动画列表 ------------------')
  const animes = []
  return new Promise((resolve, reject) => {
    const q = async.queue(async url => {
      const $ = await parse(url)
      $('.fire li').each((i, e) => {
        const item = $(e).find('a').eq(1)
        const title = item.text()
        const id = item.attr('href').replace(/[^0-9]/gi, '')
        animes.push({
          title,
          id,
        })
        console.log(`动画项目已建立：${title}-------${id}`)
      })
    }, 10)

    for (let i = 1; i < PAGE_SIZE; i++) {
      q.push(ENTRY_URL + i)
    }

    q.drain(() => {
      resolve(animes)
      console.log('------------------ 动画列表建立完成 ------------------')
    })
  })
}

const scrapy = items => {
  return new Promise((resolve, reject) => {
    const q = async.queue(async item => {
      const url = `${BASE_URL}/player/${item.id}-0-0.html`
      const $ = await parse(url)
      const playList = $('#play_0 li')
      if (playList.length < 4) {
        items.forEach((i, d) => {
          if (i.id === item.id) {
            items.splice(d, 1)
          }
        })
        console.log(`${item.title}（${playList.length}集），已从动画列表删除`)
      } else {
        item.count = playList.length
        item.videoJson = $('#play2').next().attr('src')
        console.log(`${item.title}（${playList.length}集），加入数据清洗列表`)
      }
    }, 10)

    q.push(items)

    q.drain(() => {
      resolve(items)
      console.log('------------------ 动画列表爬取完成 ------------------')
    })
  })
}

const save = async data => {
  const q = async.queue(async item => {
    const videoJsonUrl = BASE_URL + item.videoJson
    const $ = await parseJson(videoJsonUrl)
    const json = $.split(',').slice()
    const videoJson = JSON.parse(
      json
        .slice(0, json.length - 1)
        .join(',')
        .split('=')[1]
        .replace(/'/g, '"')
    )[0][1]

    item.links = videoJson.map(i => {
      const video = i.split('$')
      const name = video[0]
      const link = video[1]
      if (
        link.substring(link.lastIndexOf('.') + 1) !== 'mp4' &&
        link.indexOf('quan.qq.com') < 0
      ) {
        item.delete = true
      }
      return { name, link }
    })

    console.log(
      `${item.title}------${item.id}-----${item.count}集-----存储完成`
    )

    await Anime.findOneAndUpdate({ id: item.id }, item, { upsert: true })
  }, 10)

  q.drain(async () => {
    await Anime.deleteMany({ delete: true }, () => disconnect())
    console.log('------------------ 动画数据存储完成 ------------------')
  })

  q.push(data)
}

const bootstrap = async () => {
  connect()
  const animes = await create()
  const pending = await scrapy(animes)
  await save(pending)
}
bootstrap()
