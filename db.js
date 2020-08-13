const mongoose = require('mongoose')
const DB_URL = 'mongodb://localhost/anim'

const animSchema = new mongoose.Schema({
  title: String,
  url: String,
  count: Number,
  links: Array,
})

const Anim = mongoose.model('Anims', animSchema)

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
  Anim,
}
