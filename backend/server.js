const formidable = require('express-formidable')
const express = require('express')
const fs = require('fs')

const app = express()

const maxFilenameLength = 250
const deleteFileAfter = 604_800_000 // Week
const dataFolder = './data/'

// TODO - check file validity?

app.use(formidable())

app.post('/upload', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*')

    let filename = req.fields.filename + '.' + Date.now()
    filename = filename.replaceAll(/\/|\\|\?|\s/g, '').slice(0, maxFilenameLength)

    fs.writeFile(dataFolder + filename, req.fields.content, function (err) {
        if (err) {
            console.log(err)
            res.send('error')
            return
        }

        setTimeout(() => {
            fs.unlink(dataFolder + filename, function (err) {
                console.log(err)
            })
        }, deleteFileAfter)
    })

    res.send(filename)
})

app.post('/download', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*')

    let filename = req.query.id
    filename = filename.replaceAll(/\/|\\|\?|\s/g, '')

    fs.readFile(dataFolder + filename, function (err, data) {
        if (err) {
            console.log(err)
            res.send('error')
            return
        }

        res.send(data)
    })
})

app.listen(8080, () => {
    console.log('listening on port 8080')
})
