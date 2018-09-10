var express = require('express');
var request = require('request');
var path = require('path');

//Added because post method some time not able to receive data
var bodyParser = require('body-parser');

// Add your credentials:
// Add your client ID and secret
var CLIENT = 'Afs92R7pYi-8S9_nuFEpU3rLG3djKkA9pVCzts4QgFbnWsuqLj-nP4pPpH7GKs39HmBcrBd2tWQn5BY5';
var SECRET = 'EAq2lOfnZs-L9VZsPd1OZleyhO8a2nQodC5HF3jTc_0lvKciR0eGypwD0qikOrEbuecYYInMA-r7iqF9';

var PAYPAL_API = 'https://api.sandbox.paypal.com';


var app = express();

//Added because post method some time not able to receive data
app.use(bodyParser.urlencoded({ extended: false }));

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);

app.get('/', function(req, res) {
    res.render('index.html');
});
app.get('/return', function(req, res) {
    res.render('return.html');
});
app.get('/cancel', function(req, res) {
    res.render('cancel.html');
});

app
// Set up the payment:
// 1. Set up a URL to handle requests from the PayPal button
    .post('/my-api/create-payment/', function(req, res) {
        // 2. Call /v1/payments/payment to set up the payment
        request.post(PAYPAL_API + '/v1/payments/payment', {
            auth: {
                user: CLIENT,
                pass: SECRET
            },
            body: {
                intent: 'sale',
                payer: {
                    payment_method: 'paypal'
                },
                transactions: [{
                    amount: {
                        total: '10.99',
                        currency: 'USD'
                    }
                }],
                redirect_urls: {
                    return_url: '/return',
                    cancel_url: '/cancel'
                }
            },
            json: true
        }, function (err, response) {
            if (err) {
                console.error(err);
                return res.sendStatus(500);
            }

            // 3. Return the payment ID to the client
            res.json({
                id: response.body.id
            });
        });
    })
    // Execute the payment:
    // 1. Set up a URL to handle requests from the PayPal button.
    .post('/my-api/execute-payment/', function(req, res) {
        // 2. Get the payment ID and the payer ID from the request body.
        var paymentID = req.body.paymentID;
        var payerID   = req.body.payerID;

        // 3. Call /v1/payments/payment/PAY-XXX/execute to finalize the payment.
        request.post(PAYPAL_API + '/v1/payments/payment/' + paymentID + '/execute', {
            auth: {
                user: CLIENT,
                pass: SECRET
            },
            body: {
                payer_id: payerID,
                transactions: [{
                    amount: {
                        total: '10.99',
                        currency: 'USD'
                    }
                }]
            },
            json: true
        }, function (err, response) {
            if (err) {
                console.error(err);
                return res.sendStatus(500);
            }

            // 4. Return a success response to the client
            res.json({
                status: 'success'
            });
        });
    })
    .listen(3000, function() {
        console.log('Server listening at http://localhost:3000/');
    });

// Run `node ./server.js` in your terminal