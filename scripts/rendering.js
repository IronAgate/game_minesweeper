
class Cave {
	
	constructor(divId, resX, resY, scale=1) {
		
		this.X = resX;
		this.Y = resY;
		this.scale = scale;
		
		//disable scroll-to-refresh / needs both for diff browsers
		document.documentElement.style.overscrollBehavior = "none";
		document.body.style.overscrollBehavior = "none";
		
		const wall = document.getElementById(divId);
		this.wall = wall;
		//style wall
		wall.style.aspectRatio = resX/resY;
		wall.style.position = "relative"; //for layering: https://www.shecodes.io/athena/50922-how-to-make-an-absolute-box-responsive-with-css#:~:text=To%20make%20an%20absolute%20position%20box%20responsive%2C%20you%20should%20use,parent%20container%20and%20adjust%20accordingly.
		wall.style.touchAction = "manipulation"; //disable double-tap to zoom
		
		//doesnt work herewall.style.overscrollBehavior = "none";
		
		function makeCanvas(z) {
			const sh = document.createElement("canvas");
			sh.width = resX;
			sh.height = resY;
			//style
			sh.style.display = "none";
			sh.style.width = "100%";
			sh.style.height = "100%";
			sh.style.zIndex = z; //layering
			sh.style.position = "absolute"; //layering
			wall.appendChild(sh);
			
			
			const shcx = sh.getContext("2d");
			shcx.imageSmoothingEnabled = false;
			shcx.webkitImageSmoothingEnabled = false;
			shcx.mozImageSmoothingEnabled = false;
			
			const fig = new OffscreenCanvas(resX, resY);
			//const fig = document.createElement("canvas");
			const figcx = fig.getContext("2d");
			figcx.imageSmoothingEnabled = false;
			figcx.webkitImageSmoothingEnabled = false;
			figcx.mozImageSmoothingEnabled = false;
			
			return [sh, shcx, fig, figcx];
		}
		
		[this.bgShadow, 
			this.bgShadowContext, 
			this.bgFigure, 
			this.bgFigureContext
		] = makeCanvas(0);
		[this.fgShadow, 
			this.fgShadowContext, 
			this.fgFigure, 
			this.fgFigureContext
		] = makeCanvas(1);
		
	}
	ignite(startup) {
		//start button
		const btn = document.createElement("button");
		btn.textContent = "start";
		btn.id = "startButton";
		btn.style.width = "100%";
		btn.style.height = "100%";
		const bg = this.bgShadow;
		const fg = this.fgShadow;
		btn.onclick = 
			function() {
				bg.style.display = "block";
				fg.style.display = "block";
				//this.style.display = "none";
				this.remove();
				
				startup();
			}
		this.wall.appendChild(btn);
	}
	translate_game_to_canvas(x,y) {
		return [x * this.scale, y * this.scale];
	}
	translate_canvas_to_game(x,y) {
		return [x / this.scale, y / this.scale];
	}
	paintWall(color) {
		this.wall.style.backgroundColor = color;
	}
	/*illuminate() {
		this.bgShadowContext.drawImage(this.bgFigure, 0,0);
		this.fgShadowContext.drawImage(this.fgFigure, 0,0);
	}*/
	illuminateFg() {
		this.fgShadowContext.clearRect(0,0, this.x,this.y); //err: capitalize x/y | doing will break current game rendering
		this.fgShadowContext.drawImage(this.fgFigure, 0,0);
		this.fgFigureContext.clearRect(0,0, this.x,this.y);
	}
	illuminateBg() {
		this.bgShadowContext.clearRect(0,0, this.x,this.y);
		this.bgShadowContext.drawImage(this.bgFigure, 0,0);
		this.bgFigureContext.clearRect(0,0, this.x,this.y);
	}
	poseFg() {
		return this.fgFigureContext;
	}
	poseBg() {
		return this.bgFigureContext;
	}
	
	presentBgImage(image) {
		this.bgFigureContext.drawImage(image, 0,0, this.X,this.Y);
	}
	poseFgImage(image, x,y, sizeX,sizeY) {
		//expects game coords
		this.fgFigureContext.drawImage(image
			, x*this.scale, y*this.scale
			, sizeX*this.scale, sizeY*this.scale
		);
	}
}

class Input {
	constructor(root) {
		this.root = root
		//if root is element with low z index, wont detect clicks from under other elements
	}
	//todo: touch events + click events
	recieveDownAt(f) {
		this.root.addEventListener("mousedown", f);
	}
	recieveUpAt(f) {
		this.root.addEventListener("mouseup", f);
	}
	
	unbindDownFrom(f) {
		this.root.removeEventListener("mousedown", f);
	}
	unbindUpFrom(f) {
		this.root.removeEventListener("mouseup", f);
	}
	
	translate_to_canv(x,y) {
		const rect = this.root.getBoundingClientRect();
		//canvCoords = (clientPos - elementPos) * (elementWidth / elementCssWidth)
		return [
			(x - rect.left) * (this.root.width / this.root.offsetWidth)
			, (y- rect.top) * (this.root.height / this.root.offsetHeight)
		]
	}
}

class Spritesheet {
	constructor(cave, imId, spritesX,spritesY, spriteSize) {
		this.cave = cave;
		this.image = document.getElementById("image_sheet");
		this.sX = spritesX;
		this.sY = spritesY;
		this.res = spriteSize;
	}
	pose(index, x,y, sizeX,sizeY) {
		const scale = this.cave.scale;
		
		this.cave.fgFigureContext.drawImage(
			this.image, //img
				(index - Math.floor(index/this.sX)*this.sX) * this.res, //x,y to start clip at:
				Math.floor(index/this.sX) * this.res,
			this.res,this.res, //size of clip
			x*scale, y*scale, //pos to draw to
			sizeX*scale, sizeY*scale //size to draw to
		)
	}
}
