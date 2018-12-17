const express = require('express')
const app = express()
const port = process.env.PORT || 4000
const router = express.Router()
app.use(express.static(`${__dirname}/`))
app.engine('.html', require('ejs').renderFile)
app.set('views', `${__dirname}/`)
router.get('/*', (req, res, next) => {
  res.sendFile(`${__dirname}/index.html`)
})
app.use('/', router)
app.listen(port)
