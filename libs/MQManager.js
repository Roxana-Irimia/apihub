function MQManager(server){

	let notificationManager;
	const utils = require("./../utils");
	const readBody = utils.readStringFromStream;

	function sendStatus(res, reasonCode){
		res.statusCode = reasonCode;
		res.end();
	}

	function createChannel(req, res){
		let anchorId = req.params.anchorId;
		let SSI = req.getHeader('ssi');
		if(typeof SSI === "undefined" || typeof anchorId === "undefined"){
			return sendStatus(res, 400);
		}

		notificationManager.createQueue(anchorId, function(err){
			if(err){
				if(err.statusCode){
					res.write(err.message);
					return sendStatus(res, err.statusCode);
				}else{
					return sendStatus(res, 500);
				}
			}

			//store SSI to check ownership

			sendStatus(res, 200);
		});
	}

	function sendMessage(req, res){
		let anchorId = req.params.anchorId;
		if(typeof anchorId === "undefined"){
			return sendStatus(res, 400);
		}
		readBody(req, (err, message)=> {
			if (err) {
				return sendStatus(res, 400);
			}
			notificationManager.sendMessage(anchorId, message, function(err, counter){
				if(err){
					return sendStatus(res, 500);
				}

				if(counter > 0){
					res.write(`Message delivered to ${counter} subscribers.`);
				}else{
					res.write(`Message was added to queue and will be delivered later.`);
				}

				return sendStatus(res, 200);
			});
		});
	}

	function receiveMessage(req, res){
		let anchorId = req.params.anchorId;
		if(typeof anchorId === "undefined"){
			return sendStatus(res, 400);
		}

		//check tokens before delivering a message

		notificationManager.readMessage(anchorId, function(err, message){
			try{
				if(err){
					if(err.statusCode){
						return sendStatus(res, err.statusCode);
					}else{
						return sendStatus(res, 500);
					}
				}
				res.write(message);
				sendStatus(res, 200);
			}catch(err){
				//here we expect to get errors when a connection has reached timeout
				console.log(err);
			}
		});
	}

	require("./Notifications").getManagerInstance(workingDirPath, storageDirPath, function(err, instance){
		if(err){
			return console.log(err);
		}

		notificationManager = instance;

		server.post("/mq/create-channel/:anchorId", createChannel);
		server.post("/mq/send-message/:anchorId", sendMessage);
		server.get("/mq/receive-message/:anchorId", receiveMessage);
	});
}

module.exports = MQManager;