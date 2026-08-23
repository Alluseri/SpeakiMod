if (!window.gameState) {
	alert("SpeakiMod is not installed correctly or the game updated! Can't proceed.");
	throw "Injection error...";
}

if (!window.i18n) {
	alert("SpeakiMod is not installed correctly or the game updated! The mod will work, but some translation-related features may not.");
	window.i18n = e => e;
}

// This is needed to make requests to 'gameData', 'channels' and other API endpoints
const AuthToken = gameState.socket.socket.url.match(/eyJhb.+?(?=&|$)/);

const Emotes = {
	Cry: 1,
	Jump: 2,
	PumpkinJoayo: 3,
	StrokeStart: 4,
	StrokeStage2: 5,
	StrokeBloom: 6,
	StrokeCancel: 7,
	Dance: 8
};

// This map does NOT have quest locations and Monatium!
const Portals = {
	1: {
		2: {
			portalId: 1,
			pos: {
				x: 95,
				z: 50
			}
		}
	},
	2: {
		1: {
			portalId: 2,
			pos: {
				x: 105,
				z: 50
			}
		},
		5: {
			portalId: 7,
			pos: {
				x: 196,
				z: 100
			}
		}
	},
	5: {
		2: {
			portalId: 8,
			pos: {
				x: 204,
				z: 100
			}
		},
		3: {
			portalId: 3,
			pos: {
				x: 296,
				z: 120
			}
		}
	},
	3: {
		5: {
			portalId: 4,
			pos: {
				x: 306,
				z: 120
			}
		},
		6: {
			portalId: 9,
			pos: {
				x: 426,
				z: 100
			}
		}
	},
	6: {
		3: {
			portalId: 10,
			pos: {
				x: 434,
				z: 100
			}
		},
		4: {
			portalId: 5,
			pos: {
				x: 554,
				z: 100
			}
		}
	},
	4: {
		6: {
			portalId: 6,
			pos: {
				x: 580,
				z: 100
			}
		},
		7: {
			portalId: 11,
			pos: {
				x: 656,
				z: 100
			}
		}
	},
	7: {
		4: {
			portalId: 12,
			pos: {
				x: 664,
				z: 100
			}
		},
		8: {
			portalId: 13,
			pos: {
				x: 756,
				z: 100
			}
		}
	},
	8: {
		7: {
			portalId: 14,
			pos: {
				x: 764,
				z: 100
			}
		},
		9: {
			portalId: 15,
			pos: {
				x: 956,
				z: 100
			}
		}
	},
	9: {
		8: {
			portalId: 16,
			pos: {
				x: 964,
				z: 100
			}
		},
		10: {
			portalId: 17,
			pos: {
				x: 1136,
				z: 100
			}
		}
	},
	10: {
		9: {
			portalId: 18,
			pos: {
				x: 1144,
				z: 100
			}
		}
	}
};
// Very cringe and could be generated automatically but gijfogjifsdogd fuck graph theory
// This won't work btw if I decide to add quest portal support & Monatium
const ZoneSequences = [1, 2, 5, 3, 6, 4, 7, 8, 9, 10];

var GameData = null;

fetch("https://sr1.overture.io.kr/api/gamedata", {
	"method": "GET",
	"headers": {
		"authorization": "Bearer " + AuthToken
	},
	"mode": "cors"
}).then(async x => {
	if (!x.ok) {
		// TODO: Special case for 429? idk if it will happen or not
		alert("SpeakiMod is outdated or the game servers are down! Failed to fetch gamedata: " + x.status + "\nSome features will be hidden.");
		return;
	}

	GameData = await x.json();

	onGameDataUpdate();
});

function buildElement(tag, characteristics, inner, callback) {
	var elem = document.createElement(tag);
	elem.replaceChildren(...(inner?.filter(t => t) || []));
	for (let _ in (characteristics || {})) {
		elem[_] = characteristics[_];
	}
	if (callback) callback(elem);
	return elem;
}

var lunHudElements = {
	playersNearby: null,
	expTrackerL1: null,
	expTrackerL2: null,
	channelTracker: null,
	zoneId: null
};
var lunPanelElements = {
	targetZone: null
};

var lunTickCount = 0;
var lunSleep = 0;
const lunTPS = 50;
const lunExpTrackerWindow = 60000 / lunTPS;
var lunExpTrackerNextTicks = 0;
var lunExpTrackerStartExp = gameState.myStat.exp;
var lunExpTrackerSpeed = 0;

