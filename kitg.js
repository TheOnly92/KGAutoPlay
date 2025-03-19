// These will allow quick selection of the buildings which consume energy
(function(s){var w,f={},o=window,l=console,m=Math,z='postMessage',x='HackTimer.js by turuslan: ',v='Initialisation failed',p=0,r='hasOwnProperty',y=[].slice,b=o.Worker;function d(){do{p=0x7FFFFFFF>p?p+1:0}while(f[r](p));return p}if(!/MSIE 10/i.test(navigator.userAgent)){try{s=o.URL.createObjectURL(new Blob(["var f={},p=postMessage,r='hasOwnProperty';onmessage=function(e){var d=e.data,i=d.i,t=d[r]('t')?d.t:0;switch(d.n){case'a':f[i]=setInterval(function(){p(i)},t);break;case'b':if(f[r](i)){clearInterval(f[i]);delete f[i]}break;case'c':f[i]=setTimeout(function(){p(i);if(f[r](i))delete f[i]},t);break;case'd':if(f[r](i)){clearTimeout(f[i]);delete f[i]}break}}"]))}catch(e){}}if(typeof(b)!=='undefined'){try{w=new b(s);o.setInterval=function(c,t){var i=d();f[i]={c:c,p:y.call(arguments,2)};w[z]({n:'a',i:i,t:t});return i};o.clearInterval=function(i){if(f[r](i))delete f[i],w[z]({n:'b',i:i})};o.setTimeout=function(c,t){var i=d();f[i]={c:c,p:y.call(arguments,2),t:!0};w[z]({n:'c',i:i,t:t});return i};o.clearTimeout=function(i){if(f[r](i))delete f[i],w[z]({n:'d',i:i})};w.onmessage=function(e){var i=e.data,c,n;if(f[r](i)){n=f[i];c=n.c;if(n[r]('t'))delete f[i]}if(typeof(c)=='string')try{c=new Function(c)}catch(k){l.log(x+'Error parsing callback code string: ',k)}if(typeof(c)=='function')c.apply(o,n.p)};w.onerror=function(e){l.log(e)};l.log(x+'Initialisation succeeded')}catch(e){l.log(x+v);l.error(e)}}else l.log(x+v+' - HTML5 Web Worker is not supported')})('HackTimerWorker.min.js');

var deadScript = "Script is dead";
var GlobalMsg = {'craft':'','tech':'','relicStation':'','solarRevolution':'','ressourceRetrieval':'','chronosphere':'', 'science':''};
var switches = {"Energy Control":true, "Iron Will":false, "CollectResBReset":false}

var htmlMenuAddition = '<div id="farRightColumn" class="column">' +

'<a id="scriptOptions" onclick="selectOptions()"> | KGAutoPlay </a>' +

'<div id="optionSelect" style="display:none; margin-top:-235px; margin-left:-60px; width:200px" class="dialog help">' +
'<a href="#" onclick="clearOptionHelpDiv();" style="position: absolute; top: 10px; right: 15px;">close</a>' +

'<button id="killSwitch" onclick="clearInterval(clearScript()); gamePage.msg(deadScript);">Kill Switch</button> </br>' +
'<hr size=5>' +
'<button id="autoEnergy" style="color:black" onclick="autoSwitch(\'Energy Control\',  \'autoEnergy\')"> Energy Control </button></br>' +
'<hr size=3>' +
'<button id="Collector" title = "Collect late game res(Tcrystal, Relic, Void) before reset." style="color:red" onclick="autoSwitch(\'CollectResBReset\',  \'Collector\')"> CollectResBReset </button></br>' +
'<hr size=3>' +
'<button id="SellSpace" onclick="SellSpaceAndReset();">Sell Space and Reset</button> </br>' +
'<hr size=3>' +
'<button id="IronWill" style="color:red" onclick="autoSwitch(\'Iron Will\',  \'IronWill\')"> IronWill </button></br>' +
'</div>' +
'</div>'

$("#footerLinks").append(htmlMenuAddition);


$(document.querySelector('#rightColumn > div.right-tab-header')).append("<a id='PriorityLabel' title = 'KGAutoPlay:\nLow priority for building construction and some technology.'></a>")
//$(document.querySelector("#midColumn")).append("<a id='PriorityLabel' title = 'KGAutoPlay: Low priority for building construction and some technology.'></a>")

function selectOptions() {
	$("#optionSelect").toggle();
}
function clearOptionHelpDiv() {
	$("#optionSelect").hide();
}

function clearScript() {
	$("#farRightColumn").remove();
	$("#PriorityLabel").remove();
	$("#scriptOptions").remove();
	clearInterval(runAllAutomation);
	htmlMenuAddition = null;
}

function autoSwitch(varCheck, varName) {
	if (!switches[varCheck]) {
		switches[varCheck] = true;
		gamePage.msg('Auto ' + varCheck + ' is now on');
		document.getElementById(varName).style.color = 'black';
	} else if (switches[varCheck]) {
		switches[varCheck] = false;
		gamePage.msg('Auto ' + varCheck + ' is now off');
		document.getElementById(varName).style.color = 'red';
	}
}


/* These are the functions which are controlled by the runAllAutomation timer */

// Auto Observe Astronomical Events
function autoObserve() {
  const checkObserveBtn = document.getElementById("observeBtn");
  if (typeof(checkObserveBtn) != 'undefined' && checkObserveBtn != null) {
    document.getElementById('observeBtn').click();
  }
}

//Auto praise the sun
function autoPraise() {
  // Skip if religion tab is not visible or atheism challenge is active
  if (!gamePage.religionTab.visible || gamePage.challenges.isActive("atheism")) {
    return;
  }

  // Update religion tab
  gamePage.tabs[5].update();

  // Get current faith resource
  const faithResource = gamePage.resPool.get("faith");
  const isFaithNearMax = faithResource.value >= faithResource.maxValue * 0.99;

  // Handle religion upgrades and transcendence
  if (gamePage.religion.meta[1].meta[5].val == 1) {
    handleSolarRevolution(faithResource, isFaithNearMax);
  } else {
    handleBasicReligion(faithResource, isFaithNearMax);
  }

  // Handle cryptotheology if available
  if (!switches['CollectResBReset'] && gamePage.science.get("cryptotheology").researched) {
    purchaseCryptotheology();
  }

  // Handle pacts
  handlePacts();
}

// Helper function to purchase available religion upgrades
function purchaseReligionUpgrades() {
  const availableUpgrades = gamePage.tabs[5].rUpgradeButtons.filter(
    res => res.model.resourceIsLimited == false &&
    !res.model.name.includes('(complete)')
  );

  for (let i = 0; i < availableUpgrades.length; i++) {
    const upgrade = availableUpgrades[i];
    if (upgrade.model.enabled && upgrade.model.visible) {
      try {
        upgrade.controller.buyItem(upgrade.model, {}, function(result) {
          if (result) {
            upgrade.update();
            gamePage.msg('Religion researched: ' + upgrade.model.name);
          }
        });
      } catch(err) {
        console.log(err);
      }
    }
  }
}

// Handle solar revolution related logic
function handleSolarRevolution(faithResource, isFaithNearMax) {
  const transcendenceTier = gamePage.religion.transcendenceTier;
  const solarRevolutionRatio = gamePage.religion.getSolarRevolutionRatio();
  const solarRevolutionLimit = Math.max((transcendenceTier + 1) * 0.05, gamePage.getEffect("solarRevolutionLimit"));

  // Check if we should praise or purchase upgrades
  if (transcendenceTier > 1 && solarRevolutionRatio <= solarRevolutionLimit) {
    gamePage.religion.praise();
  } else if (gamePage.tabs[5].rUpgradeButtons.filter(res =>
    res.model.resourceIsLimited == false &&
    !res.model.name.includes('(complete)')
  ).length > 0) {
    purchaseReligionUpgrades();
  }

  // Handle faith accumulation and transcendence
  if (isFaithNearMax) {
    const faithThreshold = transcendenceTier < 5 ?
      Math.min(faithResource.maxValue * 0.99, (transcendenceTier + 1) * 10000) :
      faithResource.maxValue * 0.99;

    if (faithResource.value >= faithThreshold) {
      handleFaithReset(transcendenceTier, solarRevolutionRatio, solarRevolutionLimit);
    }
  }

  // Check if we can transcend
  if (gamePage.religion.getRU("transcendence").on) {
    tryTranscend();
  }
}

// Handle faith reset logic
function handleFaithReset(transcendenceTier, solarRevolutionRatio, solarRevolutionLimit) {
  const hasApocripha = gamePage.religion.getRU("apocripha").on;
  const hasTranscendence = gamePage.religion.getRU("transcendence").on;
  const faithRatio = gamePage.religion.faith / gamePage.religion.getApocryphaBonus();
  const faithMaxValue = gamePage.resPool.get("faith").maxValue;
  const hasVoidResonance = gamePage.getEffect("voidResonance") > 0;

  // Complex condition for faith reset
  const resetThreshold = faithMaxValue * Math.min(
    transcendenceTier,
    10,
    Math.max(transcendenceTier * 0.05, solarRevolutionLimit)
  );

  if (hasApocripha && hasTranscendence) {
    if (
      (solarRevolutionRatio > solarRevolutionLimit && transcendenceTier < 15) ||
      (hasVoidResonance && faithRatio > resetThreshold) ||
      (faithRatio > resetThreshold)
    ) {
      gamePage.religion.resetFaith(1.01, false);
    } else {
      gamePage.religion.praise();
    }
  } else {
    gamePage.religion.praise();
  }
}

// Try to transcend if possible
function tryTranscend() {
  const currentTier = gamePage.religion.transcendenceTier;
  const needNextLevel = gamePage.religion._getTranscendTotalPrice(currentTier + 1) -
    gamePage.religion._getTranscendTotalPrice(currentTier);

  if (gamePage.religion.faithRatio > needNextLevel) {
    gamePage.religion.transend();
  }
}

// Handle basic religion before solar revolution
function handleBasicReligion(faithResource, isFaithNearMax) {
  const hasSolarRevolution = gamePage.tabs[5].rUpgradeButtons.filter(
    res => res.model.metadata.name == "solarRevolution"
  )[0].model.visible == false;

  if (isFaithNearMax && gamePage.tabs[5].rUpgradeButtons.filter(
    res => res.model.resourceIsLimited == false &&
    !res.model.name.includes('(complete)')
  ).length > 0) {
    purchaseReligionUpgrades();

    // Praise if still near max faith
    if (faithResource.value >= faithResource.maxValue * 0.99) {
      gamePage.religion.praise();
    }
  } else if (isFaithNearMax || hasSolarRevolution) {
    gamePage.religion.praise();
  }
}

// Purchase available cryptotheology upgrades
function purchaseCryptotheology() {
  const cryptoButtons = gamePage.tabs[5].ctPanel.children[0].children;

  for (let i = 0; i < cryptoButtons.length; i++) {
    const upgrade = cryptoButtons[i];
    if (upgrade.model.enabled && upgrade.model.visible) {
      try {
        upgrade.controller.buyItem(upgrade.model, {}, function(result) {
          if (result) {
            upgrade.update();
            gamePage.msg('Religion Cryptotheology researched: ' + upgrade.model.name);
          }
        });
      } catch(err) {
        console.log(err);
      }
    }
  }
}

// Handle pacts
function handlePacts() {
  // Handle Pact of Cleansing
  if (gamePage.science.getPolicy("siphoning").researched &&
    gamePage.religion.getPact("pactOfCleansing").unlocked &&
    gamePage.getEffect("pactsAvailable") > 0) {

    if (gamePage.resPool.get("relic").value > 100 &&
      gamePage.resPool.get("necrocorn").value > 10 &&
      (gamePage.religion.getCorruptionPerTick() * (1 + gamePage.timeAccelerationRatio())) > 0.001 &&
      gamePage.diplomacy.get("leviathans").energy >= gamePage.diplomacy.getMarkerCap()) {

      const cleansing = gamePage.tabs[5].ptPanel.children[0].children.filter(
        res => res.model.metadata &&
        res.model.metadata.unlocked &&
        res.id == "pactOfCleansing" &&
        res.model.enabled
      );

      for (let i = 0; i < cleansing.length; i++) {
        const pact = cleansing[i];
        if (pact.model.enabled && pact.model.visible) {
          try {
            pact.controller.buyItem(pact.model, {}, function(result) {
              if (result) {
                pact.update();
                gamePage.msg('Religion Pact accepted: ' + pact.model.name);
              }
            });
          } catch(err) {
            console.log(err);
          }
        }
      }
    }
  }

  // Handle Pay Debt
  if (gamePage.religion.getPact("payDebt").unlocked &&
    gamePage.resPool.get("necrocorn").value > gamePage.religion.getPact("payDebt").prices[0].val) {

    const payDebt = gamePage.tabs[5].ptPanel.children[0].children.filter(
      res => res.model.metadata &&
      res.model.metadata.unlocked &&
      res.id == "payDebt" &&
      res.model.enabled
    )[0];

    try {
      payDebt.controller.buyItem(payDebt.model, {}, function(result) {
        if (result) {
          payDebt.update();
          gamePage.msg('Religion : ' + payDebt.model.name);
        }
      });
    } catch(err) {
      console.log(err);
    }
  }
}

const GOLDEN_BUILDINGS = ["temple", "tradepost"];

/**
 * Automatically builds buildings based on game conditions and priorities
 */
function autoBuild() {
  const gameState = {
    ironWill: gamePage.ironWill,
    solarRevolution: gamePage.religion.getRU('solarRevolution').val === 1,
    mintMetaVal: gamePage.bld.getBuildingExt('mint').meta.val
  };

  // Filter buildings that are unlocked and meet priority conditions
  const availableBuildings = gamePage.tabs[0].children.filter(building => {
    const model = building.model;
    if (!model.metadata || !model.metadata.unlocked) return false;

    // Check if resource is limited
    if (model.resourceIsLimited) return false;

    // Check priority conditions
    if (Object.keys(craftPriority[0]).length > 0) {
      const isMainPriority = model.metadata.name === craftPriority[0];
      const isNotPriorityBuilding = NOT_PRIORITY_BLD_NAMES.indexOf(model.metadata.name) > -1;
      const hasNoPriorityResources = model.prices.filter(price =>
        craftPriority[3].indexOf(price.name) !== -1
      ).length === 0;

      return isMainPriority || isNotPriorityBuilding || hasNoPriorityResources;
    }

    return true;
  });

  // Process each available building
  for (const building of availableBuildings) {
    const model = building.model;
    const controller = building.controller;
    const metadata = model.metadata;
    const prices = model.prices;

    // Update enabled status
    controller.updateEnabled(model);
    if (!model.enabled) continue;

    // Skip forbidden resources before reset if option is enabled
    if (switches['CollectResBReset'] &&
      prices.some(res => ['relic', 'timeCrystal', 'void'].includes(res.name))) {
      continue;
    }

    try {
      if (shouldBuildGoldenBuilding(metadata, prices, gameState)) {
        buyBuilding(building, controller, model);
      }
      else if (shouldBuildAICore(metadata)) {
        buyBuilding(building, controller, model);
      }
      else if (shouldSkipField(metadata)) {
        // Skip building fields in specific conditions
        continue;
      }
      else if (shouldBuildChronosphere(metadata)) {
        buyBuilding(building, controller, model);
      }
      else if (gameState.ironWill) {
        if (shouldBuildInIronWill(metadata, prices, gameState)) {
          buyBuilding(building, controller, model);
        }
      }
      else {
        // Default case - build if enabled
        buyBuilding(building, controller, model);
      }
    } catch (err) {
      console.log(err);
    }
  }
}

/**
 * Determines if a golden building should be built
 */
function shouldBuildGoldenBuilding(metadata, prices, gameState) {
  if (!GOLDEN_BUILDINGS.includes(metadata.name)) return false;

  // Skip in iron will unless mint conditions are met
  if (gameState.ironWill && !(gameState.mintMetaVal > 3)) return false;

  const goldPrice = prices.find(res => res.name === 'gold');
  const goldResource = gamePage.resPool.get('gold');
  const isGoldMaxed = goldResource.value === goldResource.maxValue;
  const hasExcessGold = goldPrice && (goldPrice.val < (goldResource.value - 500));

  return gameState.solarRevolution ||
    (metadata.name === 'temple' && metadata.val < 3) ||
    hasExcessGold ||
    isGoldMaxed;
}

/**
 * Determines if an AI Core should be built
 */
function shouldBuildAICore(metadata) {
  return metadata.name === "aiCore" &&
    metadata.val < Math.floor(spcEntangler.val * 2.5);
}

/**
 * Determines if Field building should be skipped
 */
function shouldSkipField(metadata) {
  if (metadata.name !== "field") return false;

  // Skip fields in post-apocalypse challenge when at threshold
  if (gamePage.challenges.isActive("postApocalypse") &&
    gamePage.bld.getPollutionLevel() >= 5 &&
    metadata.val >= 95 - gamePage.time.getVSU("usedCryochambers").val - gamePage.bld.getPollutionLevel()) {
    return true;
  }

  // Skip fields in early game when catnip is low
  if (!gamePage.science.get('engineering').researched &&
    gamePage.calendar.season >= 1 &&
    gamePage.resPool.get('catnip').value < gamePage.resPool.get('catnip').maxValue * 0.9) {

    const catnipPrice = metadata.prices.find(res => res.name === "catnip");
    if (catnipPrice && catnipPrice.val * 3 > gamePage.resPool.get('catnip').value) {
      return true;
    }
  }

  return false;
}

/**
 * Determines if a Chronosphere should be built
 */
