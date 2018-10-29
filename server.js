"use strict";
require('dotenv').config();
const express = require('express');
const app = express();
const validUrl = require('valid-url');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const dbUrl = process.env.DB_URI;

const ID = () => Math.random().toString(36).substr(2, 9);

const corsOptions = {
	origin: 'http://hrly.herokuapp.com',
	optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.get('/', (req, res) => {
	 res.sendFile(__dirname + '/home.html');
});

app.get('/new/*', (req, res) => {
	let oriUrl = req.params[0];

	if ( validUrl.isHttpUri(oriUrl) || validUrl.isHttpsUri(oriUrl) ) {
		MongoClient.connect(dbUrl, (err, db) => {
			assert.equal(null, err);
			console.log('Mongo is connected');

			let col = 'shortenedurls';
			let collection = db.collection(col);
			const id = ID();

			collection.insert({
				"_id": id,
				"original": oriUrl
			}, (err, result) => {
				assert.equal(err, null);
				console.log('New URL inserted');
				res.json({
					"original": oriUrl,
					"short": 'https://hrly.herokuapp.com/' + id,
				});
			});
		});
	} else {
		res.json({
			"error":"Wrong url format, make sure you have a valid protocol and real site."
		});
	}
});

app.get('/:URLid', (req, res) => {
	let URLid = Number(req.params.URLid);
	MongoClient.connect(dbUrl, (err, db) => {
		assert.equal(null, err);
		// console.log('Mongo is connected');
		db.collection('shortenedurls').findOne({ "_id": URLid }, (err, result) => {
			if (err) { console.error(err) }
			if (result == null) { 
				res.status(404).send({
					"error":"URL id is not found"
				});
				return;
			}
			res.redirect(result['original']);
		});
	});
});

app.listen(process.env.PORT || 8080, () => {
	console.log('Server is running on port 8080');
});