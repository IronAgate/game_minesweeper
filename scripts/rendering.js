
class RenderController {
	
	constructor(divId, width,depth) {
		this.div = document.getElementById(divId);
		
		if (this.div === null) {
			throw new Error("| RenderController failed to locate '" + divId + "' div.");
		}
		
		this.width = width;
		this.depth = depth;
		
		this.artist = new DisplayCanvasHandler(width,depth);
		this.scale = 1;
		
		
		//essential css rules
		//disable scroll-to-refresh / needs both for diff browsers
		document.documentElement.style.overscrollBehavior = "none";
		document.body.style.overscrollBehavior = "none";
		//disable double-tap-zoom
		this.div.style.touchAction = "manipulation";
		
		this.div.style.aspectRatio = width/depth;
		
		
		
	}
	start(funcCall) {
		//create start button
		const btn = document.createElement("button");
		btn.textContent = "start";
		btn.id = "startButton";
		btn.style.width = "100%";
		btn.style.height = "100%";
		const rc = this;
		btn.onclick = 
			function() {
				rc.artist.addSelf(rc.div);
				this.remove();
				
				funcCall();
			}
		this.div.appendChild(btn);
	}
}

class InputHandler {
	
}

class CanvasHandler { //abstract
	constructor(canvas, width, depth) {
		this.canvas = canvas;
		this.canvas.width = width;
		this.canvas.height = depth;
		
		this.context = this.canvas.getContext("2d");
		//for pixel art
		this.context.imageSmoothingEnabled = false;
		this.context.webkitImageSmoothingEnabled = false;
		this.context.mozImageSmoothingEnabled = false;
	}
	setColor(color_hexadecimal) {
		this.context.fillStyle = color_hexadecimal;
	}
	clear() {
		this.context.fillRect(0,0, this.canvas.width,this.canvas.height);
	}
}
class DisplayCanvasHandler extends CanvasHandler { //abstract
	constructor(width, depth) {
		super(
			document.createElement("canvas"),
			width,
			depth
		);
		
		this.canvas.style.width = "100%";
		this.canvas.style.height = "100%";
		//this.canvas.style.backgroundColor = "#900";
		
	}
	addSelf(element) {
		element.appendChild(this.canvas);
	}
}
class OffscreenCanvasHandler extends CanvasHandler {
	constructor(width, depth) {
		super(
			new OffScreenCanvas(width, depth),
			width, //necessary?
			depth
		);
	}
}
