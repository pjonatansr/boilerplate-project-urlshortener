require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
var bodyParser = require('body-parser');
var validUrl = require('valid-url');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

//Just in memory because doesn't need a database for the course
let index = 0;
let arrUrl = [Number];

const validateId = (id) => arrUrl.some(
  (obj) => obj.short_url === parseInt(id)
);

const validateUrl = (url) => {
  return validUrl.isWebUri(url);
};

const invalidUrl = () => {
  throw new Error("invalid url");
};

app.use((req, _, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.route("/api/shorturl/:id?")
  .post((req, res, next) => {
    var urlObject = {
      original_url: req.body.url,
      short_url: ++index
    };

    try {
      validateUrl(urlObject.original_url) || invalidUrl();
      
      arrUrl[index] = urlObject;

      res.json(arrUrl[index]);
    } catch (e) {
      return next(e);
    }

  })
  .get((req, res, next) => {
    const id = req.params.id;

    try {
      const validatedUrl = validateId(id)
        && validateUrl(arrUrl[id].original_url);

      validatedUrl || invalidUrl();

      res.redirect(302, arrUrl[id].original_url);

    } catch (e) {
      return next(e);
    }
  });

app.use("/api/shorturl/:id?", (err, req, res, next) => {
  return res.send({ 'error': 'invalid url'});
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
