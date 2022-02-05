/* eslint-disable no-console */

const comicgen = require('./comicgen')(require('fs'))
const express = require('express')
const bodyParser = require('body-parser')
const sharp = require('sharp')

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.static('.'))

app.get('/comic', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*')

  const start = new Date()
  let result, duration
  try {
    result = comicgen(req.query)
  } catch(e) {
    return handleException(e, req, res, start)
  }
  res.set('Cache-Control', 'public, max-age=3600')
  if (req.query.ext && req.query.ext.match(/png/i)) {
    try {
      result = await sharp(Buffer.from(result, 'utf8')).toFormat('png', { colors: 256 }).toBuffer()
      res.set('Content-Type', 'image/png')
    } catch(e) {
      return handleException(e, req, res, start)
    }
  } else {
    res.set('Content-Type', 'image/svg+xml')
  }
  res.send(result)
  duration = +new Date() - start
  console.log('I', start, duration, req.url)
})


app.listen(3000, () => {
  console.log('Comicgen is running at http://localhost:3000')
})


function handleException(e, req, res, start) {
  let duration = +new Date() - start
  let error = e.toString().trim()
  console.error('E', start, duration, req.url, error)
  res.set('Content-Type', 'text/plain')
  res.send(error)
}