function shouldBuildChronosphere(metadata) {
  if (metadata.name !== "chronosphere") return false;

  const chronosphereVal = gamePage.bld.getBuildingExt('chronosphere').meta.val;
  const timeCrystalResource = gamePage.resPool.get("timeCrystal");
  const unobtainiumResource = gamePage.resPool.get("unobtainium");

  // Case 1: Need chronoforge but need to save time crystals
  if (gamePage.workshop.get("chronoforge").researched &&
    chronosphereVal >= 10 &&
    ((gamePage.time.meta[0].meta[5].unlocked &&
      timeCrystalResource.value < gamePage.timeTab.cfPanel.children[0].children[6].model.prices.find(res => res.name === "timeCrystal").val *
      (gamePage.timeTab.cfPanel.children[0].children[6].model.metadata.val > 3 ? 0.9 : 0.05)) ||
      !gamePage.science.get("paradoxalKnowledge").researched)) {
    return true;
  }

  // Case 2: Under 20 chronospheres with time tab and resources
  if (chronosphereVal < 20 &&
    gamePage.timeTab.visible &&
    timeCrystalResource.value - Chronosphere10SummPrices()["timeCrystal"] > 100 &&
    gamePage.time.meta[0].meta[5].val > 0) {
    return true;
  }

  // Case 3: Under 10 chronospheres with enough resources
  if (chronosphereVal < 10 &&
    ((unobtainiumResource.value >= Chronosphere10SummPrices()["unobtainium"] &&
      timeCrystalResource.value >= Chronosphere10SummPrices()["timeCrystal"]) ||
      unobtainiumResource.value >= unobtainiumResource.maxValue)) {
    return true;
  }

  return false;
}

/**
 * Determines if a building should be built during Iron Will mode
 */
function shouldBuildInIronWill(metadata, prices, gameState) {
  // Skip housing buildings
  if (metadata.effects.maxKittens) return false;

  const workshopMeta = gamePage.bld.getBuildingExt('workshop').meta;
  const amphitheatreMeta = gamePage.bld.getBuildingExt('amphitheatre').meta;
  const templeMeta = gamePage.bld.getBuildingExt('temple').meta;

  // Skip pastures without solar revolution
  if (metadata.name === "pasture" && !gameState.solarRevolution) return false;

  // Skip buildings requiring science before gold ore
  if (!gamePage.workshop.get("goldOre").researched &&
    prices.some(res => res.name === 'science')) return false;

  // Skip mineral/slab buildings before first workshop
  if (workshopMeta.unlocked && workshopMeta.val === 0 &&
    metadata.name !== workshopMeta.name &&
    prices.some(res => ['minerals', 'slab'].includes(res.name))) return false;

  // Skip mineral/slab buildings before gold ore when workshop exists
  if (!gamePage.workshop.get("goldOre").researched &&
    gamePage.workshop.get("goldOre").unlocked &&
    workshopMeta.val > 0 &&
    prices.some(res => ['minerals', 'slab'].includes(res.name))) return false;

  // Skip mineral/slab buildings when prioritizing amphitheatre
  if (amphitheatreMeta.unlocked && amphitheatreMeta.val <= 10 &&
    workshopMeta.val > 0 && metadata.name !== amphitheatreMeta.name &&
    prices.some(res => ['minerals', 'slab'].includes(res.name))) return false;

  // Skip slab buildings when prioritizing temples
  if (!gameState.solarRevolution && templeMeta.unlocked && templeMeta.val < 3 &&
    amphitheatreMeta.val > 10 && gamePage.science.get('philosophy').researched &&
    metadata.name !== templeMeta.name &&
    prices.some(res => res.name === 'slab')) return false;

  // Skip expensive science buildings before key technologies
  const pendingTechs = [
    !gamePage.science.get('astronomy').researched && gamePage.science.get('astronomy').unlocked,
    !gamePage.science.get('philosophy').researched && gamePage.science.get('philosophy').unlocked,
    !gamePage.science.get('theology').researched && gamePage.science.get('theology').unlocked
  ];

  if (pendingTechs.some(tech => tech) &&
    prices.some(res => res.name === 'science' && res.val > 1000)) return false;

  return true;
}

/**
 * Purchases a building and logs the action
 */
function buyBuilding(building, controller, model) {
  controller.buyItem(model, {}, function(result) {
    if (result) {
      building.update();
      gamePage.msg('Build: ' + building.model.name);
    }
  });
}

// Build space stuff automatically
function autoSpace() {
  if (!gamePage.spaceTab.visible) {
    return; // Exit early if space tab isn't visible
  }

  gamePage.tabs[6].update();

  // Build space buildings
  buildSpaceBuildings();

  // Build space programs
  buildSpacePrograms();
}

/**
 * Attempts to build available space buildings
 */
function buildSpaceBuildings() {
  for (let panelIndex = 0; panelIndex < gamePage.tabs[6].planetPanels.length; panelIndex++) {
    try {
      const spaceBuildings = gamePage.tabs[6].planetPanels[panelIndex].children;

      for (let buildingIndex = 0; buildingIndex < spaceBuildings.length; buildingIndex++) {
        const building = spaceBuildings[buildingIndex];

        if (!building.model.metadata.unlocked) {
          continue;
        }

        if (shouldSkipBuilding(building)) {
          continue;
        }

        // Skip buildings that provide kittens during Iron Will mode
        if (gamePage.ironWill && building.model.metadata.effects.maxKittens) {
          continue;
        }

        // Buy the building
        building.controller.buyItem(building.model, {}, function(result) {
          if (result) {
            building.update();
            gamePage.msg('Build in Space: ' + building.model.name);
          }
        });
      }
    } catch(err) {
      console.log(err);
    }
  }
}

/**
 * Determines if a building should be skipped based on resource constraints
 */
function shouldSkipBuilding(building) {
  const model = building.model;
  const buildingName = model.metadata.name;
  const prices = model.prices;

  // Skip buildings that require relic, time crystal, or void if CollectResBReset switch is on
  if (switches['CollectResBReset'] &&
    prices.some(res => ['relic', 'timeCrystal', 'void'].includes(res.name))) {
    return true;
  }

  // Skip antimatter buildings if relic station is unlocked but not researched
  // and we don't have enough antimatter during non-energy challenges
  if (gamePage.workshop.get("relicStation").unlocked &&
    !gamePage.workshop.get("relicStation").researched &&
    prices.some(res => res.name === 'antimatter') &&
    !gamePage.challenges.isActive("energy") &&
    gamePage.resPool.get("antimatter").value < gamePage.resPool.get("antimatter").maxValue) {
    return true;
  }

  // Skip certain space buildings before void space is researched when unobtainium is low
  const criticalBuildings = ["hydroponics", "moonBase", "sunlifter", "cryostation", "heatsink"];
  if (!gamePage.science.get('voidSpace').researched &&
    criticalBuildings.includes(buildingName)) {

    const eludiumPrice = prices.find(res => res.name === "eludium");
    const unobtainiumResource = gamePage.resPool.get("unobtainium");

    if ((eludiumPrice === undefined || eludiumPrice.val > 500) &&
      unobtainiumResource.value < unobtainiumResource.maxValue * 0.5) {
      return true;
    }
  }

  // Skip moonBase when unobtainium is low and cost exceeds available eludium
  if (buildingName === "moonBase") {
    const unobtainiumPrice = prices.find(res => res.name === "unobtainium");
    const unobtainiumResource = gamePage.resPool.get("unobtainium");
    const eludiumResource = gamePage.resPool.get("eludium");

    if (unobtainiumResource.value < unobtainiumResource.maxValue * 0.5 &&
      unobtainiumPrice && unobtainiumPrice.val > eludiumResource.value) {
      return true;
    }
  }

  // Skip hydroponics when unobtainium cost exceeds available eludium
  if (buildingName === "hydroponics") {
    const unobtainiumPrice = prices.find(res => res.name === "unobtainium");
    const eludiumResource = gamePage.resPool.get("eludium");

    if (unobtainiumPrice && unobtainiumPrice.val > eludiumResource.value) {
      return true;
    }
  }

  return false;
}

/**
 * Attempts to research available space programs
 */
function buildSpacePrograms() {
  const spacePrograms = gamePage.tabs[6].GCPanel.children;

  for (let programIndex = 0; programIndex < spacePrograms.length; programIndex++) {
    const program = spacePrograms[programIndex];

    if (program.model.metadata.unlocked && program.model.on === 0) {
      try {
        program.controller.buyItem(program.model, {}, function(result) {
          if (result) {
            program.update();
            gamePage.msg('Research Space program: ' + program.model.name);
          }
        });
      } catch(err) {
        console.log(err);
      }
    }
  }
}

let embRefreshCnt = 0;
let sciencePriority = [null, []];

/**
 * Calculate the selling ratio for a resource
 */
function calcSellRatio(res) {
  const resource = gamePage.resPool.get(res.name);
  let ratio = 0;

  // Check building priority
  if (craftPriority[0].length > 0) {
    const buildingPrices = gamePage.bld.getPrices(craftPriority[0]);
    const requiredResource = buildingPrices.find(r => r.name === res.name);

    if (requiredResource && requiredResource.val > resource.value) {
      return { name: res.name, ratio: 0 };
    }
  }

  // Check science priority
  if (sciencePriority[0] !== null) {
    const scienceResource = sciencePriority[1].find(r => r.name === res.name);

    if (scienceResource && scienceResource.val > resource.value) {
      return { name: res.name, ratio: -1 };
    }
  }

  // Calculate ratio based on resource max value
  if (resource.maxValue !== 0) {
    ratio = resource.value / resource.maxValue * resource.value;
  } else {
    ratio = 0.1 * resource.value;
  }

  return { name: res.name, ratio };
}

/**
 * Check if time crystal retrieval is possible and set message
 */
function checkTimeRetrieval() {
  const timeCrystals = gamePage.resPool.get("timeCrystal");
  const cfPanel = gamePage.timeTab.cfPanel.children[0].children[6].model;

  if (!gamePage.time.meta[0].meta[5].unlocked) return false;

  const requiredCrystals = cfPanel.prices.find(res => res.name === "timeCrystal").val;
  const currentLevel = cfPanel.metadata.val;
  const threshold = currentLevel > 3 ? 0.9 : 0.05;

  if (timeCrystals.value > requiredCrystals * threshold) {
    const percentage = Math.round((timeCrystals.value / requiredCrystals) * 100);
    GlobalMsg["ressourceRetrieval"] = `${cfPanel.metadata.label}(${currentLevel + 1}) ${percentage}%`;
    return true;
  }

  GlobalMsg["ressourceRetrieval"] = '';
  return false;
}

/**
 * Trade with Leviathans based on current game state
 */
function tradeWithLeviathans() {
  const leviathans = gamePage.diplomacy.get('leviathans');
  if (!leviathans.unlocked || leviathans.duration === 0) return;

  const unobtainium = gamePage.resPool.get('unobtainium');
  const timeCrystal = gamePage.resPool.get('timeCrystal');
  const eludium = gamePage.resPool.get('eludium');

  // Handle time crystal trades
  if (gamePage.time.meta[0].meta[5].val === 0 &&
    timeCrystal.value < (gamePage.bld.getBuildingExt('chronosphere').meta.val < 10 ?
      Chronosphere10SummPrices()["timeCrystal"] : 6)) {
    if (unobtainium.value > 5000) {
      gamePage.diplomacy.tradeMultiple(game.diplomacy.get("leviathans"), 1);
    }
    return;
  }

  // Check for unobtainium surplus
  if (unobtainium.value <= 5000) return;

  // Calculate trade amount
  const tradeAmount = Math.min(
    gamePage.diplomacy.getMaxTradeAmt(leviathans),
    Math.max(Math.floor(unobtainium.value / 5000), 1)
  );

  // Handle different trading strategies
  if (checkTimeRetrieval()) {
    // Trade for time crystals if close to next resource retrieval
    gamePage.diplomacy.tradeAll(leviathans);
  } else if (!switches['CollectResBReset'] &&
    gamePage.space.getBuilding('sunlifter').unlocked &&
    timeCrystal.value >= Chronosphere10SummPrices()['timeCrystal'] &&
    gamePage.space.meta[5].meta[0].val < 30) {
    // Maximize sunlifter level (best effort)
    // No trade action needed
  } else if (switches['CollectResBReset'] && timeCrystal.value < 1500) {
    gamePage.diplomacy.tradeMultiple(leviathans, tradeAmount);
  } else if (!switches['CollectResBReset'] &&
    gamePage.bld.getBuildingExt('chronosphere').meta.val >= 10 &&
    timeCrystal.value <= eludium.value / 5) {
    gamePage.diplomacy.tradeMultiple(leviathans, tradeAmount);
  }

  // Handle feeding elders
  handleFeedingElders();
}

/**
 * Handle feeding elders with necrocorns
 */
function handleFeedingElders() {
  const leviathans = gamePage.diplomacy.get("leviathans");
  const necrocorn = gamePage.resPool.get("necrocorn");
  const marker = gamePage.religion.getZU("marker");

  if (leviathans.energy >= gamePage.diplomacy.getMarkerCap()) return;

  const necrocornsNeeded = gamePage.religion.meta[0].meta[8].val > 0
    ? (leviathans.energy + 1) * 10
    : Math.ceil(leviathans.energy / 10) + 1;

  if (necrocorn.value > necrocornsNeeded &&
    leviathans.energy < (marker.val * 5 + 5)) {
    gamePage.diplomacy.feedElders();
  }
}

/**
 * Handle trading with Dragons
 */
function tradeWithDragons() {
  const dragons = gamePage.diplomacy.get('dragons');
  if (!dragons.unlocked) return;

  const titanium = gamePage.resPool.get('titanium');
  const uranium = gamePage.resPool.get('uranium');
  const gold = gamePage.resPool.get('gold');
  const paragon = gamePage.resPool.get('paragon');

  if ((titanium.value > 5000 || gamePage.bld.getBuildingExt('reactor').meta.val > 0) &&
    uranium.value < Math.min(paragon.value, 100) &&
    gold.value < gold.maxValue * 0.95) {
    gamePage.diplomacy.tradeAll(dragons, 1);
  }
}

/**
 * Handle building embassies
 */
function buildEmbassies() {
  const culture = gamePage.resPool.get('culture');

  // Skip if not enough culture or in pacifism challenge
  if ((culture.value < 10000 && culture.value < culture.maxValue) &&
    !gamePage.challenges.isActive("pacifism")) {
    return;
  }

  // Refresh embassy panel occasionally
  embRefreshCnt += 1;
  if (embRefreshCnt >= 10) {
    gamePage.diplomacyTab.render();
    embRefreshCnt = 0;
  }

  // Find embassy buttons for races with unlocked trading
  const embassyButtons = gamePage.diplomacyTab.racePanels.filter(emb =>
    emb.race.unlocked &&
    emb.embassyButton !== null &&
    !emb.embassyButton.model.resourceIsLimited
  );

  if (embassyButtons.length > 0) {
    // Sort by embassy level and build the lowest one
    const lowestEmbassyRace = embassyButtons.sort((a, b) =>
      a.race.embassyLevel - b.race.embassyLevel
    )[0];

    lowestEmbassyRace.embassyButton.controller.buyItem(
      lowestEmbassyRace.embassyButton.model,
      {},
      result => {
        if (result) {
          lowestEmbassyRace.embassyButton.update();
        }
      }
    );
  }
}

/**
 * Handle blackcoin speculation
 */
function handleBlackcoinSpeculation() {
  const leviathans = gamePage.diplomacy.get('leviathans');
  if (!leviathans.unlocked || leviathans.duration === 0) return;

  const blackchain = gamePage.science.get("blackchain");
  const blackcoin = gamePage.resPool.get("blackcoin");
  const relic = gamePage.resPool.get("relic");

  // Skip if blackchain not researched and no blackcoins
  if (!blackchain.researched && blackcoin.value <= 0) return;

  // Sell blackcoins at high price
  if (blackcoin.value > 0 && gamePage.calendar.cryptoPrice > 1090) {
    gamePage.diplomacy.sellBcoin();
  }

  // Buy blackcoins at low price if not saving for reset
  if (!switches['CollectResBReset'] &&
    relic.value > (1000 + blackcoin.value * 1000) &&
    gamePage.calendar.cryptoPrice < 1000) {
    gamePage.diplomacy.buyBcoin();
  }
}

/**
 * Determine if trading should be active based on game conditions
 * @return {Boolean} Whether trading should be active
 */
function shouldTradeBeActive() {
  const gold = gamePage.resPool.get('gold');

  // Solar Revolution is active
  if (gamePage.religion.getRU('solarRevolution').val === 1) return true;

  // Atheism or Pacifism challenge with sufficient gold or mint
  if ((gamePage.challenges.isActive("atheism") || gamePage.challenges.isActive("pacifism")) &&
    (gold.value > 550 || gamePage.bld.getBuildingExt('mint').meta.val > 0)) {
    return true;
  }

  // Gold is at max capacity and max is low
  if (gold.value === gold.maxValue && gold.maxValue < 500) return true;

  // Iron Will is active
  if (gamePage.ironWill) return true;

  return false;
}

/**
 * Check if it's a good time to trade based on resource levels
 * @return {Boolean} Whether it's a good time to trade
 */
function isGoodTimeToTrade() {
  const gold = gamePage.resPool.get('gold');
  const blueprint = gamePage.resPool.get('blueprint');
  const solarRev = gamePage.religion.getRU('solarRevolution').val;
  const mint = gamePage.bld.getBuildingExt('mint').meta.val;
  const accelerator = gamePage.bld.getBuildingExt('accelerator').meta.val;
  const transcendence = gamePage.religion.getRU("transcendence").on;

  // Gold is near max capacity
  if (gold.value > gold.maxValue * 0.95) return true;

  // Have mint and sufficient gold
  if (mint > 0 && gold.value > (accelerator < 1 ? 90 : Math.min(accelerator * 1000, 10000))) {
    return true;
  }

  // Transcendence is active
  if (transcendence) return true;

  // Atheism or Pacifism challenge with sufficient gold
  if ((gamePage.challenges.isActive("atheism") || gamePage.challenges.isActive("pacifism")) &&
    gold.value > 500) {
    return true;
  }

  // Iron Will with sufficient gold
  if (gamePage.ironWill && gold.value > (solarRev === 1 ? 15 : 600)) return true;

  // Low blueprints with Solar Revolution and sufficient gold
  if (blueprint.value < 300 && solarRev === 1 && gold.value > 90) return true;

  return false;
}

