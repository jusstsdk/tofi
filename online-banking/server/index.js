const express = require('express')
const router = require('./routes/index')
const path = require('path');

const PORT = process.env.PORT || 3000

const app = express()

app.use(express.json())
app.use('/', router)

app.use(express.static(path.join(__dirname, '../pages')));
app.use('/styles.css', express.static(path.join(__dirname, '../styles.css')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/welcome/welcome.html'));
})

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/login/sign_in.html'));
})

app.use('/register', express.static(path.join(__dirname, '../pages/login')));
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/login/sign_up.html'));
})

app.get('/accounts', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/accounts/accounts.html'));
})

app.get('/accounts/create', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/create_account/create_account.html'));
})

app.use('/payments/create', express.static(path.join(__dirname, '../pages/create_payment')));
app.get('/payments/create', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/create_payment/create_payment.html'));
})

app.get('/payments', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/payments/payments.html'));
})

app.get('/collectings', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/collectings/collectings.html'));
})

app.use('/collecting-details', express.static(path.join(__dirname, '../pages/collecting_details')));
app.get('/collecting-details', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/collecting_details/collecting_details.html'));
})

app.use('/collectings/create', express.static(path.join(__dirname, '../pages/create_collecting')));
app.get('/collectings/create', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/create_collecting/create_collecting.html'));
})

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/profile/profile.html'));
})

app.get('/credits', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/credits/credits.html'));
})


app.listen(PORT, () => console.log(`Server started on port ${PORT}`))

