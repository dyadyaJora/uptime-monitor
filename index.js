let http = require('http');
let fs = require('fs');
let cluster = require('cluster');
let path = require('path');
let passport = require('passport');
let LocalStrategy = require('passport-local');
let JwtStrategy = require('passport-jwt').Strategy;
let ExtractJwt = require('passport-jwt').ExtractJwt;
let jwt = require('jsonwebtoken');
let mongoose = require('mongoose');
let express = require('express');
let bodyParser = require('body-parser');

let config = require('./config');
let utils = require('./utils');

cluster.setupMaster({
  exec: 'pinger.js'
});

cluster.fork();

/* TODO: RABBIT + forking
for(let i = 0; i < require('os').cpus().length; i++)
    cluster.fork();
*/

const MONGO_URI = config.mongodbUri;
const JWT_SECRET = config.jwtSecretKey;

let port = config.webPort;
let app = express();

mongoose.Promise = Promise;
mongoose.connect(MONGO_URI);

mongoose.connection.on('error', function (err) {
  console.error('Database Connection Error: ' + err);
});

mongoose.connection.on('connected', function () {
  console.info('Succesfully connected to MongoDB Database');
});

require('./models/user');
let User = mongoose.model('User');

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  session: false
}, function (email, password, done) {
  User.findOne({email}, (err, user) => {
    if (err) {
      return done(err);
    }

    if (!user || !utils.checkPassword(password, user.passwordHash, user.salt)) {
      return done(null, false, {message: 'User does not exist or wrong password.'});
    }

    return done(null, user);
  });
}));

passport.use(new JwtStrategy({
  secretOrKey: JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}, function (payload, done) {
  User.findById(payload.id, (err, user) => {
    if (err) {
      return done(err);
    }
    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  });
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, './www')));
app.use(passport.initialize());
app.disable('x-powered-by');

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

app.get('/', (req, res, next) => {
  fs.readFile(path.resolve('./www/index.html'), 'utf-8', (err, str) => {
    if (err) {
      return next(err);
    }

    res.send(str);
  });
});

app.post('/site', passport.authenticate('jwt', { session: false }), (req, res) => {
  // save to db;
  res.json({ ok: true });
});

app.put('/site', passport.authenticate('jwt', { session: false }), (req, res) => {
  // update in db;
});

app.post('/login', passport.authenticate('local', { failureRedirect: '/' }), (req, res, next) => {
  let resData = {};

  if (req.user == false) {
    resData = { message: 'Login failed', err: true };
  } else {
    const payload = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    };
    const token = jwt.sign(payload, JWT_SECRET);

    resData = { user: req.user.email, token: 'Bearer ' + token };
  }

  res.json(resData);
});

app.post('/register', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let salt = utils.createSalt();
  let passwordHash = utils.md5Hash(password, salt);
  let user = new User({
    email: email,
    name: 'no name',
    passwordHash: passwordHash,
    salt: salt
  });

  user.save()
    .then(usr => {
      res.sendStatus(201);
      // ** user created
      // ** generate first jwt
      // ** status 201
    })
    .catch(err => {
      if (err) {
        console.log(err, 'ERROR creating new user');
        res.sendStatus(400);
      }
    });
});

app.set('port', port);
let server = http.createServer(app);

server.listen(port);
console.log('SERVER started');