/**
 * Trade with regular races based on resource needs
 */
function tradeWithRegularRaces() {
  const tradersData = [
    ['zebras', gamePage.diplomacy.get('zebras')],
    ['griffins', gamePage.diplomacy.get('griffins')],
    ['lizards', gamePage.diplomacy.get('lizards')],
    ['sharks', gamePage.diplomacy.get('sharks')],
    ['nagas', gamePage.diplomacy.get('nagas')],
    ['spiders', gamePage.diplomacy.get('spiders')],
    ['dragons', gamePage.diplomacy.get('dragons')]
  ];

  // Prepare traders with calculated selling ratios
  const traders = tradersData
    .filter(([name, race]) => {
      if (!race.unlocked) return false;

      const buyResource = race.buys[0];
      const resource = gamePage.resPool.get(buyResource.name);

      return buyResource.val <= resource.value &&
        resource.value >= (resource.maxValue !== 0 ? resource.maxValue * 0.01 : 0);
    })
    .map(([name, race]) => {
      // Calculate selling ratios
      const sells = race.sells
        .filter(sell => gamePage.diplomacy.isValidTrade(sell, race))
        .map(calcSellRatio);

      // Special case for zebras to add titanium
      if (name === 'zebras') {
        sells.push(calcSellRatio({ name: "titanium" }));
      }

      sells.sort((a, b) => a.ratio - b.ratio);

      return [name, race.buys, sells];
    });

  // Sort by lowest sell ratio and get the best trade
  if (traders.length === 0) return;

  const bestTrade = traders.sort((a, b) => a[2][0].ratio - b[2][0].ratio)[0];
  const raceName = bestTrade[0];
  const race = gamePage.diplomacy.get(raceName);

  if (gamePage.ironWill) {
    // Special case for griffins in Iron Will mode
    if (raceName === 'griffins') {
      const buyResource = bestTrade[1][0];
      const resource = gamePage.resPool.get(buyResource.name);

      if (resource.value > resource.maxValue * 0.8) {
        const tradeAmount = Math.floor(gamePage.diplomacy.getMaxTradeAmt(race) / 10);
        gamePage.diplomacy.tradeMultiple(race, tradeAmount);
        return;
      }
    }

    gamePage.diplomacy.tradeAll(race);
  } else {
    // Special case for nagas when ivory is low
    if (raceName === 'nagas') {
      const ivory = gamePage.resPool.get('ivory');
      const slab = gamePage.resPool.get('slab');

      if (ivory.value < slab.value) {
        return; // Skip trading with nagas
      }
    }

    gamePage.diplomacy.tradeAll(race);
  }
}

/**
 * Main function to handle all automated trading
 */
function autoTrade() {
  GlobalMsg["ressourceRetrieval"] = '';

  // Check for time crystal retrieval
  checkTimeRetrieval();

  // Trade with leviathans and dragons
  tradeWithLeviathans();
  tradeWithDragons();

  // Handle building embassies
  buildEmbassies();

  // Handle blackcoin speculation
  handleBlackcoinSpeculation();

  // Only proceed with regular trading if conditions are met
  if (!shouldTradeBeActive() || !isGoodTimeToTrade()) return;

  // Ensure diplomacy tab is rendered if necessary
  if (gamePage.diplomacyTab.racePanels.length !==
    gamePage.diplomacy.races.filter(race => race.unlocked).length) {
    gamePage.diplomacyTab.render();
  }

  // Handle leviathan-specific trading
  if (gamePage.diplomacy.get('leviathans').unlocked &&
    gamePage.diplomacy.get('leviathans').duration !== 0) {
    tradeWithLeviathans();
  }

  // Trade with regular races
  tradeWithRegularRaces();
}

/**
 * Automatically hunts when catpower is near maximum or resources are low
 * Hunts when either:
 * 1. Catpower is above 90% of maximum capacity
 * 2. Furs and ivory are less than 2% of maximum catpower
 */
function autoHunt() {
  const gameResources = gamePage.resPool;
  const catpower = gameResources.get('manpower');

  // Skip hunting if pacifism challenge is active
  if (gamePage.challenges.isActive("pacifism")) {
    return;
  }

  // Get current fur and ivory amounts
  const furs = gameResources.get('furs').value;
  const ivory = gameResources.get('ivory').value;
  const lowerResourceValue = Math.min(furs, ivory);

  // Calculate resource-to-catpower ratio
  const resourceRatio = lowerResourceValue / catpower.maxValue;
  const catpowerRatio = catpower.value / catpower.maxValue;

  // Hunt if catpower is high or resources are low
  if (catpowerRatio > 0.9 || resourceRatio < 0.02) {
    gamePage.village.huntAll();
  }
}

/**
 * Buildings that should be given a very low priority factor.
 */
const NOT_PRIORITY_BLD_NAMES = [
  "temple","tradepost","aiCore","unicornPasture","chronosphere","mint",
  "chapel","zebraOutpost","zebraWorkshop","zebraForge","brewery","accelerator",
  "ivoryTemple"
];

/**
 * Workshop upgrades with special resource thresholds to gather.
 * Each entry has the form:
 *   [ workshopUpgradeObject, [ [resName, amountNeeded], ... ] ]
 */
const WORKSHOP_UPGRADES_CRAFT = [
  [ gamePage.workshop.get("printingPress"),     [ ["gear", 45 * 1.2] ] ],
  [ gamePage.workshop.get("fluidizedReactors"), [ ["alloy", 200 * 1.2] ] ],
  [ gamePage.workshop.get("oxidation"),         [ ["steel", 5000 * 1.2] ] ],
  [ gamePage.workshop.get("miningDrill"),       [ ["steel", 750 * 1.2] ] ],
  [ gamePage.workshop.get("steelPlants"),       [ ["gear", 750 * 1.2] ] ],
  [ gamePage.workshop.get("rotaryKiln"),        [ ["gear", 500 * 1.2] ] ]
];

/**
 * Current building priority data:
 *   [ buildingName, buildingPrices, currentBldLevel, neededResourceNames ]
 */
let craftPriority = [[], [], 0, []];

/**
 * Tracks auto-crafting attempts and needed resources:
 *  - craftAttemptsCount:  how many times we've tried crafting
 *                         for the current building priority
 *  - neededResources:     an object (map) of resource -> amount needed
 */
const autoCraftState = {
  craftAttemptsCount: 0,
  neededResources: {}
};

/**
 * Returns an array of resource definitions as objects.
 * Each object has:
 *   - name:         resource identifier
 *   - ingredients:  array of { name, amount } describing
 *                   what is needed per craft
 *   - computeTarget: function returning how many units
 *                    the script wants to craft (dynamic)
 *   - canCraft:     boolean or function returning whether
 *                   crafting this resource is allowed
 *   - isActive:     boolean or function returning whether
 *                   the resource is "active" by default
 */
function getResourceDefinitions() {
  const ratio = gamePage.getCraftRatio() + 1;

  return [
    {
      name: "beam",
      ingredients: [ { name: "wood", amount: 175 } ],
      computeTarget: () => {
        const wood = gamePage.resPool.get("wood").value;
        return Math.min((wood / 175) * ratio, 50000);
      },
      canCraft: () => true,
      isActive: () => true
    },
    {
      name: "slab",
      ingredients: [ { name: "minerals", amount: 250 } ],
      computeTarget: () => {
        const minerals = gamePage.resPool.get("minerals").value;
        return Math.min((minerals / 250) * ratio, 50000);
      },
      canCraft: () => !gamePage.ironWill,
      isActive: () => true
    },
    {
      name: "steel",
      ingredients: [
        { name: "iron", amount: 100 },
        { name: "coal", amount: 100 }
      ],
      computeTarget: () => {
        const ironVal = gamePage.resPool.get("iron").value;
        const coalVal = gamePage.resPool.get("coal").value;
        const fromIron = (ironVal / 100) * ratio;
        const fromCoal = (coalVal / 100) * ratio;
        const base     = Math.min(fromIron, fromCoal);
        const limited  = Math.max(base, 75);
        return Math.min(limited, 50000);
      },
      canCraft: () => true,
      isActive: () => true
    },
    {
      name: "plate",
      ingredients: [ { name: "iron", amount: 125 } ],
      computeTarget: () => {
        const ironVal   = gamePage.resPool.get("iron").value;
        const plateVal  = gamePage.resPool.get("plate").value;
        const titanVal  = gamePage.resPool.get("titanium").value;
        const reacUnlocked = gamePage.bld.getBuildingExt("reactor").meta.unlocked;
        const reacCost  = gamePage.bld.getPrices("reactor");
        const storageLimited = gamePage.resPool.isStorageLimited(reacCost);

        if (reacUnlocked && !storageLimited) {
          if (gamePage.ironWill) {
            return 15;
          }
          if (plateVal < 200) {
            return 200;
          }
          if (titanVal > 300) {
            // reacCost[1].val is typically titanium cost for reactor
            return reacCost[1].val;
          }
          return 200;
        } else {
          if (gamePage.ironWill) {
            return 15;
          }
          if (plateVal < 150 && gamePage.science.get("navigation").researched) {
            return 150;
          }
          return Math.min((ironVal / 125) * ratio, 50000);
        }
      },
      canCraft: () => true,
      isActive: () => true
    },
    {
      name: "concrate",
      ingredients: [
        { name: "steel", amount: 25 },
        { name: "slab",  amount: 2500 }
      ],
      computeTarget: () => {
        if (gamePage.resPool.get("eludium").value > 125) {
          return gamePage.resPool.get("steel").value;
        }
        return 0;
      },
      canCraft: () => true,
      isActive: () => true
    },
    {
      name: "gear",
      ingredients: [ { name: "steel", amount: 15 } ],
      computeTarget: () => 25,
      canCraft: () => true,
      isActive: () => true
    },
    {
      name: "alloy",
      ingredients: [
        { name: "steel",    amount: 75 },
        { name: "titanium", amount: 10 }
      ],
      computeTarget: () => {
        const steelVal = gamePage.resPool.get("steel").value;
        const titanVal = gamePage.resPool.get("titanium").value;
        const eludVal  = gamePage.resPool.get("eludium").value;
        const baseSteel = (steelVal / 75) * ratio;
        const baseTitan = (titanVal / 10) * ratio;

        if (eludVal > 125) {
          return steelVal;
        }
        if (titanVal < 20) {
          return 0;
        }
        const geodesyBonus = gamePage.workshop.get("geodesy").researched ? 50 : 0;
        const fromBoth = Math.min(baseSteel, baseTitan);
        const clamp    = Math.max(fromBoth, geodesyBonus);
        return Math.min(clamp, 1000);
      },
      canCraft: () => true,
      isActive: () => true
    },
    {
      name: "eludium",
      ingredients: [
        { name: "unobtainium", amount: 1000 },
        { name: "alloy",       amount: 2500 }
      ],
      computeTarget: () => {
        const eludVal = gamePage.resPool.get("eludium").value;
        if (eludVal < 125) {
          return 125;
        }
        if (gamePage.bld.getBuildingExt("chronosphere").meta.val < 10) {
          return 125;
        }
        if (eludVal < 500) {
          return 500;
        }
        const unobVal = gamePage.resPool.get("unobtainium").value;
        const unobMax = gamePage.resPool.get("unobtainium").maxValue;
        const tcVal   = gamePage.resPool.get("timeCrystal").value;
        const nearFull = unobVal > unobMax * 0.9;
        const bigCheck = unobVal >= Math.max(
          eludVal,
          tcVal > 1000000
          ? unobMax * 0.3
          : (eludVal < 100000 ? 200000 : unobMax * 0.1)
        );
        if (nearFull || bigCheck) {
          return (tcVal * 2 + 1);
        }
        return 0;
      },
      canCraft: () => true,
      isActive: () => true
    },
    {
      name: "scaffold",
      ingredients: [ { name: "beam", amount: 50 } ],
      computeTarget: () => 0,
      canCraft: () => true,
      isActive: () => true
    },
    {
      name: "ship",
      ingredients: [
        { name: "scaffold",  amount: 100 },
        { name: "plate",     amount: 150 },
        { name: "starchart", amount: 25 }
      ],
      computeTarget: () => {
        if (!gamePage.workshop.get("geodesy").researched) {
          return 100;
        }
        const starVal = gamePage.resPool.get("starchart").value;
        const shipVal = gamePage.resPool.get("ship").value;
        if (starVal > 600 || shipVal > 500) {
          return Math.min(
            gamePage.resPool.get("plate").value,
            100 + (starVal - 500) / 25
          );
        }
        return 100;
      },
      canCraft: () => true,
      isActive: () => true
    },
    {
      name: "tanker",
      ingredients: [
        { name: "ship",      amount: 200 },
        { name: "kerosene",  amount: gamePage.resPool.get("oil").maxValue * 2 },
        { name: "alloy",     amount: 1250 },
        { name: "blueprint", amount: 5 }
      ],
      computeTarget: () => 0,
      canCraft: () => true,
      isActive: () => true
    },
    {
      name: "kerosene",
      ingredients: [ { name: "oil", amount: 7500 } ],
      computeTarget: () => {
        const oilVal = gamePage.resPool.get("oil").value;
        return Math.min((oilVal / 7500) * ratio, 50000);
      },
      canCraft: () => true,
      isActive: () => true
    },
    {
      name: "parchment",
      ingredients: [ { name: "furs", amount: 175 } ],
      computeTarget: () => {
        if (gamePage.resPool.get("starchart").value <= 1) {
          return 0;
        }
        if (gamePage.religion.getRU("solarRevolution").val === 1) {
          return gamePage.resPool.get("furs").value / 3;
        }
        return 100;
      },
      canCraft: () => true,
      isActive: () => true
    },
    {
      name: "manuscript",
      ingredients: [
        { name: "parchment", amount: 25 },
        { name: "culture",   amount: 400 }
      ],
      computeTarget: () => {
        if (gamePage.ironWill) {
          const cultureVal = gamePage.resPool.get("culture").value;
          const nagaUnlocked = gamePage.diplomacy.get("nagas").unlocked;
          return (cultureVal > 1600 || nagaUnlocked) ? 50 : 0;
        }
        if (
          gamePage.religion.getRU("solarRevolution").val === 1 &&
          gamePage.resPool.get("culture").value >= gamePage.resPool.get("culture").maxValue
        ) {
          return gamePage.resPool.get("parchment").value / 3;
        }
        return 200;
      },
      canCraft: () => true,
      isActive: () => {
        if (gamePage.ironWill) {
          return (
            gamePage.resPool.get("culture").value > 1600 ||
            gamePage.diplomacy.get("nagas").unlocked
          );
        }
        return true;
      }
    },
    {
      name: "compedium",
      ingredients: [
        { name: "manuscript", amount: 50 },
        { name: "science",    amount: 10000 }
      ],
      computeTarget: () => {
        if (gamePage.ironWill) {
          if (gamePage.science.get("astronomy").researched) {
            return Math.min(
              (gamePage.resPool.get("science").value / 10000) * ratio,
              1500
            );
          }
          return 0;
        }
        if (gamePage.religion.getRU("solarRevolution").val === 1) {
          return gamePage.resPool.get("manuscript").value / 3;
        }
        return 110;
      },
      canCraft: () => true,
      isActive: () => {
        return gamePage.resPool.get("manuscript").value > 200;
      }
    },
    {
      name: "blueprint",
      ingredients: [
        { name: "compedium", amount: 25 },
        { name: "science",   amount: 25000 }
      ],
      computeTarget: () => 0,
      canCraft: () => true,
      isActive: () => {
        return gamePage.resPool.get("compedium").value > 200;
      }
    },
    {
      name: "thorium",
      ingredients: [ { name: "uranium", amount: 250 } ],
      computeTarget: () => {
        const uraVal = gamePage.resPool.get("uranium").value;
        return Math.min((uraVal / 250) * ratio, 50000);
      },
      canCraft: () => true,
      isActive: () => true
    },
    {
      name: "megalith",
      ingredients: [
        { name: "slab",  amount: 50 },
        { name: "beam",  amount: 25 },
        { name: "plate", amount: 5 }
      ],
      computeTarget: () => 0,
      canCraft: () => true,
      isActive: () => {
        return gamePage.resPool.get("manuscript").value > 300;
      }
    },
    {
      name: "tMythril",
      ingredients: [
        { name: "bloodstone", amount: 5 },
        { name: "ivory",      amount: 1000 },
        { name: "titanium",   amount: 500 }
      ],
      computeTarget: () => 5,
      canCraft: () => true,
      isActive: () => {
        return gamePage.ironWill && gamePage.resPool.get("tMythril").value < 5;
      }
    }
  ];
}

/**
 * Converts the array of resource-definition objects into
 * the array-of-arrays structure the rest of the script expects:
 *   [
 *     resourceName,
 *     [ [ingName, ingAmt], ... ],
 *     target,
 *     canCraftBoolean,
 *     isActiveBoolean
 *   ]
 */
function getResourcesAll() {
  const defs = getResourceDefinitions();
  return defs.map(def => {
    const ingArray = def.ingredients.map(ing => [ing.name, ing.amount]);
    return [
      def.name,
      ingArray,
      def.computeTarget(),
      def.canCraft(),
      def.isActive()
    ];
  });
}

/**
 * Returns a numeric factor indicating how strongly the script
 * prioritizes each building.
 */
