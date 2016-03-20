/*
	Author: Simon Laroche
	Site: http://simon.lc/
	Demo: http://simon.lc/tetr.js
	
	Remake author: Lesiuk Stanislav
	Site: http://ststudio.xyz
	
	Note: Before looking at this code, it would be wise to do a bit of reading about
	the game so you know why some things are done a certain way.
*/
'use strict';

/**
	* Playfield.
*/
var cellSize;
var column;

/**
	* Get html elements. 
*/
var msg = document.getElementById('msg');
var stats = document.getElementById('stats');
//var stats2 = document.getElementById('stats2');
//var statsTime = document.getElementById('time');
var statsLines = document.getElementById('line');
var statsLevel = document.getElementById('level');
//var statsPiece = document.getElementById('piece');
var statsScore = document.getElementById('score');
var h3 = document.getElementsByTagName('h3');
var set = document.getElementById('settings');

// Get canvases and contexts
var holdCanvas = document.getElementById('hold');
var bgStackCanvas = document.getElementById('bgStack');
var stackCanvas = document.getElementById('stack');
var activeCanvas = document.getElementById('active');
var previewCanvas = document.getElementById('preview');
var spriteCanvas = document.getElementById('sprite');

var holdCtx = holdCanvas.getContext('2d');
var bgStackCtx = bgStackCanvas.getContext('2d');
var stackCtx = stackCanvas.getContext('2d');
var activeCtx = activeCanvas.getContext('2d');
var previewCtx = previewCanvas.getContext('2d');
var spriteCtx = spriteCanvas.getContext('2d');

/**
	* Piece data
*/