var lunChannelTrackerWindow = 7500 / lunTPS;
var lunChannelTrackerNextTicks = 0;

var lunWalkToPortal = -1;
var lunAutoTravelTarget = null;
var lunCameraLocked = false;
var lunViewClip = false;

const spkmodBorderWidth = "3px";

document.head.appendChild(buildElement(
	"style",
	{
		id: "spkmod-stylesheet",
		innerHTML: `
		#spkmod-hud {
			display: flex;
			flex-direction: row;
			gap: 4px;
			position: absolute;
			top: 225px;
			left: 5px;
			z-index: 500000;
			color: #EEE;
		}
		#spkmod-main {
			display: flex;
			flex-direction: column;
			gap: 1px;
			background-color: #000C;
			border: ${spkmodBorderWidth} solid #DDD;
			border-radius: 8px;
			padding: 6px;
		}
		#spkmod-panel {
			display: flex;
			flex-direction: column;
			gap: 2px;
		}
		#spkmod-header, #spkmod-texpb {
			border-bottom: 1px solid #DDD;
			margin-bottom: 4px;
		}
		.spkmod-panel-btn {
			color: #EEE;
			background-color: #000C;
			border: ${spkmodBorderWidth} solid #DDD;
			border-radius: 8px;
			padding: 5px;
			font-size: 11pt;
			cursor: pointer;
			outline: none;
		}
		.spkmod-watch-player-btn {
			color: #FFF;
			border-color: #333;
			box-shadow: 0 .1875rem 0 #333;
			background: #000;
		}
		.spkmod-panel-cat {
			display: flex;
			flex-direction: row;
			gap: 4px;
			align-items: center;
		}
		.spkmod-panel-counter {
			outline: none;
			border: ${spkmodBorderWidth} solid #DDD;
			border-radius: 8px;
			background-color: #000C;
			color: #EEE;
			height: min-content;
		}
		.spkmod-panel-counter::-webkit-inner-spin-button, 
		.spkmod-panel-counter::-webkit-outer-spin-button {
			opacity: 1;
		}
		.spkmod-panel-combo {
			outline: none;
			background-color: #000C;
			color: #EEE;
			border-radius: 8px;
			border: ${spkmodBorderWidth} solid #DDD;
		}
		`
	}
));

document.body.appendChild(
	buildElement("div", {
		id: "spkmod-hud"
	}, [
		buildElement("div", {
			id: "spkmod-main"
		}, [
			buildElement("span", {
				id: "spkmod-header",
				innerText: "SpeakiMod v2"
			}),
			lunHudElements.playersNearby = buildElement("span", {
				innerText: "Players nearby: 0"
			}),
			lunHudElements.zoneId = buildElement("span", {
				innerText: "Zone ID: N/A"
			}),
			lunHudElements.expTrackerL1 = buildElement("span", {
				innerText: "0 EXP per minute"
			}),
			lunHudElements.expTrackerL2 = buildElement("span", {
				id: "spkmod-texpb",
				innerText: "Until next level: N/A"
			}),
			lunHudElements.channelTracker = buildElement("span", {
				innerText: "Channel tracker: N/A"
			})
		]),
		buildElement("div", {
			id: "spkmod-panel"
		}, [
			buildElement("button", {
				className: "spkmod-panel-btn",
				innerText: "Dance",
				value: "",
				onclick: e => {
					gameState.sendEmoteNow(Emotes.Dance);
				}
			}),
			buildElement("button", {
				className: "spkmod-panel-btn",
				innerText: "Joayo",
				value: "",
				onclick: e => {
					gameState.sendEmoteNow(Emotes.PumpkinJoayo);
				}
			}),
			buildElement("button", {
				className: "spkmod-panel-btn",
				innerText: "Reset Camera",
				value: "",
				onclick: e => {
					watchPlayer();
				}
			}),
			buildElement("button", {
				className: "spkmod-panel-btn",
				innerText: "Lock Camera",
				value: "",
				onclick: e => {
					lunCameraLocked = !lunCameraLocked;
					e.target.innerText = lunCameraLocked ? "Unlock Camera" : "Lock Camera";
				}
			}),
			buildElement("button", {
				className: "spkmod-panel-btn",
				innerText: "ViewClip OFF",
				value: "",
				onclick: e => {
					lunViewClip = !lunViewClip;
					e.target.innerText = lunViewClip ? "ViewClip ON" : "ViewClip OFF";
				}
			}),
			buildElement("div", {
				className: "spkmod-panel-cat"
			}, [
				buildElement("button", {
					className: "spkmod-panel-btn",
					innerText: "Walk to Portal",
					value: "",
					onclick: e => {
						if (lunWalkToPortal == -1) {
							lunWalkToPortal = lunPanelElements.targetZone.value - 0;
							e.target.innerText = "Stop Walking";
							chatLog("Walking to " + lunPanelElements.targetZone.options[lunPanelElements.targetZone.selectedIndex].innerText + " (" + lunWalkToPortal + ")");
						} else {
							lunWalkToPortal = -1;
							e.target.innerText = "Walk to Portal";
							chatLog("Stopped autowalking");
						}

						e.target.blur();
						lunPanelElements.targetZone.blur();
					}
				}),
				lunPanelElements.targetZone = buildElement("select", {
					className: "spkmod-panel-combo"
				}, Object.keys(Portals).map(zoneId => buildElement("option", {
					value: zoneId - 0,
					innerText: i18n(`content.zone.${zoneId}.name`)
				})))
			])
		])
	])
);

