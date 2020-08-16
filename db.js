const mongoose = require('mongoose')
const DB_URL = 'mongodb://localhost/anime'

const animeSchema = new mongoose.Schema({
  title: String,
  url: String,
  count: Number,
  links: Array,
})

const cacheSchema = new mongoose.Schema({
  title: String,
  url: String,
  link: String,
  name: String,
  src: String,
  status: String,
})

const Anime = mongoose.model('Animes', animeSchema)
const Cache = mongoose.model('Caches', cacheSchema)

const connect = () => {
  mongoose.connect(
    DB_URL,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    },
    () => console.log('已连接上数据库')
  )
}

const disconnect = () => {
  mongoose.disconnect()
}

module.exports = {
  connect,
  disconnect,
  Anime,
  Cache,
}
