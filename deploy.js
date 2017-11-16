const express = require('express');
const rest = require('request-promise-native');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3255;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.post('/deploy', (request, response) => {
    const data = request.body;
    console.log("data ", data);
    const branch = data.ref.slice(11);
    const name = data.repository.name + '-' + branch;
    rest.get({
        uri: 'http://admin:dae6668c46212ca60ca80ea5192a103c@88.99.31.246:8080/crumbIssuer/api/json?xpath=concat(//crumbRequestField,":",//crumb)',
        json: true
    }).then( res => {
        return rest.post({
            uri: 'http://admin:dae6668c46212ca60ca80ea5192a103c@88.99.31.246:8080/job/' + name + '/build?token=EL0px76ra3R10LXxnL903cQcbo6bxwB9',
            headers: {
              'jenkins-crumb': res.crumb
            }
        });
    }).then( () => {
        response.json({
            status: true
        });
    }).catch( error => {
        response.json({
            status: false,
            error: error.message
        });
    });
});

app.use(function (error, request, response, next) {
    if (error.name === 'UnauthorizedError') {
        response.status(401).json({ message: error.message });
    }
});

app.use((error, request, response, next) => {
    console.error(error.stack);
    return response.status(error.status || 500)
    .json({ 'message_error': error.errors, message: 'internal' });
});

app.listen(port, () => console.log(`Please use localhost:${port}`));

module.exports = app;