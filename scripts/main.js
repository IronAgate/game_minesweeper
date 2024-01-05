

function startup(renderController) {
	
	new Chef(renderController, tempMenuStr).ignite();
	
}

new RenderController("game", 500,500).ignite(startup);