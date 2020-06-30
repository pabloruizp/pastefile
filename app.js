const express = require('express')
const morgan = require('morgan')
const fileUpload = require('express-fileupload')
const bodyParser = require('body-parser')
const cors = require('cors')

let app = express()

// enable files upload - soy inutil
app.use(fileUpload({
    createParentPath: true
}));

app.use(cors())
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))


app.use('/files',express.static(__dirname + '/public'))


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
            
            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            avatar.mv('./public/' + avatar.name);

            //send response
            res.send({
                status: true,
                message: 'File is uploaded',
                data: {
                    name: avatar.name,
                    mimetype: avatar.mimetype,
                    size: avatar.size
                }
            });
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

app.get('/', (req,res) => {
    res.sendFile(__dirname + '/index.html')
})

let port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("API working")
})