

class Chef {
	//builds/manages menu from json menu
	constructor(renderController, menuStr) {
		
		this.renderController = renderController;
		
		this.ms = JSON.parse(menuStr);
		this.waiter = new Waiter(renderController);
		
		const me = this;
			
			
	}
	ignite(home = "home") {
		this.renderController.input.recieveUp(this);
		this.display(home);
	}
	display(menuName) {
		const contents = this.ms[menuName].contents
		this.current = menuName;
		
		const frame = new OffscreenEisel(this.renderController.width,this.renderController.depth);
		
		frame.setColor(this.ms["style"].bgColor);
		frame.clear();
		
		const w = frame.getWidth();
		const d = frame.getDepth();
		
		let startX = w * 0.05;
		let width =  w - startX*2;
		
		let startY = d * 0.05;
		let depth = ((d-startY*2) * 0.95) / contents.length
		let spacing = ((d - startY*2) * 0.05) / contents.length
		
		for (let i = 0; i < contents.length; i++) {
			
			contents[i].x = startX;
			contents[i].y = startY + (depth + spacing) * i;
			contents[i].endX = startX + width;
			contents[i].endY = (startY + (depth + spacing) * i) + depth;
			
			frame.setColor(this.ms["style"].fgColor);
			frame.paintRectangle(
				startX
				, startY + (depth + spacing) * i
				, width
				, depth
			);
			frame.setColor(this.ms["style"].textColor);
			frame.setFont(depth*0.5);
			frame.write(
				contents[i].text
				, startX * 1.50
				, (startY + (depth + spacing) * i) + depth*0.75
				, width
			);
		}
		frame.presentFill(this.renderController.eisel);
	}
	onUp([x,y]) {
		const contents = this.ms[this.current].contents;
		
		for (let i = 0; i < contents.length; i++) {
				
			if (
				(x >= contents[i].x)
				&& (x <= contents[i].endX)
				&& (y >= contents[i].y)
				&& (y <= contents[i].endY)
			) {
				this.trigger(contents[i]);
				break;
			}
		}
	}
	trigger(btn) {
		
		if (btn.type === 0) { //navigate
			this.display(btn.menu);
		} else if (btn.type === 1) { //call func
			eval("this.waiter." + btn.f); //todo: find alternative
		} else if (btn.type === 2) {//open link
			//btn.link
		}
		
	}
}


const tempMenuStr = `
{

"style": {
	"bgColor": "#324056"
	, "fgColor": "#557185"
	, "textColor": "#ffd079"
}

, "home": {
	
	
	"contents": [
		{
			"text": "play"
			, "type": 0
			, "menu": "play"
		}, {
			"text": "help"
			, "type": 2
			, "link": ""
		}
	]
}
, "play": {
	
	
	"contents": [
		{
			"text": "beginner"
			, "type": 1
			, "f": "play(8,8,10)"
		}, {
			"text": "medium"
			, "type": 1
			, "f": "play(14,14,35)"
		}, {
			"text": "hard"
			, "type": 1
			, "f": "play(19,19,75)"
		}, {
			"text": "mega"
			, "type": 1
			, "f": "playMega()"
		}, {
			"text": "<- back"
			, "type": 0
			, "menu": "home"
		}
	]
}

}
`
/*
, "settings": {
	
	
	"contents": [
		{
			"text": "safety"
			, "type": 1
			, "f": "settingsSafety()"
		}, {
			"text": "death"
			, "type": 1
			, "f": "settingsDeath()"
		}, {
			"text": "palette"
			, "type": 1
			, "f": "settingsPalette()"
		}, {
			"text": "done"
			, "type": 0
			, "menu":"home"
		}
	]
}


}
`
*/