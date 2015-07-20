var channel_max = 32;
var audiochannels = new Array();

for (a = 0; a < channel_max; a++) {
	audiochannels[a] = new Array();
	audiochannels[a]['channel'] = new Audio();
	audiochannels[a]['finished'] = -1;
}
function play_multi_sound(s) {
	for (a = 0; a < audiochannels.length; a++) {
		thistime = new Date();
		if (audiochannels[a]['finished'] < thistime.getTime()) {
			//audiochannels[a]['finished'] = thistime.getTime() + document.getElementById(s).duration * 1000;
			audiochannels[a]['finished'] = thistime.getTime() + 2000;
			audiochannels[a]['channel'].src = document.getElementById(s).firstChild.src;
			audiochannels[a]['channel'].load();
			audiochannels[a]['channel'].play();
			break;
		}
	}
}

var Sounds = {
	explosion: function () {
		play_multi_sound("explosion");
	},

	popp: function () {
		play_multi_sound("popp");
	}
}