function sec(t) {
	return t * lunTPS;
}

function normalizeVector(x, y) {
	let n = Math.sqrt(x * x + y * y);
	return n < 1e-6 ? {
		x: 0,
		z: 0
	} : {
		x: x / n,
		z: y / n
	}
}

function distanceToVector(vec) {
	var ep = getPlayerPos();

	return Math.hypot(vec.x - ep.x, vec.z - ep.z);
}

function getPlayerPos() {
	return gameState.playerContainer.position;
}

function chatLog(msg) {
	gameState.chatBox.append(-1337, "SpeakiMod", msg);
}

function watchPlayer(name) {
	if (name) {
		var pi = Object.values(Object.fromEntries(gameState.remotePlayers.remotePlayers)).find(t => t.info.name == name);
		if (pi) {
			gameState.cameraController.target = pi.container;
			chatLog("The camera will be following " + name + " now.");
			return;
		} else {
			chatLog("Couldn't find the target player. The camera will be following you now.");
		}
	} else {
		chatLog("The camera will be following you now.");
	}

	gameState.cameraController.target = gameState.playerContainer;
}

var hPartyTarget = document.querySelector(".sr-party-target");
if (hPartyTarget) {
	hPartyTarget.insertBefore(
		buildElement("button", {
			className: "sr-btn sr-party-target__btn spkmod-watch-player-btn",
			innerText: "[SM] Watch",
			value: "",
			onclick: e => {
				watchPlayer(e.target.parentElement.querySelector(".sr-party-target__name").innerText);
			}
		}),
		hPartyTarget.querySelector(".sr-party-target__close")
	)
} else {
	alert("Warning: Couldn't find party target element. The Watch functionality will only be available through chat commands. Mod loaded too early?");
}

function onGameDataUpdate() {

}

