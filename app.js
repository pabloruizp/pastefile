const path = require('path')
const express = require('express')
const morgan = require('morgan')
const fileUpload = require('express-fileupload')
const bodyParser = require('body-parser')
const cors = require('cors')
const fsExtra = require('fs-extra')
const { nanoid } = require('nanoid')

// Initial time on load the app
let lastDelete = Date.now();

let app = express()

// All the files are deleted every 5 minutes
const delay = 60 * 5 


// Enable file upload
app.use(fileUpload({
    createParentPath: true,
    limits: { 
        fileSize: 10 * 1024 * 1024 * 1024 //10 MB max file(s) size
    },
}));

app.use(cors())
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// Directory to store the files
app.use('/files',express.static(__dirname + '/public'))

// Before each request, the time of the last global delete is checked
app.use(function (req, res, next) {
    
    if ((Date.now() - lastDelete) > (delay * 1000)) {
        fsExtra.emptyDir(__dirname + "/public/", (err) => {
            if (err) throw(err)
            console.log("Folder clean")
        })

        lastDelete = Date.now();
    }
    next()
});

// Thanks to https://attacomsian.com/blog/uploading-files-nodejs-express
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
            
            let extension = path.extname(avatar.name)
            let nameId = nanoid()
            let newName = nameId + extension
            //Use the mv() method to place the file in upload directory 
            avatar.mv('./public/' + newName);

            // Send of GET parameters to the index.html
            url = req.protocol + '://' + req.get('host') + req.originalUrl + 'files/' + newName
            res.redirect(req.protocol + '://' + req.get('host') + req.originalUrl + '?name=' + nameId + '&ext=' + extension.substring(1))
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