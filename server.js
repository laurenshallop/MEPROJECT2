var cookiesParser = require('cookie-parser');
var session = require('express-session');
var morgan = require('morgan');
var User = require('./models/user');
var hbs = require('express-handlebars');
var bodyParser = require('body-parser');
var express = require('express');
var path = require('path');

var app = express;
app.set('port', 3306);
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookiesParser());
app.use(session({
    key: 'user_sid',
    secret: 'somesecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

// handlebars
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: _dirname + '/views/layouts'}));
app.set('view engine', 'hbs');

app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user){
        res.clearCookie('user_sid');
    }
    next();
});

var hbsContent = {userName: '', loggedin: false, title: "not logged in", body: "Hello World"};

// middleware function to check for logged in users
var sessionChecker = (req,res,next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/dashboard');
    } else {
        next();
    }
};

// route for Home-Page
app.get('/', sessionChecker, (req,res) => {
    res.redirect('/login');
});

// route for signup page
app.route('/signup')
    .get((req,res) => {
        res.render('signup', hbsContent);
    })
    .post((req, res) => {
        User.create({
            username: req.body.username,
            password: req.body.password
        })
        .then(user => {
            req.session.user = user.dataValues;
            res.redirect('/dashboard');
        })
        .catch(error => {
            res.redirect('/signup');
        });
    });

    // route for user login 
    app.route('/login')
        .get((req, res) => {
            res.render('login', hbsContent);
        })
        .post((req,res) => {
            var username = req.body.username;
            var password = req.body.password;

            User.findOne({ where: { username: username } }).then(function (user) {
                if (!user) {
                    res.redirect('/login');
                } else if (!user.validPassword(password)) {
                    res.redirect('/login');
                } else {
                    req.session.user = user.dataValues;
                    res.redirect('/dashboard');
                }
            });
        });
    
// route for users dashboard 
app.get('/dashboard', (req,res) => {
    if (req.session.user && req.cookies.username_sid) {
        hbsContent.loggedin = true;
        hbsContent.userName = req.session.user.username;
        hbsContent.title = "logged in";
        res.render('index', hbsContent);
    } else {
        res.redirect('/login');
    }
});

// route for user logout 
app.get('/logout', (req,res) => {
    if (req.session.user && req.cookies.user_sid) {
        hbsContent.loggedin = flase
        hbsContent.title = "logged out";
        res.clearCookie('user_sid');
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

// route for handling 404 requests
app.use(function (req,res,next) {
    res.status(404).send("Can't find that")
});

app.listen(app.get('port'), () => console.log(`App started on port ${app.get('port')}`));