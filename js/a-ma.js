"use strict";

leave_InAppBrowser();
$(function(){
	var last_sec;
	$("video").one("play", function(){
		microphone_detect();
	}).on("timeupdate", function(){
		var sec = Math.floor(this.currentTime*1)/1, 
			$b = $("body");

		if([23,40,56,112,121,169,181,194,209,223,242,250,259,276].indexOf(sec)>=0 && sec!=last_sec){
			$(this).get(0).pause();
		}
		else if(sec==239){
			$b.addClass("fire");
		}
		else if(sec==277){
			$b.removeClass("fire");
		}
		last_sec = sec;
		console.log("播放秒數："+sec);
	});
});

function is_touch_device(){
	return ("ontouchstart" in window || ("maxTouchPoints" in navigator && navigator.maxTouchPoints>0)) && !matchMedia("(pointer:fine)").matches;
}

function leave_InAppBrowser(){
	var u = location.href;
	if((navigator.userAgent || "").indexOf("Line/")>0 && u.indexOf("openExternalBrowser")<0)
		location.href = u+(u.indexOf("?")>0 ? "&":"?")+"openExternalBrowser=1";
}

function microphone_detect(){
	navigator.mediaDevices.getUserMedia({audio: true}).then(function(stream){

		var volume = is_touch_device() ? 40 : 60, 
			audioContext = new AudioContext(), 
			analyser = audioContext.createAnalyser(), 
			microphone = audioContext.createMediaStreamSource(stream), 
			javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

			analyser.smoothingTimeConstant = 0.8;
			analyser.fftSize = 1024;

		microphone.connect(analyser);
		analyser.connect(javascriptNode);
		javascriptNode.connect(audioContext.destination);
		javascriptNode.onaudioprocess = function(){

			let values = 0, 
				array = new Uint8Array(analyser.frequencyBinCount);

			analyser.getByteFrequencyData(array);

			let length = array.length;
			for(let i=0; i<length; i++){
				values += (array[i]);
			}

			let vol = Math.round(values/length);
			if(vol>volume) $("video").get(0).play();
			$(".vol").text(vol>20?vol:0);
			// console.log("音量："+vol);
		}
	}).catch(function(e){

	});
}