function getPriorityFactorForBuilding(bldName) {
  // If it's in NOT_PRIORITY_BLD_NAMES, return a minimal factor
  if (NOT_PRIORITY_BLD_NAMES.includes(bldName)) {
    return 0.00000001;
  }

  // Each case returns a factor reflecting urgency.
  switch (bldName) {
    case "hut":
      return gamePage.science.get("agriculture").researched
        ? (
          gamePage.bld.getBuildingExt("mine").meta.val > 0
          ? 7 * (
            (gamePage.resPool.get("paragon").value > 200 || gamePage.village.getKittens() > 70)
            ? 1
            : (
              !gamePage.challenges.anyChallengeActive() &&
              gamePage.religion.getRU("solarRevolution").val === 1 &&
              gamePage.resPool.get("paragon").value < 200
            )
            ? 10
            : 2
          )
          : 5
        )
        : 1;

    case "logHouse":
      return 7 * (
        (gamePage.resPool.get("paragon").value > 200 || gamePage.village.getKittens() > 70)
        ? 1
        : (
          !gamePage.challenges.anyChallengeActive() &&
          gamePage.religion.getRU("solarRevolution").val === 1 &&
          gamePage.resPool.get("paragon").value < 200
        )
        ? 10
        : 2
      );

    case "mansion":
      return (
        (gamePage.resPool.get("titanium").value > 300 &&
          (gamePage.resPool.get("steel").value > 300 || gamePage.bld.getBuildingExt("mansion").meta.val > 10))
        ? 1.5
        : 0.00000001
      );

    case "steamworks":
      return (
        (gamePage.challenges.isActive("pacifism") && gamePage.bld.getBuildingExt("steamworks").meta.val < 5)
        ? 50
        : (
          gamePage.bld.getBuildingExt("magneto").meta.val > 0
          ? 2
          : 0.00000001
        )
      );

    case "magneto":
      return (gamePage.bld.getBuildingExt("magneto").meta.val > 10) ? 2 : 0.00000001;

    case "factory":
      return (
        (gamePage.resPool.get("titanium").value > 300 &&
          gamePage.bld.getBuildingExt("magneto").meta.val > 10)
        ? 3
        : 0.00000001
      );

    case "reactor":
      return (gamePage.bld.getBuildingExt("magneto").meta.val > 10) ? 10 : 0.00000001;

    case "warehouse":
      return (gamePage.bld.getBuildingExt("warehouse").meta.stage === 1) ? 0 : 0.0001;

    case "quarry":
      return (gamePage.bld.getBuildingExt("quarry").meta.val < 5) ? 10 : 1.1;

    case "harbor":
      return (
        (gamePage.bld.getBuildingExt("harbor").meta.val > 100 ||
          (gamePage.resPool.get("ship").value > 0 &&
            gamePage.resPool.get("plate").value >
            gamePage.bld.getPrices("harbor").filter(res => res.name === "plate")[0].val
          )
        )
        ? 1
        : 0.0001
      );

    case "smelter":
      return (
        (gamePage.bld.getBuildingExt("amphitheatre").meta.val > 0)
        ? (
          (gamePage.religion.getRU("solarRevolution").val === 0)
          ? (
            (gamePage.resPool.get("gold").value < 500 &&
              gamePage.bld.getBuildingExt("smelter").meta.on === gamePage.bld.getBuildingExt("smelter").meta.val
            )
            ? 100
            : 5
          )
          : 5
        )
        : (gamePage.challenges.isActive("pacifism") ? 100 : 0.0001)
      );

    case "observatory":
      return (
        (!gamePage.challenges.isActive("blackSky") &&
          gamePage.resPool.get("ship").value === 0 &&
          gamePage.religion.getRU("solarRevolution").val === 1
        )
        ? 100
        : (
          (gamePage.resPool.get("ship").value === 0 &&
            gamePage.bld.getBuildingExt("observatory").meta.val > 10 &&
            gamePage.resPool.get("starchart").value >= 25
          )
          ? 0.00000001
          : (
            (gamePage.religion.getRU("solarRevolution").val === 1 || gamePage.challenges.isActive("atheism"))
            ? 0.5
            : 0.0001
          )
        )
      );

    case "oilWell":
      return (
        (gamePage.bld.getBuildingExt("oilWell").meta.val === 0 &&
          gamePage.resPool.get("coal").value > 0)
        ? 10
        : (gamePage.resPool.get("oil").value < 500 ? 1 : 0.01)
      );

    case "lumberMill":
      {
        const ironPrice = gamePage.bld.getPrices("lumberMill")
        .filter(r => r.name === "iron")[0].val;
        if (ironPrice + 150 <= gamePage.resPool.get("iron").value) {
          return 1;
        } else {
          return (
            (gamePage.religion.getRU("solarRevolution").val === 1 ? 0.005 : 0.0001) *
            (gamePage.resPool.get("paragon").value > 200 ? 1 : 2)
          );
        }
      }

    case "calciner":
      {
        const val       = gamePage.bld.getBuildingExt("calciner").meta.val;
        const oilNeeded = gamePage.bld.getPrices("calciner").filter(r => r.name === "oil")[0].val;
        if (
          (gamePage.resPool.get("titanium").value > 0 &&
            (val > 10 || gamePage.resPool.get("oil").value > oilNeeded)) ||
          gamePage.challenges.isActive("blackSky")
        ) {
          if (
            oilNeeded < gamePage.resPool.get("oil").maxValue * 0.3 ||
            (
              gamePage.resPool.get("kerosene").value > gamePage.resPool.get("oil").maxValue * 0.4 &&
              oilNeeded < gamePage.resPool.get("kerosene").value
            )
          ) {
            return (val === 0 ? 10 : 1.1);
          }
        }
        return 0.00000001;
      }

    case "biolab":
      return (gamePage.bld.getBuildingExt("biolab").meta.val > 500) ? 1 : 0.0001;

    case "aqueduct":
      return (gamePage.bld.getBuildingExt("aqueduct").meta.stage === 1) ? 0.01 : 0.1;

    case "amphitheatre":
      return (
        (gamePage.bld.getBuildingExt("amphitheatre").meta.val === 0 &&
          gamePage.resPool.get("parchment").value > 0)
        ? 7
        : (
          (gamePage.bld.getBuildingExt("amphitheatre").meta.stage === 0 &&
            gamePage.resPool.get("parchment").value > 0)
          ? 3
          : 0.00000001
        )
      );

    case "ziggurat":
      {
        const zVal          = gamePage.bld.getBuildingExt("ziggurat").meta.val;
        const blueprintCost = gamePage.bld.getPrices("ziggurat")
        .filter(r => r.name === "blueprint")[0].val;

        if (zVal > 100) {
          return 1;
        } else if (
          zVal < 20 &&
          blueprintCost <= gamePage.resPool.get("blueprint").value &&
          gamePage.science.get("theology").researched &&
          gamePage.resPool.get("blueprint").value > 100
        ) {
          return 0.1;
        } else if (gamePage.resPool.get("blueprint").value > 500) {
          return 0.01;
        }
        return 0.00000001;
      }

    case "mine":
      return (gamePage.bld.getBuildingExt("mine").meta.val > 0)
        ? (1 * (gamePage.resPool.get("paragon").value > 200 ? 1 : 2))
        : 10;

    case "workshop":
      return (gamePage.bld.getBuildingExt("workshop").meta.val > 0) ? 2 : 10;

    case "pasture":
      return 0.0001;

    case "library":
      return (gamePage.bld.getBuildingExt("library").meta.val <= 10) ? 1 : 0.01;

    case "field":
      return (
        (gamePage.challenges.isActive("postApocalypse") &&
          gamePage.bld.getPollutionLevel() >= 5) ||
        !gamePage.science.get("engineering").researched
      )
        ? 0
        : 0.01;

    default:
      return 0.00000001;
  }
}

/**
 * Calculates how many resources are missing for a building,
 * including nested sub-crafting costs.
 */
function getMissingResourcesCost(prices, resourcesAll) {
  let total = 0;
  for (let i = 0; i < prices.length; i++) {
    const neededName = prices[i].name;
    const neededVal  = prices[i].val;
    const have       = gamePage.resPool.get(neededName).value;

    let resSum = 1;
    if (neededVal > have) {
      const missing = neededVal - have;
      for (let r = 0; r < resourcesAll.length; r++) {
        if (neededName === resourcesAll[r][0]) {
          resSum = 1;
          for (let s = 0; s < resourcesAll[r][1].length; s++) {
            const subName   = resourcesAll[r][1][s][0];
            const subAmount = resourcesAll[r][1][s][1];
            let subResSum   = 1;

            let differ2 = (subAmount * missing) / (gamePage.getCraftRatio() + 1)
              - gamePage.resPool.get(subName).value;
            if (differ2 < 0) {
              differ2 = 0;
            }
            for (let t = 0; t < resourcesAll.length; t++) {
              if (subName === resourcesAll[t][0]) {
                for (let u = 0; u < resourcesAll[t][1].length; u++) {
                  const deeperAmt = resourcesAll[t][1][u][1];
                  subResSum += (deeperAmt * differ2) / (gamePage.getCraftRatio() + 1);
                }
              }
            }
            const directCraftCost = (subAmount * missing) / (gamePage.getCraftRatio() + 1);
            resSum += Math.max(directCraftCost, subResSum);
          }
        }
      }
      total += resSum;
    } else {
      total += resSum;
    }
  }
  return total;
}

/**
 * Returns a "score" for a building by dividing its missing
 * resource cost by the building's priority factor. Lower is better.
 */
function computeBuildingScore(priorityFactor, bldPrices, resourcesAll) {
  const missingCost = getMissingResourcesCost(bldPrices, resourcesAll);
  return missingCost / priorityFactor;
}

/**
 * Finds and returns the best next building to focus on,
 * or null if none is suitable.
 */
function findNextPriorityBuilding(resourcesAll) {
  const allBlds = gamePage.tabs[0].children.filter(child =>
    child.model.metadata &&
    child.model.metadata.unlocked &&
    !child.model.resourceIsLimited
  );

  const prior = [];
  for (let i = 0; i < allBlds.length; i++) {
    const meta    = allBlds[i].model.metadata;
    const bldName = meta.name;

    if (gamePage.ironWill && meta.effects && meta.effects.maxKittens) {
      continue;
    }
    const blueprintCost = allBlds[i].model.prices.filter(r => r.name === "blueprint");
    if (blueprintCost.length && meta.val === 0) {
      if (gamePage.resPool.get("blueprint").value < blueprintCost[0].val) {
        continue;
      }
    }

    const factor = getPriorityFactorForBuilding(bldName);
    if (factor <= 0.00000001) {
      continue;
    }
    prior.push([ factor, bldName, allBlds[i].model.prices ]);
  }

  if (!prior.length) {
    return null;
  }

  prior.sort((a, b) => {
    const scoreA = computeBuildingScore(a[0], a[2], resourcesAll);
    const scoreB = computeBuildingScore(b[0], b[2], resourcesAll);
    return scoreA - scoreB;
  });

  return {
    factor: prior[0][0],
    buildingName: prior[0][1],
    prices: prior[0][2]
  };
}

/**
 * Once a building is chosen, determines the needed resources
 * for that building. Also updates craftPriority accordingly.
 */
function updateCraftPriority(bld) {
  autoCraftState.neededResources = {};

  const bldName = bld.buildingName;
  const prices  = bld.prices;

  for (let i = 0; i < prices.length; i++) {
    const needName = prices[i].name;
    const needVal  = prices[i].val;
    const have     = gamePage.resPool.get(needName).value;

    if (needVal > have) {
      autoCraftState.neededResources[needName] = needVal;

      const resourcesAll = getResourcesAll();
      for (let r = 0; r < resourcesAll.length; r++) {
        if (needName === resourcesAll[r][0]) {
          const subIngs = resourcesAll[r][1];
          for (let s = 0; s < subIngs.length; s++) {
            const [subName, subVal] = subIngs[s];
            const subNeeded =
              (subVal * (needVal - have) - gamePage.resPool.get(subName).value) /
              (gamePage.getCraftRatio() + 1);

            if (subNeeded > 0) {
              autoCraftState.neededResources[subName] = Math.max(
                (autoCraftState.neededResources[subName] || 0),
                subNeeded,
                1
              );
            }
          }
        }
      }
    }
  }

  craftPriority = [
    bldName,
    prices,
    gamePage.bld.getBuildingExt(bldName).meta.val,
    Object.keys(autoCraftState.neededResources)
  ];
}

/**
 * Checks if certain workshop upgrades are unlocked but not researched.
 * If so, ensures their required resources are marked as needed.
 */
function handleWorkshopUpgrades(resourcesAll) {
  if (gamePage.resPool.get("ship").value <= 0) {
    return;
  }
  for (let i = 0; i < WORKSHOP_UPGRADES_CRAFT.length; i++) {
    const upgradeObj   = WORKSHOP_UPGRADES_CRAFT[i][0];
    const neededResArr = WORKSHOP_UPGRADES_CRAFT[i][1];

    if (upgradeObj.researched) {
      WORKSHOP_UPGRADES_CRAFT.splice(i,1);
      i--;
      continue;
    }
    if (!upgradeObj.unlocked) {
      continue;
    }

    let missingSomething = false;
    for (let j=0; j<neededResArr.length; j++) {
      const [reqName, reqVal] = neededResArr[j];
      const have = gamePage.resPool.get(reqName).value;
      if (have < reqVal) {
        missingSomething = true;

        // Bump resource in resourcesAll if present
        const targetRes = resourcesAll.find(r => r[0] === reqName);
        if (targetRes) {
          if (targetRes[2] < reqVal) {
            targetRes[2] = reqVal;
          }
          targetRes[4] = true;
          targetRes[3] = false;
        }
        // Store in autoCraftState
        autoCraftState.neededResources[reqName] = Math.max(
          (autoCraftState.neededResources[reqName] || 0),
          reqVal
        );
      }
    }
    if (missingSomething) {
      GlobalMsg.tech = upgradeObj.label;
      break;
    }
  }
}

/**
 * Crafts resources needed for the current building priority (and upgrades).
 */
function performPriorityCrafts(resourcesAll) {
  // Mark resources as active if they appear in autoCraftState.neededResources
  for (let i=0; i<resourcesAll.length; i++) {
    const entry = resourcesAll[i];
    const rName = entry[0];

    if (autoCraftState.neededResources[rName]) {
      const desired = autoCraftState.neededResources[rName];
      if (entry[2] < desired) {
        entry[2] = desired;
      }
      entry[4] = true;
      entry[3] = false;
    } else {
      // If sub-ingredients are needed, disable certain crafts
      for (let z=0; z<entry[1].length; z++) {
        const subName = entry[1][z][0];
        if (
          autoCraftState.neededResources[subName] &&
          !["plate", "ship", "eludium", "alloy"].includes(rName)
        ) {
          entry[3] = false;
          entry[4] = false;
        }
      }
    }
  }

  // Filter resources that are unlocked and active
  const craftableList = resourcesAll.filter(r => {
    const craftObj = gamePage.workshop.getCraft(r[0]);
    return (craftObj && craftObj.unlocked && r[4]);
  });

  // Sort by ascending current resource value
  craftableList.sort((a,b) => {
    return (
      gamePage.resPool.get(a[0]).value -
      gamePage.resPool.get(b[0]).value
    );
  });

  // Attempt to craft each up to the target
  for (let cIdx=0; cIdx<craftableList.length; cIdx++) {
    const [resName, ingArr, targetQty] = craftableList[cIdx];
    const curVal = gamePage.resPool.get(resName).value;
    if (curVal >= targetQty) {
      continue;
    }
    let canCraftCount = Infinity;
    for (const [ingName, ingAmt] of ingArr) {
      const haveIng = gamePage.resPool.get(ingName).value;
      const possible = Math.floor(haveIng / ingAmt);
      if (possible < canCraftCount) {
        canCraftCount = possible;
      }
    }
    if (canCraftCount === Infinity) {
      canCraftCount = 0;
    }

    // Special cases for certain resources
    if (resName === "ship") {
      if (
        curVal < 100 ||
        (curVal < 5000 && gamePage.workshop.get("geodesy").researched) ||
        gamePage.resPool.get("starchart").value > 1500
      ) {
        if (canCraftCount > 0) {
          gamePage.craft(resName, canCraftCount);
        }
      }
    }
    else if (resName === "kerosene") {
      if (
        gamePage.resPool.get("oil").value >= gamePage.resPool.get("oil").maxValue * 0.9 ||
        (gamePage.resPool.get("kerosene").value < 50000 &&
          gamePage.resPool.get("oil").value > 1000000)
      ) {
        if (canCraftCount > 0) {
          gamePage.craft(resName, canCraftCount);
        }
      }
    }
    else if (resName === "eludium") {
      if (canCraftCount > 0) {
        gamePage.craft(resName, canCraftCount);
      }
    }
    else {
      if (canCraftCount > 0) {
        gamePage.craft(resName, canCraftCount);
      }
    }
  }
}

/**
 * Converts resources near cap into more refined goods
 * to prevent waste.
 */
function handleOverflowCrafting() {
  const conversions = [
    ["catnip",     "wood",       50],
    ["wood",       "beam",       175],
    ["minerals",   "slab",       250],
    ["iron",       "plate",      125],
    ["oil",        "kerosene",   7500],
    ["uranium",    "thorium",    250],
    ["unobtainium","eludium",    1000],
    ["furs",       "parchment",  175]
  ];

  for (let i=0; i<conversions.length; i++) {
    const [rawName, craftName, cost] = conversions[i];
    const rawRes = gamePage.resPool.get(rawName);
    if (!rawRes) { continue; }

    const craftObj = gamePage.workshop.getCraft(craftName);
    if (!craftObj || !craftObj.unlocked) {
      continue;
    }

    const resourcePerTick = gamePage.getResourcePerTick(rawName, 0);
    const resourcePerCraftTrade = Math.max(
      Math.min(resourcePerTick * 100, rawRes.value),
      1
    );

    if (rawRes.maxValue > 0) {
      if (rawRes.value > (rawRes.maxValue - resourcePerTick * 5)) {
        const toCraft = Math.floor(resourcePerCraftTrade / cost);
        if (toCraft > 0) {
          gamePage.craft(craftName, toCraft);
        }
      }
    } else {
      const craftVal = gamePage.resPool.get(craftName).value;
      if (rawRes.value > craftVal) {
        const toCraft = Math.floor(resourcePerCraftTrade / cost);
        if (toCraft > 0) {
          gamePage.craft(craftName, toCraft);
        }
      }
    }
  }
}

