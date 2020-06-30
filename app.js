const express = require('express')
const morgan = require('morgan')


let app = express()

app.use(morgan('dev'))
app.use('/files',express.static(__dirname + '/public'))


app.get('/', (req,res) => {
    res.sendFile(__dirname + '/index.html')
})

let port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("API working")
})