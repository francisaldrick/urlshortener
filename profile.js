const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const cors = require('cors');
const path = require('path')
const keys = require('./keys');
const ShortUrl = require('./models/shortUrl');
const User = require('./models/users');

const app = express();

app.use(express.static(path.join(__dirname,'./front\ end')));

app.use(express.urlencoded({ extended: false }));

app.use(cors());

mongoose.connect(keys.mongodb.dbURI, { useUnifiedTopology: true, useNewUrlParser: true }, () => {
  console.log('connected to mongodb');
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', async (req, res) => {
  res.sendFile('index.html');
});

app.post('/urlshorten', async (req, res) => {
  if(await ShortUrl.findOne({$or:[{fullURL: req.body.full_url}, {emailId: req.body.user_email}]}, null)==null){
  await ShortUrl.create({ emailId: req.body.user_email, fullURL: req.body.full_url });
  }
  res.json({ message: "created successfully", user_email: req.body.user_email });
});

app.post('/geturls', async (req, res) => {
  const result = await ShortUrl.find({ emailId: req.body.user_email }, (err, result) => {
    if (err) {
      res.sendStatus(500);
    }
  });
  res.json({ message: "retrieved successfully", urls: result });
})

app.post("/signup", (req, res) => {
  const requestBody = req.body;
  User.findOne(
    { emailId: requestBody.user_email },
    (err, result) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else if (!result) {
        const user_password = requestBody.password;
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(user_password, salt, (err, hash) => {
            User.create({
              username: requestBody.user_name,
              emailId: requestBody.user_email,
              passwordHash: hash,
              creationDate: Date.now(),
            }).then((result) => {
              res.json({ message: "created successfully", user_email: result.emailId });
            });
          });
        });
      } else if (result) {
        res
          .status(422)
          .json({ message: "exists", user_email: requestBody.user_email });
      }
    }
  );
});

app.post("/login", (req, res) => {
  const requestBody = req.body;
  User.findOne(
    { emailId: requestBody.user_email },
    (err, result) => {
      if (err) {
        console.log(err);
        res.send(500);
      } else if (!result) {
        res.status(422).json({ message: "invalid credentials" });
      } else {
        const userPassword = requestBody.password;
        const passwordHash = result.passwordHash;
        bcrypt.compare(userPassword, passwordHash, (err, success) => {
          if (err) {
            console.log(err);
            res.send(500);
          }
          if (!success) {
            res.status(422).json({ message: "invalid credentials" });
          } else {
            res.json({ message: "logged in successfully" , user_email: requestBody.user_email});
          }
        });
      }
    }
  );
});

app.get('/:shortUrl', async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ shortURL: req.params.shortUrl });
  if (shortUrl == null) return res.sendStatus('404');
  shortUrl.clicks++;
  shortUrl.save();
  res.redirect(shortUrl.fullURL);
});

var listener = app.listen(process.env.PORT || 3000, () => {
  console.log("app listening on port" + listener.address().port);
});