
class RenderController {
	
	constructor(divId, width,depth) {
		this.div = document.getElementById(divId);
		
		if (this.div === null) {
			throw new Error("| RenderController failed to locate '" + divId + "' div.");
		}
		
		this.width = width;
		this.depth = depth;
		
		this.eisel = new DisplayEisel(width,depth);
		this.scale = 1;
		
		
		
		//essential css rules
		//disable scroll-to-refresh / needs both for diff browsers
		document.documentElement.style.overscrollBehavior = "none";
		document.body.style.overscrollBehavior = "none";
		//disable double-tap-zoom
		this.div.style.touchAction = "manipulation";
		
		this.div.style.aspectRatio = width/depth;
		
		
		
	}
	ignite(funcCall) {
		//todo: initiate inputHandler here and use that instead
		this.input = new InputHandler(this.eisel);
		//create start button
		const btn = document.createElement("button");
		btn.textContent = "start";
		btn.id = "startButton";
		btn.style.width = "100%";
		btn.style.height = "100%";
		const rc = this;
		btn.onclick = 
			function() {
				rc.eisel.addSelf(rc.div);
				this.remove();
				
				funcCall(rc);
			}
		this.div.appendChild(btn);
	}
	createFullEisel() {
		return new OffscreenEisel(this.width,this.depth);
	}
}

class InputHandler {
	constructor(rootEisel) {
		this.rootEisel = rootEisel;
	}
	translateClientApp(x,y) {
		const rect = this.rootEisel.canvas.getBoundingClientRect();
		[x,y] = [ //translate client to canv
			(x - rect.left) * (this.rootEisel.canvas.width / this.rootEisel.canvas.offsetWidth)
			, (y- rect.top) * (this.rootEisel.canvas.height / this.rootEisel.canvas.offsetHeight)
		];
		return this.rootEisel.translateCanvasApp(x,y);
	}
	
	//subject to change for proper touch events
	recieveDown(object) {
		const i = this;
		this.downCall = function(e) {
			object.onDown(i.translateClientApp(e.clientX,e.clientY));
		}
		this.rootEisel.canvas.addEventListener("mousedown", this.downCall);
	}
	recieveUp(object) {
		const i = this;
		this.upCall = function(e) {
			object.onUp(i.translateClientApp(e.clientX,e.clientY));
		}
		this.rootEisel.canvas.addEventListener("mouseup", this.upCall);
	}
	forgetDown() {
		this.rootEisel.canvas.removeEventListener("mousedown", this.downCall);
		this.downCall = null;
	}
	forgetUp() {
		this.rootEisel.canvas.removeEventListener("mouseup", this.upCall);
		this.upCall = null;
	}
	
}

class Eisel { //abstract canvas handler
	constructor(canvas) {
		this.canvas = canvas;
		this.scale = 1;
		
		this.context = this.canvas.getContext("2d");
		//for pixel art
		this.context.imageSmoothingEnabled = false;
		this.context.webkitImageSmoothingEnabled = false;
		this.context.mozImageSmoothingEnabled = false;
	}
	setScale(newScale) {
		this.scale = newScale;
	}
	scaleFit(x,y) {
		if (Math.abs(x - this.canvas.width) >= Math.abs(y - this.canvas.height)) {
			this.scale = this.canvas.width / x;
		} else {
			this.scale = this.canvas.height / y;
		}
	}
	getWidth() {
		return this.canvas.width;
	}
	getDepth() {
		return this.canvas.height;
	}
	translateAppCanvas(x,y) {
		return [Math.floor(x * this.scale), Math.floor(y * this.scale)]
	}
	translateCanvasApp(x,y) {
		return [x / this.scale, y / this.scale]
	}
	setColor(color_hexadecimal) {
		this.context.fillStyle = color_hexadecimal;
	}
	clear() {
		this.context.fillRect(0,0, this.canvas.width,this.canvas.height);
	}
	paintRectangle(x,y, width,depth) {
		[x,y] = this.translateAppCanvas(x,y);
		[width,depth] = this.translateAppCanvas(width,depth);
		this.context.fillRect(x,y, width,depth);
	}
	//images
	paintFromRegion(image, sx,sy, swidth,sheight, dx,dy, dwidth,dheight) {
		[dx,dy] = this.translateAppCanvas(dx,dy);
		//[dwidth,dheight] = this.translateAppCanvas(dwidth,dheight);
		dwidth = Math.ceil(dwidth * this.scale);
		dheight = Math.ceil(dheight * this.scale);
		this.context.drawImage(
			image,
			sx,sy,
			swidth,sheight,
			dx,dy,
			dwidth,dheight
		);			
	}
	paintSprite(index, sheet, spriteSize, dx,dy, dwidth = 1,dheight = 1) {
		index *= spriteSize;
		const sx = index % sheet.width
		const sy = Math.floor(index / sheet.width) * spriteSize;
		this.paintFromRegion(
			sheet,
			sx,sy,
			spriteSize,spriteSize,
			dx,dy,
			dwidth,dheight
		);
	}
	paintImage(image, x,y, width,height) {
		[x,y] = this.translateAppCanvas(x,y);
		//[width,height] = this.translateAppCanvas(width,height);
		width = Math.ceil(width * this.scale);
		height = Math.ceil(height * this.scale);
		this.context.drawImage(
			image,
			x,y,
			width,height
		);
	};
	
	//text
	setFont(size, style="monospace") {
		this.context.font = String(size) + "px " + style;
	}
	write(text, x,y, width) {
		[x,y] = this.translateAppCanvas(x,y);
		let _; //todo: so dont need this workaround
		[width,_] = this.translateAppCanvas(width,0); //todo
		this.context.fillText(
			text,
			x,y,
			width
		);
	}
	
	//inter-eisel
	present(destinationEisel, x,y, width,depth) {
		destinationEisel.paintImage(
			this.canvas,
			x,y,
			width,depth
		);
	}
	presentFill(destinationEisel) {
		destinationEisel.context.drawImage(
			this.canvas,
			0,0,
			destinationEisel.canvas.width,
				destinationEisel.canvas.height
		);
	}
}
class DisplayEisel extends Eisel { //abstract
	constructor(width, depth) {
		super(
			document.createElement("canvas")
		);
		
		this.canvas.width = width;
		this.canvas.height = depth;
		
		this.canvas.style.width = "100%";
		this.canvas.style.height = "100%";
		
	}
	addSelf(element) {
		element.appendChild(this.canvas);
	}
}
class OffscreenEisel extends Eisel {
	constructor(width, depth) {
		super(
			new OffscreenCanvas(width, depth)
		);
	}
}
