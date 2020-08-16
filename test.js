var VideoListJson = [
  [
    '�ſ�',
    [
      '第01集$https://gss3.baidu.com/6LZ0ej3k1Qd3ote6lo7D0j9wehsv/tieba-smallvideo/60_782fb6bdb8d5cd2b13b44e08738bdbda.mp4$flv',
      '第02集$https://gss3.baidu.com/6LZ0ej3k1Qd3ote6lo7D0j9wehsv/tieba-smallvideo/60_66a0e0850f2aecdc238e90def44fb6d5.mp4$flv',
      '第03集$https://gss3.baidu.com/6LZ0ej3k1Qd3ote6lo7D0j9wehsv/tieba-smallvideo/60_41c46a3d4b44fddaef329458728815d8.mp4$flv',
      '第04集$https://gss3.baidu.com/6LZ0ej3k1Qd3ote6lo7D0j9wehsv/tieba-smallvideo/60_000c4199e252bd733e35ff1d91c072e6.mp4$flv',
      '第05集$https://gss3.baidu.com/6LZ0ej3k1Qd3ote6lo7D0j9wehsv/tieba-smallvideo/60_0744d7aed5e5cfbc023e9b306b40d3e1.mp4$flv',
      '第06集$https://gss3.baidu.com/6LZ0ej3k1Qd3ote6lo7D0j9wehsv/tieba-smallvideo/60_87c4c0e71b55c95c0e7c7b3caa63bda4.mp4$flv',
    ],
  ],
  [
    '�ſ�',
    [
      '第01集$http://quan.qq.com/video/1098_782fb6bdb8d5cd2b13b44e08738bdbda$flv',
      '第02集$http://quan.qq.com/video/1098_66a0e0850f2aecdc238e90def44fb6d5$flv',
      '第03集$http://quan.qq.com/video/1098_41c46a3d4b44fddaef329458728815d8$flv',
      '第04集$http://quan.qq.com/video/1098_000c4199e252bd733e35ff1d91c072e6$flv',
      '第05集$http://quan.qq.com/video/1098_0744d7aed5e5cfbc023e9b306b40d3e1$flv',
    ],
  ],
]

const superagent = require('superagent')
const cheerio = require('cheerio')
const charset = require('superagent-charset')

charset(superagent)

function f(array) {
  let x = VideoListJson
  if (x.length > 0) {
    x = x[Math.min(array[0], x.length - 1)][1]
    const res = x[Math.min(array[1], x.length - 1)].split('$')
    return res.splice(0, res.length - 1)
  }
}

const get = url => {
  return new Promise((resolve, reject) => {
    superagent
      .get(url)
      .buffer(true)
      .charset('gb2312')
      .end((err, res) => (err ? reject(err) : resolve(cheerio.load(res.text))))
  })
}

const test = () => {
  const ret = 'http://www.imomoe.in/player/7754-0-0.html'.split('-')
  return [ret[1], ret[2].split('.')[0]]
}

// ;(async () => {
//   const $ = await get('http://www.imomoe.in/player/1615-0-0.html')
//   const json = $('body').find('script')[0].attr('src')
//   console.log(json)
// })()

// console.log(f())

console.log(f(test()))
