const mongoose = require('mongoose')
const DB_URL = 'mongodb://localhost/animes'

const animeSchema = new mongoose.Schema(
  {
    title: String,
    id: String,
    count: Number,
    videoJson: String,
    links: Array,
    delete: {
      type: Boolean,
      default: false,
    },
  },
  { versionKey: false }
)

const Anime = mongoose.model('Animes', animeSchema)

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
}
