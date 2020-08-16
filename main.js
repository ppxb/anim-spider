const superagent = require('superagent')
const cheerio = require('cheerio')
const async = require('async')
const charset = require('superagent-charset')

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

const clean = async data => {
  const videoJsonUrl = BASE_URL + data[0].videoJson
  console.log(data[0].title)
  const $ = await parseJson(videoJsonUrl)
  const json = $.split(',').slice()
  const videoJson = JSON.parse(
    json
      .slice(0, json.length - 1)
      .join(',')
      .split('=')[1]
      .replace(/'/g, '"')
  )

  // test.js 取对应集数的文件
}

const bootstrap = async () => {
  const animes = await create()
  const pending = await scrapy(animes)
  await clean(pending)
}
bootstrap()
