const cheerio = require('cheerio')
const async = require('async')
const puppeteer = require('puppeteer')
const charset = require('superagent-charset')
const superagent = require('superagent')
const { connect, disconnect, Cache, Anime } = require('./db')

charset(superagent)

let browser = null
const baseUrl = 'http://www.imomoe.in'
const searchUrl = 'http://www.imomoe.in/so.asp?page='
const pageSize = 3
const status = 1

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

const getItems = () => {
  return new Promise((resolve, reject) => {
    const items = []
    const q = async.queue(async url => {
      const $ = await parse(url)
      $('.fire li').each((i, e) => {
        const item = $(e).find('a').eq(1)
        items.push({
          title: item.text(),
          url: baseUrl + item.attr('href'),
        })
      })
    }, 10)

    for (let i = 1; i < pageSize; i++) {
      q.push(searchUrl + i, () => {
        console.log(`完成抓取动画入口页： ${searchUrl + i}`)
      })
    }

    q.drain(() => {
      resolve(items)
      console.log('------------------ 动画入口页爬取完成 ------------------')
    })
  })
}

const getList = list => {
  return new Promise((resolve, reject) => {
    const q = async.queue(async ({ title, url }, done) => {
      const $ = await parse(url)
      const wrapper = $('#play_0 li')
      if (wrapper.length < 4) {
        done()
      } else {
        wrapper.each(async (i, e) => {
          const item = $(e).find('a').eq(0)
          const name = item.text()
          const link = baseUrl + item.attr('href')

          const res = await Cache.findOne({ link })
          if (res) {
            console.log(`已存在数据库------${title}------${name}------${link}`)
          } else {
            await Cache.findOneAndUpdate(
              { link },
              {
                title,
                url,
                name,
                link,
                src: '',
                status: 'wait',
              },
              {
                upsert: true,
              }
            )
            console.log(`爬取完成------${title}------${name}------${link}`)
          }
        })
      }
    }, 10)

    q.drain(async () => {
      console.log('------------------ 视频列表页爬取完成 ------------------')
    })

    q.push(list)
  })
}

const getSrc = async () => {
  const urls = await Cache.find()
  // const page = await browser.newPage()
  const q = async.queue(async (item, done) => {
    if (['complete', 'delete'].includes(item.status)) {
      console.log(`${item.title}---${item.name}---视频源文件已抓取过，跳过`)
      done()
    }
    const page = await browser.newPage()
    await page.goto(item.link)
    const originSrc = await page.frames()[1]._url
    const modifiedSrc = originSrc.split('=')[1]
    if (
      modifiedSrc.substring(modifiedSrc.lastIndexOf('.') + 1) === 'mp4' ||
      modifiedSrc.indexOf('quan.qq.com') > -1
    ) {
      item.src = modifiedSrc
      item.status = 'complete'
      await Cache.findOneAndUpdate({ link: item.link }, item)
      console.log(`${item.title}---${item.name}---视频源文件抓取完毕`)
    } else {
      await Cache.findOneAndUpdate({ link: item.link }, { status: 'delete' })
      console.log(`${item.title}---${item.name}---视频源文件不符合规则已标记`)
    }
    page.close()
  }, 5)

  q.drain(async () => {
    await browser.close()
    console.log('------------------ 视频源文件爬取完成 ------------------')
  })

  q.push(urls)
}

const aggregate = async () => {
  const group = await Cache.aggregate([
    {
      $group: {
        _id: '$url',
        url: { $first: '$url' },
        title: { $first: '$title' },
        links: {
          $addToSet: {
            name: '$name',
            src: '$src',
          },
        },
      },
    },
  ])
  group.forEach(async i => {
    delete i._id
    i.count = i.links.length
    console.log(i)
    await Anime.findOneAndUpdate(
      { title: i.title },
      { links: i.links },
      { upsert: true }
    )
  })
}

const bootstrap = async () => {
  connect()
  switch (status) {
    case 0:
      const items = await getItems()
      await getList(items)
      break
    case 1:
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '–disable - gpu',
          '–disable-dev-shm-usage',
          '–disable-setuid-sandbox',
          '–no-first-run',
          '–no-sandbox',
          '–no-zygote',
          '–single-process',
        ],
      })
      await getSrc()
      break
    case 2:
      await aggregate()
      break
  }
}

bootstrap()
