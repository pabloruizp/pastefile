const path = require('path')
const express = require('express')
const morgan = require('morgan')
const fileUpload = require('express-fileupload')
const bodyParser = require('body-parser')
const cors = require('cors')
const fsExtra = require('fs-extra')
const { nanoid } = require('nanoid')


let lastDelete = Date.now();

let app = express()
const delay = 60


// enable files upload - soy inutil
app.use(fileUpload({
    createParentPath: true
}));

app.use(cors())
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))


app.use('/files',express.static(__dirname + '/public'))

app.use(function (req, res, next) {
    var diff = Date.now() - lastDelete
    console.log(diff)
    if ((Date.now() - lastDelete) > (delay * 1000)) {
        fsExtra.emptyDir(__dirname + "/public/", (err) => {
            if (err) throw(err)
            console.log("Folder clean")
        })
        lastDelete = Date.now();
    }
    next()
});


app.post('/', async (req, res) => {
    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
            let avatar = req.files.avatar;
            
            let newName = nanoid() + path.extname(avatar.name)
            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            avatar.mv('./public/' + newName);

            url = req.protocol + '://' + req.get('host') + req.originalUrl + 'files/' + newName
            res.send('File uploaded!<br><a href="' + url + '">'+ url + '</a>')
        }
    } catch (err) {
        res.status(500).send(err);
        console.log(err)
    }
});

app.get('/', (req,res) => {
    res.sendFile(__dirname + '/index.html')
})

let port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("API working")
})