/**
 * Main auto-crafting entry point.
 * - Resets global messages
 * - Rechecks resourcesAll for dynamic changes
 * - Picks/updates building priority if needed
 * - Gathers resources for workshop upgrades
 * - Crafts resources for the priority building
 * - Handles overflow conversions
 */
function autoCraft2() {
  GlobalMsg.tech  = "";
  GlobalMsg.craft = "";

  const resourcesAll = getResourcesAll();

  const currentBldName  = craftPriority[0];
  const currentBldLevel = craftPriority[2];
  let buildingLevelChanged = false;

  if (currentBldName && currentBldName.length > 0) {
    const ext = gamePage.bld.getBuildingExt(currentBldName);
    if (ext && ext.meta.val !== currentBldLevel) {
      buildingLevelChanged = true;
    }
  }

  // Decide if we need to pick a new priority
  if (
    !currentBldName || currentBldName.length === 0 ||
    autoCraftState.craftAttemptsCount === 0 ||
    autoCraftState.craftAttemptsCount > 200 ||
    buildingLevelChanged
  ) {
    const nextBld = findNextPriorityBuilding(resourcesAll);
    if (nextBld) {
      updateCraftPriority(nextBld);
      autoCraftState.craftAttemptsCount = 0;
    }
  }

  // Update user message for the current building
  if (craftPriority[0] && craftPriority[0].length > 0) {
    autoCraftState.craftAttemptsCount++;
    const bldExt = gamePage.bld.getBuildingExt(craftPriority[0]);
    if (bldExt && bldExt._metaCache) {
      GlobalMsg.craft =
        bldExt._metaCache.label + " (" + (bldExt.meta.val + 1) + "): " +
        (201 - autoCraftState.craftAttemptsCount);
    }
    if (autoCraftState.craftAttemptsCount > 200) {
      autoCraftState.craftAttemptsCount = 0;
    }
  }

  // If the Construction tab is visible, do advanced crafting
  if (gamePage.science.get("construction").researched && gamePage.tabs[3].visible) {
    handleWorkshopUpgrades(resourcesAll);
    performPriorityCrafts(resourcesAll);
    handleOverflowCrafting();
  }
}

var science_labels = ['astronomy', 'theology', 'voidSpace', 'paradoxalKnowledge', 'navigation', 'architecture', 'physics', 'chemistry', 'archeology', 'electricity', 'biology'];
var policy_lst_all = [
"liberty", "authocracy", "communism",
"socialism", "diplomacy", "zebraRelationsAppeasement",
"knowledgeSharing", "stoicism", "mysticism",
"clearCutting", "fullIndustrialization", "militarizeSpace",
"necrocracy", "expansionism", "frugality", "siphoning", "spiderRelationsGeologists", "lizardRelationsDiplomats",
"sharkRelationsMerchants", "griffinRelationsMachinists", "dragonRelationsPhysicists", "nagaRelationsCultists"
];
var policy_lst_post_apocalypse = [
"liberty", "authocracy", "communism",
"socialism", "diplomacy", "zebraRelationsAppeasement",
"knowledgeSharing", "stoicism", "mysticism",
"environmentalism", "militarizeSpace",
"necrocracy", "expansionism", "frugality", "conservation", "siphoning"
];

// Auto Research
function autoResearch() {
    if (gamePage.tabs[2].visible) {
        gamePage.tabs[2].update();
        GlobalMsg['science'] = ''
        if (science_labels.length > 0){
            for (var sc = 0; sc < science_labels.length; sc++) {
                if (gamePage.science.get(science_labels[sc]).unlocked && !gamePage.science.get(science_labels[sc]).researched){
                    GlobalMsg['science'] = gamePage.science.get(science_labels[sc]).label
                    sciencePriority = [gamePage.science.get(science_labels[sc]).label, gamePage.science.get(science_labels[sc]).prices]
                    break;
                } else if (gamePage.science.get(science_labels[sc]).researched){
                    science_labels.splice(sc, 1);
                    sciencePriority = [null,[]];
                    break;
                }
            }
        }
        var btn = gamePage.tabs[2].buttons.filter(res => res.model.metadata.unlocked && res.model.enabled && !res.model.metadata.researched);
        for (var rsc = 0; rsc < btn.length; rsc++) {
            if ((gamePage.ironWill && !['astronomy','theology'].includes(btn[rsc].model.metadata.name)) && ((!gamePage.science.get('astronomy').researched && gamePage.science.get('astronomy').unlocked ) || (!gamePage.science.get('theology').researched && gamePage.science.get('theology').unlocked)))
               {}
            else{
                try {
                    btn[rsc].controller.buyItem(btn[rsc].model, {}, function(result) {
                        if (result) {
                            btn[rsc].update();
                            gamePage.msg('Researched: ' + btn[rsc].model.name );
                            return;
                        }
                    });
                } catch(err) {
                console.log(err);
                }
            }
        }
        //policy
        if (gamePage.religion.getRU('solarRevolution').val == 1 || gamePage.resPool.get("culture").value >= 2000){
            var policy_lst = !gamePage.challenges.isActive("postApocalypse") ? policy_lst_all : policy_lst_post_apocalypse
            var policy_btns = gamePage.tabs[2].policyPanel.children.filter(res => res.model.metadata.unlocked && res.model.enabled && !res.model.metadata.researched)
            for (var rsc = 0; rsc < policy_btns.length; rsc++) {
                if (policy_lst.includes(policy_btns[rsc].id)){
                    try {
                        pr_no_confirm = gamePage.opts.noConfirm;
                        gamePage.opts.noConfirm = true;
                        policy_btns[rsc].controller.buyItem(policy_btns[rsc].model, {}, function(result) {
                            if (result) {
                                policy_btns[rsc].update();
                                gamePage.msg('Policy researched: ' + policy_btns[rsc].model.name );
                                return;
                            }
                        });
                        gamePage.opts.noConfirm = pr_no_confirm;
                    } catch(err) {
                    console.log(err);
                    }
                }
            }

        }
    }
}

// Auto Workshop upgrade
function autoWorkshop() {
    if (gamePage.workshopTab.visible) {
        gamePage.tabs[3].update();
         let ignores = ["biofuel", "invisibleBlackHand"];
         let check_str = (str, checklist) => checklist.some((s) => str.includes(s));
         if (gamePage.ironWill && !gamePage.workshop.get("seti").researched) {
            let IWignores = ['register', 'Hoes', 'Axe', 'Drill', 'Huts', 'geodesy', 'augumentation', 'astrophysicists', 'logistics', 'Engineers', 'internet', 'neuralNetworks', 'Robotic', 'Optimization' , 'assistance'];
            var btn = gamePage.tabs[3].buttons.filter(res => res.model.metadata.unlocked && !res.model.metadata.researched && !check_str(res.id, ignores) && !check_str(res.id, IWignores));
         }else{
            var btn = gamePage.tabs[3].buttons.filter(res => res.model.metadata.unlocked && !res.model.metadata.researched && !check_str(res.id, ignores));
         }
         for (var wrs = 0; wrs < btn.length; wrs++) {
            if (gamePage.ironWill && ((!gamePage.science.get('astronomy').researched && gamePage.science.get('astronomy').unlocked) || (!gamePage.science.get('theology').researched && gamePage.science.get('theology').unlocked  && gamePage.workshop.get("goldOre").researched && gamePage.workshop.get("goldOre").unlocked)))
            {}
            else if (gamePage.workshop.get("relicStation").unlocked && !gamePage.workshop.get("relicStation").researched && !['relicStation','voidAspiration'].includes(btn[wrs].model.metadata.name) && btn[wrs].model.prices.filter(res => res.name == 'antimatter').length > 0)
            {}
            else{
                try {
                    btn[wrs].controller.buyItem(btn[wrs].model, {}, function(result) {
                        if (result) {
                            btn[wrs].update();
                            gamePage.msg('Upgraded: ' + btn[wrs].model.name );
                            return;
                        }
                    });
                } catch(err) {
                console.log(err);
                }
            }
        }
    }
}

// Festival automatically
function autoParty() {
	if (gamePage.science.get("drama").researched) {
		var catpowerP = gamePage.resPool.get('manpower').value;
		var culture = gamePage.resPool.get('culture').value;
		var parchment = gamePage.resPool.get('parchment').value;
		var tclvl = Math.max(gamePage.religion.transcendenceTier,1);

		if (catpowerP > 1500 && culture > 5000 && parchment > 2500) {
		    if (gamePage.prestige.getPerk("carnivals").researched){
                if (gamePage.calendar.festivalDays < 400*30) {
                    if(catpowerP > 1500 * tclvl && culture > 5000 * tclvl && parchment > 2500 * tclvl){
                        gamePage.village.holdFestival(tclvl);
                        gamePage.resPool.addResEvent("manpower", -1500 * tclvl);
                        gamePage.resPool.addResEvent("culture", -5000 * tclvl);
                        gamePage.resPool.addResEvent("parchment", -2500 * tclvl);
                    }
                    else{
                        gamePage.village.holdFestival(1);
                        gamePage.resPool.addResEvent("manpower", -1500 * 1);
                        gamePage.resPool.addResEvent("culture", -5000 * 1);
                        gamePage.resPool.addResEvent("parchment", -2500 * 1);
                    }
                }
			}
			else if (gamePage.calendar.festivalDays == 0 && catpowerP > gamePage.resPool.get('manpower').maxValue * 0.5) {
			    gamePage.village.holdFestival(1);
			    gamePage.resPool.addResEvent("manpower", -1500 * 1);
                gamePage.resPool.addResEvent("culture", -5000 * 1);
                gamePage.resPool.addResEvent("parchment", -2500 * 1);
			}
		}
	}
}

function autozig() {
    if (gamePage.religionTab.visible) {
        if (gamePage.bld.getBuildingExt('ziggurat').meta.on > 0 && !gamePage.religionTab.sacrificeBtn) {
             gamePage.tabs[5].render();
        }
        gamePage.religionTab.update();


        if (gamePage.religionTab.sacrificeBtn && gamePage.resPool.get('unicorns').value > gamePage.resPool.get('tears').value ){
            var btn = gamePage.tabs[0].children.filter(res =>  res.model.metadata && res.model.metadata.unlocked && res.model.metadata.name == 'unicornPasture');

            if (btn.length > 0 &&  ((btn[0].model.prices.filter(res => res.name == "unicorns")[0].val - gamePage.resPool.get('unicorns').value) / (gamePage.getResourcePerTick('unicorns', true) * gamePage.getTicksPerSecondUI()))/60 > 0.1){
                if(gamePage.religionTab.sacrificeBtn.model.allLink.visible){
                    gamePage.religionTab.sacrificeBtn.controller.transform(gamePage.religionTab.sacrificeBtn.model, 1, {}, function(result) {
                                                if (result) {
                                                }})
                }
            }
        }

        if (gamePage.resPool.get('alicorn').value > 25 && (switches['CollectResBReset'] || gamePage.resPool.get('alicorn').value > gamePage.resPool.get("timeCrystal").value || (gamePage.time.meta[0].meta[5].unlocked && gamePage.resPool.get("timeCrystal").value > gamePage.timeTab.cfPanel.children[0].children[6].model.prices.filter(res => res.name == "timeCrystal")[0].val * (gamePage.timeTab.cfPanel.children[0].children[6].model.metadata.val > 2 ? 0.9 : 0.05)))) {
            if (gamePage.religionTab.sacrificeAlicornsBtn.model.allLink.visible){
                gamePage.religionTab.sacrificeAlicornsBtn.controller.transform(gamePage.religionTab.sacrificeAlicornsBtn.model, 1, {}, function(result) {
                                                if (result) {
                                                }})
            }
        }
        if (!switches['CollectResBReset']) {
            if (!gamePage.workshop.get("relicStation").researched && (!gamePage.workshop.get("chronoforge").researched || gamePage.religion.getTU("blackNexus").on > 5) && (gamePage.resPool.get('relic').value  < (gamePage.challenges.isActive("energy") ? 25 : 5) && gamePage.resPool.get('timeCrystal').value > 50)) {
                if (gamePage.religionTab.refineTCBtn && gamePage.religionTab.refineTCBtn.model.visible){
                    gamePage.religionTab.refineTCBtn.controller.buyItem(gamePage.religionTab.refineTCBtn.model, {}, function(result) {
                        if (result) {
                             gamePage.religionTab.refineTCBtn.update();
                        }
                        });
                }
            } else if (gamePage.calendar.year > 1000 && (gamePage.resPool.get('relic').value + (gamePage.resPool.get("blackcoin").value * 1000)) < (gamePage.resPool.get('timeCrystal').value / 25 * (1 + gamePage.getEffect("relicRefineRatio") * gamePage.religion.getZU("blackPyramid").getEffectiveValue(gamePage)))  && (gamePage.resPool.get('timeCrystal').value > 1000000 && GlobalMsg["ressourceRetrieval"] == '')) {
                if(gamePage.religionTab.refineTCBtn && gamePage.religionTab.refineTCBtn.model.allLink.visible){
                    gamePage.religionTab.refineTCBtn.controller.transform(gamePage.religionTab.refineTCBtn.model, 1, {}, function(result) {
                                                if (result) {
                                                }})
                }
            }
        }



        if(gamePage.religionTab.zgUpgradeButtons.filter(res => res.model.metadata.unlocked).length > 0){
            zig = gamePage.religionTab.zgUpgradeButtons.filter(res => res.model.visible).sort(function(a, b) {
                        a1 = a.model.metadata.effects.alicornPerTick;
                        a2 = a.model.metadata.effects.unicornsRatioReligion
                        b1 = b.model.metadata.effects.alicornPerTick;
                        b2 = b.model.metadata.effects.unicornsRatioReligion
                        if (!a1){a1 = 0};
                        if (!a2){a2 = 0};
                        if (!b1){b1 = 0};
                        if (!b2){b2 = 0};

                        return ((a1 + a2) - (b1 + b2));
                     });

            var btn = zig;

             for (var zg = 0; zg < btn.length; zg++) {
                btn[zg].controller.updateEnabled(btn[zg].model);
             }

            if (btn.length < 2 || (btn.slice(btn.length - 2, btn.length ).filter(res => res.model.enabled).length > 0) || (gamePage.religionTab.zgUpgradeButtons[0].model.prices.filter(res => res.name == "tears")[0].val < gamePage.resPool.get('tears').value * 0.1) || (gamePage.religionTab.zgUpgradeButtons[6].model.prices.filter(res => res.name == "tears")[0].val < gamePage.resPool.get('tears').value * 0.1 && gamePage.religionTab.zgUpgradeButtons[6].model.prices.filter(res => res.name == "unobtainium")[0].val < gamePage.resPool.get('unobtainium').value) ) {
                for (var zg = btn.length - 1; zg >= 0; zg--) {
                    if (btn[zg] && btn[zg].model.metadata.unlocked && (!btn[zg].model.prices.filter(res => res.name == "unobtainium")[0] || btn[zg].model.prices.filter(res => res.name == "unobtainium")[0].val < (gamePage.resPool.get('unobtainium').value - (gamePage.bld.getBuildingExt('chronosphere').meta.val < 10 ?  Chronosphere10SummPrices()["unobtainium"] : 0)) )) {
                        if (btn[zg].model.metadata.name == "unicornGraveyard" && gamePage.religionTab.zgUpgradeButtons[7].model.on > 0 && (gamePage.religionTab.zgUpgradeButtons[8].model.prices.filter(res => res.name == "necrocorn")[0].val < 200 || gamePage.diplomacy.get("leviathans").energy < gamePage.diplomacy.getMarkerCap()))
                            {}
                        else{
                            try {
                                btn[zg].controller.buyItem(btn[zg].model, {}, function(result) {
                                    if (result) {
                                            btn[zg].update();
                                            gamePage.msg('Build in Ziggurats: ' + btn[zg].model.name );
                                            if (zg == btn.length - 1 && btn[btn.length - 1].model.enabled) {
                                                zg++
                                            }
                                        }
                                    });
                            } catch(err) {
                            console.log(err);
                            }
                        }
                    }
                }
            }
        }

        if ( gamePage.resPool.get('sorrow').value < gamePage.resPool.get('sorrow').maxValue &&  gamePage.resPool.get('sorrow').value * 10000 < gamePage.resPool.get('tears').value ){
            var btn = [gamePage.religionTab.refineBtn]
            for (var zg = 0; zg < btn.length; zg++) {
                if (btn[zg] && btn[zg].model.visible == true) {
                    try {
                         btn[zg].controller.buyItem(btn[zg].model, {}, function(result) {
                            if (result) {
                                gamePage.msg('Refine tears: BLS(' + Math.trunc(gamePage.resPool.get('sorrow').value)  + ')');
                            }
                            });
                    } catch(err) {
                    console.log(err);
                    }
                }
            }
        }
    }
}

var IincKAssign = 0;

