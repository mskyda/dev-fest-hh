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
		}.bind(this));

	},

	startRecognition: function(){

		this.recognition.lang = 'en-EN';
		this.recognition.continuous = false;
		this.recognition.interimResults = false;
		this.recognition.addEventListener('result', this.onRecognitionResult);
		this.recognition.addEventListener('end', this.recognition.start);

		this.recognition.start();

	},

	onRecognitionResult: function(event){

		for (var i = event.resultIndex; i < event.results.length; i++) {

			if(event.results[i].isFinal){

				console.log(event.results[i][0].transcript);

			}

		}

	}

};

const appKey = 'AAAAZyvhWtw:APA91bFLTKB2QjfofeH02VsaZPWzeXKJnd75v6m_zugSxHeiKoE7unZRLBQbQWrNIN7xL59creGphy42snuWOHf_XnGGGNOyU7fBfY8HOGCHnCd-enLbWxWOEtuY4bIb9i0RuSADoYUI';
const topic = 'dev-fest-hh';

new App(appKey, topic);