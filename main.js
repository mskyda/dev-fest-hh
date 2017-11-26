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

		this.setLanguage();

		this.requestPermission();

	},

	setLanguage: function(){

		var select = document.querySelector('#language');

		this.language = select.value;

		select.addEventListener('change', function () {

			this.language = select.value;

			this.stopRecognition();

			this.recognition.lang = this.language;

			var delayed = this.restartRecognition.bind(this);

			setTimeout(delayed, 1);

		}.bind(this));

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

			this.setupRecognition();

		}.bind(this));

	},

	listenTopic: function(){

		var fetchUrl = 'https://iid.googleapis.com/iid/v1/' + this.token + '/rel/topics/' + this.topic;

		fetch(fetchUrl, {
			method: 'POST',
			headers: {
				Authorization: 'key=' + this.appKey,
				'Content-Type': 'application/json'
			}
		}).then(function() {

			console.log('Listening topic: "' + this.topic + '"');

			this.receiveMessages();

		}.bind(this));

	},

	receiveMessages: function(){

		this.messaging.onMessage(function(response) {

			var msg = response.notification.body;

			console.log('Message received: "' + msg + '"');

			this.publishMessage(msg, response.data);

		}.bind(this));

	},

	publishMessage: function(msg, data){

		var isOwnMsg = this.token.indexOf(data.id) === -1,
			label = isOwnMsg ? '<strong class="own">You say: </strong>' : '<strong>' + data.userName + ' says: </strong>';

		document.querySelector('h1').style.display = 'none';

		document.querySelector('#messages').innerHTML += '<li>' + label + '"' + msg + '"</li>';

		if(!isOwnMsg){ this.sayMessage(msg, data.lang); }

	},

	sayMessage: function(msg, language){

		this.stopRecognition();

		var utter = new SpeechSynthesisUtterance(msg);

		utter.lang = language;

		utter.addEventListener('end', this.restartRecognition.bind(this));

		var delayed = function(){ this.synth.speak(utter); }.bind(this);

		setTimeout(delayed, 1);

	},

	stopRecognition: function(){

		this.recognition.removeEventListener('end', this.recognition.start);

		this.recognition.abort();

	},

	restartRecognition: function(){

		this.recognition.addEventListener('end', this.recognition.start);

		this.recognition.start();

	},

	setupRecognition: function(){

		this.recognition.lang = this.language;
		this.recognition.continuous = false;
		this.recognition.interimResults = false;
		this.recognition.addEventListener('result', this.onRecognitionResult.bind(this));
		this.recognition.addEventListener('end', this.recognition.start);

		this.recognition.start();

	},

	onRecognitionResult: function(event){

		for (var i = event.resultIndex; i < event.results.length; i++) {

			if(event.results[i].isFinal){

				var recognitionResult = event.results[i][0].transcript;

				console.log('Message recongnized: "' + recognitionResult + '"');

				this.sendMessage(recognitionResult);

			}

		}

	},

	sendMessage: function(message){

		console.log('Sending the message');

		var userName = document.querySelector('#username').value || 'Anonymous';

		fetch('https://fcm.googleapis.com/fcm/send', {
			method: 'POST',
			headers: {
				Authorization: 'key=' + this.appKey,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				notification: {
					title: 'New message from ' + userName,
					body: message
				},
				data: {
					lang: this.language,
					id: this.token.slice(0, 5),
					userName: userName
				},
				to: '/topics/' + this.topic
			})
		}).then(function() {

			console.log('Message sent');

		});

	}

};

const appKey = 'AAAAZyvhWtw:APA91bFLTKB2QjfofeH02VsaZPWzeXKJnd75v6m_zugSxHeiKoE7unZRLBQbQWrNIN7xL59creGphy42snuWOHf_XnGGGNOyU7fBfY8HOGCHnCd-enLbWxWOEtuY4bIb9i0RuSADoYUI';
const topic = 'dev-fest-hh';

new App(appKey, topic);