const path = require('path')
const express = require('express')
const session = require('express-session');
const hbs = require('hbs')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const Session = require('inspector')
const response = require('express')
const app = express()
var router = express.Router()

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodejs_nd',
});

conn.connect((err) => {
    if (err) throw err;
    console.log('Connected!!!!');
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/assets', express.static(__dirname + '/public'));

//login
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//landing page
app.get('/', (req, res) => {
    res.render('index');
})

//register
app.get('/register', (req, res) => {
    res.render('register');
});

//process register
app.post('/authRegister', (req, res) => {
    // var name = req.body.name;
    // var username = req.body.username;
    // var password = req.body.password;
    let data = { name: req.body.name, username: req.body.username, password: req.body.password };
    let sql = "INSERT INTO users SET ? ";
    let query = conn.query(sql, data, (err, result) => {
        if (err) throw err;
        res.redirect('/login');
    })

})

//login
app.get('/login', (req, res) => {
    res.render('login');
});

//process login
app.post('/auth', (req, res) => {

    var username = req.body.username;
    var password = req.body.password;
    if (username && password) {
        conn.query('SELECT * FROM `users` WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
            if (results.length > 0) {
                req.session.loggedin = true;
                req.session.username = username;
                res.redirect('/product');
            } else {
                res.send('Incorrect Username and/or Password!');
            }
            res.end();
        });
    } else {
        res.send('Please enter Username and Password!');
        res.end();
    }
});

//logout
app.get('/logout', (req, res, next) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});

//users
app.get('/users', (req, res) => {
    let sql = "SELECT * FROM users";
    let query = conn.query(sql, (err, results) => {
        if (err) throw err;
        res.render('users', {
            results: results
        })
    })
})

//update users
app.post('/updateUsers', (req, res) => {
    let sql = "UPDATE users SET name='" + req.body.name + "', username='" +
        req.body.username + "', password='" + req.body.password + "' WHERE user_id=" + req.body.id;
    let query = conn.query(sql, (err, result) => {
        if (err) throw err;
        res.redirect('/users');
    })
})

//delete user
app.post('/deleteUsers', (req, res) => {
    let sql = "DELETE FROM users WHERE user_id=" + req.body.id + "";
    let query = conn.query(sql, (err, results) => {
        if (err) throw err;
        res.redirect('/users');
    })
})


//index product
app.get('/product', (req, res) => {
    let sql = "SELECT * FROM product";
    let query = conn.query(sql, (err, results) => {
        if (err) throw err;
        res.render('product_view', {
            results: results
        });
    });
});

//save data
app.post('/save', (req, res) => {
    let data = { product_name: req.body.product_name, product_price: req.body.product_price };
    let sql = "INSERT INTO product SET ?";
    let query = conn.query(sql, data, (err, results) => {
        if (err) throw err;
        res.redirect('/product');
    });
});

//update data
app.post('/update', (req, res) => {
    let sql = "UPDATE product SET product_name='" + req.body.product_name + "', product_price='" +
        req.body.product_price + "' WHERE product_id=" + req.body.id;
    let query = conn.query(sql, (err, result) => {
        if (err) throw err;
        res.redirect('/product');
    });
});

//delete data
app.post('/delete', (req, res) => {
    let sql = "DELETE FROM product WHERE product_id=" + req.body.product_id + "";
    let query = conn.query(sql, (err, result) => {
        if (err) throw err;
        res.redirect('/product');
    });
});

app.listen(8000, () => {
    console.log('Server is running at port 8000');
});