// To be called just once, on load. Sets everything to be consistent
function init() {
	changeText(time);

	$('#initButton').prop("disabled", false);
	$('#pauseButton').prop("disabled", true);
	$('#stopButton').prop("disabled", true);

	if (ding) {
		$('.bell').addClass('fa-bell');
	} else {
		$('.bell').addClass('fa-bell-slash');
	}

	if (debateTypeIsBp) {
		$('#presetsButton').text("15/07/05");
		$('#academic').addClass('hidden');
	} else {
		$('#presetsButton').text("05/04/03");
		$('#bp').addClass('hidden');
	}

	if (window.location.hash == '#cmude') {
		$('.cmude').removeClass('hidden');
	} else {
		$('.cmude').addClass('hidden');
	}
}

// Starts or resumes the chron
function initChrono() {
	if (!paused) {
		final = performance.now() + time * 1000;
		initialTime = time;
	} else {
		final = performance.now() + getTimeOnScreen() * 1000;
	}

	animationFrame = requestAnimationFrame(chron);

	$('#initButton').prop("disabled", true);
	$('#pauseButton').prop("disabled", false);
	$('#stopButton').prop("disabled", false);

	paused = false;
}

// Pauses the chrono
function pauseChrono() {
	cancelAnimationFrame(animationFrame);

	$('#initButton').prop("disabled", false);
	$('#pauseButton').prop("disabled", true);
	$('#stopButton').prop("disabled", false);

	paused = true;
}

// Stops the chrono
function stopChrono() {
	cancelAnimationFrame(animationFrame);

	$('#initButton').prop("disabled", true);
	$('#pauseButton').prop("disabled", true);
	$('#stopButton').prop("disabled", true);

	paused = false;
}

function stopChronoAndRecord() {
	$('#tableHelp').remove();
	$('#resultsTable tbody').append('<tr><td>#' + number + '</td><td>' + formatValue(initialTime)  + '</td><td>' + formatValue(getTimeOnScreen()) + '</td></tr>');
	number += 1;

	resetChrono();
}

function resetChrono() {
	stopChrono();

	time = getTimeOnInput();

	$('#initButton').prop("disabled", false);

	changeText(time);

	paused = false;
}

function changeTime(t) {
	time = t;
	stopChrono();
	var minutes = time / 60;
	var seconds = time % 60;
	changeText(t);
	$('#initButton').prop("disabled", false);

	$('#minutesInput').val(minutes);
	$('#secondsInput').val(seconds);

	paused = false;
}


function toggleConfiguration() {
	$('#config').toggleClass('hidden');
}

function toggleDings() {
	$('#bellConfig').toggleClass('hidden');
}

function toggleDing(num) {
	dings[num] = !dings[num]; 

	if (dings[num]) {
		playDing();
	}

	$('.dingGlyphicon' + num).toggleClass('fa-bell-slash fa-bell');
}

function togglePresets() {
	$('.timePresets').toggleClass('hidden');

	debateTypeIsBp = !debateTypeIsBp;

	if (debateTypeIsBp) {
		$('#presetsButton').text("15/07/05");
	} else {
		$('#presetsButton').text("05/04/03");
	}
}

function toggleTable() {
	$('#resultsTable').toggleClass('hidden');
	$('#tableIcon').toggleClass('fa-check fa-times');
}

// Private 
var time = 420;
var final = null;
var animationFrame = null;
var paused = false;
var ding = true;
var dinging = false;
var shouldDing = false;
var debateTypeIsBp = true;
var number = 1;
var initialTime = null;
var dings = {0: ding, 1: ding, 6: ding};

function chron(t) {
	var value = (final - t) / 1000;

	changeText(value);

	animationFrame = requestAnimationFrame(chron);
}

function changeText(value) {
	var text;
	var min = ~~(value / 60);
	var sec = ~~(value % 60);
	//min = Math.floor(value / 60);
	min = ~~(Math.floor(value) / 60);
	sec = Math.floor(value) % 60;

	//console.log('changeText: ' + value + ' _ ' + min + ':' + sec);

	// Text formating
	if (min > 10) {
		text = min + ':' + ('0' + sec).slice(-2);
	} else if (min >= 0 && sec >= 0) {
		text = ('0' + min).slice(-2) + ':' + ('0' + sec).slice(-2);
	} else if (min > -10) {
		text = '-' + ('0' + Math.abs(min)).slice(-2) + ':' + ('0' + Math.abs(sec)).slice(-2);
	} else {
		text = min + ':' + ('0' + Math.abs(sec)).slice(-1);
	}

	// State machine for dinging
	if (sec == 0 && min == 6) {
		if (!dinging) {
			dinging = true;
			playDing(6);
		}
	} else if (sec == 0 && min == 1) {
		if (!dinging) {
			dinging = true;
			playDing(1);
		}
	} else if (sec == 0 && min == 0) {
		if (!dinging) {
			dinging = true;
			playDing(0);
		}
	} else {
		dinging = false;
	}

	$('#chrono').children().text(text);	
}

function getTimeOnInput() {
	var min = $('#minutesInput').val();
	var sec = $('#secondsInput').val();

	return (min * 60 + sec * 1);
}

function getTimeOnScreen() {
	var text = $('#chrono').text().split(':');
	var min = text[0];
	var sec = text[1];


	if (min[0] == '-') {
		//console.log('getTimeOnScreen: ' + min + ':' + sec + '= ' + (min * 60 - sec * 1));
		return (min * 60 - sec * 1);
	} else {
		//console.log('getTimeOnScreen: ' + min + ':' + sec + '= ' + (min * 60 + sec * 1));
		return (min * 60 + sec * 1);
	}	
}

function playDing(num) {
	if (dings[num]) {
		if (num != 0) {
			$('#dingx1').trigger('play');
		} else {
			$('#dingx2').trigger('play');
		}
	}
}

function formatValue(value) {
	var min = ~~(value / 60);
	var sec = ~~(value % 60);
	min = ~~(Math.floor(value) / 60);
	sec = Math.floor(value) % 60;
	var text = "";

	// Text formating
	if (min > 10) {
		text = min + ':' + ('0' + sec).slice(-2);
	} else if (min >= 0 && sec >= 0) {
		text = ('0' + min).slice(-2) + ':' + ('0' + sec).slice(-2);
	} else if (min > -10) {
		text = '-' + ('0' + Math.abs(min)).slice(-2) + ':' + ('0' + Math.abs(sec)).slice(-2);
	} else {
		text = min + ':' + ('0' + Math.abs(sec)).slice(-1);
	}

	return text;
}