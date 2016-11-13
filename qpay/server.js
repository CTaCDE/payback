var express = require('express');

var app = express();

// Brian account id = 5827fee4360f81f10454a8be
function testTransfer(){transferToSteve("5827fee4360f81f10454a8be", 10000);}

function transferToSteve(payerID, amount) {
	j = {
		  medium: "balance",
		  payee_id: "5827fec6360f81f10454a8bd",
		  amount: amount,
		  description: "transfer to steve"
	}

	key = "c6ab2e123a0c7d7b5a693a9fa7721271";

	url = "http://api.reimaginebanking.com/accounts/";
	url = url + payerID;
	url = url + "/transfers?key=";
	url = url + key;


	$.ajax({
	    url: url,
	    success: function(results) {
	        console.log(JSON.stringify(results));
	    },
	    error: function(results) {
	    	console.log(results);
	    },
	    method: "POST",
	    contentType: 'application/json',
	    data: JSON.stringify(j)
	});
}

// app.use(express.static('public'));

app.get('/', function (req, res) {
	console.log("payer: " + req.query.payer);
	console.log("amount: " + req.query.amount);

	transferToSteve(req.query.payer, req.query.amount);
	// res.write(req.query.id);
    res.sendFile("C:/Users/steven/desktop/payback/qpay/public/index.html");
});

app.get('/hardcodeTransfer', function (req, res) {
	// transferToSteve(req.query.payer, req.query.amount);
	// res.write(req.query.id);
    res.sendFile("C:/Users/steven/desktop/payback/qpay/public/hardcodeSend.html");
});

app.post('/api', function(req, res) {
	console.log(req.query);

});

app.listen(80, function () {
  console.log('Example app listening on port 80!');
});