// Auto assign new kittens to selected job
function autoAssign() {
        var resourcesAssign = {
       		"catnip": (gamePage.challenges.isActive("winterIsComing") && (gamePage.bld.getBuildingExt('aqueduct').meta.val < 10 && gamePage.resPool.get("catnip").value < gamePage.village.getKittens() * 100)) ? ["catnip", "farmer", 0.001, 0.001] : ((gamePage.village.getKittens() > 2  ||  gamePage.workshop.get("mineralHoes").researched ) ? ["catnip", "farmer", gamePage.resPool.get("catnip").value < gamePage.resPool.get("catnip").maxValue * 0.1 ? 9 : 999, (gamePage.resPool.get('paragon').value < 200 && gamePage.bld.getBuildingExt('temple').meta.val < 1 && gamePage.village.getKittens() > 2) ? 0.1 : 1] : ["wood","woodcutter", 1, 1]),
        	"wood, beam": ["wood","woodcutter",(gamePage.resPool.get("beam").value < gamePage.resPool.get("slab").value && gamePage.resPool.get("beam").value < gamePage.resPool.get("wood").value) ?  Math.max(0.1, gamePage.resPool.get("wood").value/gamePage.resPool.get("wood").maxValue) : gamePage.resPool.get("beam").value > gamePage.resPool.get("wood").maxValue ?  Math.max(0.1, gamePage.resPool.get("beam").value/gamePage.resPool.get("wood").maxValue / ((gamePage.resPool.get("wood").maxValue / ((gamePage.getResourcePerTick("wood", 0) * 5) / gamePage.village.getJob('woodcutter').value)) / gamePage.village.getJob('woodcutter').value / gamePage.village.getJob('woodcutter').value))  : 1 , 2],
        	"minerals, slab": ["minerals","miner",(gamePage.resPool.get("slab").value < gamePage.resPool.get("beam").value && gamePage.resPool.get("slab").value < gamePage.resPool.get("minerals").value) ?  Math.max(0.1, gamePage.resPool.get("minerals").value/gamePage.resPool.get("minerals").maxValue) :  gamePage.resPool.get("slab").value > gamePage.resPool.get("minerals").maxValue ?  Math.max(0.1, gamePage.resPool.get("slab").value/gamePage.resPool.get("minerals").maxValue / ((gamePage.resPool.get("minerals").maxValue / ((gamePage.getResourcePerTick("minerals", 0) * 5) / gamePage.village.getJob('miner').value)) / gamePage.village.getJob('miner').value / gamePage.village.getJob('miner').value)) : 1 , (gamePage.resPool.get("minerals").value < 275 && gamePage.challenges.isActive("winterIsComing")) ? 0.01 : 2],
            "science": ["science", "scholar",(gamePage.resPool.get("science").value < gamePage.resPool.get("science").maxValue * 0.5) ? 0.5 : 1, (gamePage.science.get('engineering').researched  && gamePage.resPool.get("science").value > 100) ? 1 : (gamePage.village.getKittens() > 1 ? 0.1 : 0.001)],
        	"manpower, parchment": ["manpower", "hunter", 0.1 , (gamePage.workshopTab.visible && gamePage.resPool.get("parchment").value < 200) ? 0.2 : 1],
            "faith": ["faith", "priest", gamePage.tabs[5].rUpgradeButtons.filter(res => res.model.resourceIsLimited == false && (!(res.model.name.includes('(complete)'))) && (!(res.model.name.includes('(Transcend)')))).length  == 0 ?  (gamePage.religion.getSolarRevolutionRatio() <= Math.max(gamePage.religion.transcendenceTier * 0.05, gamePage.getEffect("solarRevolutionLimit")) ? 0.1 : 2) :  (gamePage.religion.getSolarRevolutionRatio() <= Math.max(gamePage.religion.transcendenceTier * 0.05, gamePage.getEffect("solarRevolutionLimit")) ? 1 : gamePage.resPool.get("faith").value/gamePage.resPool.get("faith").maxValue * 10 + 1 ) , (gamePage.resPool.get("faith").value < 750 && gamePage.resPool.get("gold").maxValue >= 500 ) ? 0.01 : 5],
            "coal, gold": (gamePage.resPool.get("coal").value / gamePage.resPool.get("coal").maxValue  || 100) < (gamePage.workshop.get("geodesy").researched ? gamePage.resPool.get("gold").value / gamePage.resPool.get("gold").maxValue : 100) ? ["coal", "geologist",gamePage.resPool.get("coal").value < gamePage.resPool.get("coal").maxValue * 0.99 ? 1 : 15,15] : ["gold", "geologist",gamePage.resPool.get("gold").value < gamePage.resPool.get("gold").maxValue * 0.99 ? 1 : 15,15]
                };


        if(Object.keys(craftPriority[0]).length > 0){
            let tstres = ["wood", "minerals", "beam", "slab", "science", "faith", "gold", "coal", "manpower", "parchment"].filter(x => gamePage.bld.getPrices(craftPriority[0]).map(elem => elem.name).includes(x))
            if (tstres.length > 0) {
                tstres.forEach(function(entry) {
                    if (gamePage.resPool.get(entry).value < gamePage.bld.getPrices(craftPriority[0]).filter(el => el.name == entry)[0].val) {
                         res_elem = Object.entries(resourcesAssign).map(([k,v]) => k).filter( k => k.indexOf(entry) > -1)[0];
                         resourcesAssign[res_elem][2] = 0.1;
                         resourcesAssign[res_elem][3] = 0.1;
                    }
                });
            }
        }

        resourcesAssign = Object.entries(resourcesAssign).map(([k,v]) => v);
	    let restmp = resourcesAssign.filter(res => res[0] in gamePage.village.getJob(res[1]).modifiers &&  gamePage.village.getJob(res[1]).unlocked && ( !gamePage.challenges.isActive("atheism") || res[0] != 'faith'));
	    restmpq = restmp.sort(function(a, b) {
	            if (gamePage.resPool.get(a[0]).value >= gamePage.resPool.get(a[0]).maxValue){
	                atick = gamePage.resPool.get(a[0]).maxValue * 10;
	                ajobs = (gamePage.religion.getRU('solarRevolution').val == 1 || gamePage.challenges.isActive("atheism")) ? a[2] : a[3];
	            }
	            else{
	                atick = gamePage.calcResourcePerTick(a[0]) + 1;
	                ajobs = gamePage.village.getJob(a[1]).value + 1;
	            }
	            if (gamePage.resPool.get(b[0]).value >= gamePage.resPool.get(b[0]).maxValue){
	                btick = gamePage.resPool.get(b[0]).maxValue * 10;
	                bjobs = (gamePage.religion.getRU('solarRevolution').val == 1 || gamePage.challenges.isActive("atheism")) ? b[2] : b[3];
	            }
	            else{
	                btick = gamePage.calcResourcePerTick(b[0]) + 1;
	                bjobs = gamePage.village.getJob(b[1]).value + 1;
	            }
	            kfa = (gamePage.religion.getRU('solarRevolution').val == 1 || gamePage.challenges.isActive("atheism")) ? a[2] : a[3];
	            kfb = (gamePage.religion.getRU('solarRevolution').val == 1 || gamePage.challenges.isActive("atheism")) ? b[2] : b[3];
	            return (((atick / gamePage.resPool.get(a[0]).maxValue) * (gamePage.resPool.get(a[0]).value / gamePage.resPool.get(a[0]).maxValue) * (kfa * ajobs) ) * kfa - ((btick / gamePage.resPool.get(b[0]).maxValue) * (gamePage.resPool.get(b[0]).value / gamePage.resPool.get(b[0]).maxValue) * (kfb * bjobs)) * kfb);

        });

        kittens_cnt = gamePage.village.getKittens()
        if (game.village.getFreeKittens() != 0 ) {
            gamePage.village.assignJob(gamePage.village.getJob(restmpq[0][1]),1);
        }else if (kittens_cnt > 0) {
            restmpdel = restmpq.filter(res => gamePage.village.getJob(res[1]).value > ((gamePage.resPool.get(res[0]).value >= gamePage.resPool.get(res[0]).maxValue) ? 1 : kittens_cnt/2/7));
            if (restmpdel.length > 0){
                let cnt = Math.max(Math.floor(gamePage.village.getJob(restmpdel[restmpdel.length - 1][1]).value * 0.1),1)
                if (cnt > 0) {
                    gamePage.village.sim.removeJob(restmpdel[restmpdel.length - 1][1],cnt);
                    gamePage.village.assignJob(gamePage.village.getJob(restmpq[0][1]),cnt);
                }

            }
        }
        if (gamePage.science.get('civil').researched && !gamePage.ironWill && gamePage.resPool.get("gold").value > 1000){
            if (IincKAssign > 10) {
                  let prkitten = gamePage.village.sim.kittens.filter(kitten => kitten.job == restmpq[0][1]).sort(function(a, b) {return  b.skills[restmpq[0][1]] - a.skills[restmpq[0][1]];})[0]
                  if (prkitten){
                      gamePage.village.makeLeader(prkitten);
                      if (gamePage.village.sim.expToPromote(prkitten.rank, prkitten.rank+1, prkitten.exp)[0] && gamePage.village.sim.goldToPromote(prkitten.rank, prkitten.rank+1, gamePage.resPool.get("gold").value)[1] < gamePage.resPool.get("gold").value * 0.3) {
                         gamePage.village.sim.promote(prkitten);
                      }
                  }
                  IincKAssign = 0;
            }
            IincKAssign++;
        }
}

var bldSmelter = gamePage.bld.buildingsData[15];
var bldBioLab = gamePage.bld.buildingsData[9];
var bldOilWell = gamePage.bld.buildingsData[20];
var bldFactory = gamePage.bld.buildingsData[22];
var bldCalciner = gamePage.bld.buildingsData[16];
var bldAccelerator = gamePage.bld.buildingsData[24];
var bldWarehouse = gamePage.bld.buildingsData[11];

var spcContChamber = gamePage.space.meta[5].meta[1];
var spcMoonBase = gamePage.space.meta[2].meta[1];
var spcEntangler = gamePage.space.meta[10].meta[0];
var spcSpaceStation = gamePage.space.meta[1].meta[2];
var spcLunarOutpost = gamePage.space.meta[2].meta[0];
var spcOrbitalArray = gamePage.space.meta[4].meta[1];

 // These are the assorted variables
var proVar = gamePage.resPool.energyProd;
var conVar = gamePage.resPool.energyCons;
var FreeEnergy = 0;
// Control Energy Consumption
function energyControl() {
  if (switches["Energy Control"]){
    // 0 = building data
    // 1 = priority
    // 2 = building control
    var EnergyPriority = [
      [gamePage.challenges.isActive("postApocalypse") ? null : bldSmelter, 0.09,gamePage.tabs[0].children.find(o => o.model.metadata && o.model.metadata.name == 'smelter')],
      [gamePage.challenges.isActive("postApocalypse") ? null : bldOilWell, (gamePage.bld.getBuildingExt('library').meta.stage == 1 && gamePage.bld.getBuildingExt('biolab').meta.on != gamePage.bld.getBuildingExt('biolab').meta.val) ? 9999 :  0.3 ,gamePage.tabs[0].children.find(o => o.model.metadata && o.model.metadata.name == "oilWell")],
      [bldBioLab, (gamePage.science.get('antimatter').researched && gamePage.resPool.get("antimatter").value < gamePage.resPool.get("antimatter").maxValue*0.2) ? 0.3 : Math.max(0.2,gamePage.calcResourcePerTick('oil') * 5 / gamePage.resPool.get('oil').maxValue * 100 * (gamePage.resPool.get("oil").value / gamePage.resPool.get("oil").maxValue))* (gamePage.space.meta[3].meta[1].val +1),gamePage.tabs[0].children.find(o => o.model.metadata && o.model.metadata.name == "biolab")],
      (gamePage.ironWill && Math.min(Math.floor(gamePage.resPool.get('coal').value /(gamePage.resPool.get('coal').maxValue / gamePage.bld.getBuildingExt('calciner').meta.val)), Math.floor(gamePage.resPool.get('minerals').value / 1000)) < gamePage.bld.getBuildingExt('calciner').meta.val ) ? [gamePage.challenges.isActive("postApocalypse") ? null : bldSmelter, 0.09,gamePage.tabs[0].children.find(o => o.model.metadata && o.model.metadata.name == 'smelter')] : [gamePage.challenges.isActive("postApocalypse") ? null : bldCalciner, 0.101,gamePage.tabs[0].children.find(o => o.model.metadata && o.model.metadata.name == "calciner")],
      [bldAccelerator, 0.09, gamePage.tabs[0].children.find(o => o.model.metadata && o.model.metadata.name == "accelerator")],
      [gamePage.tabs[6].planetPanels[1] ? spcMoonBase: null, 0.2, gamePage.tabs[6].planetPanels[1] ? gamePage.tabs[6].planetPanels[1].children[1]: null],
      [gamePage.tabs[6].planetPanels[0] ? spcSpaceStation: null, 0.09, gamePage.tabs[6].planetPanels[0]  ? gamePage.tabs[6].planetPanels[0].children[2]: null],
      [bldFactory, 0.01, gamePage.tabs[0].children.find(o => o.model.metadata && o.model.metadata.name == "factory")],
      [gamePage.tabs[6].planetPanels[1] ? (gamePage.resPool.get('uranium').value > 1000 ? spcLunarOutpost: null) : null, 0.01, gamePage.tabs[6].planetPanels[1]  ? (gamePage.resPool.get('uranium').value > 1000 ? gamePage.tabs[6].planetPanels[1].children[0] : null): null],
      [gamePage.tabs[6].planetPanels[3] ? spcOrbitalArray : null, 0.01, gamePage.tabs[6].planetPanels[3]  ? gamePage.tabs[6].planetPanels[3].children[1]: null],
      [gamePage.tabs[6].planetPanels[9] ? gamePage.space.meta[10].meta[0] : null, 0.1, gamePage.tabs[6].planetPanels[9]  ? gamePage.tabs[6].planetPanels[9].children[0]: null],
      [gamePage.bld.getBuildingExt('warehouse').meta.stage == 0 ? null : bldWarehouse, 0.3, gamePage.tabs[0].children.find(o => o.model.metadata && o.model.metadata.name == 'warehouse')],
      [gamePage.science.get('voidSpace').researched ? gamePage.time.voidspaceUpgrades[4] : null, 0.1, gamePage.tabs[7] && gamePage.tabs[7].children[3] ? gamePage.tabs[7].children[3].children[0].children[5] : null],
    ];

    if (gamePage.science.get('antimatter') && gamePage.resPool.get("antimatter").value < gamePage.resPool.get("antimatter").maxValue*0.9 && gamePage.space.meta[5].meta[1].on > 1){
      // Antimatter less than max storage then reduce containment chamber
      var sunlifter = gamePage.tabs[6].planetPanels[4].children[0];
      var empty = gamePage.resPool.get("antimatter").maxValue - gamePage.resPool.get("antimatter").value;
      if (sunlifter.model.on*50*1.05 < empty) {
        // gamePage.space.meta[5].meta[1].on = gamePage.space.meta[5].meta[1].on-1;
        gamePage.tabs[6].planetPanels[4].children[1].controller.off(gamePage.tabs[6].planetPanels[4].children[1].model, 1);
      }
    } else {
      EnergyPriority.push([gamePage.tabs[6].planetPanels[4] ? spcContChamber : null, (gamePage.science.get('antimatter').researched && gamePage.resPool.get("antimatter").value >= gamePage.resPool.get("antimatter").maxValue*0.9 && gamePage.space.meta[5].meta[1].val > 1) ? Math.max(0.05, (1 - gamePage.resPool.get("antimatter").value/gamePage.resPool.get("antimatter").maxValue )/10): 9999,gamePage.tabs[6].planetPanels[4] ? gamePage.tabs[6].planetPanels[4].children[1] : null]);
    }

    proVar = gamePage.resPool.energyProd;
    conVar = gamePage.resPool.energyCons;
    FreeEnergy = Math.abs(proVar - conVar);

    if (proVar>conVar) {
      // Energy is positive then turn on some stuff
      EnergyInc = EnergyPriority.filter(res => res[0] && res[0].val > res[0].on && (proVar > (conVar + res[0].effects.energyConsumption * gamePage.resPool.getEnergyConsumptionRatio() ) || (res[2].model.metadata.name == "containmentChamber" && gamePage.resPool.get("antimatter").value >= gamePage.resPool.get("antimatter").maxValue * 0.9 )  ) ).sort(function(a, b) {
        return a[1] - b[1];
      });
      if (EnergyInc.length > 0){
        var onNum = Math.min(Math.floor(FreeEnergy / (EnergyInc[0][0].effects.energyConsumption * gamePage.resPool.getEnergyConsumptionRatio()) ), EnergyInc[0][0].val -  EnergyInc[0][0].on);
        EnergyInc[0][2].controller.on(EnergyInc[0][2].model, onNum);
      }
    } else if (proVar<conVar) {
      // Energy is negative then turn off some stuff
      EnergyDec = EnergyPriority.filter(res => res[0] && res[0].on > 1 && res[0].effects !== undefined && "energyConsumption" in res[0].effects && res[0].effects.energyConsumption * gamePage.resPool.getEnergyConsumptionRatio() > 0 && proVar < conVar).sort(function (a, b) {
        return b[1] - a[1];
      });
      if (EnergyDec.length > 0){
        var onNum = Math.min(EnergyDec[0][0].on - 1, Math.min(Math.ceil(FreeEnergy / (EnergyDec[0][0].effects.energyConsumption * gamePage.resPool.getEnergyConsumptionRatio()) ), EnergyDec[0][0].on));
        EnergyDec[0][2].controller.off(EnergyDec[0][2].model, onNum);
      }
    }
  }
}

function autoNip() {
		if (gamePage.bld.buildingsData[0].val < 40 && gamePage.resPool.get('catnip').value < 100 && (gamePage.gatherClicks  < 2500 || gamePage.ironWill )) {
		    btn = gamePage.tabs[0].children[0];
			try {
				btn.controller.buyItem(btn.model, {}, function(result) {
					if (result) {
                        if (gamePage.timer.ticksTotal % 151 === 0){
                            gamePage.msg('Gathering catnip');
                        }
					}
					});
			} catch(err) {
			console.log(err);
			}
		}
}
function autoRefine() {
    if ((gamePage.village.getKittens() < 14 || !gamePage.workshopTab.visible) && ((!gamePage.challenges.isActive("winterIsComing") || gamePage.bld.getBuildingExt('hut').meta.val == 0) && gamePage.bld.getBuildingExt('field').meta.unlocked && gamePage.resPool.get('catnip').value > gamePage.resPool.get('wood').value * 5  && gamePage.resPool.get('catnip').value > Math.min(gamePage.resPool.get('catnip').maxValue * 0.9, (gamePage.calendar.season >= 1 ? Math.max(gamePage.tabs[0].children[2].model.prices.filter(res => res.name == "catnip")[0].val * 2, 100) : 100)))) {
        if (!gamePage.workshopTab.visible ){

                    if (gamePage.tabs[0].children[1].model.x100Link.visible && gamePage.tabs[0].children[2].model.resourceIsLimited ){
                        gamePage.tabs[0].children[1].model.x100Link.handler(gamePage.tabs[0].children[1].model);
                    }
                    else if(gamePage.tabs[0].children[2] && gamePage.tabs[0].children[2].model.resourceIsLimited && gamePage.tabs[0].children[1].model.visible){
                        gamePage.tabs[0].children[1].controller.buyItem(gamePage.tabs[0].children[1].model, {}, function(){})
                    }
                    else {
                        btn = gamePage.tabs[0].children[1];
                        price = gamePage.tabs[0].children[1].model.prices.filter(res => res.name == "catnip")[0].val;
                        limit = Math.ceil(Math.min(gamePage.resPool.get('wood').maxValue * 0.1 - gamePage.resPool.get('wood').value, Math.trunc(gamePage.resPool.get('catnip').value/price)-1));


                        for (var rf = 0; rf < limit; rf++) {
                            if (btn.model.enabled) {
                                 try {
                                        btn.controller.buyItem(btn.model, {}, function(result) {
                                                if (result) {
                                                }
                                        });
                                     } catch(err) {
                                        console.log(err);
                                     }
                            }
                        }
                    }

        }
        else if(gamePage.tabs[0].children[1].model.x100Link && gamePage.ironWill && gamePage.resPool.get('wood').value < gamePage.resPool.get('wood').maxValue * 0.1) {
            if (gamePage.tabs[0].children[1].model.x100Link.visible){
                gamePage.tabs[0].children[1].model.x100Link.handler(gamePage.tabs[0].children[1].model);
            }
        }
    }
}

