
class RenderController {
	
	constructor(divId, width,depth, startup) {
		
		this.div = document.getElementById(divId);
		
		//essential css rules
		//disable scroll-to-refresh / needs both for diff browsers
		document.documentElement.style.overscrollBehavior = "none";
		document.body.style.overscrollBehavior = "none";
		//disable double-tap-zoom
		this.div.style.touchAction = "manipulation";
		
		this.div.style.aspectRatio = width/depth;
		
		
		if (this.div === null) {
			throw new Error("| RenderController failed to locate '" + divId + "' div.");
		}
		
		this.eisel = new DisplayEisel(width,depth);
		
		this.input = new InputHandler(this.eisel);
		/*
		//create the 'start' button at beginning
		const btn = document.createElement("button");
		btn.textContent = "start";
		btn.id = "startButton";
		btn.style.width = "100%";
		btn.style.height = "100%";
		const rc = this;
		btn.onclick = 
			function() {
				rc.eisel.appendSelf(rc.div);
				this.remove();
				
				startup(rc);
			}
		this.div.appendChild(btn);
		*/
		this.div.appendChild(this.eisel.getCanvas())
		startup(this);
	}
	newFrame() {
		return new OffscreenEisel(this.eisel.getWidth(), this.eisel.getHeight());
	}
}
class InputHandler { //PROBLEM: accesses eisel's "private" canvas
	constructor(rootEisel) {
		this.rootEisel = rootEisel;
	}
	translateClientApp(x,y) {
		const c = this.rootEisel.getCanvas();
		const rect = c.getBoundingClientRect();
		[x,y] = [ //translate client to canv
			(x - rect.left) * (c.width / c.offsetWidth)
			, (y- rect.top) * (c.height / c.offsetHeight)
		];
		return this.rootEisel.unscale(x,y);
	}
	
	//subject to change for proper touch events
	recieveDown(object) {
		
		if (this.downCall != null) {
			this.forgetDown();
		}
		
		const i = this;
		this.downCall = function(e) {
			object.onDown(i.translateClientApp(e.clientX,e.clientY));
		}
		this.rootEisel.getCanvas().addEventListener("mousedown", this.downCall);
	}
	recieveUp(object) {
		
		if (this.upCall != null) {
			this.forgetUp();
		}
		
		const i = this;
		this.upCall = function(e) {
			object.onUp(i.translateClientApp(e.clientX,e.clientY));
		}
		this.rootEisel.getCanvas().addEventListener("mouseup", this.upCall);
	}
	forgetDown() {
		this.rootEisel.getCanvas().removeEventListener("mousedown", this.downCall);
		this.downCall = null;
	}
	forgetUp() {
		this.rootEisel.getCanvas().removeEventListener("mouseup", this.upCall);
		this.upCall = null;
	}
	
}
class Eisel { //abstract
	constructor(canvas, scale=1) {
		this._canvas = canvas;
		this._scale = scale;
		
		this._context = this._canvas.getContext("2d");
		//for pixel art
		this._context.imageSmoothingEnabled = false;
		this._context.webkitImageSmoothingEnabled = false;
		this._context.mozImageSmoothingEnabled = false;
	}
	setScale(newScale) {
		this._scale = newScale;
	}
	setScaleFit(width,height) {
		//scale so something of specified height/width will fit within canvas
		[width,height] = this._scaleSize(width,height);
		
		if (Math.abs(width - this._canvas.width) <= Math.abs(height - this._canvas.height)) {
			this._scale = this._canvas.width / width;
		} else {
			this._scale = this._canvas.height / height;
		}
	}
	getWidth() {
		return this._canvas.width;
	}
	getHeight() {
		return this._canvas.height;
	}
	getCanvas() {
		return this._canvas;
	}
	unscale(x,y) {
		return [x/this._scale, y/this._scale];
	}
	_scalePos(x,y) {
		return [
			Math.floor(x * this._scale)
			, Math.floor(y * this._scale)
		];
	}
	_scaleSize(w,h) {
		return [
			Math.ceil(w * this._scale)
			, Math.ceil(h * this._scale)
		];
	}
	
	//basic drawing
	color(colorHex) {
		this._context.fillStyle = colorHex;
	}
	clear() {
		this._context.fillRect(0,0, this._canvas.width,this._canvas.height);
	}
	paintRectangle(x,y, w,h) {
		[x,y] = this._scalePos(x,y);
		[w,h] = this._scaleSize(w,h);
		this._context.fillRect(x,y, w,h);
	}
	
	//images
	paintFromRegion(image, sx,sy, sw,sh, dx,dy, dw,dh) {
		[dx,dy] = this._scalePos(dx,dy);
		[dw, dh] = this._scaleSize(dw,dh);
		this._context.drawImage(
			image
			, sx,sy
			, sw,sh
			, dx,dy
			, dw,dh
		);
	}
	paintSprite(index, sheet, spriteSize, dx,dy, dw=1,dh=1) {
		index *= spriteSize;
		const sx = index % sheet.width;
		const sy = Math.floor(index / sheet.width) * spriteSize;
		this.paintFromRegion(
			sheet
			, sx,sy
			, spriteSize,spriteSize
			, dx,dy
			, dw,dh
		);
	}
	paintImage(image, x,y, w,h) {
		[x,y] = this._scalePos(x,y);
		[w, h] = this._scaleSize(w,h);
		this._context.drawImage(
			image
			, x,y
			, w,h
		);
	}
	
	//text
	font(size, style="monospace") {
		this._context.font = String(size) + "px " + style;
	}
	write(text, x,y, w) {
		[x,y] = this._scalePos(x,y);
		let _;
		[w,_] = this._scaleSize(w);
		this._context.fillText(
			text
			, x,y
			, w
		);
	}
	
	//inter-eisel
	display(originEisel) {
		this.paintImage(
			originEisel.getCanvas()
			, 0,0
			, this._canvas.width, this._canvas.height
		);
	}
	
}
class DisplayEisel extends Eisel {
	constructor(width,height, scale=1) {
		super(
			document.createElement("canvas")
			, scale
		);
		
		this._canvas.width = width;
		this._canvas.height = height;
		
		this._canvas.style.width = "100%";
		this._canvas.style.height = "100%";
	}
	appendSelf(element) {
		element.appendChild(this._canvas);
	}
}
class OffscreenEisel extends Eisel {
	constructor(width,height, scale=1) {
		super(
			new OffscreenCanvas(width, height)
			, scale
		);
		
	}
}