// NOTE y values are inverted since our matrix counts from top to bottom.
var kickData = [
	[[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
	[[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
	[[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
	[[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]]
];
var kickDataI = [
	[[0, 0], [-1, 0], [2, 0], [-1, 0], [2, 0]],
	[[-1, 0], [0, 0], [0, 0], [0, -1], [0, 2]],
	[[-1, -1], [1, -1], [-2, -1], [1, 0], [-2, 0]],
	[[0, -1], [0, -1], [0, -1], [0, 1], [0, -2]]
];
// TODO get rid of this lol.
var kickDataO = [
	[[0, 0]],
	[[0, 0]],
	[[0, 0]],
	[[0, 0]]
];

// Define shapes and spawns.
var PieceI = {
	index: 0,
	x: 2,
	y: -1,
	kickData: kickDataI,
	tetro: [
		[0, 0, 0, 0, 0],
		[0, 0, 1, 0, 0],
		[0, 0, 1, 0, 0],
		[0, 0, 1, 0, 0],
	[0, 0, 1, 0, 0]]
};
var PieceJ = {
	index: 1,
	x: 3,
	y: 0,
	kickData: kickData,
	tetro: [
		[2, 2, 0],
		[0, 2, 0],
	[0, 2, 0]]
};
var PieceL = {
	index: 2,
	x: 3,
	y: 0,
	kickData: kickData,
	tetro: [
		[0, 3, 0],
		[0, 3, 0],
	[3, 3, 0]]
};
var PieceO = {
	index: 3,
	x: 4,
	y: 0,
	kickData: kickDataO,
	tetro: [
		[4, 4],
	[4, 4]]
};
var PieceS = {
	index: 4,
	x: 3,
	y: 0,
	kickData: kickData,
	tetro: [
		[0, 5, 0],
		[5, 5, 0],
	[5, 0, 0]]
};
var PieceT = {
	index: 5,
	x: 3,
	y: 0,
	kickData: kickData,
	tetro: [
		[0, 6, 0],
		[6, 6, 0],
	[0, 6, 0]]
};
var PieceZ = {
	index: 6,
	x: 3,
	y: 0,
	kickData: kickData,
	tetro: [
		[7, 0, 0],
		[7, 7, 0],
	[0, 7, 0]]
};
var pieces = [PieceI, PieceJ, PieceL, PieceO, PieceS, PieceT, PieceZ];
var piecesValues = [1, 2, 3, 4, 5, 6, 7];

// Finesse data
// index x orientatio x column = finesse
// finesse[0][0][4] = 1
// TODO double check these.
var finesse = [
	[
		[1, 2, 1, 0, 1, 2, 1],
		[2, 2, 2, 2, 1, 1, 2, 2, 2, 2],
		[1, 2, 1, 0, 1, 2, 1],
		[2, 2, 2, 2, 1, 1, 2, 2, 2, 2]
	],
	[
		[1, 2, 1, 0, 1, 2, 2, 1],
		[2, 2, 3, 2, 1, 2, 3, 3, 2],
		[2, 3, 2, 1, 2, 3, 3, 2],
		[2, 3, 2, 1, 2, 3, 3, 2, 2]
	],
	[
		[1, 2, 1, 0, 1, 2, 2, 1],
		[2, 2, 3, 2, 1, 2, 3, 3, 2],
		[2, 3, 2, 1, 2, 3, 3, 2],
		[2, 3, 2, 1, 2, 3, 3, 2, 2]
	],
	[
		[1, 2, 2, 1, 0, 1, 2, 2, 1],
		[1, 2, 2, 1, 0, 1, 2, 2, 1],
		[1, 2, 2, 1, 0, 1, 2, 2, 1],
		[1, 2, 2, 1, 0, 1, 2, 2, 1]
	],
	[
		[1, 2, 1, 0, 1, 2, 2, 1],
		[2, 2, 2, 1, 1, 2, 3, 2, 2],
		[1, 2, 1, 0, 1, 2, 2, 1],
		[2, 2, 2, 1, 1, 2, 3, 2, 2]
	],
	[
		[1, 2, 1, 0, 1, 2, 2, 1],
		[2, 2, 3, 2, 1, 2, 3, 3, 2],
		[2, 3, 2, 1, 2, 3, 3, 2],
		[2, 3, 2, 1, 2, 3, 3, 2, 2]
	],
	[
		[1, 2, 1, 0, 1, 2, 2, 1],
		[2, 2, 2, 1, 1, 2, 3, 2, 2],
		[1, 2, 1, 0, 1, 2, 2, 1],
		[2, 2, 2, 1, 1, 2, 3, 2, 2]
	]
];

/**
	* Gameplay specific vars.
*/
var blockSpeed = 2000;
var gravityUnit = 0.00390625;
var gravity;
var gravityArr = (function() {
	var array = [];
	array.push(0);
	for (var i = 1; i < 64; i++)
    array.push(i / 64);
	for (var i = 1; i <= 20; i++)
    array.push(i);
	return array;
})();

var settings = {
	DAS: 10,
	ARR: 1,
	Gravity: 0,
	'Soft Drop': 31,
	'Lock Delay': 30,
	Size: 0,
	Sound: 0,
	Volume: 100,
	Block: 5,
	Ghost: 0,
	Grid: 0,
	Outline: 0
};

var setting = {
	DAS: range(0,31),
	ARR: range(0,11),
	Gravity: (function() {
		var array = [];
		array.push('Auto');
		array.push('0G');
		for (var i = 1; i < 64; i++)
		array.push(i + '/64G');
		for (var i = 1; i <= 20; i++)
		array.push(i + 'G');
		return array;
	})(),
	'Soft Drop': (function() {
		var array = [];
		for (var i = 1; i < 64; i++)
		array.push(i + '/64G');
		for (var i = 1; i <= 20; i++)
		array.push(i + 'G');
		return array;
	})(),
	'Lock Delay': range(0,101),
	Size: ['Auto', 'Small', 'Medium', 'Large'],
	Sound: ['Off', 'On'],
	Volume: range(0, 101),
	Block: ['Shaded', 'Solid', 'Glossy', 'Arika', 'World'],
	Ghost: ['Normal', 'Colored', 'Off'],
	Grid: ['Off', 'On'],
	Outline: ['Off', 'On']
};

var frame;

/**
	*Pausing variables
*/

var startPauseTime;
var pauseTime;

/**
	* 0 = Normal
	* 1 = win
	* 2 = countdown
	* 3 = game not played
	* 9 = loss
*/
var gameState = 3;

var paused = false;
var lineLimit;

var replayKeys;
var watchingReplay = false;
var toGreyRow;
var gametype;
//TODO Make dirty flags for each canvas, draw them all at once during frame call.
// var dirtyHold, dirtyActive, dirtyStack, dirtyPreview;
var lastX, lastY, lastPos, landed;

// Stats
var lines;
var linesPerLevel;
var level;
var username;
var score;
var statsFinesse;
var piecesSet;
var startTime;
var digLines;

// Keys
var keysDown;
var lastKeys;
var released;

var binds = {
	pause: 27,
	moveLeft: 37,
	moveRight: 39,
	moveDown: 40,
	hardDrop: 32,
	holdPiece: 67,
	rotRight: 88,
	rotLeft: 90,
	rot180: 16,
	retry: 82
};
var flags = {
	hardDrop: 1,
	moveRight: 2,
	moveLeft: 4,
	moveDown: 8,
	holdPiece: 16,
	rotRight: 32,
	rotLeft: 64,
	rot180: 128,
};
var spriteImages = ["img/can.png", "img/cangreen.png", "img/canred.png", "img/cangreen.png"];
var pattern = [];
var imgObj = [];
for(var i = 0; i< spriteImages.length; i++){
	imgObj[i] = new Image();
	imgObj[i].src = spriteImages[i];
}


function resize() {
	var a = document.getElementById('a');
	var b = document.getElementById('b');
	var c = document.getElementById('c');
	var c1 = document.getElementById('c1');
	var c2 = document.getElementById('c2');
	var aWithC = document.getElementById('a-with-c');
	var content = document.getElementById('content');
	
	// TODO Finalize this.
	// Aspect ratio: 1.024
	var screenHeight = window.innerHeight - 34;
	var screenWidth = ~~(screenHeight * 1.024);
	if (screenWidth > window.innerWidth)
    screenHeight = ~~(window.innerWidth / 1.024);
	
	if (settings.Size === 1 && screenHeight > 602) cellSize = 15;
	else if (settings.Size === 2 && screenHeight > 602) cellSize = 30;
	else if (settings.Size === 3 && screenHeight > 902) cellSize = 45;
	//STAS CHANGED, INITIALLY WAS (screenHeight / 20)
	else cellSize = Math.max(~~(screenHeight / 22), 10);
	
	cellSize = 45;
	console.log("cell Size is: " + cellSize);
	
	var pad = (window.innerHeight - (cellSize * 20 + 2)) / 4 + 'px';
	content.style.padding = pad + ' 0';
	stats.style.bottom = pad;
	
	// Size elements
	//NOW MADE BY CSS
	//a.style.padding = '0 0.5rem ' + ~~(cellSize / 2) + 'px';
	
	stackCanvas.width = activeCanvas.width = bgStackCanvas.width = cellSize * 10;
	stackCanvas.height = activeCanvas.height = bgStackCanvas.height = cellSize * 20;
	b.style.width = stackCanvas.width + 'px';
	//aWithC.style.width = stackCanvas.width*0.5 + 'px';
	d.style.width = stackCanvas.width*0.5 + 'px';
	
	
	b.style.height = stackCanvas.height + 'px';
	stats.style.height = (stackCanvas.height*0.6 -10)+"px";
	//stats2.style.height = stackCanvas.height*0.2+"px";
	document.getElementsByClassName("arrow-container")[0].style.height = (stackCanvas.height*0.2 - 10) +"px";
	var cHeight = stackCanvas.height*0.78;
	c.style.height = cHeight + "px";
	
	c1.style.height = (cHeight*0.35) +"px";
	c2.style.height = (cHeight*0.65 - 10)+"px";
	
	a.style.height = stackCanvas.height*0.22 - 10 +"px";
	
	holdCanvas.width = cellSize * 4;
	holdCanvas.height = cellSize * 2;
	//NOW MADE BY CSS
	//a.style.width = holdCanvas.width + 'px';
	//a.style.height = holdCanvas.height + 'px';
	
	previewCanvas.width = cellSize * 4;
	previewCanvas.height = stackCanvas.height;
	
	//NOW MADE BY CSS
	//c.style.height = (parseInt(b.style.height) * 0.8)+"px";
	
	// Scale the text so it fits in the thing.
	// TODO get rid of extra font sizes here.
	msg.style.lineHeight = b.style.height;
	msg.style.fontSize = ~~(stackCanvas.width / 6) + 'px';
	stats.style.fontSize = ~~(stackCanvas.width / 11) + 'px';
	document.documentElement.style.fontSize = ~~(stackCanvas.width / 16) + 'px';
	
	stats.style.width = a.style.width;
	for (var i = 0, len = h3.length; i < len; i++) {
		h3[i].style.lineHeight = parseFloat(a.style.height)*0.55 + "px";
		h3[i].style.fontSize = stats.style.fontSize;
	}
	
	var fReady = false;
	var sReady = false;
	function checkAllImagesReady(){
		console.log("ready: " + fReady + sReady);
		if(fReady && sReady)
			makeSprite();
	}
	// Redraw graphics
	
	imgObj[0].onload = function(){
		fReady = true;
		pattern[0] = spriteCtx.createPattern(this, "repeat");
		console.log("loaded 0");
		checkAllImagesReady();
	}
	imgObj[1].onload = function(){
		sReady = true;
		pattern[1] = spriteCtx.createPattern(this, "repeat");
		console.log("loaded 1");
		checkAllImagesReady();
	}
	
	if (settings.Grid === 1)
    bg(bgStackCtx);
	
	if (gameState === 0) {
		piece.drawGhost();
		piece.draw();
		stack.draw();
		preview.draw();
		if (hold.piece) {
			hold.draw();
		}
	}
}
addEventListener('resize', resize, false);

/**
	* ========================== Model ===========================================
*/

/**
	* Resets all the settings and starts the game.
*/
function init(gt) {
	username = document.getElementById("username").value;
	if(username == "" || username == undefined)
	{
		alert("Please insert your name");
		return;
	}
	showSidePanels();
	if (gt === 'replay') {
		watchingReplay = true;
		} else {
		watchingReplay = false;
		replayKeys = {};
		// TODO Make new seed and rng method.
		replayKeys.seed = ~~(Math.random() * 2147483645) + 1;
		gametype = gt;
	}
	
	lineLimit = 45;
	
	//Reset
	column = 0;
	keysDown = 0;
	lastKeys = 0;
	released = 255;
	//TODO Check if needed.
	piece.shiftDir = 0;
	piece.shiftReleased = true;
	
	startPauseTime = 0;
	pauseTime = 0;
	paused = false;
	
	rng.seed = replayKeys.seed;
	toGreyRow = 21;
	frame = 0;
	lastPos = 'reset';
	stack.new(10, 22);
	hold.piece = void 0;
	if (settings.Gravity === 0) gravity = gravityUnit * 4;
	startTime = Date.now();
	
	preview.init()
	preview.draw();
	
	statsFinesse = 0;
	lines = 0;
	level = 0;
	score = 0;
	linesPerLevel = lineLimit/15;
	piecesSet = 0;
	
	statsLines.innerHTML = lineLimit - lines;
	//statsPiece.innerHTML = piecesSet;
	//console.log('initial set, should be 1 time only');
	level = parseInt(lines/linesPerLevel + 1);
	statsLevel.innerHTML = level;
	
	statistics();
	clear(stackCtx);
	clear(activeCtx);
	clear(holdCtx);
	
	
	menu();
	
	// Only start a loop if one is not running already.
	if (gameState === 3) {
		gameState = 2;
		gameLoop();
		} else {
		gameState = 2;
	}
}

function range(start, end, inc) {
	inc = inc || 1;
	var array = [];
	for (var i = start; i < end; i += inc) {
		array.push(i);
	}
	return array;
}

/**
	* Add divisor method so we can do clock arithmetics. This is later used to
	*  determine tetromino orientation.
*/
Number.prototype.mod = function(n) {
	return ((this % n) + n) % n;
};

/**
	* Shim.
*/
window.requestAnimFrame = (function () {
	/*return window.requestAnimationFrame       ||
		window.mozRequestAnimationFrame    ||
		window.webkitRequestAnimationFrame ||
		function (callback) {
		window.setTimeout(callback, 1000 / 60);
		};
	*/
	return function (callback) {
		window.setTimeout(callback, blockSpeed / 60);
	};
})();

function pause() {
	if (gameState === 0) {
		paused = true;
		startPauseTime = Date.now();
		msg.innerHTML = "Paused";
		menu(4);    
	}
}

function unpause() {
	paused = false;
	pauseTime += (Date.now() - startPauseTime);
	msg.innerHTML = '';
	menu();
}

/**
	* Park Miller "Minimal Standard" PRNG.
*/
//TODO put random seed method in here.
var rng = new (function() {
	this.seed = 1;
	this.next = function() {
		// Returns a float between 0.0, and 1.0
		return (this.gen() / 2147483647);
	}
	this.gen = function() {
		return this.seed = (this.seed * 16807) % 2147483647;
	}
})();

/**
	* Draws the stats next to the tetrion.
*/
function statistics() {
	/*var time = Date.now() - startTime - pauseTime;
	var seconds = (time / 1000 % 60).toFixed(2);
	var minutes = ~~(time / 60000);
	statsTime.innerHTML = (minutes < 10 ? '0' : '') + minutes +
	(seconds < 10 ? ':0' : ':') + seconds;*/
}

// ========================== View ============================================

/**
	* Draws grid in background.
*/
function bg(ctx) {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.fillStyle = '#1c1c1c';
	for (var x = -1; x < ctx.canvas.width + 1; x += cellSize) {
		ctx.fillRect(x, 0, 2, ctx.canvas.height);
	}
	for (var y = -1; y < ctx.canvas.height + 1; y += cellSize) {
		ctx.fillRect(0, y, ctx.canvas.width, 2);
	}
}

/**
	* Draws a pre-rendered mino.
*/
function drawCell(x, y, color, ctx) {
	x = x * cellSize;
	x = ~~x;
	y = ~~y * cellSize - 2 * cellSize;
	ctx.drawImage(spriteCanvas, color * cellSize, 0, cellSize, cellSize, x, y, cellSize, cellSize);
}

/**
	* Pre-renders all mino types in all colors.
*/
function makeSprite() {
	console.log("making sprite");
	var shaded = [
		// 0         +10        -10        -20
		['#c1c1c1', '#dddddd', '#a6a6a6', '#8b8b8b'],
		['#25bb9b', '#4cd7b6', '#009f81', '#008568'],
		['#3397d9', '#57b1f6', '#007dbd', '#0064a2'],
		['#e67e23', '#ff993f', '#c86400', '#a94b00'],
		['#efc30f', '#ffdf3a', '#d1a800', '#b38e00'],
		['#9ccd38', '#b9e955', '#81b214', '#659700'],
		['#9c5ab8', '#b873d4', '#81409d', '#672782'],
		['#e64b3c', '#ff6853', '#c62c25', '#a70010'],
		['#898989', '#a3a3a3', '#6f6f6f', '#575757']
	];
	var glossy = [
		//25         37         52         -21        -45
		['#ffffff', '#ffffff', '#ffffff', '#888888', '#4d4d4d'],
		['#7bffdf', '#9fffff', '#ccffff', '#008165', '#00442e'],
		['#6cdcff', '#93feff', '#c2ffff', '#00629f', '#002c60'],
		['#ffc166', '#ffe386', '#ffffb0', '#aa4800', '#650500'],
		['#ffff6a', '#ffff8c', '#ffffb8', '#b68a00', '#714f00'],
		['#efff81', '#ffffa2', '#ffffcd', '#6b9200', '#2c5600'],
		['#dc9dfe', '#ffbeff', '#ffe9ff', '#5d287e', '#210043'],
		['#ff9277', '#ffb497', '#ffe0bf', '#a7000a', '#600000'],
		['#cbcbcb', '#ededed', '#ffffff', '#545454', '#1f1f1f']
	];
	var tgm = [
		['#7b7b7b', '#303030', '#6b6b6b', '#363636'],
		['#f08000', '#a00000', '#e86008', '#b00000'],
		['#00a8f8', '#0000b0', '#0090e8', '#0020c0'],
		['#f8a800', '#b84000', '#e89800', '#c85800'],
		['#e8e000', '#886800', '#d8c800', '#907800'],
		['#f828f8', '#780078', '#e020e0', '#880088'],
		['#00e8f0', '#0070a0', '#00d0e0', '#0080a8'],
		['#78f800', '#007800', '#58e000', '#008800'],
		['#7b7b7b', '#303030', '#6b6b6b', '#363636'],
	];
	var world = [];
	world[0] = tgm[0];
	world[1] = tgm[6];
	world[2] = tgm[2];
	world[3] = tgm[3];
	world[4] = tgm[4];
	world[5] = tgm[7];
	world[6] = tgm[5];
	world[7] = tgm[1];
	world[8] = tgm[8];
	
	spriteCanvas.width = cellSize * 9;
	spriteCanvas.height = cellSize;
	for (var i = 0; i < 9; i++) {
		var x = i * cellSize;
		if (settings.Block === 0) {
			// Shaded
			spriteCtx.fillStyle = shaded[i][1];
			spriteCtx.fillRect(x, 0, cellSize, cellSize);
			
			spriteCtx.fillStyle = shaded[i][3];
			spriteCtx.fillRect(x, cellSize / 2, cellSize, cellSize / 2);
			
			spriteCtx.fillStyle = shaded[i][0];
			spriteCtx.beginPath();
			spriteCtx.moveTo(x, 0);
			spriteCtx.lineTo(x + cellSize / 2, cellSize / 2);
			spriteCtx.lineTo(x, cellSize);
			spriteCtx.fill();
			
			spriteCtx.fillStyle = shaded[i][2];
			spriteCtx.beginPath();
			spriteCtx.moveTo(x + cellSize, 0);
			spriteCtx.lineTo(x + cellSize / 2, cellSize / 2);
			spriteCtx.lineTo(x + cellSize, cellSize);
			spriteCtx.fill();
		}
		else if (settings.Block === 1) {
			// Flat
			spriteCtx.fillStyle = shaded[i][0];
			spriteCtx.fillRect(x, 0, cellSize, cellSize);
		}
		else if (settings.Block === 2) {
			// Glossy
			var k = Math.max(~~(cellSize * 0.083), 1);
			
			var grad = spriteCtx.createLinearGradient(x, 0, x + cellSize, cellSize);
			grad.addColorStop(0.5, glossy[i][3]);
			grad.addColorStop(1, glossy[i][4]);
			spriteCtx.fillStyle = grad;
			spriteCtx.fillRect(x, 0, cellSize, cellSize);
			
			var grad = spriteCtx.createLinearGradient(x, 0, x + cellSize, cellSize);
			grad.addColorStop(0, glossy[i][2]);
			grad.addColorStop(0.5, glossy[i][1]);
			spriteCtx.fillStyle = grad;
			spriteCtx.fillRect(x, 0, cellSize - k, cellSize - k);
			
			var grad = spriteCtx.createLinearGradient(x + k, k, x + cellSize - k, cellSize - k);
			grad.addColorStop(0, shaded[i][0]);
			grad.addColorStop(0.5, glossy[i][0]);
			grad.addColorStop(0.5, shaded[i][0]);
			grad.addColorStop(1, glossy[i][0]);
			spriteCtx.fillStyle = grad;
			spriteCtx.fillRect(x + k, k, cellSize - k * 2, cellSize - k * 2);
			
		}
		else if (settings.Block === 3 || settings.Block === 4) {
			// Arika
			if (settings.Block === 4) tgm = world;
			var k = Math.max(~~(cellSize * 0.125), 1);
			
			spriteCtx.fillStyle = tgm[i][1];
			spriteCtx.fillRect(x, 0, cellSize, cellSize);
			spriteCtx.fillStyle = tgm[i][0];
			spriteCtx.fillRect(x, 0, cellSize, ~~(cellSize / 2));
			
			var grad = spriteCtx.createLinearGradient(x, k, x, cellSize - k);
			grad.addColorStop(0, tgm[i][2]);
			grad.addColorStop(1, tgm[i][3]);
			spriteCtx.fillStyle = grad;
			spriteCtx.fillRect(x + k, k, cellSize - k*2, cellSize - k*2);
			
			var grad = spriteCtx.createLinearGradient(x, k, x, cellSize);
			grad.addColorStop(0, tgm[i][0]);
			grad.addColorStop(1, tgm[i][3]);
			spriteCtx.fillStyle = grad;
			spriteCtx.fillRect(x, k, k, cellSize - k);
			
			var grad = spriteCtx.createLinearGradient(x, 0, x, cellSize - k);
			grad.addColorStop(0, tgm[i][2]);
			grad.addColorStop(1, tgm[i][1]);
			spriteCtx.fillStyle = grad;
			spriteCtx.fillRect(x + cellSize - k, 0, k, cellSize - k);
		}
		else if(settings.Block == 5){
			// Images
			//spriteCtx.fillStyle = shaded[i][0];
			//spriteCtx.fillRect(x, 0, cellSize, cellSize);
			
			console.log("filling rect");
			spriteCtx.fillStyle = pattern[i%2];
			spriteCtx.fillRect(x, 0, cellSize, cellSize);
			spriteCtx.fill();
			
		}
	}
}

/**
	* Clear canvas.
*/
function clear(ctx) {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

/**
	* Draws a 2d array of minos.
*/
function draw(tetro, cx, cy, ctx, color) {
	for (var x = 0, len = tetro.length; x < len; x++) {
		for (var y = 0, wid = tetro[x].length; y < wid; y++) {
			if (tetro[x][y]) drawCell(x + cx, y + cy, color !== void 0 ? color : tetro[x][y], ctx);
		}
	}
}

// ========================== Controller ======================================
var iFrequency = 200;
var myInterval = 0;
var loopActive = false;
function addPointsOnKeyDown(){
	score += piecesValues[piece.index];
	statsScore.innerHTML = score;
}
function startLoop() {
	loopActive = true;
	if(myInterval > 0) 
	clearInterval(myInterval);  // stop
	myInterval = setInterval( "addPointsOnKeyDown()", iFrequency );  // run
}
function stopLoop(){
	loopActive = false;
	clearInterval(myInterval);
}

function stop(){
	clearInterval(myInterval);
}
addEventListener('keydown', function(e) {
	// TODO send to menu or game depending on context.
	if ([32,37,38,39,40].indexOf(e.keyCode) !== -1)
    e.preventDefault();
	//TODO if active, prevent default for binded keys
	//if (bindsArr.indexOf(e.keyCode) !== -1)
	//  e.preventDefault();
	if (e.keyCode === binds.pause) {
		if (paused) {
			unpause();
			} else {
			pause();
		}
	}
	if (e.keyCode === binds.retry) {
		init(gametype);
	}
	if (!watchingReplay) {
		if (e.keyCode === binds.moveLeft) {
			keysDown |= flags.moveLeft;
			//piece.finesse++
			} else if (e.keyCode === binds.moveRight) {
			keysDown |= flags.moveRight;
			} else if (e.keyCode === binds.moveDown) {
			startLoop();
			keysDown |= flags.moveDown;
			} else if (e.keyCode === binds.hardDrop) {
			keysDown |= flags.hardDrop;
			} else if (e.keyCode === binds.rotRight) {
			keysDown |= flags.rotRight;
			} else if (e.keyCode === binds.rotLeft) {
			keysDown |= flags.rotLeft;
			} else if (e.keyCode === binds.rot180) {
			keysDown |= flags.rot180;
			} else if (e.keyCode === binds.holdPiece) {
			keysDown |= flags.holdPiece;
		}
	}
}, false);
addEventListener('keyup', function(e) {
	if (!watchingReplay) {
		if (e.keyCode === binds.moveLeft && keysDown & flags.moveLeft) {
			keysDown ^= flags.moveLeft;
			} else if (e.keyCode === binds.moveRight && keysDown & flags.moveRight) {
			keysDown ^= flags.moveRight;
			} else if (e.keyCode === binds.moveDown && keysDown & flags.moveDown) {
			//console.log("down arrow -  key up, stopping score adding");
			stopLoop();
			keysDown ^= flags.moveDown;
			} else if (e.keyCode === binds.hardDrop && keysDown & flags.hardDrop) {
			keysDown ^= flags.hardDrop;
			} else if (e.keyCode === binds.rotRight && keysDown & flags.rotRight) {
			keysDown ^= flags.rotRight;
			} else if (e.keyCode === binds.rotLeft && keysDown & flags.rotLeft) {
			keysDown ^= flags.rotLeft;
			} else if (e.keyCode === binds.rot180 && keysDown & flags.rot180) {
			keysDown ^= flags.rot180;
			} else if (e.keyCode === binds.holdPiece && keysDown & flags.holdPiece) {
			keysDown ^= flags.holdPiece;
		}
	}
}, false);


// ========================== Loop ============================================

//TODO Cleanup gameloop and update.
/**
	* Runs every frame.
*/
function update() {
	//TODO Das preservation broken.
	if (lastKeys !== keysDown && !watchingReplay) {
		replayKeys[frame] = keysDown;
		} else if (frame in replayKeys) {
		keysDown = replayKeys[frame];
	}
	
	if (!(lastKeys & flags.holdPiece) && flags.holdPiece & keysDown) {
		piece.hold();
	}
	
	if (flags.rotLeft & keysDown && !(lastKeys & flags.rotLeft)) {
		piece.rotate(-1);
		piece.finesse++;
		} else if (flags.rotRight & keysDown && !(lastKeys & flags.rotRight)) {
		piece.rotate(1);
		piece.finesse++;
		} else if (flags.rot180 & keysDown && !(lastKeys & flags.rot180)) {
		piece.rotate(1);
		piece.rotate(1);
		piece.finesse++;
	}
	
	piece.checkShift();
	
	if (flags.moveDown & keysDown) {
		piece.shiftDown();
		//piece.finesse++;
	}
	if (!(lastKeys & flags.hardDrop) && flags.hardDrop & keysDown) {
		piece.hardDrop();
	}
	
	piece.update();
	
	// Win
	// TODO
	if (lines >= lineLimit) {
		gameState = 1;
		msg.innerHTML = 'GREAT!';
		hideSidePanels();
		EndGame();
		menu(3);
	}
	
	statistics();
	
	if (lastKeys !== keysDown) {
		lastKeys = keysDown;
	}
}

function gameLoop() {
	requestAnimFrame(gameLoop);
	
	//TODO check to see how pause works in replays.
	frame++;
	
	if (gameState === 0) {
		// Playing
		
		if (!paused) {
			update();
		}
		
		// TODO improve this with 'dirty' flags.
		if (piece.x !== lastX ||
		Math.floor(piece.y) !== lastY ||
		piece.pos !== lastPos ||
		piece.dirty) {
			clear(activeCtx);
			//THIS DRAW GHOST IS BAD drawGhost
			piece.drawGhost();
			piece.draw();
		}
		lastX = piece.x;
		lastY = Math.floor(piece.y);
		lastPos = piece.pos;
		piece.dirty = false;
		} else if (gameState === 2) {
		// Count Down
		if (frame < 50) {
			if (msg.innerHTML !== 'READY') msg.innerHTML = 'READY';
			} else if (frame < 100) {
			if (msg.innerHTML !== 'GO!') msg.innerHTML = 'GO!';
			} else {
			msg.innerHTML = '';
			gameState = 0;
			startTime = Date.now();
			piece.new(preview.next());
		}
		// DAS Preload
		if (lastKeys !== keysDown && !watchingReplay) {
			replayKeys[frame] = keysDown;
			} else if (frame in replayKeys) {
			keysDown = replayKeys[frame];
		}
		if (keysDown & flags.moveLeft) {
			lastKeys = keysDown;
			piece.shiftDelay = settings.DAS;
			piece.shiftReleased = false;
			piece.shiftDir = -1;
			} else if (keysDown & flags.moveRight) {
			lastKeys = keysDown;
			piece.shiftDelay = settings.DAS;
			piece.shiftReleased = false;
			piece.shiftDir = 1;
		}
		} else if (toGreyRow >= 2){
		/**
			* Fade to grey animation played when player loses.
		*/
		if (toGreyRow === 21)
		clear(activeCtx);
		if (frame % 2) {
			for (var x = 0; x < 10; x++) {
				if (stack.grid[x][toGreyRow]) stack.grid[x][toGreyRow] = gameState - 1;
			}
			stack.draw();
			toGreyRow--;
		}
	}
}

function getLeaderboard(){
	$.ajax({
		url:'game.php',
		type:'post',
		data:{
			action:'getBestPlayers'
		},
		success: function(response){
			//console.log("leaderboard: " + response);
			var data = JSON.parse(response);
			var html = "";
			var rank = 0;
			html+="<li class='main-li'>";
			html+="JOUW SCORE";
			html+="</li>";
			$.each(data.results, function(i, item){
				html+="<li>";
				html+="<div class='bell-with-rank'>"+ (i+1)+ "</div>";
				html+="<div class='name'>"+item.name+"</div>";
				html+="<div class='score'>"+item.score+"</div>";
				html+="</li>";
			});
			html+="<li>";
			html+="<a class='button' onclick='menu(0)'>Done</a>";
			html+="</li>";
			//console.log("html made: " + html);
			//console.log($(".row-hall-of-fame"));
			$(".row-hall-of-fame").html(html);
		}
	});
} 
$(document).ready(function(){
	getLeaderboard();
});

function EndGame() {
	console.log("game End");
	if(score != 0){
		console.log('result is '+score);
		$.ajax({
			url:'game.php',
			type:'post',
			data:{
				action:'checkScore',
				score:score
			},
			success: function(response){
				var data = JSON.parse(response);
				console.log(data);
				/*if(data.top10 == true){
					$("#score-hall-of-fame").modal("show");
					}else{
					$("#leaderboard-box").modal("show");
					}
					$(".user-score").text(score);
					$("#label-place").text(data.rank);
					$(".place-number-hall_top").text(data.rank);
				*/
			}
		});
		}else{
		console.log('result is 0');
		//$("#leaderboard-box").modal("show");
		//$(".user-score").text(score);
	}
	
	
}
function sendScore(namev, scorev) {
	$.ajax({ type:"POST", url:"insertScore.php", data:{name:namev, score:scorev} })
	.done(function( data ) {console.log("insert response: " + data);getLeaderboard();}); 
}