function upgradeByModel(target){
	var metadataRaw = target.controller.getMetadataRaw(target.model);
    metadataRaw.stage = metadataRaw.stage || 0;
    metadataRaw.stage++;

    metadataRaw.val = 0;
    metadataRaw.on = 0;
    if (metadataRaw.calculateEffects){
        metadataRaw.calculateEffects(metadataRaw, target.controller.game);
    }
    target.controller.game.upgrade(metadataRaw.upgrades);
    target.controller.game.render();
}

var postApocalypse_is_competed = true;

function UpgradeBuildings() {
    if (gamePage.diplomacy.hasUnlockedRaces()){
        gamePage.diplomacy.unlockRandomRace();
    }
    if (gamePage.bld.getBuildingExt('reactor').meta.unlocked && !gamePage.bld.getBuildingExt('reactor').meta.isAutomationEnabled && gamePage.bld.getBuildingExt('reactor').meta.val > 0 && gamePage.workshop.get("thoriumReactors").researched && gamePage.resPool.get('thorium').value > 10000 && gamePage.resPool.get('uranium').perTickCached > 250) {
        gamePage.bld.getBuildingExt('reactor').meta.isAutomationEnabled = true
    }

    var mblds = gamePage.bld.meta[0].meta.filter(res => res.stages && res.stages[1].stageUnlocked && res.stage == 0 && (res.name != "library" || (gamePage.space.getProgram("orbitalLaunch").val == 1 && !gamePage.challenges.isActive("energy") && gamePage.bld.getBuildingExt('aqueduct').meta.stage != 0)) && (res.name != "aqueduct" || (!gamePage.challenges.isActive("winterIsComing") && ((gamePage.resPool.get('paragon').value > 200 && gamePage.bld.getBuildingExt('accelerator').meta.val > 2) || (gamePage.resPool.get('paragon').value <= 200 && gamePage.space.getBuilding('hydroponics').val > 0) )) ) && (res.name != "warehouse" || (gamePage.resPool.get("eludium").value >= 200000 && gamePage.time.getCFU("ressourceRetrieval").val > 3)) );
    var upgradeTarget;
    for (var up = 0; up < mblds.length; up++) {
        upgradeTarget = gamePage.tabs[0].children.find(res => res.model.metadata && res.model.metadata.name == mblds[up].name);
        upgradeByModel(upgradeTarget);
    }

    if (!gamePage.challenges.isActive("postApocalypse") && gamePage.bld.getBuildingExt('steamworks').meta.on < gamePage.bld.getBuildingExt('steamworks').meta.val && gamePage.resPool.get('coal').value > 0 && gamePage.bld.getBuildingExt('steamworks').meta.unlocked) {
        gamePage.bld.getBuildingExt('steamworks').meta.on = gamePage.bld.getBuildingExt('steamworks').meta.val;
    }
    if (gamePage.bld.getBuildingExt('reactor').meta.on < gamePage.bld.getBuildingExt('reactor').meta.val && gamePage.resPool.get('uranium').value > 100 && gamePage.bld.getBuildingExt('reactor').meta.unlocked) {
        gamePage.bld.getBuildingExt('reactor').meta.on = gamePage.bld.getBuildingExt('reactor').meta.val;
    }
    if (!gamePage.challenges.isActive("postApocalypse")  && gamePage.bld.getBuildingExt('magneto').meta.on < gamePage.bld.getBuildingExt('magneto').meta.val && gamePage.resPool.get('oil').value > 0 && gamePage.bld.getBuildingExt('magneto').meta.unlocked) {
        gamePage.bld.getBuildingExt('magneto').meta.on = gamePage.bld.getBuildingExt('magneto').meta.val;
    }
    if (gamePage.space.getBuilding("moonOutpost").unlocked && !gamePage.challenges.isActive("energy")){
        if (gamePage.space.getBuilding("moonOutpost").on < gamePage.space.getBuilding("moonOutpost").val && gamePage.resPool.get('uranium').value > 1000 && gamePage.resPool.get('unobtainium').value < gamePage.resPool.get('unobtainium').maxValue){
            gamePage.space.getBuilding("moonOutpost").on = gamePage.space.getBuilding("moonOutpost").val
        }else if (gamePage.space.getBuilding("moonOutpost").on > 0 && (gamePage.resPool.get('uranium').value <= 1000 || gamePage.resPool.get('unobtainium').value >= gamePage.resPool.get('unobtainium').maxValue)){
            gamePage.space.getBuilding("moonOutpost").on--;
        }
    }
    if (gamePage.bld.getBuildingExt('smelter').meta.unlocked && (!gamePage.challenges.isActive("postApocalypse") || gamePage.village.getKittens() < 10)){
        if (((gamePage.ironWill && gamePage.diplomacy.get('nagas').unlocked && gamePage.resPool.get('gold').unlocked &&  gamePage.resPool.get('minerals').value / 100 > gamePage.bld.getBuildingExt('smelter').meta.on ) || (gamePage.ironWill && ((gamePage.workshop.get("goldOre").researched && gamePage.bld.getBuildingExt('amphitheatre').meta.val > 3) || gamePage.resPool.get('iron').value < 100 ))) || ((gamePage.calcResourcePerTick('wood') + gamePage.getResourcePerTickConvertion('wood') + gamePage.bld.getBuildingExt('smelter').meta.effects.woodPerTickCon +  gamePage.calcResourcePerTick('wood') * gamePage.prestige.getParagonProductionRatio()) * 5 > gamePage.bld.getBuildingExt('smelter').meta.on  && ( gamePage.calcResourcePerTick('minerals') + gamePage.getResourcePerTickConvertion('minerals')  + gamePage.bld.getBuildingExt('smelter').meta.effects.mineralsPerTickCon + gamePage.calcResourcePerTick('minerals') * gamePage.prestige.getParagonProductionRatio()) * 5 > gamePage.bld.getBuildingExt('smelter').meta.on)) {
                if (gamePage.ironWill) {
                    if (gamePage.bld.getBuildingExt('smelter').meta.val >= gamePage.bld.getBuildingExt('smelter').meta.on){
                        gamePage.bld.getBuildingExt('smelter').meta.on= Math.min(Math.floor(gamePage.resPool.get('minerals').value / 100), gamePage.bld.getBuildingExt('smelter').meta.val);
                        gamePage.bld.getBuildingExt('calciner').meta.on= Math.min(Math.max(Math.floor(gamePage.resPool.get('coal').value /(gamePage.resPool.get('coal').maxValue / gamePage.bld.getBuildingExt('calciner').meta.val)),1), Math.floor(gamePage.resPool.get('minerals').value / 1000), gamePage.bld.getBuildingExt('calciner').meta.val);
                    }
                }
                else if (gamePage.bld.getBuildingExt('smelter').meta.val > gamePage.bld.getBuildingExt('smelter').meta.on){
                    gamePage.bld.getBuildingExt('smelter').meta.on++;
                }
        }
        else if (gamePage.bld.getBuildingExt('smelter').meta.on > 0) {
            if (gamePage.ironWill) {
                if (gamePage.bld.getBuildingExt('amphitheatre').meta.val > 3){
                    gamePage.bld.getBuildingExt('smelter').meta.on= Math.min(Math.floor(gamePage.resPool.get('minerals').value / 100), gamePage.bld.getBuildingExt('smelter').meta.on--);
                    gamePage.bld.getBuildingExt('calciner').meta.on= Math.min(Math.max(Math.floor(gamePage.resPool.get('coal').value /(gamePage.resPool.get('coal').maxValue / gamePage.bld.getBuildingExt('calciner').meta.val)),1), Math.floor(gamePage.resPool.get('minerals').value / 1000), gamePage.bld.getBuildingExt('calciner').meta.val);
                }
                else {
                    gamePage.bld.getBuildingExt('smelter').meta.on= 0;
                }
            }
            else if (gamePage.religion.getRU('solarRevolution').val == 0){
                gamePage.bld.getBuildingExt('smelter').meta.on--;
            }
        }
    }
    if (gamePage.resPool.get('paragon').value < 200 && gamePage.bld.getBuildingExt("mint").meta.val > 1 && gamePage.calendar.year < 2000){
        if (gamePage.resPool.get('manpower').value > gamePage.bld.getBuildingExt("mint").meta.on * (gamePage.resPool.get('manpower').maxValue / gamePage.bld.getBuildingExt("mint").meta.val) ){
            if (gamePage.bld.getBuildingExt("mint").meta.on < gamePage.bld.getBuildingExt("mint").meta.val){
                gamePage.bld.getBuildingExt('mint').meta.on++;
            }
        }
        else {
            if (gamePage.bld.getBuildingExt("mint").meta.on > 1){
                gamePage.bld.getBuildingExt('mint').meta.on--;
            }
        }
    } else if (gamePage.bld.getBuildingExt("mint").meta.on != gamePage.bld.getBuildingExt("mint").meta.val){
        gamePage.bld.getBuildingExt('mint').meta.on = gamePage.bld.getBuildingExt('mint').meta.val
    }

    if (gamePage.challenges.isActive("postApocalypse") && gamePage.time.getCFU("ressourceRetrieval").val > 0 && (gamePage.calendar.cycle != 5 || (gamePage.calendar.day <= 10 || gamePage.calendar.day >= 90))){
        gamePage.bld.getBuildingExt('mine').meta.on = 0;
        gamePage.bld.getBuildingExt('quarry').meta.on = 0;
        gamePage.bld.getBuildingExt('calciner').meta.on = 0;
        gamePage.bld.getBuildingExt('steamworks').meta.on = 0;
        gamePage.bld.getBuildingExt('magneto').meta.on = 0;
        gamePage.bld.getBuildingExt('oilWell').meta.isAutomationEnabled = false;
        if (gamePage.workshop.get("geodesy").researched){
            gamePage.bld.getBuildingExt('smelter').meta.on = 0;
        }
        postApocalypse_is_competed = false;
    }
    if ((!postApocalypse_is_competed  && !gamePage.challenges.isActive("postApocalypse")) || (gamePage.challenges.isActive("postApocalypse")  && gamePage.time.getCFU("ressourceRetrieval").val > 0 && gamePage.calendar.cycle == 5 && gamePage.calendar.day > 10 && gamePage.calendar.day < 90)){
        gamePage.bld.getBuildingExt('mine').meta.on = gamePage.bld.getBuildingExt('mine').meta.val;
        gamePage.bld.getBuildingExt('quarry').meta.on =  gamePage.bld.getBuildingExt('quarry').meta.val;
        gamePage.bld.getBuildingExt('calciner').meta.on =  gamePage.bld.getBuildingExt('calciner').meta.val;
        gamePage.bld.getBuildingExt('smelter').meta.on =  gamePage.bld.getBuildingExt('smelter').meta.val;
        gamePage.bld.getBuildingExt('steamworks').meta.on =  gamePage.bld.getBuildingExt('steamworks').meta.val;
        gamePage.bld.getBuildingExt('magneto').meta.on = gamePage.bld.getBuildingExt('magneto').meta.val
        gamePage.bld.getBuildingExt('oilWell').meta.isAutomationEnabled = true;
        if (!postApocalypse_is_competed  && !gamePage.challenges.isActive("postApocalypse")){
            postApocalypse_is_competed = true;
        }
    }
}

function ResearchSolarRevolution() {
        GlobalMsg['solarRevolution'] = ''
        if (gamePage.religion.getRU('solarRevolution').val == 0 && !gamePage.challenges.isActive("atheism")){
            if (gamePage.science.get('theology').researched){
                GlobalMsg['solarRevolution'] =  gamePage.religion.getRU("solarRevolution").label
            }
            if (  gamePage.tabs[5].rUpgradeButtons.filter(res => res.model.metadata.name == "solarRevolution" && res.model.visible &&  res.model.enabled && res.model.resourceIsLimited == false).length > 0){
                    var btn = gamePage.tabs[5].rUpgradeButtons[5];
                    try {
                        btn.controller.buyItem(btn.model, {}, function(result) {
                            if (result) {
                                btn.update();
                                gamePage.msg('Religion researched: ' + btn.model.name);
                            }
                        });
                    } catch(err) {
                        console.log(err);
                    }
            }
	    }
}

