

class Chef {
	//builds/manages menu from json menu
	constructor(cave, inp, menuStr) {
		
		this.ms = JSON.parse(menuStr);
		this.waiter = new Waiter();
		
		this.cave = cave;
		
		this.inp = inp;
		const me = this;
		this.tempF = function(e) {
			const [x,y] = me.inp.translate_to_canv(e.clientX, e.clientY);
		
			const contents = me.ms[me.current].contents;
		
			for (let i = 0; i < contents.length; i++) {
				
				if (
					(x >= contents[i].x)
					&& (x <= contents[i].endX)
					&& (y >= contents[i].y)
					&& (y <= contents[i].endY)
				) {
					me.trigger(contents[i]);
					break;
				}
			}
		}
	}
	/*onTap(e) {
		const [x,y] = this.inp.translate_to_canv(e.clientX, e.clientY);
		
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
		
	}*/
	start(home = "home") {
		this.inp.recieveUpAt(this.tempF);
		this.display(home);
	}
	display(menuName) {
		const contents = this.ms[menuName].contents
		this.current = menuName;
		
		this.cave.poseFg().fillStyle = this.ms["style"].bgColor;
		this.cave.poseFg().fillRect(0,0, this.cave.X,this.cave.Y);
		
		let startX = this.cave.X * 0.05;
		let width = this.cave.X - startX*2;
		
		let startY = this.cave.Y * 0.05;
		let depth = ((this.cave.Y-startY*2) * 0.95) / contents.length
		let spacing = ((this.cave.Y - startY*2) * 0.05) / contents.length
		
		for (let i = 0; i < contents.length; i++) {
			
			contents[i].x = startX;
			contents[i].y = startY + (depth + spacing) * i;
			contents[i].endX = startX + width;
			contents[i].endY = (startY + (depth + spacing) * i) + depth;
			
			this.cave.poseFg().fillStyle = this.ms["style"].fgColor;
			this.cave.poseFg().fillRect(
				startX
				, startY + (depth + spacing) * i
				, width
				, depth
			);
			this.cave.poseFg().fillStyle = this.ms["style"].textColor;
			//this.cave.poseFg().textAlign = "center";
			this.cave.poseFg().font = String(depth*0.50) + "px monospace";
			this.cave.poseFg().fillText(
				contents[i].text
				, startX * 1.50
				, (startY + (depth + spacing) * i) + depth*0.75
				, width
			);
		}
		this.cave.illuminateFg();
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