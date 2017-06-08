var redis = require("redis");
var client = redis.createClient();
module.exports = {
	saveCriteria : (id,criteria)=>{
		if(criteria.device && criteria.device.length > 0){
			criteria.device.forEach((val)=>{
				saveDevice(id,val);
			});
		}
		if(criteria.hour && criteria.hour.length > 0){
			criteria.hour.forEach((val)=>{
				saveHour(id,val);
			});
		}
		if(criteria.day && criteria.day.length > 0){
			criteria.day.forEach((val)=>{
				saveDay(id,val);
			});
		}
		if(criteria.state && criteria.state.length > 0){
			criteria.state.forEach((val)=>{
				saveState(id,val);
			});
		}
	},
	getRoute : (buyerIds,callback)=>{
		var data=[];
		var maxVal=0;
		var location = null;
		var res = {};
		buyerIds.forEach((val)=>{
			client.hget("buyer",val,function(err,value){
				if(value){
					res = getMaxValUrl(JSON.parse(value),function(res){
						//console.log(res);return;
						if(res.maxVal > maxVal){
							maxVal = res.maxVal;
							location = res.location;
						}
					});
				}
			});
		});

		setTimeout(function () {
			callback(location);
		}, 1000);


	}
};

function getMaxValUrl(data,cb){
	var res = {};
	res.maxVal=0;
	res.location = "";
	if(data.offers && data.offers.length > 0){
		data.offers.forEach((val)=>{
			if(val.value > res.maxVal){
				res.maxVal = val.value;
				res.location = val.location;
			}
		});
	}
	cb(res);
}

function saveDevice(id,device){
	//console.log(device);
	client.sadd(['device-'+device,id],(err,reply)=>{
		console.log(err);
		console.log(reply);
	});
}

function saveHour(id,hour){
	//console.log(device);
	client.sadd(['hour-'+hour,id],(err,reply)=>{
		console.log(err);
		console.log(reply);
	});
}

function saveDay(id,day){
	//console.log(device);
	client.sadd(['day-'+day,id],(err,reply)=>{
		console.log(err);
		console.log(reply);
	});
}

function saveState(id,state){
	//console.log(device);
	client.sadd(['state-'+state,id],(err,reply)=>{
		console.log(err);
		console.log(reply);
	});
}
