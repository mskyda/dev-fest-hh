var App = function(appKey, topic){

	this.appKey = appKey;
	this.topic = topic;

	this.init();

};

App.prototype = {

	init: function(){

		this.messaging = window.firebase.messaging();
		this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition);
		this.synth = window.speechSynthesis;

	}

};

const appKey = 'AAAAZyvhWtw:APA91bFLTKB2QjfofeH02VsaZPWzeXKJnd75v6m_zugSxHeiKoE7unZRLBQbQWrNIN7xL59creGphy42snuWOHf_XnGGGNOyU7fBfY8HOGCHnCd-enLbWxWOEtuY4bIb9i0RuSADoYUI';
const topic = 'dev-fest-hh';

new App(appKey, topic);