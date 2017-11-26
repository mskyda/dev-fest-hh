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

		});

	}

};

const appKey = 'AAAAZyvhWtw:APA91bFLTKB2QjfofeH02VsaZPWzeXKJnd75v6m_zugSxHeiKoE7unZRLBQbQWrNIN7xL59creGphy42snuWOHf_XnGGGNOyU7fBfY8HOGCHnCd-enLbWxWOEtuY4bIb9i0RuSADoYUI';
const topic = 'dev-fest-hh';

new App(appKey, topic);