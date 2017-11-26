var App = function(appKey, topic){

	this.appKey = appKey;
	this.topic = topic;

	this.init();

};

App.prototype = {

	init: function(){

		console.log('Init App');

		this.messaging = window.firebase.messaging();
		this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition);
		this.synth = window.speechSynthesis;

		this.requestPermission();

	},

	requestPermission: function(){

		console.log('Requesting permission');

		this.messaging.requestPermission().then(function(){

			console.log('Notification permission granted');

			this.requestToken();

		}.bind(this));

	},

	requestToken: function(){

		console.log('Requesting Token');

		this.messaging.getToken().then(function(token) {

			console.log('Received token: ' + token);

			this.token = token;

			this.listenTopic();

			this.startRecognition();

		}.bind(this));

	},

	listenTopic: function(){

		var fetchUrl = 'https://iid.googleapis.com/iid/v1/' + this.token + '/rel/topics/' + this.topic;

		fetch(fetchUrl, {
			'method': 'POST',
			'headers': {
				'Authorization': 'key=' + this.appKey,
				'Content-Type': 'application/json'
			}
		}).then(function() {

			console.log('Listening topic: "' + this.topic + '"');

			this.receiveMessages();

		}.bind(this));

	},

	receiveMessages: function(){

		this.messaging.onMessage(function(msg) {

			msg = msg.notification.body;

			console.log('Message received: "' + msg + '"');

			this.publishMessage(msg);

		}.bind(this));

	},

	publishMessage: function(msg){

		var isOwnMsg = msg === this.recognitionResult,
			label = isOwnMsg ? '<span class="own">You say: </span>' : '<span>Somebody says: </span>';

		document.querySelector('#messages').innerHTML += '<li>' + label + '"' + msg + '"</li>';

		if(!isOwnMsg){ this.sayMessage(msg); }

	},

	sayMessage: function(msg){

		this.recognition.removeEventListener('end', this.recognition.start);

		this.recognition.abort();

		var utter = new SpeechSynthesisUtterance(msg);

		utter.lang = 'en-EN';

		utter.addEventListener('end', function () {

			this.recognition.addEventListener('end', this.recognition.start);

			this.recognition.start();

		}.bind(this));

		var delayed = function(){ this.synth.speak(utter); }.bind(this);

		setTimeout(delayed, 1);

	},

	startRecognition: function(){

		this.recognition.lang = 'en-EN';
		this.recognition.continuous = false;
		this.recognition.interimResults = false;
		this.recognition.addEventListener('result', this.onRecognitionResult.bind(this));
		this.recognition.addEventListener('end', this.recognition.start);

		this.recognition.start();

	},

	onRecognitionResult: function(event){

		for (var i = event.resultIndex; i < event.results.length; i++) {

			if(event.results[i].isFinal){

				this.recognitionResult = event.results[i][0].transcript;

				console.log('Message recongnized: "' + this.recognitionResult + '"');

				this.sendMessage();

			}

		}

	},

	sendMessage: function(){

		console.log('Sending the message');

		var notification = {
			'title': 'New message',
			'body': this.recognitionResult
		};

		fetch('https://fcm.googleapis.com/fcm/send', {
			'method': 'POST',
			'headers': {
				'Authorization': 'key=' + this.appKey,
				'Content-Type': 'application/json'
			},
			'body': JSON.stringify({
				'notification': notification,
				'to': '/topics/' + this.topic
			})
		}).then(function() {

			console.log('Message sent');

		});

	}

};

const appKey = 'AAAAZyvhWtw:APA91bFLTKB2QjfofeH02VsaZPWzeXKJnd75v6m_zugSxHeiKoE7unZRLBQbQWrNIN7xL59creGphy42snuWOHf_XnGGGNOyU7fBfY8HOGCHnCd-enLbWxWOEtuY4bIb9i0RuSADoYUI';
const topic = 'dev-fest-hh';

new App(appKey, topic);