var express = require('express');
var redis = require("redis");
var bodyParser = require('body-parser');
var micro = require('./micro');

var app = express();
var client = redis.createClient();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



app.post("/buyers",insertBuyers);
app.get("/buyers/:id", getBuyerById);
app.get('/route',getRoute);

function getBuyerById(req,res,next){
	var key = req.params.id;
	console.log(key);
	client.hget("buyer",key,function(err,value){
		if(value){
			res.send(JSON.parse(value));
		}else{
			res.send("no record found");
		}
	});
}

function insertBuyers(req,res,next){
	var data = req.body;
	client.hset("buyer", data.id, JSON.stringify(data), redis.print);
	if(data.offers && data.offers.length > 0){
		data.offers.forEach(function(val){
			if(val.criteria){
				micro.saveCriteria(data.id,val.criteria);
			}
		});
	}
	res.send("saved successfully");
}

function getDevices(req,res,next){
	var type = req.params.type;
	console.log(type);
	client.smembers('device-'+type,(err,reply)=>{
		if(reply){
			res.send(reply);
		}else{
			res.send("no record found");
		}
	});
}

function getRoute(req,res,next){
	//res.send(req.query);
	var time = req.query.timestamp;
	var device = req.query.device;
	var state = req.query.state;
	var day = new Date(time).getDay();
	var hour = new Date(time).getHours();
	//console.log(time,device,state,day,hour);
	client.sinter([
		'device-'+device,
		'state-'+state,
		'day-'+day,
		'hour-'+hour
	],(err,reply)=>{
		if(reply){
			micro.getRoute(reply,(url)=>{
				if(url){
					res.send({location : url});
				}else{
					res.send('Your query did not found a location');
				}

			});
		}else{
			res.send('No relevent route found!!');
		}
	});
}


app.listen(3000);
console.log('Express started on port 3000');