function Timepage() {
        GlobalMsg['relicStation'] = ''
        GlobalMsg['voidAspiration'] = ''
        if (gamePage.science.get('voidSpace').researched || gamePage.workshop.get("chronoforge").researched ){
            gamePage.timeTab.update();
        }
        if (gamePage.science.get('voidSpace').researched && GlobalMsg['science'] != 'Paradox Theory'){
            var VoidBuild = gamePage.timeTab.vsPanel.children[0].children;
            var voidcf = gamePage.religion.getZU("marker").val > 1 ? Math.max(Math.min(VoidBuild[3].model.prices.filter(res => res.name == "void")[0].val,VoidBuild[5].model.prices.filter(res => res.name == "void")[0].val),gamePage.resPool.get("void").value) : Math.min(VoidBuild[3].model.prices.filter(res => res.name == "void")[0].val,VoidBuild[5].model.prices.filter(res => res.name == "void")[0].val)
            if (gamePage.workshop.get("turnSmoothly").researched && !gamePage.ironWill) {
                if (VoidBuild[0].model.visible) {
                    if ( Math.max(500, VoidBuild[2].model.on * 20) > voidcf * 0.1){
                        {}
                    }else {
                        VoidBuild[0].controller.buyItem(VoidBuild[0].model, {}, function(result) {
                        if (result) {
                            gamePage.msg('Cryochamber Fixed');
                        }
                        });
                    }
                }

                if (VoidBuild[1].model.visible) {
                    if ( VoidBuild[1].model.prices.filter(res => res.name == 'void')[0].val > voidcf * 0.1 ||  VoidBuild[1].model.metadata.val >= Math.max(Math.ceil((VoidBuild[2].model.metadata.val+1) * 0.1), 5) ){
                        {}
                    }else {
                        VoidBuild[1].controller.buyItem(VoidBuild[1].model, {}, function(result) {
                        if (result) {
                            VoidBuild[1].update();
                            gamePage.msg('Build in Time: ' + VoidBuild[1].model.name );
                        }
                        });
                    }
                }
            }


			try {
				for (var v = 3 ;v < VoidBuild.length; v++) {
					if (VoidBuild[v].model.metadata.unlocked && VoidBuild[v].model.enabled) {

					    if (!switches['CollectResBReset'] ) {
                            if (gamePage.workshop.get("voidAspiration").unlocked && !gamePage.workshop.get("voidAspiration").researched){
                                {
                                    GlobalMsg['voidAspiration'] = gamePage.workshop.get("voidAspiration").label
                                }
                            }
                            else{
                                if (( v == 5 && (!gamePage.workshop.get("turnSmoothly").researched && gamePage.timeTab.vsPanel.children[0].children[5].model.metadata.val > 0 && gamePage.resPool.get("temporalFlux").value - VoidBuild[5].model.prices.filter(res => res.name == "temporalFlux")[0].val < gamePage.workshop.get("turnSmoothly").prices.filter(res => res.name == "temporalFlux")[0].val)) || (v == 6 && gamePage.time.meta[0].meta[5].val < 3)){
                                  {}
                                }
                                else if ((v != 3 && v != 5 ) && ((VoidBuild[3].model.metadata.unlocked && VoidBuild[3].model.prices.filter(res => res.name == 'void')[0].val < voidcf * 0.1) || (VoidBuild[5].model.metadata.unlocked  && VoidBuild[5].model.prices.filter(res => res.name == 'void')[0].val < voidcf * 0.1 ))){
                                  {}
                                }
                                else if (gamePage.ironWill){
                                    if(!VoidBuild[v].model.metadata.effects.maxKittens ){
                                        VoidBuild[v].controller.buyItem(VoidBuild[v].model, {}, function(result) {
                                        if (result) {
                                            VoidBuild[v].update();
                                            gamePage.msg('Build in Time: ' + VoidBuild[v].model.name );
                                        }
                                        });
                                    }
                                }else{
                                    VoidBuild[v].controller.buyItem(VoidBuild[v].model, {}, function(result) {
                                    if (result) {
                                        VoidBuild[v].update();
                                        gamePage.msg('Build in Time: ' + VoidBuild[v].model.name );
                                    }
                                    });
                                }
                            }
						}

					}
				}
			} catch(err) {
			    console.log(err);
			}

	    }
        if (gamePage.workshop.get("chronoforge").researched){
            var chronoforge = gamePage.timeTab.cfPanel.children[0].children;
            var tc_val = gamePage.resPool.get("timeCrystal").value
            var factor = gamePage.challenges.getChallenge("1000Years").researched ? 5 : 10
            var fast_combust = (Math.max(tc_val, 600) < gamePage.resPool.get("void").value || (tc_val > 45 && gamePage.calendar.day < 10 && gamePage.time.heat < gamePage.getEffect("heatMax") * 0.9)) && gamePage.time.meta[0].meta[5].val >= 1 && gamePage.religion.getTU("darkNova").on > 0
            var not_dark = gamePage.calendar.darkFutureYears(true) < 0

            if (gamePage.time.getCFU("blastFurnace").unlocked) {
		    		if (gamePage.time.getCFU("blastFurnace").isAutomationEnabled) {
                    	gamePage.time.getCFU("blastFurnace").isAutomationEnabled = false
					}
              /*
                if (gamePage.calendar.cycle == 5 && gamePage.time.getCFU("blastFurnace").heat < 200  && gamePage.time.getCFU("blastFurnace").isAutomationEnabled) {
                    gamePage.time.getCFU("blastFurnace").isAutomationEnabled = false
                }
                else if (!gamePage.time.getCFU("blastFurnace").isAutomationEnabled && gamePage.resPool.energyProd - gamePage.resPool.energyCons >= 0 &&  gamePage.calendar.cycle != 5 ) {
                    gamePage.time.getCFU("blastFurnace").isAutomationEnabled = true
                }
                */
            }

            if (gamePage.workshop.get("relicStation").unlocked && !gamePage.workshop.get("relicStation").researched && gamePage.science.get("paradoxalKnowledge").researched){
                GlobalMsg['relicStation'] = gamePage.workshop.get("relicStation").label + ' ' + Math.round((gamePage.resPool.get("antimatter").value/gamePage.workshop.get("relicStation").prices.filter(res => res.name == 'antimatter')[0].val)*100) + '%';
            }


            if (!switches['CollectResBReset'] || gamePage.time.getCFU("ressourceRetrieval").val >= 1) {
                if (gamePage.time.getCFU("ressourceRetrieval").val > 0 && (!gamePage.challenges.isActive("1000Years") || gamePage.resPool.get("void").value > 800)){
                    if ( gamePage.resPool.get("unobtainium").value < gamePage.resPool.get("unobtainium").maxValue * 0.9 && (gamePage.resPool.energyProd - gamePage.resPool.energyCons >= 0 || gamePage.resPool.get("antimatter").value >= gamePage.resPool.get("antimatter").maxValue) && gamePage.calendar.day > 1 && (  (gamePage.calendar.cycle != 5 && gamePage.prestige.getPerk("numerology").researched) || (gamePage.time.meta[0].meta[5].val >= (gamePage.resPool.get('paragon').value > 100 ? 1 : 3) && tc_val >= (gamePage.resPool.get('paragon').value > 100 ? 1 : gamePage.time.meta[0].meta[5].val * 1000) )) && (((gamePage.calendar.cycle != 5 && gamePage.prestige.getPerk("numerology").researched) || ( (gamePage.time.meta[0].meta[5].val >= 3 || gamePage.time.heat < 50)  && (gamePage.workshop.get("relicStation").unlocked && !gamePage.workshop.get("relicStation").researched && gamePage.science.get("paradoxalKnowledge").researched)  && (tc_val > (fast_combust ? 5 : 45) && gamePage.bld.getBuildingExt('chronosphere').meta.val >= 10) && gamePage.space.getBuilding('sunlifter').val > 0 ))  || ( gamePage.time.meta[0].meta[5].val >= (gamePage.resPool.get('paragon').value > 100 ? 1 : 3) && ((gamePage.time.heat == 0 && ((gamePage.calendar.cycle != 5 && gamePage.prestige.getPerk("numerology").researched) || (gamePage.calendar.season > 0 && gamePage.time.meta[0].meta[5].val >= 3) ))  || ( (fast_combust ? true : gamePage.time.heat + 50 * factor < gamePage.getEffect("heatMax")) && tc_val > (gamePage.resPool.get('paragon').value > 100 ? (gamePage.time.meta[0].meta[5].val >= 3 ? 5 : 5000) : gamePage.time.meta[0].meta[5].val * 1000)  && gamePage.calendar.cycle == 5 &&  (gamePage.calendar.season > 0 || (fast_combust ? true : gamePage.time.heat < gamePage.getEffect("heatMax") * 0.5 && gamePage.calendar.day < 10))))))) {
                        if (gamePage.time.heat > gamePage.getEffect("heatMax") * 0.9 && factor *  chronoforge[0].controller.getPricesMultiple(chronoforge[0].model, 5).timeCrystal <= gamePage.getEffect("heatMax")  &&  [4, 5].indexOf(gamePage.calendar.cycle) == -1 && gamePage.time.meta[0].meta[5].val >= 1 && tc_val >= gamePage.timeTab.cfPanel.children[0].children[0].controller.getPricesMultiple(gamePage.timeTab.cfPanel.children[0].children[0].model, 5).timeCrystal ) {
                            if (gamePage.getEffect("heatMax") - gamePage.time.heat > chronoforge[0].controller.getPricesMultiple(chronoforge[0].model, 5).timeCrystal * factor){
                                gamePage.msg('Skip time (1): ' + gamePage.calendar.yearsPerCycle );
                                chronoforge[0].controller.doShatterAmt(chronoforge[0].model, gamePage.calendar.yearsPerCycle)
                                chronoforge[0].update();
                            }
                        }
                        else if (factor * chronoforge[0].controller.getPricesMultiple(chronoforge[0].model, 45).timeCrystal <= gamePage.getEffect("heatMax")  && (gamePage.calendar.cycle != 4 || gamePage.time.heat < gamePage.getEffect("heatMax") * 0.9) && gamePage.time.meta[0].meta[5].val >= 3 && tc_val >= gamePage.timeTab.cfPanel.children[0].children[0].controller.getPricesMultiple(gamePage.timeTab.cfPanel.children[0].children[0].model, 45).timeCrystal && gamePage.calendar.cycleYear == 0) {
                            if ( gamePage.getEffect("heatMax")  - gamePage.time.heat > chronoforge[0].controller.getPricesMultiple(chronoforge[0].model, 45).timeCrystal * factor &&  (gamePage.time.meta[0].meta[5].val >= 3 || (!gamePage.ironWill && gamePage.time.meta[0].meta[5].val >= 1))) {
                                gamePage.msg('Skip time (2): ' + gamePage.calendar.yearsPerCycle * (gamePage.calendar.cyclesPerEra - 1) );
                                chronoforge[0].controller.doShatterAmt(chronoforge[0].model, gamePage.calendar.yearsPerCycle * (gamePage.calendar.cyclesPerEra - 1))
                                chronoforge[0].update();
                            }
                        }
                        else if (factor * chronoforge[0].controller.getPricesMultiple(chronoforge[0].model, 5).timeCrystal <= gamePage.getEffect("heatMax")  && (gamePage.calendar.cycle != 4 || gamePage.time.heat < gamePage.getEffect("heatMax") * 0.9) && gamePage.time.meta[0].meta[5].val >= 1 &&  tc_val >= gamePage.timeTab.cfPanel.children[0].children[0].controller.getPricesMultiple(gamePage.timeTab.cfPanel.children[0].children[0].model, 5).timeCrystal) {
                            if (gamePage.getEffect("heatMax") - gamePage.time.heat > chronoforge[0].controller.getPricesMultiple(chronoforge[0].model, 5).timeCrystal * factor){
                                if (gamePage.calendar.cycle == 4) {
                                    gamePage.msg('Skip time (4): ' + gamePage.calendar.yearsPerCycle - gamePage.calendar.cycleYear );
                                    chronoforge[0].controller.doShatterAmt(chronoforge[0].model, gamePage.calendar.yearsPerCycle - gamePage.calendar.cycleYear)
                                    chronoforge[0].update();
                                } else {
                                    gamePage.msg('Skip time (3): ' + gamePage.calendar.yearsPerCycle );
                                    chronoforge[0].controller.doShatterAmt(chronoforge[0].model, gamePage.calendar.yearsPerCycle)
                                    chronoforge[0].update();
                                }
                            }
                        }
                        else if (tc_val >= gamePage.timeTab.cfPanel.children[0].children[0].controller.getPricesMultiple(gamePage.timeTab.cfPanel.children[0].children[0].model, 1).timeCrystal && gamePage.getEffect("heatMax") - gamePage.time.heat > chronoforge[0].controller.getPricesMultiple(chronoforge[0].model, 1).timeCrystal * factor) {
                                try {
                                       chronoforge[0].controller.buyItem(chronoforge[0].model, {}, function(result) {
                                        if (result) {
                                            chronoforge[0].update();
                                        }
                                        });
                                } catch(err) {
                                    console.log(err);
                                }
                        }
                    }
                }
                else if (gamePage.calendar.cycle != 5 && gamePage.time.getCFU("ressourceRetrieval").val == 0 && tc_val >= 1 && gamePage.time.heat < gamePage.getEffect("heatMax") / 2){
                    chronoforge[0].controller.doShatterAmt(chronoforge[0].model, 1);
                    chronoforge[0].update();
                }
            }
            if ( gamePage.time.getCFU("ressourceRetrieval").unlocked || (gamePage.time.getCFU("blastFurnace").unlocked && gamePage.time.getCFU("blastFurnace").val < 2)) {
                try {
                    for (var t = 1 ;t < chronoforge.length; t++) {
                        if (!switches['CollectResBReset'] ) {
                            if (chronoforge[t].model.metadata.name != "ressourceRetrieval" && gamePage.time.getCFU("ressourceRetrieval").unlocked && (gamePage.time.getCFU("ressourceRetrieval").val > 2 ? Math.min(chronoforge[t].model.prices.filter(res => res.name == "timeCrystal")[0].val, gamePage.resPool.get("timeCrystal").value) : gamePage.resPool.get("timeCrystal").value)  > gamePage.timeTab.cfPanel.children[0].children[6].model.prices.filter(res => res.name == "timeCrystal")[0].val * (gamePage.time.getCFU("ressourceRetrieval").val > 3 ? 0.9 : 0.05)  && (gamePage.time.getCFU("ressourceRetrieval").val <= 3 || gamePage.religion.getZU("marker").val > 1) )
                            {}
                            else if ( (t != 2 && t != 6) && ((( gamePage.calendar.year < 40000  && gamePage.resPool.get("timeCrystal").value < 20000) || chronoforge[t].model.prices.filter(res => res.name == 'timeCrystal')[0].val > chronoforge[6].model.prices.filter(res => res.name == 'timeCrystal')[0].val * (gamePage.resPool.get("timeCrystal").value > (gamePage.resPool.get("unobtainium").maxValue * 0.01) ? 0.1 : 0.01)) || gamePage.time.getCFU("ressourceRetrieval").val <= 3) )
                            {}
                            else if ( t == 7)
                            {}
                            else if (t == 2 && ((Math.floor(chronoforge[t].model.metadata.val / 8) - 1) * 5) > chronoforge[6].model.metadata.val)
                            {}
                            else if (chronoforge[t].model.metadata.unlocked && chronoforge[t].model.enabled) {
                                chronoforge[t].controller.buyItem(chronoforge[t].model, {}, function(result) {
                                    if (result) {
                                        chronoforge[t].update();
                                        gamePage.msg('Build in Time: ' + chronoforge[t].model.name );
                                    }
                                    });
                            }
                        }
                    }

                } catch(err) {
                    console.log(err);
                }
            }
        }


        if (gamePage.workshop.get("turnSmoothly").researched) {
            if ( !gamePage.time.isAccelerated && gamePage.resPool.get("temporalFlux").value >= gamePage.resPool.get("temporalFlux").maxValue) {
                gamePage.time.isAccelerated = true
            }
        }

}

function Service(){
    gamePage.ui.render();
    if (!switches["Iron Will"]) {
        gamePage.ironWill = false;
    }
}

var ActualTabs = Object.values(gamePage.tabs.filter(tab => tab.tabName != "Stats"));

function RenderNewTabs(){
    if(gamePage.tabs.filter(tab => tab.tabName != "Stats"  && !ActualTabs.includes(tab)).length > 0) {
        gamePage.tabs.filter(tab => tab.tabName != "Stats" && !ActualTabs.includes(tab)).forEach(tab => tab.render());
        ActualTabs = Object.values(gamePage.tabs.filter(tab => tab.tabName != "Stats"));
    }
    //space render
    else if(gamePage.tabs[6].GCPanel.children.filter(res => res.model.on == 1).length != gamePage.tabs[6].planetPanels.length){
        gamePage.tabs[6].render();
        ActualTabs = Object.values(gamePage.tabs.filter(tab => tab.tabName != "Stats"));
    }
}


if (gamePage.ironWill){
    if (gamePage.resPool.get("zebras").value == 0) {
        gamePage.msg('"Iron Will" mode will be off after 755 game ticks (if not switched)');
    }
    else if (!switches["Iron Will"]){
        autoSwitch('Iron Will',  'IronWill')
    }
}


function SellSpaceAndReset(){
     if (!gamePage.challenges.anyChallengeActive()) {
        msg = "Sell all space and Reset?";
        gamePage.ui.confirm($I("reset.confirmation.title"), msg, function() {
            let optsell = gamePage.opts.hideSell
            gamePage.opts.hideSell = false
            //sell all space
            if (gamePage.tabs[6].planetPanels.length > 3){
                gamePage.tabs[6].planetPanels[4].children[1].model.metadata.on = gamePage.tabs[6].planetPanels[4].children[1].model.metadata.val
            }
            for (var z = 0; z < gamePage.tabs[6].planetPanels.length; z++) {
                    var spBuild = gamePage.tabs[6].planetPanels[z].children;
                    try {
                        for (var s = 0 ;s < spBuild.length; s++) {
                            if (spBuild[s].model.metadata.unlocked && spBuild[s].model.metadata.val > 1 && spBuild[s].model.metadata.name != "containmentChamber") {
                                    spBuild[s].controller.sellInternal(spBuild[s].model,1);
                                }
                        }

                    } catch(err) {
                    console.log(err);
                    }
            }
            gamePage.opts.hideSell = optsell
            setTimeout(function() { gamePage.resetAutomatic(); }, 10000);
            console.log("reset will be in 10 sec")
            $("#PriorityLabel")[0].innerText = "reset will be in 10 sec"
            clearInterval(runAllAutomation);
        });
     }
     else {
         gamePage.msg('You are in challenge now, please reset manually.');
     }
}

function LabelMsg(){
    GlobalMsg['chronosphere'] = ''
    if (gamePage.bld.getBuildingExt('chronosphere').meta.val < 10 && gamePage.bld.getBuildingExt('chronosphere').meta.unlocked && gamePage.resPool.get("unobtainium").value > 0  && gamePage.resPool.get("timeCrystal").value > 0){
        GlobalMsg['chronosphere'] = gamePage.bld.getBuildingExt('chronosphere').meta.label + '(1-10) ' +  Math.min(Math.round((gamePage.resPool.get("timeCrystal").value/Chronosphere10SummPrices()["timeCrystal"])*100),Math.round((gamePage.resPool.get("unobtainium").value/Chronosphere10SummPrices()["unobtainium"])*100)) + '%';
    }


   let gmsgarr = []
   for (let key of Object.keys(GlobalMsg)) {
     if (GlobalMsg[key]) {
        gmsgarr[gmsgarr.length] = GlobalMsg[key]
     }
   }
   $("#PriorityLabel")[0].innerText =  gmsgarr.join(' / ')
}

function Chronosphere10SummPrices() {
	 	var bldPrices = gamePage.bld.getBuildingExt('chronosphere').get('prices');
		var ratio = gamePage.bld.getPriceRatioWithAccessor(gamePage.bld.getBuildingExt('chronosphere'));

		var prices = {};
        var sumVal = 0;

		for (var cr = 0; cr< bldPrices.length; cr++){
		    sumVal = 0;
		    for (var g = gamePage.bld.getBuildingExt('chronosphere').meta.val; g <= Math.max(gamePage.bld.getBuildingExt('chronosphere').meta.val,9); g++){
		        sumVal+= bldPrices[cr].val * Math.pow(ratio, g)
		    }

            prices[bldPrices[cr].name] = sumVal
		}
	    return prices;
}




gamePage.tabs.filter(tab => tab.tabId != "Stats" ).forEach(tab => tab.render());

// This function keeps track of the game's ticks and uses math to execute these functions at set times relative to the game.
gamePage.ui.render();

var tick = 0;

var runAllAutomation = setInterval(function() {
    if (tick != gamePage.timer.ticksTotal) {
        tick = gamePage.timer.ticksTotal;
        setTimeout(autoBuild, 2);
        setTimeout(autoNip, 0);
        setTimeout(autoRefine, 1);
        setTimeout(LabelMsg, 0);

        if (gamePage.timer.ticksTotal % 3 === 0) {
            setTimeout(autoObserve, 0);
            setTimeout(autoCraft2, 1);
            setTimeout(autoAssign, 0);
            gamePage.villageTab.updateTab();
             setTimeout(autoHunt, 3);
        }

        if (gamePage.timer.ticksTotal % 10 === 0) {
            setTimeout(autoSpace, 1);
        }

        if (gamePage.timer.ticksTotal % 25 === 0) {
             setTimeout(energyControl, 0);
             setTimeout(autoParty, 0);
             setTimeout(autoTrade, 1);
             setTimeout(autoResearch, 2);
             setTimeout(autoWorkshop, 2);
             setTimeout(autoPraise, 2);

        }

        if (gamePage.timer.ticksTotal % 30 === 0) {
             setTimeout(Timepage, 0);
        }

         if (gamePage.timer.ticksTotal % 50 === 0) {
             setTimeout(ResearchSolarRevolution, 0);
             setTimeout(UpgradeBuildings, 1);

        }

        if (gamePage.timer.ticksTotal % 151 === 0) {
            setTimeout(RenderNewTabs, 1);
        }
        if (gamePage.timer.ticksTotal % 11 === 0) {
            setTimeout(autozig, 0);
        }
        if (gamePage.timer.ticksTotal % 755 === 0) {
            setTimeout(Service, 2);
        }
    }

}, 50);