function tick() {
	// TODO: Reset some settings if player is dead

	lunAutoTravelTarget = null;
	lunTickCount++;
	lunSleep--;

	var playerExp = gameState.myStat.exp;
	var zoneId = gameState.zoneId % 10000;

	lunHudElements.playersNearby.innerText = "Players nearby: " + gameState.remotePlayers.remotePlayers.size;
	lunHudElements.zoneId.innerText = "Zone ID: " + zoneId;

	if (lunExpTrackerStartExp > playerExp || lunTickCount >= lunExpTrackerNextTicks) {
		lunExpTrackerSpeed = (playerExp - lunExpTrackerStartExp) / lunExpTrackerWindow * (1000 / lunTPS);

		lunExpTrackerNextTicks = lunTickCount + lunExpTrackerWindow;
		lunExpTrackerStartExp = playerExp;
	}

	if (lunExpTrackerSpeed > 0) {
		lunHudElements.expTrackerL1.innerText = (lunExpTrackerSpeed * 60).toFixed(2) + " EXP per minute";
		lunHudElements.expTrackerL2.innerText = "Until next level: ~" + ((gameState.myStat.maxExp - playerExp) / lunExpTrackerSpeed / 60).toFixed(2) + " min";
	} else {
		lunHudElements.expTrackerL1.innerText = "0 EXP per minute";
		lunHudElements.expTrackerL2.innerText = "Until next level: N/A";
	}

	lunHudElements.expTrackerL1.innerText += " (" + ((lunExpTrackerNextTicks - lunTickCount) * lunTPS / 1000).toFixed(0) + "s)";

	if (lunTickCount >= lunChannelTrackerNextTicks) {
		fetch("https://sr1.overture.io.kr/api/realtime/channels", {
			"method": "GET",
			"headers": {
				"authorization": "Bearer " + AuthToken
			},
			"mode": "cors"
		}).then(async x => {
			var resp = (await x.json());
			if (!x.ok) {
				lunHudElements.channelTracker.innerText = "Channel tracker: Error " + x.status;
				return;
			}

			lunHudElements.channelTracker.innerText = resp.map(t => `Channel ${t.channel}: ${t.population}/${t.capacity}`).join("\n");
		});

		lunChannelTrackerNextTicks = lunTickCount + lunChannelTrackerWindow;
	}

	// When changing zones:
	// Stopped autowalking because there doesn't seem to be a way to get to the specified zone (z 0 -> -1, lw -1 -> 5)

	if (lunWalkToPortal != -1 && zoneId) {
		// TODO: This doesn't reset the button state

		var currentIndex = ZoneSequences.indexOf(zoneId - 0);
		var targetIndex = ZoneSequences.indexOf(lunWalkToPortal - 0);

		if (currentIndex == -1 || targetIndex == -1) {
			chatLog("Stopped autowalking because there doesn't seem to be a way to get to the specified zone (z " + zoneId + " -> " + currentIndex + ", lw " + lunWalkToPortal + " -> " + targetIndex + ")");
			lunWalkToPortal = -1;
			return;
		}

		const sg = Math.sign(targetIndex - currentIndex);

		if (sg == 0) {
			lunWalkToPortal = -1;
			chatLog("You've arrived!");
			return;
		} else {
			var targetZone = ZoneSequences[currentIndex + sg];

			var portals = Portals[zoneId];
			if (!portals) {
				lunWalkToPortal = -1;
				chatLog("Stopped autowalking because the current zone has no portals registered");
				return;
			}

			var targetPortal = portals[targetZone];
			if (!targetPortal) {
				lunWalkToPortal = -1;
				chatLog("Stopped autowalking because it seems there is a portal missing");
				return;
			}

			lunAutoTravelTarget = targetPortal.pos;

			if (lunSleep <= 0 && distanceToVector(lunAutoTravelTarget) <= 3) {
				gameState.tryUsePortal();
				lunSleep = sec(1);
			}
		}
	}
}

var hkCombatAssistUpdate = gameState.combatAssist.update.bind(gameState.combatAssist);
gameState.combatAssist.update = function (e) {
	if (lunAutoTravelTarget) {
		var pp = getPlayerPos();

		return {
			moveDir: normalizeVector(
				lunAutoTravelTarget.x - pp.x,
				lunAutoTravelTarget.z - pp.z
			),
			castSkillId: null
		};
	}

	return hkCombatAssistUpdate(e);
}

var hkComputeCameraTargetPosition = gameState.cameraController.computeCameraTargetPosition.bind(gameState.cameraController);
gameState.cameraController.computeCameraTargetPosition = function (pos) {
	if (!lunCameraLocked)
		return hkComputeCameraTargetPosition(pos);
}

var hkCameraControllerGetObstacles = gameState.cameraController.getObstacles.bind(gameState.cameraController);
gameState.cameraController.getObstacles = function () {
	return lunViewClip ? [] : hkCameraControllerGetObstacles();
}

var hkTrySendChat = gameState.trySendChat.bind(gameState);
gameState.trySendChat = function (msg) {
	if (msg.startsWith("!")) {
		var cmd = msg.substring(1).split(" ");
		switch (cmd[0]) {
			case "watch":
				watchPlayer(cmd[1]);
				break;
			case "zoom":
				if (!cmd[1]) {
					chatLog("Usage: !zoom [number]");
					chatLog("Legitimate values range from 3 to 12. Higher value = farther camera.");
					return;
				}

				chatLog("Set camera zoom to " + (gameState.cameraController.cameraZoomDistance = Number.parseInt(cmd[1]) || 12) + "!");
				break;
			default:
				chatLog("Unknown command: " + cmd[0]);
				chatLog("Available commands: watch, zoom");
				break;
		}
		return;
	}

	return hkTrySendChat(msg);
}

setInterval(tick, 50);
