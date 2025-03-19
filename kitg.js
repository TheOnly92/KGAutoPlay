// These will allow quick selection of the buildings which consume energy
(function(s){var w,f={},o=window,l=console,m=Math,z='postMessage',x='HackTimer.js by turuslan: ',v='Initialisation failed',p=0,r='hasOwnProperty',y=[].slice,b=o.Worker;function d(){do{p=0x7FFFFFFF>p?p+1:0}while(f[r](p));return p}if(!/MSIE 10/i.test(navigator.userAgent)){try{s=o.URL.createObjectURL(new Blob(["var f={},p=postMessage,r='hasOwnProperty';onmessage=function(e){var d=e.data,i=d.i,t=d[r]('t')?d.t:0;switch(d.n){case'a':f[i]=setInterval(function(){p(i)},t);break;case'b':if(f[r](i)){clearInterval(f[i]);delete f[i]}break;case'c':f[i]=setTimeout(function(){p(i);if(f[r](i))delete f[i]},t);break;case'd':if(f[r](i)){clearTimeout(f[i]);delete f[i]}break}}"]))}catch(e){}}if(typeof(b)!=='undefined'){try{w=new b(s);o.setInterval=function(c,t){var i=d();f[i]={c:c,p:y.call(arguments,2)};w[z]({n:'a',i:i,t:t});return i};o.clearInterval=function(i){if(f[r](i))delete f[i],w[z]({n:'b',i:i})};o.setTimeout=function(c,t){var i=d();f[i]={c:c,p:y.call(arguments,2),t:!0};w[z]({n:'c',i:i,t:t});return i};o.clearTimeout=function(i){if(f[r](i))delete f[i],w[z]({n:'d',i:i})};w.onmessage=function(e){var i=e.data,c,n;if(f[r](i)){n=f[i];c=n.c;if(n[r]('t'))delete f[i]}if(typeof(c)=='string')try{c=new Function(c)}catch(k){l.log(x+'Error parsing callback code string: ',k)}if(typeof(c)=='function')c.apply(o,n.p)};w.onerror=function(e){l.log(e)};l.log(x+'Initialisation succeeded')}catch(e){l.log(x+v);l.error(e)}}else l.log(x+v+' - HTML5 Web Worker is not supported')})('HackTimerWorker.min.js');

var deadScript = "Script is dead";
var GlobalMsg = {'craft':'','tech':'','relicStation':'','solarRevolution':'','ressourceRetrieval':'','chronosphere':'', 'science':'', 'priorityJob': '', 'build': ''};
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
'<button id="SellSpace" onclick="sellSpaceAndReset();">Sell Space and Reset</button> </br>' +
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
        const result = upgrade.controller.buyItem(upgrade.model, {});
        if (result.itemBought) {
          upgrade.update();
          gamePage.msg('Religion researched: ' + upgrade.model.name);
        }
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
        const result = upgrade.controller.buyItem(upgrade.model, {});
        if (result.itemBought) {
          upgrade.update();
          gamePage.msg('Religion Cryptotheology researched: ' + upgrade.model.name);
        }
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
            const result = pact.controller.buyItem(pact.model);
            if (result.itemBought) {
              pact.update();
              gamePage.msg('Religion Pact accepted: ' + pact.model.name);
            }
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
      const result = payDebt.controller.buyItem(payDebt.model, {});
      if (result.itemBought) {
        payDebt.update();
        gamePage.msg('Religion : ' + payDebt.model.name);
      }
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
      const isNotPriorityBuilding = NOT_PRIORITY_BLD_NAMES_SET.has(model.metadata.name);
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
    timeCrystalResource.value - calculateChronosphere10Prices()["timeCrystal"] > 100 &&
    gamePage.time.meta[0].meta[5].val > 0) {
    return true;
  }

  // Case 3: Under 10 chronospheres with enough resources
  if (chronosphereVal < 10 &&
    ((unobtainiumResource.value >= calculateChronosphere10Prices()["unobtainium"] &&
      timeCrystalResource.value >= calculateChronosphere10Prices()["timeCrystal"]) ||
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
  const result = controller.buyItem(model, {});
  if (result.itemBought) {
    building.update();
    gamePage.msg('Build: ' + building.model.metadata.label);
  }
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
        const result = building.controller.buyItem(building.model, {});
        if (result.itemBought) {
          building.update();
          gamePage.msg('Build in Space: ' + building.model.name);
        }
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
        const result = program.controller.buyItem(program.model, {});
        if (result.itemBought) {
          program.update();
          gamePage.msg('Research Space program: ' + program.model.name);
        }
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
      calculateChronosphere10Prices()["timeCrystal"] : 6)) {
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
    timeCrystal.value >= calculateChronosphere10Prices()['timeCrystal'] &&
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

    const result = lowestEmbassyRace.embassyButton.controller.buyItem(
      lowestEmbassyRace.embassyButton.model,
      {}
    );
    if (result.itemBought) {
      lowestEmbassyRace.embassyButton.update();
    }
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
 * Buildings that should have extremely low priority.
 * Uses a Set for instant (O(1)) membership checks.
 */
const NOT_PRIORITY_BLD_NAMES_SET = new Set([
  "temple","tradepost","aiCore","unicornPasture","chronosphere","mint",
  "chapel","zebraOutpost","zebraWorkshop","zebraForge","brewery","accelerator",
  "ivoryTemple"
]);

/**
 * Certain workshop upgrades require specific resource thresholds.
 * Each entry is: [ workshopUpgradeObject, [ [resName, amountNeeded], ... ] ]
 */
const WORKSHOP_UPGRADES_CRAFT = [
  [ gamePage.workshop.get("printingPress"),     [ ["gear",     45 * 1.2] ] ],
  [ gamePage.workshop.get("fluidizedReactors"), [ ["alloy",   200 * 1.2] ] ],
  [ gamePage.workshop.get("oxidation"),         [ ["steel",  5000 * 1.2] ] ],
  [ gamePage.workshop.get("miningDrill"),       [ ["steel",   750 * 1.2] ] ],
  [ gamePage.workshop.get("steelPlants"),       [ ["gear",    750 * 1.2] ] ],
  [ gamePage.workshop.get("rotaryKiln"),        [ ["gear",    500 * 1.2] ] ]
];

/**
 * Script tracks the current building priority in:
 *   [ buildingName, buildingPrices, buildingCurrentVal, neededResourceNames[] ]
 */
let craftPriority = [[], [], 0, []];

/**
 * Maintains:
 *  - how many times we've tried crafting for the current building
 *  - which sub-resources are needed for that building
 */
const autoCraftState = {
  craftAttemptsCount: 0,
  neededResources: {}
};

/**
 * Creates a Map of buildingName -> function.
 * Each function returns a numeric "priority factor."
 * If a building is not in this map or is in the "not priority" set,
 * the script falls back to a minimal factor (0.00000001).
 */
function getBuildingsPriorityMap() {
  const map = new Map();

  /**
   * Helper function to add a building's priority factor logic.
   * bldName: string (e.g., "hut")
   * fn:      function returning a numeric factor based on game state
   */
  function addBuildingPriority(bldName, fn) {
    map.set(bldName, fn);
  }

  /*
   * Fill in **all** buildings from the prior "big switch" logic.
   * Each building is assigned a function returning its factor.
   *
   * If the building is also in NOT_PRIORITY_BLD_NAMES_SET,
   * the function can simply return 0.00000001, or that check
   * can happen outside. We do a short-circuit inside for clarity.
   */

  addBuildingPriority("hut", () => {
    if (NOT_PRIORITY_BLD_NAMES_SET.has("hut")) {
      return 0.00000001;
    }
    const agriculture = gamePage.science.get("agriculture").researched;
    if (!agriculture) {
      return 1;
    }
    const mineVal     = gamePage.bld.getBuildingExt("mine").meta.val;
    const paragon     = gamePage.resPool.get("paragon").value;
    const kittens     = gamePage.village.getKittens();
    const anyCh       = gamePage.challenges.anyChallengeActive();
    const solarRev    = (gamePage.religion.getRU("solarRevolution").val === 1);
    if (mineVal > 0) {
      const isLowParagon = (paragon < 200 && !anyCh && solarRev);
      return 7 * ((paragon > 200 || kittens > 70) ? 1 : (isLowParagon ? 10 : 2));
    }
    return 5;
  });

  addBuildingPriority("logHouse", () => {
    if (NOT_PRIORITY_BLD_NAMES_SET.has("logHouse")) {
      return 0.00000001;
    }
    const paragon  = gamePage.resPool.get("paragon").value;
    const kittens  = gamePage.village.getKittens();
    const anyCh    = gamePage.challenges.anyChallengeActive();
    const solarRev = (gamePage.religion.getRU("solarRevolution").val === 1);
    const isLowParagon = (paragon < 200 && !anyCh && solarRev);
    return 7 * ((paragon > 200 || kittens > 70) ? 1 : (isLowParagon ? 10 : 2));
  });

  addBuildingPriority("mansion", () => {
    if (NOT_PRIORITY_BLD_NAMES_SET.has("mansion")) {
      return 0.00000001;
    }
    const titanium    = gamePage.resPool.get("titanium").value;
    const steelVal    = gamePage.resPool.get("steel").value;
    const mansionVal  = gamePage.bld.getBuildingExt("mansion").meta.val;
    if (titanium > 300 && (steelVal > 300 || mansionVal > 10)) {
      return 1.5;
    }
    return 0.00000001;
  });

  addBuildingPriority("steamworks", () => {
    if (NOT_PRIORITY_BLD_NAMES_SET.has("steamworks")) {
      return 0.00000001;
    }
    const val = gamePage.bld.getBuildingExt("steamworks").meta.val;
    if (gamePage.challenges.isActive("pacifism") && val < 5) {
      return 50;
    }
    const magnetoVal = gamePage.bld.getBuildingExt("magneto").meta.val;
    return (magnetoVal > 0) ? 2 : 0.00000001;
  });

  addBuildingPriority("magneto", () => {
    if (NOT_PRIORITY_BLD_NAMES_SET.has("magneto")) {
      return 0.00000001;
    }
    const val = gamePage.bld.getBuildingExt("magneto").meta.val;
    return (val > 10) ? 2 : 0.00000001;
  });

  addBuildingPriority("factory", () => {
    if (NOT_PRIORITY_BLD_NAMES_SET.has("factory")) {
      return 0.00000001;
    }
    const titanium   = gamePage.resPool.get("titanium").value;
    const magnetoVal = gamePage.bld.getBuildingExt("magneto").meta.val;
    if (titanium > 300 && magnetoVal > 10) {
      return 3;
    }
    return 0.00000001;
  });

  addBuildingPriority("reactor", () => {
    if (NOT_PRIORITY_BLD_NAMES_SET.has("reactor")) {
      return 0.00000001;
    }
    const magnetoVal = gamePage.bld.getBuildingExt("magneto").meta.val;
    return (magnetoVal > 10) ? 10 : 0.00000001;
  });

  addBuildingPriority("warehouse", () => {
    if (NOT_PRIORITY_BLD_NAMES_SET.has("warehouse")) {
      return 0.00000001;
    }
    const stage = gamePage.bld.getBuildingExt("warehouse").meta.stage;
    return (stage === 1) ? 0 : 0.0001;
  });

  addBuildingPriority("quarry", () => {
    if (NOT_PRIORITY_BLD_NAMES_SET.has("quarry")) {
      return 0.00000001;
    }
    const val = gamePage.bld.getBuildingExt("quarry").meta.val;
    return (val < 5) ? 10 : 1.1;
  });

  addBuildingPriority("harbor", () => {
    if (NOT_PRIORITY_BLD_NAMES_SET.has("harbor")) {
      return 0.00000001;
    }
    const harborVal = gamePage.bld.getBuildingExt("harbor").meta.val;
    const plateReq  = gamePage.bld.getPrices("harbor").find(r => r.name === "plate").val;
    const plateHave = gamePage.resPool.get("plate").value;
    const shipVal   = gamePage.resPool.get("ship").value;
    if (harborVal > 100 || (shipVal > 0 && plateHave > plateReq)) {
      return 1;
    }
    return 0.0001;
  });

  addBuildingPriority("smelter", () => {
    if (NOT_PRIORITY_BLD_NAMES_SET.has("smelter")) {
      return 0.00000001;
    }
    const amphVal   = gamePage.bld.getBuildingExt("amphitheatre").meta.val;
    if (amphVal > 0) {
      const solarRev = (gamePage.religion.getRU("solarRevolution").val === 1);
      const goldVal  = gamePage.resPool.get("gold").value;
      const smVal    = gamePage.bld.getBuildingExt("smelter").meta.val;
      const smOn     = gamePage.bld.getBuildingExt("smelter").meta.on;
      if (!solarRev) {
        // If gold < 500 and smelter is fully on
        if (goldVal < 500 && smOn === smVal) {
          return 100;
        }
        return 5;
      }
      return 5;
    } else if (gamePage.challenges.isActive("pacifism")) {
      return 100;
    }
    return 0.0001;
  });

  addBuildingPriority("observatory", () => {
    if (NOT_PRIORITY_BLD_NAMES_SET.has("observatory")) {
      return 0.00000001;
    }
    const blackSky   = gamePage.challenges.isActive("blackSky");
    const shipVal    = gamePage.resPool.get("ship").value;
    const solarRev   = (gamePage.religion.getRU("solarRevolution").val === 1);
    const obsVal     = gamePage.bld.getBuildingExt("observatory").meta.val;
    const starVal    = gamePage.resPool.get("starchart").value;
    const atheism    = gamePage.challenges.isActive("atheism");

    if (!blackSky && shipVal === 0 && solarRev) {
      return 100;
    }
    if (shipVal === 0 && obsVal > 10 && starVal >= 25) {
      return 0.00000001;
    }
    return ((solarRev || atheism) ? 0.5 : 0.0001);
  });

  addBuildingPriority("oilWell", () => {
    if (NOT_PRIORITY_BLD_NAMES_SET.has("oilWell")) {
      return 0.00000001;
    }
    const val = gamePage.bld.getBuildingExt("oilWell").meta.val;
    const coal= gamePage.resPool.get("coal").value;
    const oil = gamePage.resPool.get("oil").value;
    if (val === 0 && coal > 0) {
      return 10;
    }
    return (oil < 500 ? 1 : 0.01);
  });

  addBuildingPriority("lumberMill", () => {
    if (NOT_PRIORITY_BLD_NAMES_SET.has("lumberMill")) {
      return 0.00000001;
    }
    const ironReq = gamePage.bld.getPrices("lumberMill").find(r => r.name === "iron").val;
    const iron    = gamePage.resPool.get("iron").value;
    const solarRev= (gamePage.religion.getRU("solarRevolution").val === 1);
    const paragon = gamePage.resPool.get("paragon").value;
    if (ironReq + 150 <= iron) {
      return 1;
    }
    return ((solarRev ? 0.005 : 0.0001) * (paragon > 200 ? 1 : 2));
  });

  addBuildingPriority("calciner", () => {
    if (NOT_PRIORITY_BLD_NAMES_SET.has("calciner")) {
      return 0.00000001;
    }
    const val       = gamePage.bld.getBuildingExt("calciner").meta.val;
    const oilNeeded = gamePage.bld.getPrices("calciner").find(r => r.name === "oil").val;
    const titanium  = gamePage.resPool.get("titanium").value;
    const oilHave   = gamePage.resPool.get("oil").value;
    const blackSky  = gamePage.challenges.isActive("blackSky");
    if ((titanium > 0 && (val > 10 || oilHave > oilNeeded)) || blackSky) {
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
  });

  addBuildingPriority("biolab", () => {
    if (NOT_PRIORITY_BLD_NAMES_SET.has("biolab")) {
      return 0.00000001;
    }
    const val = gamePage.bld.getBuildingExt("biolab").meta.val;
    return (val > 500) ? 1 : 0.0001;
  });

  addBuildingPriority("aqueduct", () => {
    if (NOT_PRIORITY_BLD_NAMES_SET.has("aqueduct")) {
      return 0.00000001;
    }
    const stage = gamePage.bld.getBuildingExt("aqueduct").meta.stage;
    return (stage === 1) ? 0.01 : 0.1;
  });

  addBuildingPriority("amphitheatre", () => {
    if (NOT_PRIORITY_BLD_NAMES_SET.has("amphitheatre")) {
      return 0.00000001;
    }
    const ampVal   = gamePage.bld.getBuildingExt("amphitheatre").meta.val;
    const ampStage = gamePage.bld.getBuildingExt("amphitheatre").meta.stage;
    const parch    = gamePage.resPool.get("parchment").value;
    if (ampVal === 0 && parch > 0) {
      return 7;
    } else if (ampStage === 0 && parch > 0) {
      return 3;
    }
    return 0.00000001;
  });

  addBuildingPriority("ziggurat", () => {
    if (NOT_PRIORITY_BLD_NAMES_SET.has("ziggurat")) {
      return 0.00000001;
    }
    const zVal = gamePage.bld.getBuildingExt("ziggurat").meta.val;
    const blueprintCost = gamePage.bld.getPrices("ziggurat").find(r => r.name === "blueprint").val;
    const blueprintHave= gamePage.resPool.get("blueprint").value;
    const theologyRes  = gamePage.science.get("theology").researched;
    if (zVal > 100) {
      return 1;
    } else if (
      zVal < 20 && blueprintCost <= blueprintHave &&
      theologyRes && blueprintHave > 100
    ) {
      return 0.1;
    } else if (blueprintHave > 500) {
      return 0.01;
    }
    return 0.00000001;
  });

  addBuildingPriority("mine", () => {
    if (NOT_PRIORITY_BLD_NAMES_SET.has("mine")) {
      return 0.00000001;
    }
    const mineVal = gamePage.bld.getBuildingExt("mine").meta.val;
    const paragon = gamePage.resPool.get("paragon").value;
    if (mineVal > 0) {
      return (1 * (paragon > 200 ? 1 : 2));
    }
    return 10;
  });

  addBuildingPriority("workshop", () => {
    if (NOT_PRIORITY_BLD_NAMES_SET.has("workshop")) {
      return 0.00000001;
    }
    const val = gamePage.bld.getBuildingExt("workshop").meta.val;
    return (val > 0) ? 2 : 10;
  });

  addBuildingPriority("pasture", () => {
    if (NOT_PRIORITY_BLD_NAMES_SET.has("pasture")) {
      return 0.00000001;
    }
    return 0.0001;
  });

  addBuildingPriority("library", () => {
    if (NOT_PRIORITY_BLD_NAMES_SET.has("library")) {
      return 0.00000001;
    }
    const libVal = gamePage.bld.getBuildingExt("library").meta.val;
    return (libVal <= 10) ? 1 : 0.01;
  });

  addBuildingPriority("field", () => {
    if (NOT_PRIORITY_BLD_NAMES_SET.has("field")) {
      return 0.00000001;
    }
    const postApo   = gamePage.challenges.isActive("postApocalypse");
    const pollLevel = gamePage.bld.getPollutionLevel();
    const engRes    = gamePage.science.get("engineering").researched;
    if ((postApo && pollLevel >= 5) || !engRes) {
      return 0;
    }
    return 0.01;
  });

  return map;
}

/**
 * Retrieves the building's factor from buildingsPriorityMap.
 * If it is missing or in NOT_PRIORITY_BLD_NAMES_SET,
 * returns a tiny fallback factor.
 */
function getPriorityFactorForBuilding(bldName, buildingsPriorityMap) {
  if (NOT_PRIORITY_BLD_NAMES_SET.has(bldName)) {
    return 0.00000001;
  }
  const fn = buildingsPriorityMap.get(bldName);
  if (!fn) {
    return 0.00000001;
  }
  return fn();
}

/**
 * Returns a Map of resourceName -> definition object,
 * describing sub-ingredients, target logic, canCraft, and isActive.
 */
function getResourcesMap() {
  const ratio = gamePage.getCraftRatio() + 1;
  const resourcesMap = new Map();

  /**
   * Adds a resource definition to the resourcesMap.
   * name:     string (e.g., "beam")
   * subIngs:  array of [ [ingredientName, amount], ... ]
   * computeFn: function returning how many units are desired
   * canVal:   boolean or function => boolean
   * activeVal: boolean or function => boolean
   */
  function addResource(name, subIngs, computeFn, canVal, activeVal) {
    resourcesMap.set(name, {
      subIngs,
      computeTarget: computeFn,
      canCraft: canVal,
      isActive: activeVal
    });
  }

  // ------------- Resource Definitions ------------------
  // Replicates the logic from beam -> tMythril
  // If the developer changes game logic, it can be updated here.

  addResource(
    "beam",
    [["wood", 175]],
    () => {
      const wood = gamePage.resPool.get("wood").value;
      return Math.min((wood / 175) * ratio, 50000);
    },
    true,
    true
  );

  addResource(
    "slab",
    [["minerals", 250]],
    () => {
      const minerals = gamePage.resPool.get("minerals").value;
      return Math.min((minerals / 250) * ratio, 50000);
    },
    () => !gamePage.ironWill,
    true
  );

  addResource(
    "steel",
    [["iron",100], ["coal",100]],
    () => {
      const ironVal = gamePage.resPool.get("iron").value;
      const coalVal = gamePage.resPool.get("coal").value;
      const fromIron= (ironVal / 100) * ratio;
      const fromCoal= (coalVal / 100) * ratio;
      const base    = Math.min(fromIron, fromCoal);
      const limited = Math.max(base, 75);
      return Math.min(limited, 50000);
    },
    true,
    true
  );

  addResource(
    "plate",
    [["iron",125]],
    () => {
      const ironVal     = gamePage.resPool.get("iron").value;
      const plateVal    = gamePage.resPool.get("plate").value;
      const titanVal    = gamePage.resPool.get("titanium").value;
      const reacUnlocked= gamePage.bld.getBuildingExt("reactor").meta.unlocked;
      const reacCost    = gamePage.bld.getPrices("reactor");
      const storageLimited = gamePage.resPool.isStorageLimited(reacCost);

      if (reacUnlocked && !storageLimited) {
        if (gamePage.ironWill) {
          return 15;
        }
        if (plateVal < 200) {
          return 200;
        }
        if (titanVal > 300) {
          return reacCost[1].val; // often the titanium cost for reactor
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
    true,
    true
  );

  addResource(
    "concrate",
    [["steel",25], ["slab",2500]],
    () => {
      return (gamePage.resPool.get("eludium").value > 125)
        ? gamePage.resPool.get("steel").value
        : 0;
    },
    true,
    true
  );

  addResource(
    "gear",
    [["steel",15]],
    () => 25,
    true,
    true
  );

  addResource(
    "alloy",
    [["steel",75], ["titanium",10]],
    () => {
      const steelVal = gamePage.resPool.get("steel").value;
      const titanVal = gamePage.resPool.get("titanium").value;
      const eludVal  = gamePage.resPool.get("eludium").value;
      const baseSteel= (steelVal / 75) * ratio;
      const baseTitan= (titanVal / 10) * ratio;

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
    true,
    true
  );

  addResource(
    "eludium",
    [["unobtainium",1000], ["alloy",2500]],
    () => {
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
      const unobVal   = gamePage.resPool.get("unobtainium").value;
      const unobMax   = gamePage.resPool.get("unobtainium").maxValue;
      const tcVal     = gamePage.resPool.get("timeCrystal").value;
      const nearFull  = (unobVal > unobMax * 0.9);
      const bigCheck  = (unobVal >= Math.max(
        eludVal,
        (tcVal > 1000000
          ? unobMax * 0.3
          : (eludVal < 100000 ? 200000 : unobMax * 0.1)
        )
      ));
      if (nearFull || bigCheck) {
        return (tcVal * 2 + 1);
      }
      return 0;
    },
    true,
    true
  );

  addResource(
    "scaffold",
    [["beam",50]],
    () => 0,
    true,
    true
  );

  addResource(
    "ship",
    [["scaffold",100], ["plate",150], ["starchart",25]],
    () => {
      if (!gamePage.workshop.get("geodesy").researched) {
        return 100;
      }
      const starVal = gamePage.resPool.get("starchart").value;
      const shipVal = gamePage.resPool.get("ship").value;
      if (starVal > 600 || shipVal > 500) {
        return Math.min(
          gamePage.resPool.get("plate").value,
          100 + (starVal - 500)/25
        );
      }
      return 100;
    },
    true,
    true
  );

  addResource(
    "tanker",
    [
      ["ship",      200],
      ["kerosene",  gamePage.resPool.get("oil").maxValue * 2],
      ["alloy",     1250],
      ["blueprint", 5]
    ],
    () => 0,
    true,
    true
  );

  addResource(
    "kerosene",
    [["oil",7500]],
    () => {
      const oilVal = gamePage.resPool.get("oil").value;
      return Math.min((oilVal / 7500) * ratio, 50000);
    },
    true,
    true
  );

  addResource(
    "parchment",
    [["furs",175]],
    () => {
      if (gamePage.resPool.get("starchart").value <= 1) {
        return 0;
      }
      if (gamePage.religion.getRU("solarRevolution").val === 1) {
        return gamePage.resPool.get("furs").value / 3;
      }
      return 100;
    },
    true,
    true
  );

  addResource(
    "manuscript",
    [["parchment",25], ["culture",400]],
    () => {
      if (gamePage.ironWill) {
        const cultVal      = gamePage.resPool.get("culture").value;
        const nagaUnlocked = gamePage.diplomacy.get("nagas").unlocked;
        return (cultVal > 1600 || nagaUnlocked) ? 50 : 0;
      }
      if (
        gamePage.religion.getRU("solarRevolution").val === 1 &&
        gamePage.resPool.get("culture").value >= gamePage.resPool.get("culture").maxValue
      ) {
        return gamePage.resPool.get("parchment").value / 3;
      }
      return 200;
    },
    true,
    () => {
      if (gamePage.ironWill) {
        return (
          gamePage.resPool.get("culture").value > 1600 ||
          gamePage.diplomacy.get("nagas").unlocked
        );
      }
      return true;
    }
  );

  addResource(
    "compedium",
    [["manuscript",50], ["science",10000]],
    () => {
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
    true,
    () => (gamePage.resPool.get("manuscript").value > 200)
  );

  addResource(
    "blueprint",
    [["compedium",25], ["science",25000]],
    () => 0,
    true,
    () => (gamePage.resPool.get("compedium").value > 200)
  );

  addResource(
    "thorium",
    [["uranium",250]],
    () => {
      const uraVal = gamePage.resPool.get("uranium").value;
      return Math.min((uraVal / 250) * ratio, 50000);
    },
    true,
    true
  );

  addResource(
    "megalith",
    [["slab",50], ["beam",25], ["plate",5]],
    () => 0,
    true,
    () => (gamePage.resPool.get("manuscript").value > 300)
  );

  addResource(
    "tMythril",
    [["bloodstone",5], ["ivory",1000], ["titanium",500]],
    () => 5,
    true,
    () => (gamePage.ironWill && gamePage.resPool.get("tMythril").value < 5)
  );

  return resourcesMap;
}

/**
 * Computes the missing resources for a building's prices,
 * including sub-crafting, using resourcesMap for O(1) lookups.
 */
function getMissingResourcesCost(prices, resourcesMap) {
  let total = 0;
  for (const priceObj of prices) {
    const neededName = priceObj.name;
    const neededVal  = priceObj.val;
    const have       = gamePage.resPool.get(neededName).value;

    let resSum = 1;
    if (neededVal > have) {
      const missing = neededVal - have;
      resSum = computeSubCraftingCost(neededName, missing, resourcesMap);
    }
    total += resSum;
  }
  return total;
}

/**
 * Recursively calculates sub-crafting cost for a single resource,
 * referencing resourcesMap for sub-ingredient definitions.
 */
function computeSubCraftingCost(resourceName, missing, resourcesMap) {
  let cost = 1;
  const def = resourcesMap.get(resourceName);
  if (!def) {
    return missing;
  }

  for (const [subName, subAmt] of def.subIngs) {
    let differ2 = (subAmt * missing)/(gamePage.getCraftRatio() + 1)
                  - gamePage.resPool.get(subName).value;
    if (differ2 < 0) {
      differ2 = 0;
    }

    let subResSum = 1;
    const subDef = resourcesMap.get(subName);
    if (subDef) {
      for (const [deepName, deepAmt] of subDef.subIngs) {
        subResSum += (deepAmt * differ2)/(gamePage.getCraftRatio() + 1);
      }
    }
    const directCost = (subAmt * missing)/(gamePage.getCraftRatio() + 1);
    cost += Math.max(directCost, subResSum);
  }

  return cost;
}

/**
 * Sorts all unlocked buildings by (missingCost / buildingFactor)
 * and picks the best one.
 */
function findNextPriorityBuilding(resourcesMap, buildingsPriorityMap) {
  const allBlds = gamePage.tabs[0].children.filter(child =>
    child.model.metadata &&
    child.model.metadata.unlocked &&
    !child.model.resourceIsLimited
  );

  const candidates = [];

  for (const bld of allBlds) {
    const meta    = bld.model.metadata;
    const bldName = meta.name;

    if (gamePage.ironWill && meta.effects && meta.effects.maxKittens) {
      continue;
    }
    const blueprintCost = bld.model.prices.filter(r => r.name === "blueprint");
    if (blueprintCost.length && meta.val === 0) {
      // If we need blueprint but we have none
      if (gamePage.resPool.get("blueprint").value < blueprintCost[0].val) {
        continue;
      }
    }

    const factor = getPriorityFactorForBuilding(bldName, buildingsPriorityMap);
    if (factor <= 0.00000001) {
      continue;
    }
    candidates.push([ factor, bldName, bld.model.prices ]);
  }

  if (!candidates.length) {
    return null;
  }

  candidates.sort((a, b) => {
    const costA  = getMissingResourcesCost(a[2], resourcesMap);
    const costB  = getMissingResourcesCost(b[2], resourcesMap);
    const scoreA = costA / a[0];
    const scoreB = costB / b[0];
    return scoreA - scoreB;
  });

  return {
    factor:       candidates[0][0],
    buildingName: candidates[0][1],
    prices:       candidates[0][2]
  };
}

/**
 * Updates autoCraftState.neededResources with sub-ingredients
 * required for the chosen building. Then updates craftPriority.
 */
function updateCraftPriority(bld, resourcesMap) {
  autoCraftState.neededResources = {};

  const { buildingName, prices } = bld;

  for (const priceObj of prices) {
    const neededName = priceObj.name;
    const neededVal  = priceObj.val;
    const have       = gamePage.resPool.get(neededName).value;

    if (neededVal > have) {
      autoCraftState.neededResources[neededName] = neededVal;
      const def = resourcesMap.get(neededName);
      if (def) {
        for (const [subName, subAmt] of def.subIngs) {
          const subNeeded = ((subAmt * (neededVal - have))
            - gamePage.resPool.get(subName).value)
            / (gamePage.getCraftRatio() + 1);
          if (subNeeded > 0) {
            autoCraftState.neededResources[subName] = Math.max(
              autoCraftState.neededResources[subName] || 0,
              subNeeded,
              1
            );
          }
        }
      }
    }
  }

  craftPriority = [
    buildingName,
    prices,
    gamePage.bld.getBuildingExt(buildingName).meta.val,
    Object.keys(autoCraftState.neededResources)
  ];
}

/**
 * If a workshop upgrade is unlocked but not researched,
 * makes sure we gather the needed resources.
 */
function handleWorkshopUpgrades() {
  if (gamePage.resPool.get("ship").value <= 0) {
    return;
  }
  for (let i = 0; i < WORKSHOP_UPGRADES_CRAFT.length; i++) {
    const [upgradeObj, neededResArr] = WORKSHOP_UPGRADES_CRAFT[i];

    if (upgradeObj.researched) {
      WORKSHOP_UPGRADES_CRAFT.splice(i,1);
      i--;
      continue;
    }
    if (!upgradeObj.unlocked) {
      continue;
    }

    let missing = false;
    for (const [reqName, reqVal] of neededResArr) {
      const have = gamePage.resPool.get(reqName).value;
      if (have < reqVal) {
        missing = true;
        autoCraftState.neededResources[reqName] = Math.max(
          autoCraftState.neededResources[reqName] || 0,
          reqVal
        );
      }
    }
    if (missing) {
      GlobalMsg.tech = upgradeObj.label;
      break;
    }
  }
}

/**
 * Crafts resources indicated by autoCraftState.neededResources
 * by referencing the definitions in resourcesMap.
 */
function performPriorityCrafts(resourcesMap) {
  const resourceArray = [];

  // Build an array from the Map so we can sort/filter
  for (const [rName, def] of resourcesMap.entries()) {
    let target = def.computeTarget();
    const canVal  = (typeof def.canCraft === "function") ? def.canCraft() : def.canCraft;
    const actVal  = (typeof def.isActive === "function") ? def.isActive() : def.isActive;

    let finalCan   = canVal;
    let finalActive= actVal;

    // If autoCraftState says we specifically need this resource
    if (autoCraftState.neededResources[rName]) {
      const desired = autoCraftState.neededResources[rName];
      if (target < desired) {
        target = desired;
      }
      finalActive = true;
      finalCan    = false;
    } else {
      // If sub-ingredients are needed, possibly disable this resource
      for (const [subName] of def.subIngs) {
        if (
          autoCraftState.neededResources[subName] &&
          !["plate","ship","eludium","alloy"].includes(rName)
        ) {
          finalActive = false;
          finalCan    = false;
        }
      }
    }

    resourceArray.push({
      rName,
      subIngs: def.subIngs,
      target,
      canVal: finalCan,
      active: finalActive
    });
  }

  // Filter to items that are active and unlocked
  const craftableList = resourceArray.filter(item => {
    const craftObj = gamePage.workshop.getCraft(item.rName);
    return craftObj && craftObj.unlocked && item.active;
  });

  // Sort them by how many units we have
  craftableList.sort((a,b) => {
    return gamePage.resPool.get(a.rName).value - gamePage.resPool.get(b.rName).value;
  });

  // Attempt to craft each up to its target
  for (const item of craftableList) {
    const curVal = gamePage.resPool.get(item.rName).value;
    if (curVal >= item.target) {
      continue;
    }
    let canCraftCount = Infinity;
    for (const [ingName, ingAmt] of item.subIngs) {
      const haveIng = gamePage.resPool.get(ingName).value;
      const possible = Math.floor(haveIng / ingAmt);
      if (possible < canCraftCount) {
        canCraftCount = possible;
      }
    }
    if (canCraftCount === Infinity) {
      canCraftCount = 0;
    }

    if (canCraftCount > 0) {
      // Special case logic for certain resources:
      if (item.rName === "ship") {
        const shipVal = gamePage.resPool.get("ship").value;
        if (
          shipVal < 100 ||
          (shipVal < 5000 && gamePage.workshop.get("geodesy").researched) ||
          gamePage.resPool.get("starchart").value > 1500
        ) {
          gamePage.craft(item.rName, canCraftCount);
        }
      } else if (item.rName === "kerosene") {
        if (
          gamePage.resPool.get("oil").value >= gamePage.resPool.get("oil").maxValue * 0.9 ||
          (gamePage.resPool.get("kerosene").value < 50000 &&
           gamePage.resPool.get("oil").value > 1000000)
        ) {
          gamePage.craft(item.rName, canCraftCount);
        }
      } else if (item.rName === "eludium") {
        gamePage.craft(item.rName, canCraftCount);
      } else {
        gamePage.craft(item.rName, canCraftCount);
      }
    }
  }
}

/**
 * Converts resources near their max storage into refined goods,
 * preventing overflow waste.
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

  for (const [rawName, craftName, cost] of conversions) {
    const rawRes = gamePage.resPool.get(rawName);
    if (!rawRes) {
      continue;
    }
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
      // If near the max
      if (rawRes.value > (rawRes.maxValue - resourcePerTick * 5)) {
        const toCraft = Math.floor(resourcePerCraftTrade / cost);
        if (toCraft > 0) {
          gamePage.craft(craftName, toCraft);
        }
      }
    } else {
      // If unbounded but we have more than the next resource
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
 * Main entry point. Builds the buildingPriorityMap and resourceMap,
 * picks or updates building priority, gathers workshop upgrades,
 * performs priority crafting, and handles overflow conversions.
 */
function autoCraft2() {
  GlobalMsg.tech  = "";
  GlobalMsg.craft = "";

  // Build the building priorities map (with addBuildingPriority)
  const buildingsPriorityMap = getBuildingsPriorityMap();

  // Build resource definitions map (with addResource)
  const resourcesMap = getResourcesMap();

  // Check if we need a new building
  const currentBldName  = craftPriority[0];
  const currentBldLevel = craftPriority[2];
  let buildingLevelChanged = false;

  if (currentBldName && currentBldName.length > 0) {
    const ext = gamePage.bld.getBuildingExt(currentBldName);
    if (ext && ext.meta.val !== currentBldLevel) {
      buildingLevelChanged = true;
    }
  }

  // If no building is set, or we tried > 200 times,
  // or the building advanced a level, pick a new building.
  if (
    !currentBldName || currentBldName.length === 0 ||
    autoCraftState.craftAttemptsCount === 0 ||
    autoCraftState.craftAttemptsCount > 200 ||
    buildingLevelChanged
  ) {
    const nextBld = findNextPriorityBuilding(resourcesMap, buildingsPriorityMap);
    if (nextBld) {
      updateCraftPriority(nextBld, resourcesMap);
      autoCraftState.craftAttemptsCount = 0;
    }
  }

  // Display which building is targeted
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

  // If construction tab is visible, do advanced logic
  if (gamePage.science.get("construction").researched && gamePage.tabs[3].visible) {
    handleWorkshopUpgrades();
    performPriorityCrafts(resourcesMap);
    handleOverflowCrafting();
  }
}

const SCIENCE_LABELS = [
  'astronomy', 'theology', 'voidSpace', 'paradoxalKnowledge',
  'navigation', 'architecture', 'physics', 'chemistry',
  'archeology', 'electricity', 'biology'
];

const POLICY_LIST_ALL = [
  "liberty", "authocracy", "communism", "socialism",
  "diplomacy", "zebraRelationsAppeasement", "knowledgeSharing",
  "stoicism", "mysticism", "clearCutting", "fullIndustrialization",
  "militarizeSpace", "necrocracy", "expansionism", "frugality",
  "siphoning", "spiderRelationsGeologists", "lizardRelationsDiplomats",
  "sharkRelationsMerchants", "griffinRelationsMachinists",
  "dragonRelationsPhysicists", "nagaRelationsCultists"
];

const POLICY_LIST_POST_APOCALYPSE = [
  "liberty", "authocracy", "communism", "socialism",
  "diplomacy", "zebraRelationsAppeasement", "knowledgeSharing",
  "stoicism", "mysticism", "environmentalism", "militarizeSpace",
  "necrocracy", "expansionism", "frugality", "conservation", "siphoning"
];

/**
 * Automatically researches available technologies and policies
 */
function autoResearch() {
  // Only proceed if the science tab is visible
  if (!gamePage.tabs[2].visible) {
    return;
  }

  gamePage.tabs[2].update();

  // Handle science research
  researchScience();

  // Handle policy research if conditions are met
  if (gamePage.religion.getRU('solarRevolution').val === 1 || gamePage.resPool.get("culture").value >= 2000) {
    researchPolicies();
  }
}

/**
 * Processes available science technologies for research
 */
function researchScience() {
  // Reset science message
  GlobalMsg['science'] = '';

  // Find first available research from prioritized list
  findPriorityResearch();

  // Get all available research buttons
  const researchButtons = gamePage.tabs[2].buttons.filter(res =>
    res.model.metadata.unlocked &&
    res.model.enabled &&
    !res.model.metadata.researched
  );

  // Research each available technology
  for (const button of researchButtons) {
    // Skip non-priority research in Iron Will mode with astronomy/theology available
    if (shouldSkipResearchInIronWill(button)) {
      continue;
    }

    tryResearch(button, 'Researched');
  }
}

/**
 * Finds the highest priority research from the science labels list
 */
function findPriorityResearch() {
  if (SCIENCE_LABELS.length === 0) {
    return;
  }

  for (let i = 0; i < SCIENCE_LABELS.length; i++) {
    const science = gamePage.science.get(SCIENCE_LABELS[i]);

    if (science.unlocked && !science.researched) {
      GlobalMsg['science'] = science.label;
      sciencePriority = [science.label, science.prices];
      break;
    } else if (science.researched) {
      SCIENCE_LABELS.splice(i, 1);
      sciencePriority = [null, []];
      break;
    }
  }
}

/**
 * Determines if research should be skipped during Iron Will mode
 */
function shouldSkipResearchInIronWill(button) {
  if (!gamePage.ironWill) {
    return false;
  }

  const isNonPriorityResearch = !['astronomy', 'theology'].includes(button.model.metadata.name);
  const astronomyAvailable = !gamePage.science.get('astronomy').researched &&
    gamePage.science.get('astronomy').unlocked;
  const theologyAvailable = !gamePage.science.get('theology').researched &&
    gamePage.science.get('theology').unlocked;

  return isNonPriorityResearch && (astronomyAvailable || theologyAvailable);
}

/**
 * Processes available policies for research
 */
function researchPolicies() {
  const policyList = gamePage.challenges.isActive("postApocalypse")
    ? POLICY_LIST_POST_APOCALYPSE
    : POLICY_LIST_ALL;

  const policyButtons = gamePage.tabs[2].policyPanel.children.filter(res =>
    res.model.metadata.unlocked &&
    res.model.enabled &&
    !res.model.metadata.researched
  );

  for (const button of policyButtons) {
    if (policyList.includes(button.id)) {
      // Temporarily disable confirmation
      const originalNoConfirm = gamePage.opts.noConfirm;
      gamePage.opts.noConfirm = true;

      tryResearch(button, 'Policy researched');

      // Restore original confirmation setting
      gamePage.opts.noConfirm = originalNoConfirm;
    }
  }
}

/**
 * Attempts to research a given button item
 */
function tryResearch(button, messagePrefix) {
  try {
    const result = button.controller.buyItem(button.model, {});
    if (result.itemBought) {
      button.update();
      gamePage.msg(`${messagePrefix}: ${button.model.name}`);
    }
  } catch (err) {
    console.log(err);
  }
}

// Auto Workshop upgrade
function autoWorkshop() {
  // Only proceed if workshop tab is visible
  if (!gamePage.workshopTab.visible) {
    return;
  }

  // Update the workshop tab
  gamePage.tabs[3].update();

  // Define items to ignore for all game modes
  const ignores = ["biofuel", "invisibleBlackHand"];

  // Helper function to check if a string contains any items from a list
  const containsAny = (str, checklist) => checklist.some(item => str.includes(item));

  // Filter available upgrades
  let availableUpgrades;

  if (gamePage.ironWill && !gamePage.workshop.get("seti").researched) {
    // Additional ignored items during Iron Will mode before SETI
    const ironWillIgnores = [
      'register', 'Hoes', 'Axe', 'Drill', 'Huts', 'geodesy',
      'augumentation', 'astrophysicists', 'logistics', 'Engineers',
      'internet', 'neuralNetworks', 'Robotic', 'Optimization', 'assistance'
    ];

    availableUpgrades = gamePage.tabs[3].buttons.filter(upgrade =>
      upgrade.model.metadata.unlocked &&
      !upgrade.model.metadata.researched &&
      !containsAny(upgrade.id, ignores) &&
      !containsAny(upgrade.id, ironWillIgnores)
    );
  } else {
    availableUpgrades = gamePage.tabs[3].buttons.filter(upgrade =>
      upgrade.model.metadata.unlocked &&
      !upgrade.model.metadata.researched &&
      !containsAny(upgrade.id, ignores)
    );
  }

  // Process each available upgrade
  for (const upgrade of availableUpgrades) {
    // Skip if we're in certain game conditions
    if (shouldSkipUpgrade(upgrade)) {
      continue;
    }

    // Try to purchase the upgrade
    try {
      const result = upgrade.controller.buyItem(upgrade.model, {});
      if (result.itemBought) {
        upgrade.update();
        gamePage.msg('Upgraded: ' + upgrade.model.name);
      }
    } catch (error) {
      console.log('Error purchasing upgrade:', error);
    }
  }
}

// Helper function to determine if an upgrade should be skipped based on game conditions
function shouldSkipUpgrade(upgrade) {
  // Case 1: Iron Will mode with specific research conditions
  if (gamePage.ironWill &&
    ((!gamePage.science.get('astronomy').researched && gamePage.science.get('astronomy').unlocked) ||
      (!gamePage.science.get('theology').researched && gamePage.science.get('theology').unlocked &&
        gamePage.workshop.get("goldOre").researched && gamePage.workshop.get("goldOre").unlocked))) {
    return true;
  }

  // Case 2: Skip antimatter upgrades when relic station is available but not researched
  if (gamePage.workshop.get("relicStation").unlocked &&
    !gamePage.workshop.get("relicStation").researched &&
    !['relicStation', 'voidAspiration'].includes(upgrade.model.metadata.name) &&
    upgrade.model.prices.some(price => price.name === 'antimatter')) {
    return true;
  }

  return false;
}

// Festival automatically
function autoParty() {
  // Early return if prerequisite research isn't completed
  if (!gamePage.science.get("drama").researched) {
    return;
  }

  // Resource constants
  const RESOURCE_REQUIREMENTS = {
    manpower: 1500,
    culture: 5000,
    parchment: 2500
  };

  // Get current resource values
  const resources = {
    manpower: gamePage.resPool.get('manpower'),
    culture: gamePage.resPool.get('culture'),
    parchment: gamePage.resPool.get('parchment')
  };

  // Get transcendence tier level (minimum of 1)
  const transcendenceTier = Math.max(gamePage.religion.transcendenceTier, 1);

  // Check if basic resource requirements are met
  const hasBasicResources =
    resources.manpower.value > RESOURCE_REQUIREMENTS.manpower &&
    resources.culture.value > RESOURCE_REQUIREMENTS.culture &&
    resources.parchment.value > RESOURCE_REQUIREMENTS.parchment;

  if (!hasBasicResources) {
    return;
  }

  // Handle different festival conditions
  const hasCarnivalPerk = gamePage.prestige.getPerk("carnivals").researched;
  const festivalDaysRemaining = gamePage.calendar.festivalDays;
  const MAX_FESTIVAL_DAYS = 400 * 30;

  let tierToUse = 1; // Default festival tier

  if (hasCarnivalPerk && festivalDaysRemaining < MAX_FESTIVAL_DAYS) {
    // Check if we have enough resources for transcended festival
    const hasTranscendedResources =
      resources.manpower.value > RESOURCE_REQUIREMENTS.manpower * transcendenceTier &&
      resources.culture.value > RESOURCE_REQUIREMENTS.culture * transcendenceTier &&
      resources.parchment.value > RESOURCE_REQUIREMENTS.parchment * transcendenceTier;

    if (hasTranscendedResources) {
      tierToUse = transcendenceTier;
    }
  } else if (!hasCarnivalPerk &&
    festivalDaysRemaining === 0 &&
    resources.manpower.value > resources.manpower.maxValue * 0.5) {
    // Regular festival when no carnival perk, no active festival, and sufficient manpower
    tierToUse = 1;
  } else {
    // No festival conditions met
    return;
  }

  // Hold the festival and consume resources
  gamePage.village.holdFestival(tierToUse);

  // Deduct resources based on tier
  Object.entries(RESOURCE_REQUIREMENTS).forEach(([resource, amount]) => {
    gamePage.resPool.addResEvent(resource, -amount * tierToUse);
  });
}

/**
 * Manages automatic Ziggurat operations in the game
 * Handles sacrifice of unicorns/alicorns, refining tears, and purchasing upgrades
 */
function autozig() {
  // Only proceed if religion tab is visible
  if (!gamePage.religionTab.visible) {
    return;
  }

  const religionTab = gamePage.religionTab;
  const resPool = gamePage.resPool;

  // Ensure religion tab is rendered properly
  if (gamePage.bld.getBuildingExt('ziggurat').meta.on > 0 && !religionTab.sacrificeBtn) {
    gamePage.tabs[5].render();
  }
  religionTab.update();

  // Handle unicorn sacrifice
  handleUnicornSacrifice(religionTab, resPool);

  // Handle alicorn sacrifice
  handleAlicornSacrifice(religionTab, resPool);

  // Handle time crystal refinement
  if (!switches['CollectResBReset']) {
    handleTimeCrystalRefinement(religionTab, resPool);
  }

  // Handle ziggurat upgrades
  handleZigguratUpgrades(religionTab, resPool);

  // Handle tear refinement
  handleTearRefinement(religionTab, resPool);
}

/**
 * Handles unicorn sacrifice when conditions are met
 */
function handleUnicornSacrifice(religionTab, resPool) {
  if (!religionTab.sacrificeBtn || resPool.get('unicorns').value <= resPool.get('tears').value) {
    return;
  }

  const unicornPastureBtn = gamePage.tabs[0].children.filter(res =>
    res.model.metadata &&
    res.model.metadata.unlocked &&
    res.model.metadata.name == 'unicornPasture'
  );

  if (unicornPastureBtn.length === 0) {
    return;
  }

  const unicornPrice = unicornPastureBtn[0].model.prices.filter(res => res.name == "unicorns")[0].val;
  const unicornDifference = unicornPrice - resPool.get('unicorns').value;
  const unicornProductionRate = gamePage.getResourcePerTick('unicorns', true) * gamePage.getTicksPerSecondUI();
  const minutesToRecover = (unicornDifference / unicornProductionRate) / 60;

  if (minutesToRecover > 0.1 && religionTab.sacrificeBtn.model.allLink.visible) {
    religionTab.sacrificeBtn.controller.transform(religionTab.sacrificeBtn.model, 1, {},
      function(result) {/* callback intentionally left empty */}
    );
  }
}

/**
 * Handles alicorn sacrifice when conditions are met
 */
function handleAlicornSacrifice(religionTab, resPool) {
  const alicornValue = resPool.get('alicorn').value;
  const timeCrystalValue = resPool.get("timeCrystal").value;

  if (alicornValue <= 25) {
    return;
  }

  const shouldSacrifice = switches['CollectResBReset'] ||
    alicornValue > timeCrystalValue ||
    shouldSacrificeForTimeCrystals(timeCrystalValue);

  if (shouldSacrifice && religionTab.sacrificeAlicornsBtn.model.allLink.visible) {
    religionTab.sacrificeAlicornsBtn.controller.transform(
      religionTab.sacrificeAlicornsBtn.model,
      1,
      {},
      function(result) {/* callback intentionally left empty */}
    );
  }
}

/**
 * Determines if alicorns should be sacrificed for time crystals
 */
function shouldSacrificeForTimeCrystals(timeCrystalValue) {
  if (!gamePage.time.meta[0].meta[5].unlocked) {
    return false;
  }

  const cfPanel = gamePage.timeTab.cfPanel.children[0].children[6];
  const tcPrice = cfPanel.model.prices.filter(res => res.name == "timeCrystal")[0].val;
  const tcThreshold = tcPrice * (cfPanel.model.metadata.val > 2 ? 0.9 : 0.05);

  return timeCrystalValue > tcThreshold;
}

/**
 * Handles time crystal refinement
 */
function handleTimeCrystalRefinement(religionTab, resPool) {
  if (!religionTab.refineTCBtn || !religionTab.refineTCBtn.model.visible) {
    return;
  }

  const relicValue = resPool.get('relic').value;
  const timeCrystalValue = resPool.get('timeCrystal').value;

  // First condition - early game refinement
  const earlyGameCondition = !gamePage.workshop.get("relicStation").researched &&
    (!gamePage.workshop.get("chronoforge").researched || gamePage.religion.getTU("blackNexus").on > 5) &&
    (relicValue < (gamePage.challenges.isActive("energy") ? 25 : 5) && timeCrystalValue > 50);

  // Second condition - late game bulk refinement
  const relicEquivalent = relicValue + (resPool.get("blackcoin").value * 1000);
  const relicRatioEffect = gamePage.getEffect("relicRefineRatio") *
    gamePage.religion.getZU("blackPyramid").getEffectiveValue(gamePage);
  const potentialRelics = timeCrystalValue / 25 * (1 + relicRatioEffect);

  const lateGameCondition = gamePage.calendar.year > 1000 &&
    relicEquivalent < potentialRelics &&
    timeCrystalValue > 1000000 &&
    GlobalMsg["ressourceRetrieval"] == '';

  if (earlyGameCondition) {
    // Buy single TC refinement
    const result = religionTab.refineTCBtn.controller.buyItem(
      religionTab.refineTCBtn.model,
      {}
    );
    if (result.itemBought) {
      religionTab.refineTCBtn.update();
    }
  } else if (lateGameCondition && religionTab.refineTCBtn.model.allLink.visible) {
    // Transform all TCs
    religionTab.refineTCBtn.controller.transform(
      religionTab.refineTCBtn.model,
      1,
      {},
      function(result) {/* callback intentionally left empty */}
    );
  }
}

/**
 * Handles purchasing ziggurat upgrades
 */
function handleZigguratUpgrades(religionTab, resPool) {
  const zgUpgradeButtons = religionTab.zgUpgradeButtons;

  if (zgUpgradeButtons.filter(res => res.model.metadata.unlocked).length === 0) {
    return;
  }

  // Sort upgrades by unicorn/alicorn production benefit
  const sortedButtons = zgUpgradeButtons.filter(res => res.model.visible)
    .sort(function(a, b) {
      const a1 = a.model.metadata.effects.alicornPerTick || 0;
      const a2 = a.model.metadata.effects.unicornsRatioReligion || 0;
      const b1 = b.model.metadata.effects.alicornPerTick || 0;
      const b2 = b.model.metadata.effects.unicornsRatioReligion || 0;

      return (a1 + a2) - (b1 + b2);
    });

  // Update enabled status for all buttons
  for (let zg = 0; zg < sortedButtons.length; zg++) {
    sortedButtons[zg].controller.updateEnabled(sortedButtons[zg].model);
  }

  // Check if we should purchase upgrades
  const shouldPurchase = sortedButtons.length < 2 ||
    sortedButtons.slice(sortedButtons.length - 2).some(btn => btn.model.enabled) ||
    zgUpgradeButtons[0].model.prices.filter(res => res.name == "tears")[0].val < resPool.get('tears').value * 0.1 ||
    (zgUpgradeButtons[6].model.prices.filter(res => res.name == "tears")[0].val < resPool.get('tears').value * 0.1 &&
      zgUpgradeButtons[6].model.prices.filter(res => res.name == "unobtainium")[0].val < resPool.get('unobtainium').value);

  if (!shouldPurchase) {
    return;
  }

  // Purchase upgrades starting from the most beneficial
  for (let zg = sortedButtons.length - 1; zg >= 0; zg--) {
    const btn = sortedButtons[zg];

    if (!btn || !btn.model.metadata.unlocked) {
      continue;
    }

    // Check if we should skip for unobtainium requirements
    const unobtainiumPrice = btn.model.prices.find(res => res.name == "unobtainium");
    const reservedUnobtainium = gamePage.bld.getBuildingExt('chronosphere').meta.val < 10 ?
      calculateChronosphere10Prices()["unobtainium"] : 0;

    if (unobtainiumPrice && unobtainiumPrice.val >= (resPool.get('unobtainium').value - reservedUnobtainium)) {
      continue;
    }

    // Skip unicorn graveyard if we're waiting for necrocorns
    if (btn.model.metadata.name == "unicornGraveyard" &&
      zgUpgradeButtons[7].model.on > 0 &&
      (zgUpgradeButtons[8].model.prices.filter(res => res.name == "necrocorn")[0].val < 200 ||
        gamePage.diplomacy.get("leviathans").energy < gamePage.diplomacy.getMarkerCap())) {
      continue;
    }

    try {
      const result = btn.controller.buyItem(btn.model, {});
      if (result.itemBought) {
        btn.update();
        gamePage.msg('Build in Ziggurats: ' + btn.model.name);
      }
    } catch(err) {
      console.log(err);
    }
  }
}

/**
 * Handles refining tears into Black Liquid Sorrow when appropriate
 */
function handleTearRefinement(religionTab, resPool) {
  const sorrowResource = resPool.get('sorrow');
  const tearsResource = resPool.get('tears');

  if (sorrowResource.value >= sorrowResource.maxValue ||
    sorrowResource.value * 10000 >= tearsResource.value) {
    return;
  }

  if (religionTab.refineBtn && religionTab.refineBtn.model.visible) {
    try {
      const result = religionTab.refineBtn.controller.buyItem(
        religionTab.refineBtn.model,
        {}
      );
      if (result.itemBought) {
        gamePage.msg('Refine tears: BLS(' + Math.trunc(sorrowResource.value) + ')');
      }
    } catch(err) {
      console.log(err);
    }
  }
}

// Tracks calls to autoAssign(), used to schedule promotions in the late game
let kittensAssignCounter = 0;

/**
 * Determines whether the game is in a mode (Solar Revolution or Atheism Challenge)
 * that changes how ratios are applied or which jobs are allowed.
 */
function isSolarOrAtheismActive() {
  return (
    gamePage.religion.getRU("solarRevolution").val === 1 ||
    gamePage.challenges.isActive("atheism")
  );
}

/**
 * Builds a data structure that describes how each resource should be produced.
 * Returns an object whose keys are descriptive strings (e.g., "catnip" or "wood, beam")
 * and whose values are objects with the following properties:
 *   - resource     (string): Name of the resource to focus on
 *   - job          (string): Name of the job (e.g., "farmer", "woodcutter")
 *   - ratioNoSolar (number): Priority ratio if Solar Revolution / Atheism is NOT active
 *   - ratioSolar   (number): Priority ratio if Solar Revolution / Atheism IS active
 */
function buildResourcesAssign() {
  // Future developers:
  // Modify or expand entries here to change how resources are prioritized.
  const resourcesAssign = {
    "catnip": (
      gamePage.challenges.isActive("winterIsComing") &&
      gamePage.bld.getBuildingExt("aqueduct").meta.val < 10 &&
      gamePage.resPool.get("catnip").value < gamePage.village.getKittens() * 100
    )
    // If in Winter challenge and catnip is very low, assign minimal catnip production
    ? {
      resource:     "catnip",
      job:          "farmer",
      ratioNoSolar: 0.001,
      ratioSolar:   0.001
    }
    // Otherwise, if you have a few kittens or mineralHoes, produce catnip more aggressively
    : (
      (gamePage.village.getKittens() > 2 || gamePage.workshop.get("mineralHoes").researched)
      ? {
        resource:     "catnip",
        job:          "farmer",
        ratioNoSolar: (
          gamePage.resPool.get("catnip").value <
          gamePage.resPool.get("catnip").maxValue * 0.1
        )
        ? 9
        : 999,
        ratioSolar: (
          gamePage.resPool.get("paragon").value < 200 &&
          gamePage.bld.getBuildingExt("temple").meta.val < 1 &&
          gamePage.village.getKittens() > 2
        )
        ? 0.1
        : 1
      }
      : {
        resource:     "wood",
        job:          "woodcutter",
        ratioNoSolar: 1,
        ratioSolar:   1
      }
    ),

    "wood, beam": {
      resource:     "wood",
      job:          "woodcutter",
      ratioNoSolar: (
        gamePage.resPool.get("beam").value < gamePage.resPool.get("slab").value &&
        gamePage.resPool.get("beam").value < gamePage.resPool.get("wood").value
      )
      ? Math.max(
        0.1,
        gamePage.resPool.get("wood").value /
        gamePage.resPool.get("wood").maxValue
      )
      : (
        // If beams are over wood capacity, use an even higher ratio
        gamePage.resPool.get("beam").value > gamePage.resPool.get("wood").maxValue
        ? Math.max(
          0.1,
          // Original formula repeated from the old code
          gamePage.resPool.get("beam").value /
          gamePage.resPool.get("wood").maxValue /
          (
            (gamePage.resPool.get("wood").maxValue /
              ((gamePage.getResourcePerTick("wood", 0) * 5) /
                gamePage.village.getJob("woodcutter").value)
            ) /
            gamePage.village.getJob("woodcutter").value /
            gamePage.village.getJob("woodcutter").value
          )
        )
        : 1
      ),
      ratioSolar: 2
    },

    "minerals, slab": {
      resource:     "minerals",
      job:          "miner",
      ratioNoSolar: (
        gamePage.resPool.get("slab").value < gamePage.resPool.get("beam").value &&
        gamePage.resPool.get("slab").value < gamePage.resPool.get("minerals").value
      )
      ? Math.max(
        0.1,
        gamePage.resPool.get("minerals").value /
        gamePage.resPool.get("minerals").maxValue
      )
      : (
        gamePage.resPool.get("slab").value > gamePage.resPool.get("minerals").maxValue
        ? Math.max(
          0.1,
          // Original complicated expression for ratio
          gamePage.resPool.get("slab").value /
          gamePage.resPool.get("minerals").maxValue /
          (
            (gamePage.resPool.get("minerals").maxValue /
              ((gamePage.getResourcePerTick("minerals", 0) * 5) /
                gamePage.village.getJob("miner").value)
            ) /
            gamePage.village.getJob("miner").value /
            gamePage.village.getJob("miner").value
          )
        )
        : 1
      ),
      ratioSolar: (
        gamePage.resPool.get("minerals").value < 275 &&
        gamePage.challenges.isActive("winterIsComing")
      )
      ? 0.01
      : 2
    },

    "science": {
      resource:     "science",
      job:          "scholar",
      ratioNoSolar: (
        gamePage.resPool.get("science").value <
        gamePage.resPool.get("science").maxValue * 0.5
      )
      ? 0.5
      : 1,
      ratioSolar: (
        gamePage.science.get("engineering").researched &&
        gamePage.resPool.get("science").value > 100
      )
      ? 1
      : (gamePage.village.getKittens() > 1 ? 0.1 : 0.001)
    },

    "manpower, parchment": {
      resource:     "manpower",
      job:          "hunter",
      ratioNoSolar: 0.1,
      ratioSolar: (
        gamePage.workshopTab.visible &&
        gamePage.resPool.get("parchment").value < 200
      )
      ? 0.2
      : 1
    },

    "faith": {
      resource:     "faith",
      job:          "priest",
      ratioNoSolar: (
        // If no more religion upgrades, then fallback to a certain ratio
        gamePage.tabs[5].rUpgradeButtons.filter(res =>
          res.model.resourceIsLimited === false &&
          !res.model.name.includes("(complete)") &&
          !res.model.name.includes("(Transcend)")
        ).length === 0
      )
      ? (
        gamePage.religion.getSolarRevolutionRatio() <=
        Math.max(
          gamePage.religion.transcendenceTier * 0.05,
          gamePage.getEffect("solarRevolutionLimit")
        )
        ? 0.1
        : 2
      )
      : (
        gamePage.religion.getSolarRevolutionRatio() <=
        Math.max(
          gamePage.religion.transcendenceTier * 0.05,
          gamePage.getEffect("solarRevolutionLimit")
        )
        ? 1
        : (
          gamePage.resPool.get("faith").value /
          gamePage.resPool.get("faith").maxValue
        ) * 10 + 1
      ),
      ratioSolar: (
        gamePage.resPool.get("faith").value < 750 &&
        gamePage.resPool.get("gold").maxValue >= 500
      )
      ? 0.01
      : 5
    },

    "coal, gold": (
      (gamePage.resPool.get("coal").value / gamePage.resPool.get("coal").maxValue) ||
      100
    ) < (
      gamePage.workshop.get("geodesy").researched
      ? (gamePage.resPool.get("gold").value / gamePage.resPool.get("gold").maxValue)
      : 100
    )
    ? {
      resource:     "coal",
      job:          "geologist",
      ratioNoSolar: (
        gamePage.resPool.get("coal").value <
        gamePage.resPool.get("coal").maxValue * 0.99
      )
      ? 1
      : 15,
      ratioSolar: 15
    }
    : {
      resource:     "gold",
      job:          "geologist",
      ratioNoSolar: (
        gamePage.resPool.get("gold").value <
        gamePage.resPool.get("gold").maxValue * 0.99
      )
      ? 1
      : 15,
      ratioSolar: 15
    }
  };

  return resourcesAssign;
}

/**
 * Adjusts resource/job ratios if certain resources are needed for the next building.
 * If craftPriority indicates a building we want, but we're missing resources for it,
 * set the ratio between 0.1 ~ 0.2 depending on how close we are to the required amount.
 */
function adjustRatiosForCrafting(resourcesAssign) {
  if (!craftPriority?.[0]) {
    return;
  }
  // Example usage: craftPriority might be an object describing the next building to craft
  if (Object.keys(craftPriority[0]).length > 0) {
    // Retrieve resources needed for that build
    const buildPrices = gamePage.bld.getPrices(craftPriority[0]);
    const neededResourceNames = [
      "wood", "minerals", "beam", "slab",
      "science", "faith", "gold", "coal",
      "manpower", "parchment"
    ].filter(resourceName =>
      buildPrices.some(price => price.name === resourceName)
    );
    neededResourceNames.forEach((resName) => {
      const requiredValue = buildPrices.find(price => price.name === resName)?.val ?? 0;
      const currentValue = gamePage.resPool.get(resName).value;
      
      if (currentValue < requiredValue) {
        // Find the resourcesAssign key that includes this resource in the string
        const matchingKey = Object.keys(resourcesAssign)
          .find(k => k.includes(resName));
        
        if (matchingKey) {
          // Calculate ratio based on how close we are to the required amount
          // ratio will be 0.1 when at 0% of required amount
          // ratio will be 0.2 when at 100% of required amount
          const progressRatio = Math.min(currentValue / requiredValue, 1);
          const adjustedRatio = 0.075 + (progressRatio * 0.025);
          
          // Set the new dynamic ratio
          resourcesAssign[matchingKey].ratioNoSolar = adjustedRatio;
          resourcesAssign[matchingKey].ratioSolar = adjustedRatio;
        }
      }
    });
  }
}

/**
 * Returns a list of valid resource-to-job assignments.
 * "Valid" means the job is unlocked, the resource is relevant to that job's modifiers,
 * and it is not disallowed by the Atheism challenge (e.g., no priests if Atheism is active).
 */
function getValidAssignments(resourcesAssign) {
  return Object.values(resourcesAssign)
    .filter(({ resource, job }) => {
      const jobData = gamePage.village.getJob(job);
      if (!jobData || !jobData.unlocked) {
        return false;
      }
      if (gamePage.challenges.isActive("atheism") && resource === "faith") {
        return false;
      }
      // The original code checked `resource in job.modifiers`.
      // Ensures job actually produces that resource
      return (resource in jobData.modifiers);
    });
}

/**
 * Sort comparison to determine which assignment "needs" more workers.
 * A lower computed value means higher priority (more needed).
 * This logic is carried over from the original code but uses named properties.
 */
function sortJobAssignments(a, b) {
  const {
    resource: aResource,
    job: aJobName,
    ratioNoSolar: aRatioNoSolar,
    ratioSolar: aRatioSolar
  } = a;

  const {
    resource: bResource,
    job: bJobName,
    ratioNoSolar: bRatioNoSolar,
    ratioSolar: bRatioSolar
  } = b;

  const aJob = gamePage.village.getJob(aJobName);
  const bJob = gamePage.village.getJob(bJobName);

  // Decide which ratio to use based on whether solar revolution / atheism is active
  const isSolar = isSolarOrAtheismActive();
  const aRatio = isSolar ? aRatioSolar : aRatioNoSolar;
  const bRatio = isSolar ? bRatioSolar : bRatioNoSolar;

  let aTick, aJobsCount;
  const aResourceObj = gamePage.resPool.get(aResource);
  if (aResourceObj.value >= aResourceObj.maxValue) {
    // If the resource is at or above capacity, treat tick as "maxValue * 10" (a big number).
    aTick      = aResourceObj.maxValue * 10;
    aJobsCount = aRatio;
  } else {
    // If not at capacity, compute actual resource production plus 1
    aTick      = gamePage.calcResourcePerTick(aResource) + 1;
    aJobsCount = (aJob?.value ?? 0) + 1;
  }

  let bTick, bJobsCount;
  const bResourceObj = gamePage.resPool.get(bResource);
  if (bResourceObj.value >= bResourceObj.maxValue) {
    bTick      = bResourceObj.maxValue * 10;
    bJobsCount = bRatio;
  } else {
    bTick      = gamePage.calcResourcePerTick(bResource) + 1;
    bJobsCount = (bJob?.value ?? 0) + 1;
  }

  // Recreates the original formula for "priority value."
  // The lower the final value => the more we need to assign workers to that job.
  // aVal vs. bVal => if aVal is smaller, 'a' is more urgent.
  const aVal = (
    (aTick / aResourceObj.maxValue) *
    (aResourceObj.value / aResourceObj.maxValue) *
    (aRatio * aJobsCount)
  ) * aRatio;

  const bVal = (
    (bTick / bResourceObj.maxValue) *
    (bResourceObj.value / bResourceObj.maxValue) *
    (bRatio * bJobsCount)
  ) * bRatio;

  return aVal - bVal;
}

/**
 * Attempts to assign a free kitten to the highest-priority job if available.
 * If no free kittens remain, tries to reassign from the lowest-priority job
 * that has a decent number of workers.
 */
function autoAllocateKittens(sortedJobs) {
  if (!sortedJobs.length) {
    return;
  }

  const freeKittens  = gamePage.village.getFreeKittens();
  const totalKittens = gamePage.village.getKittens();
  const topJob       = sortedJobs[0].job;  // job name of the top priority

  if (freeKittens > 0) {
    // If there's at least one free kitten, assign it to the top job.
    const topJobData = gamePage.village.getJob(topJob);
    if (topJobData) {
      gamePage.village.assignJob(topJobData, 1);
    }
    return;
  }

  // If no free kittens are available, look for a job from which we can reassign some kittens.
  if (totalKittens > 0) {
    // We'll consider reassigning from the job with the lowest priority
    // that also exceeds a minimal threshold of workers.
    const reassignableJobs = sortedJobs.filter(({ resource, job }) => {
      const jobData = gamePage.village.getJob(job);
      if (!jobData) {
        return false;
      }
      const currentJobCount = jobData.value;

      const resourceValue = gamePage.resPool.get(resource).value;
      const resourceMax   = gamePage.resPool.get(resource).maxValue;

      // If resource is at or above capacity, keep at least 1 worker
      // otherwise keep some fraction (arbitrary heuristic).
      const threshold = (resourceValue >= resourceMax)
        ? 1
        : (totalKittens / 2 / 7);

      return currentJobCount > threshold && job !== topJob;
    });

    if (reassignableJobs.length > 0) {
      // The last item in sortedJobs is the *lowest priority*.
      // So we pull from that job to give to the top job.
      const { job: lowestJobName } = reassignableJobs[reassignableJobs.length - 1];
      const lowestJobData = gamePage.village.getJob(lowestJobName);

      if (lowestJobData) {
        // For example, remove 10% of that job's workers (at least 1).
        const removeCount = Math.max(Math.floor(lowestJobData.value * 0.1), 1);
        gamePage.village.sim.removeJob(lowestJobName, removeCount);

        // Assign them to the top priority job.
        const topJobData = gamePage.village.getJob(topJob);
        if (topJobData) {
          gamePage.village.assignJob(topJobData, removeCount);
        }
      }
    }
  }
}

/**
 * Every so often, promotes a kitten from the top-priority job to be the leader,
 * if we have enough gold and certain tech (civil) is researched.
 */
function maybePromoteKittens(topJob) {
  // Must have civil researched and not be in Iron Will.
  if (!gamePage.science.get("civil").researched) return;
  if (gamePage.ironWill) return;

  // Must have enough gold to justify promotions.
  if (gamePage.resPool.get("gold").value <= 1000) return;

  // Count calls to autoAssign. Only promote once every 10 calls (arbitrary).
  kittensAssignCounter++;
  if (kittensAssignCounter <= 10) {
    return;
  }
  // Reset the counter after a promotion attempt
  kittensAssignCounter = 0;

  // Among all kittens with the top job, choose the one with the highest skill for that job
  const bestKitten = gamePage.village.sim.kittens
    .filter(kitten => kitten.job === topJob)
    .sort((a, b) => (b.skills[topJob] || 0) - (a.skills[topJob] || 0))[0];

  if (!bestKitten) {
    return;
  }

  // Make that kitten your leader
  gamePage.village.makeLeader(bestKitten);

  // Check if we can afford to promote them to the next rank
  const [canPromote] = gamePage.village.sim.expToPromote(
    bestKitten.rank,
    bestKitten.rank + 1,
    bestKitten.exp
  );
  const [, goldRequired] = gamePage.village.sim.goldToPromote(
    bestKitten.rank,
    bestKitten.rank + 1,
    gamePage.resPool.get("gold").value
  );

  // Only promote if we have enough gold (<= 30% of current gold).
  if (canPromote && goldRequired < gamePage.resPool.get("gold").value * 0.3) {
    gamePage.village.sim.promote(bestKitten);
  }
}

/**
 * Main auto-assign function.
 * 1) Builds the resource->job config
 * 2) Adjusts priorities based on building requirements
 * 3) Filters out locked or invalid jobs
 * 4) Sorts remaining jobs by need
 * 5) Allocates or reallocates kittens
 * 6) Possibly promotes a kitten in the top job to leader
 */
function autoAssign() {
  // 1) Base config
  const resourcesAssign = buildResourcesAssign();

  // 2) Adjust priorities if certain resources are lacking for the next build
  adjustRatiosForCrafting(resourcesAssign);

  // 3) Filter to valid/unlocked jobs
  const validAssignments = getValidAssignments(resourcesAssign);

  // 4) Sort those assignments by need (lowest value => highest priority)
  const sortedAssignments = validAssignments.sort(sortJobAssignments);

  // 5) Assign or reassign kittens to the top priority
  autoAllocateKittens(sortedAssignments);

  // 6) Attempt to promote a kitten from the top-priority job
  if (sortedAssignments.length > 0) {
    maybePromoteKittens(sortedAssignments[0].job);
  }
}

/**
 * Controls energy consumption by prioritizing buildings based on their importance.
 * Turns buildings on or off to maintain optimal energy balance.
 */
function energyControl() {
  if (!switches["Energy Control"]) {
    return;
  }

  // Get current energy production and consumption
  const energyProduction = gamePage.resPool.energyProd;
  const energyConsumption = gamePage.resPool.energyCons;
  const energyDifference = energyProduction - energyConsumption;

  // Check if post-apocalypse challenge is active
  const isPostApocalypse = gamePage.challenges.isActive("postApocalypse");

  // Helper function to get building controller by name from buildings tab
  const getBuildingController = name =>
    gamePage.tabs[0].children.find(o => o.model.metadata && o.model.metadata.name === name);

  // Helper function to get space building controller
  const getSpaceController = (planetIndex, buildingIndex) => {
    const planetPanel = gamePage.tabs[6].planetPanels[planetIndex];
    return planetPanel ? planetPanel.children[buildingIndex] : null;
  };

  // Resource-related conditions
  const resources = gamePage.resPool;
  const antimatterNearFull = resources.get("antimatter").value >= resources.get("antimatter").maxValue * 0.9;
  const antimatterLow = resources.get("antimatter").value < resources.get("antimatter").maxValue * 0.2;
  const uraniumAbundant = resources.get("uranium").value > 1000;
  const oilRatio = resources.get("oil").value / resources.get("oil").maxValue;

  // Research conditions
  const hasAntimatterResearch = gamePage.science.get('antimatter').researched;
  const hasVoidSpaceResearch = gamePage.science.get('voidSpace').researched;

  // Building metadata
  const isBiolabStage1 = gamePage.bld.getBuildingExt('library').meta.stage === 1;
  const biolabNotFullyOn = gamePage.bld.getBuildingExt('biolab').meta.on !== gamePage.bld.getBuildingExt('biolab').meta.val;
  const isWarehouseAdvanced = gamePage.bld.getBuildingExt('warehouse').meta.stage !== 0;

  // Buildings and their controllers
  const buildings = {
    smelter: {
      building: isPostApocalypse ? null : gamePage.bld.buildingsData[15],
      controller: getBuildingController('smelter'),
      priority: 0.09
    },
    bioLab: {
      building: gamePage.bld.buildingsData[9],
      controller: getBuildingController('biolab'),
      priority: antimatterLow && hasAntimatterResearch ? 0.3 :
      Math.max(0.2, gamePage.calcResourcePerTick('oil') * 5 / resources.get('oil').maxValue * 100 * oilRatio) *
      (gamePage.space.meta[3].meta[1].val + 1)
    },
    oilWell: {
      building: isPostApocalypse ? null : gamePage.bld.buildingsData[20],
      controller: getBuildingController("oilWell"),
      priority: (isBiolabStage1 && biolabNotFullyOn) ? 9999 : 0.3
    },
    calciner: {
      building: isPostApocalypse ? null : gamePage.bld.buildingsData[16],
      controller: getBuildingController("calciner"),
      priority: 0.101
    },
    accelerator: {
      building: gamePage.bld.buildingsData[24],
      controller: getBuildingController("accelerator"),
      priority: 0.09
    },
    factory: {
      building: gamePage.bld.buildingsData[22],
      controller: getBuildingController("factory"),
      priority: 0.01
    },
    warehouse: {
      building: isWarehouseAdvanced ? gamePage.bld.buildingsData[11] : null,
      controller: getBuildingController('warehouse'),
      priority: 0.3
    }
  };

  // Space buildings and their controllers
  const spaceBuildings = {
    moonBase: {
      building: gamePage.space.meta[2].meta[1],
      controller: getSpaceController(1, 1),
      priority: 0.2,
      available: !!gamePage.tabs[6].planetPanels[1]
    },
    spaceStation: {
      building: gamePage.space.meta[1].meta[2],
      controller: getSpaceController(0, 2),
      priority: 0.09,
      available: !!gamePage.tabs[6].planetPanels[0]
    },
    lunarOutpost: {
      building: gamePage.space.meta[2].meta[0],
      controller: getSpaceController(1, 0),
      priority: 0.01,
      available: !!gamePage.tabs[6].planetPanels[1] && uraniumAbundant
    },
    orbitalArray: {
      building: gamePage.space.meta[4].meta[1],
      controller: getSpaceController(3, 1),
      priority: 0.01,
      available: !!gamePage.tabs[6].planetPanels[3]
    },
    entangler: {
      building: gamePage.space.meta[10].meta[0],
      controller: getSpaceController(9, 0),
      priority: 0.1,
      available: !!gamePage.tabs[6].planetPanels[9]
    },
    containmentChamber: {
      building: gamePage.space.meta[5].meta[1],
      controller: getSpaceController(4, 1),
      priority: (hasAntimatterResearch && antimatterNearFull && gamePage.space.meta[5].meta[1].val > 1) ?
      Math.max(0.05, (1 - resources.get("antimatter").value / resources.get("antimatter").maxValue) / 10) : 9999,
      available: !!gamePage.tabs[6].planetPanels[4] && !(hasAntimatterResearch && resources.get("antimatter").value < resources.get("antimatter").maxValue * 0.9)
    }
  };

  // Special case for void space
  const voidSpace = {
    building: hasVoidSpaceResearch ? gamePage.time.voidspaceUpgrades[4] : null,
    controller: gamePage.tabs[7] && gamePage.tabs[7].children[3] ?
    gamePage.tabs[7].children[3].children[0].children[5] : null,
    priority: 0.1
  };

  // Handle special case for calciner in Iron Will mode
  if (gamePage.ironWill) {
    const calcinerCount = gamePage.bld.getBuildingExt('calciner').meta.val;
    const coalLimit = Math.floor(resources.get('coal').value / (resources.get('coal').maxValue / calcinerCount));
    const mineralsLimit = Math.floor(resources.get('minerals').value / 1000);

    if (Math.min(coalLimit, mineralsLimit) < calcinerCount) {
      buildings.calciner.building = null;
      if (!isPostApocalypse) {
        buildings.smelter.priority = 0.09; // Prioritize smelter when low on resources in Iron Will
      }
    }
  }

  // Special case for containment chamber when antimatter is low
  if (hasAntimatterResearch && resources.get("antimatter").value < resources.get("antimatter").maxValue * 0.9 &&
    gamePage.space.meta[5].meta[1].on > 1) {
    const sunlifter = getSpaceController(4, 0);
    const emptyAntimatter = resources.get("antimatter").maxValue - resources.get("antimatter").value;

    if (sunlifter && sunlifter.model.on * 50 * 1.05 < emptyAntimatter) {
      const containmentController = getSpaceController(4, 1);
      if (containmentController) {
        containmentController.controller.off(containmentController.model, 1);
      }
      return; // Exit early after adjusting containment chamber
    }
  }

  // Combine all energy consumers into a priority list
  const energyPriority = [
    ...Object.values(buildings),
    ...Object.values(spaceBuildings).filter(item => item.available),
    voidSpace
  ].filter(item => item.building && item.controller);

  // Energy management logic
  if (energyProduction > energyConsumption) {
    // We have excess energy - turn on more buildings
    const buildingsToActivate = energyPriority
      .filter(item =>
        item.building.val > item.building.on &&
        (energyProduction > (energyConsumption + item.building.effects.energyConsumption * gamePage.resPool.getEnergyConsumptionRatio()) ||
          (item.controller.model.metadata.name === "containmentChamber" && antimatterNearFull))
      )
      .sort((a, b) => a.priority - b.priority);

    if (buildingsToActivate.length > 0) {
      const target = buildingsToActivate[0];
      const energyCostPerBuilding = target.building.effects.energyConsumption * gamePage.resPool.getEnergyConsumptionRatio();
      const availableCount = Math.min(
        Math.floor(energyDifference / energyCostPerBuilding),
        target.building.val - target.building.on
      );

      if (availableCount > 0) {
        target.controller.controller.on(target.controller.model, availableCount);
      }
    }
  } else if (energyProduction < energyConsumption) {
    // We have energy deficit - turn off some buildings
    const buildingsToDeactivate = energyPriority
      .filter(item =>
        item.building.on > 1 &&
        item.building.effects &&
        item.building.effects.energyConsumption &&
        item.building.effects.energyConsumption * gamePage.resPool.getEnergyConsumptionRatio() > 0
      )
      .sort((a, b) => b.priority - a.priority);

    if (buildingsToDeactivate.length > 0) {
      const target = buildingsToDeactivate[0];
      const energyCostPerBuilding = target.building.effects.energyConsumption * gamePage.resPool.getEnergyConsumptionRatio();
      const countToTurnOff = Math.min(
        target.building.on - 1,
        Math.ceil(Math.abs(energyDifference) / energyCostPerBuilding)
      );

      if (countToTurnOff > 0) {
        target.controller.controller.off(target.controller.model, countToTurnOff);
      }
    }
  }
}

/**
 * Automatically gathers catnip when certain game conditions are met
 * - Less than 40 huts
 * - Low catnip reserves (less than 100)
 * - Limited gathering clicks or Iron Will mode active
 */
function autoNip() {
  const CATNIP_THRESHOLD = 100;
  const FIELD_THRESHOLD = 40;
  const CLICK_THRESHOLD = 2500;
  const MESSAGE_INTERVAL = 150;

  // Check if gathering conditions are met
  const fieldCount = gamePage.bld.buildingsData[0].val;
  const catnipAmount = gamePage.resPool.get('catnip').value;
  const clickCount = gamePage.gatherClicks;
  const isIronWillActive = gamePage.ironWill;

  const shouldGather =
    fieldCount < FIELD_THRESHOLD &&
    catnipAmount < CATNIP_THRESHOLD &&
    (clickCount < CLICK_THRESHOLD || isIronWillActive);

  if (!shouldGather) {
    return;
  }

  // Get the gather button from the first tab's first child
  const gatherButton = gamePage.tabs[0].children[0];

  try {
    // Attempt to click the gather button
    const result = gatherButton.controller.buyItem(gatherButton.model, {});
    if (result.itemBought && gamePage.timer.ticksTotal % MESSAGE_INTERVAL === 0) {
      gamePage.msg('Gathering catnip');
    }
  } catch (error) {
    console.error('Error while gathering catnip:', error);
  }
}

function autoRefine() {
  const game = gamePage;
  const resourcePool = game.resPool;
  const catnip = resourcePool.get('catnip');
  const wood = resourcePool.get('wood');
  const bonfire = game.tabs[0].children[1];
  const field = game.tabs[0].children[2];

  // Check if refining is needed
  const shouldRefine = () => {
    // Basic conditions
    const hasLowKittens = game.village.getKittens() < 14;
    const workshopNotAvailable = !game.workshopTab.visible;
    const winterChallengeException = !game.challenges.isActive("winterIsComing") ||
      game.bld.getBuildingExt('hut').meta.val == 0;
    const fieldUnlocked = game.bld.getBuildingExt('field').meta.unlocked;

    // Resource conditions
    const excessCatnip = catnip.value > wood.value * 5;
    const season = game.calendar.season;
    const catnipThreshold = season >= 1
      ? Math.max(field.model.prices.find(res => res.name == "catnip").val * 2, 100)
      : 100;
    const catnipAboveThreshold = catnip.value > Math.min(catnip.maxValue * 0.9, catnipThreshold);

    return (hasLowKittens || workshopNotAvailable) &&
      winterChallengeException &&
      fieldUnlocked &&
      excessCatnip &&
      catnipAboveThreshold;
  };

  if (!shouldRefine()) return;

  // Execute refining
  if (!game.workshopTab.visible) {
    if (bonfire.model.x100Link.visible && field.model.resourceIsLimited) {
      // Refine 100 at once
      bonfire.model.x100Link.handler(bonfire.model);
    }
    else if (field.model.resourceIsLimited && bonfire.model.visible) {
      // Refine once
      bonfire.controller.buyItem(bonfire.model, {});
    }
    else {
      // Calculate optimal refining limit
      const catnipPrice = bonfire.model.prices.find(res => res.name == "catnip").val;
      const woodSpaceLeft = wood.maxValue * 0.1 - wood.value;
      const affordableRefines = Math.trunc(catnip.value / catnipPrice) - 1;
      const refineLimit = Math.ceil(Math.min(woodSpaceLeft, affordableRefines));

      // Refine multiple times
      for (let i = 0; i < refineLimit; i++) {
        if (bonfire.model.enabled) {
          try {
            bonfire.controller.buyItem(bonfire.model, {});
          } catch (err) {
            console.log(err);
            break;
          }
        }
      }
    }
  }
  else if (bonfire.model.x100Link && (game.ironWill || (gamePage.resPool.get("burnedParagon").value + gamePage.resPool.get("paragon") == 0 && gamePage.village.getKittens() < 20)) && wood.value < wood.maxValue * 0.1) {
    // Special case for ironWill mode
    if (bonfire.model.x100Link.visible) {
      bonfire.model.x100Link.handler(bonfire.model);
    }
  }
}

/**
 * Upgrades a building to its next stage
 * @param {Object} target - The building target object
 */
function upgradeByModel(target) {
    const metadataRaw = target.controller.getMetadataRaw(target.model);
  
    // Initialize stage if needed and increment
    metadataRaw.stage = metadataRaw.stage || 0;
    metadataRaw.stage++;

    // Reset values
    metadataRaw.val = 0;
    metadataRaw.on = 0;
  
    // Calculate effects if method exists
    if (metadataRaw.calculateEffects) {
        metadataRaw.calculateEffects(metadataRaw, target.controller.game);
    }
  
    // Apply upgrades and render
    target.controller.game.upgrade(metadataRaw.upgrades);
    target.controller.game.render();
}

// Track post-apocalypse challenge completion
let postApocalypseIsCompleted = true;

/**
 * Main function to manage building upgrades and automation
 */
function upgradeBuildings() {
    const game = gamePage;
  
    // Unlock random race if diplomatic options available
    if (game.diplomacy.hasUnlockedRaces()) {
        game.diplomacy.unlockRandomRace();
    }
  
    // Enable reactor automation when conditions are met
    enableReactorAutomationIfReady();
  
    // Upgrade buildings that are ready for next stage
    upgradeReadyBuildings();
  
    // Manage building activations
    manageProducingBuildings();
  
    // Handle apocalypse challenge specific logic
    handleApocalypseChallengeLogic();
}

/**
 * Enables reactor automation when conditions are met
 */
function enableReactorAutomationIfReady() {
    const game = gamePage;
    const reactor = game.bld.getBuildingExt('reactor').meta;
  
    if (reactor.unlocked &&
        !reactor.isAutomationEnabled &&
        reactor.val > 0 &&
        game.workshop.get("thoriumReactors").researched &&
        game.resPool.get('thorium').value > 10000 &&
        game.resPool.get('uranium').perTickCached > 250) {
      
        reactor.isAutomationEnabled = true;
    }
}

/**
 * Finds and upgrades buildings that are ready for their next stage
 */
function upgradeReadyBuildings() {
    const game = gamePage;
  
    // Filter for buildings ready to upgrade
    const buildingsToUpgrade = game.bld.meta[0].meta.filter(building =>
        building.stages &&
        building.stages[1].stageUnlocked &&
        building.stage === 0 &&
        isReadyForUpgrade(building)
    );
  
    // Upgrade each ready building
    for (const building of buildingsToUpgrade) {
        const upgradeTarget = game.tabs[0].children.find(
            res => res.model.metadata && res.model.metadata.name === building.name
        );
        upgradeByModel(upgradeTarget);
    }
}

/**
 * Determines if a building is ready for upgrade based on specific conditions
 * @param {Object} building - The building to evaluate
 * @returns {boolean} Whether the building is ready for upgrade
 */
function isReadyForUpgrade(building) {
    const game = gamePage;
  
    // Library upgrade conditions
    if (building.name === "library") {
        return game.space.getProgram("orbitalLaunch").val === 1 &&
               !game.challenges.isActive("energy") &&
               game.bld.getBuildingExt('aqueduct').meta.stage !== 0;
    }
  
    // Aqueduct upgrade conditions
    if (building.name === "aqueduct") {
        return !game.challenges.isActive("winterIsComing") &&
               ((game.resPool.get('paragon').value > 200 && game.bld.getBuildingExt('accelerator').meta.val > 2) ||
                (game.resPool.get('paragon').value <= 200 && game.space.getBuilding('hydroponics').val > 0));
    }
  
    // Warehouse upgrade conditions
    if (building.name === "warehouse") {
        return game.resPool.get("eludium").value >= 200000 &&
               game.time.getCFU("ressourceRetrieval").val > 3;
    }
  
    return true;
}

/**
 * Manages activation state of various production buildings
 */
function manageProducingBuildings() {
    const game = gamePage;
    const isPostApocalypse = game.challenges.isActive("postApocalypse");
  
    // Steamworks management
    manageBuildingPower('steamworks', !isPostApocalypse && game.resPool.get('coal').value > 0);
  
    // Reactor management
    manageBuildingPower('reactor', game.resPool.get('uranium').value > 100);
  
    // Magneto management
    manageBuildingPower('magneto', !isPostApocalypse && game.resPool.get('oil').value > 0);
  
    // Moon outpost management
    manageSpaceBuildingPower();
  
    // Smelter management
    manageSmelterPower();
  
    // Mint management
    manageMintPower();
}

/**
 * Manages power for standard buildings
 * @param {string} buildingName - Name of the building
 * @param {boolean} condition - Condition for turning on
 */
function manageBuildingPower(buildingName, condition) {
    const game = gamePage;
    const building = game.bld.getBuildingExt(buildingName).meta;
  
    if (building.unlocked) {
        if (condition && building.on < building.val) {
            building.on = building.val;
        } else if (!condition && building.on > 0 && buildingName !== 'reactor') {
            building.on--;
        }
    }
}

/**
 * Manages power for space buildings
 */
function manageSpaceBuildingPower() {
    const game = gamePage;
    const moonOutpost = game.space.getBuilding("moonOutpost");
  
    if (moonOutpost.unlocked && !game.challenges.isActive("energy")) {
        if (moonOutpost.on < moonOutpost.val &&
            game.resPool.get('uranium').value > 1000 &&
            game.resPool.get('unobtainium').value < game.resPool.get('unobtainium').maxValue) {
          
            moonOutpost.on = moonOutpost.val;
        } else if (moonOutpost.on > 0 &&
                  (game.resPool.get('uranium').value <= 1000 ||
                   game.resPool.get('unobtainium').value >= game.resPool.get('unobtainium').maxValue)) {
          
            moonOutpost.on--;
        }
    }
}

/**
 * Manages smelter power based on complex resource calculations
 */
function manageSmelterPower() {
    const game = gamePage;
    const smelter = game.bld.getBuildingExt('smelter').meta;
  
    if (!smelter.unlocked ||
        (game.challenges.isActive("postApocalypse") && game.village.getKittens() >= 10)) {
        return;
    }
  
    const shouldIncreaseSmelters = determineSmelterIncrease();
  
    if (shouldIncreaseSmelters) {
        if (game.ironWill) {
            if (smelter.val >= smelter.on) {
                smelter.on = Math.min(Math.floor(game.resPool.get('minerals').value / 100), smelter.val);
              
                const calciner = game.bld.getBuildingExt('calciner').meta;
                calciner.on = Math.min(
                    Math.max(
                        Math.floor(game.resPool.get('coal').value / (game.resPool.get('coal').maxValue / calciner.val)),
                        1
                    ),
                    Math.floor(game.resPool.get('minerals').value / 1000),
                    calciner.val
                );
            }
        } else if (smelter.val > smelter.on) {
            smelter.on++;
        }
    } else if (smelter.on > 0) {
        if (game.ironWill) {
            if (game.bld.getBuildingExt('amphitheatre').meta.val > 3) {
                smelter.on = Math.min(
                    Math.floor(game.resPool.get('minerals').value / 100),
                    smelter.on - 1
                );
              
                const calciner = game.bld.getBuildingExt('calciner').meta;
                calciner.on = Math.min(
                    Math.max(
                        Math.floor(game.resPool.get('coal').value / (game.resPool.get('coal').maxValue / calciner.val)),
                        1
                    ),
                    Math.floor(game.resPool.get('minerals').value / 1000),
                    calciner.val
                );
            } else {
                smelter.on = 0;
            }
        } else if (game.religion.getRU('solarRevolution').val == 0) {
            smelter.on--;
        }
    }
}

/**
 * Determines if smelters should be increased based on resource conditions
 * @returns {boolean} Whether to increase smelters
 */
function determineSmelterIncrease() {
    const game = gamePage;
  
    // Iron will specific logic
    if (game.ironWill) {
        return (
            (game.diplomacy.get('nagas').unlocked &&
             game.resPool.get('gold').unlocked &&
             game.resPool.get('minerals').value / 100 > game.bld.getBuildingExt('smelter').meta.on) ||
            ((game.workshop.get("goldOre").researched &&
              game.bld.getBuildingExt('amphitheatre').meta.val > 3) ||
             game.resPool.get('iron').value < 100)
        );
    }
  
    // Regular logic based on resource production rates
    const woodProduction = (
        game.calcResourcePerTick('wood') +
        game.getResourcePerTickConvertion('wood') +
        game.bld.getBuildingExt('smelter').meta.effects.woodPerTickCon +
        game.calcResourcePerTick('wood') * game.prestige.getParagonProductionRatio()
    ) * 5;
  
    const mineralsProduction = (
        game.calcResourcePerTick('minerals') +
        game.getResourcePerTickConvertion('minerals') +
        game.bld.getBuildingExt('smelter').meta.effects.mineralsPerTickCon +
        game.calcResourcePerTick('minerals') * game.prestige.getParagonProductionRatio()
    ) * 5;
  
    return (
        woodProduction > game.bld.getBuildingExt('smelter').meta.on &&
        mineralsProduction > game.bld.getBuildingExt('smelter').meta.on
    );
}

/**
 * Manages mint power based on game state
 */
function manageMintPower() {
    const game = gamePage;
    const mint = game.bld.getBuildingExt("mint").meta;
  
    if (game.resPool.get('paragon').value < 200 && mint.val > 1 && game.calendar.year < 2000) {
        const manpower = game.resPool.get('manpower');
        const requiredManpower = mint.on * (manpower.maxValue / mint.val);
      
        if (manpower.value > requiredManpower) {
            if (mint.on < mint.val) {
                mint.on++;
            }
        } else if (mint.on > 1) {
            mint.on--;
        }
    } else if (mint.on !== mint.val) {
        mint.on = mint.val;
    }
}

/**
 * Handles special logic for the post-apocalypse challenge
 */
function handleApocalypseChallengeLogic() {
    const game = gamePage;
    const isPostApocalypse = game.challenges.isActive("postApocalypse");
  
    // Disable buildings during most of post-apocalypse challenge
    if (isPostApocalypse &&
        game.time.getCFU("ressourceRetrieval").val > 0 &&
        (game.calendar.cycle != 5 || (game.calendar.day <= 10 || game.calendar.day >= 90))) {
      
        disableProductionBuildings();
        postApocalypseIsCompleted = false;
    }
  
    // Enable buildings during summer in post-apocalypse or after challenge completion
    if ((!postApocalypseIsCompleted && !isPostApocalypse) ||
        (isPostApocalypse &&
         game.time.getCFU("ressourceRetrieval").val > 0 &&
         game.calendar.cycle == 5 &&
         game.calendar.day > 10 &&
         game.calendar.day < 90)) {
      
        enableAllProductionBuildings();
      
        if (!postApocalypseIsCompleted && !isPostApocalypse) {
            postApocalypseIsCompleted = true;
        }
    }
}

/**
 * Disables all production buildings during post-apocalypse challenge
 */
function disableProductionBuildings() {
    const game = gamePage;
  
    game.bld.getBuildingExt('mine').meta.on = 0;
    game.bld.getBuildingExt('quarry').meta.on = 0;
    game.bld.getBuildingExt('calciner').meta.on = 0;
    game.bld.getBuildingExt('steamworks').meta.on = 0;
    game.bld.getBuildingExt('magneto').meta.on = 0;
    game.bld.getBuildingExt('oilWell').meta.isAutomationEnabled = false;
  
    if (game.workshop.get("geodesy").researched) {
        game.bld.getBuildingExt('smelter').meta.on = 0;
    }
}

/**
 * Enables all production buildings
 */
function enableAllProductionBuildings() {
    const game = gamePage;
  
    game.bld.getBuildingExt('mine').meta.on = game.bld.getBuildingExt('mine').meta.val;
    game.bld.getBuildingExt('quarry').meta.on = game.bld.getBuildingExt('quarry').meta.val;
    game.bld.getBuildingExt('calciner').meta.on = game.bld.getBuildingExt('calciner').meta.val;
    game.bld.getBuildingExt('smelter').meta.on = game.bld.getBuildingExt('smelter').meta.val;
    game.bld.getBuildingExt('steamworks').meta.on = game.bld.getBuildingExt('steamworks').meta.val;
    game.bld.getBuildingExt('magneto').meta.on = game.bld.getBuildingExt('magneto').meta.val;
    game.bld.getBuildingExt('oilWell').meta.isAutomationEnabled = true;
}

/**
 * Research the Solar Revolution upgrade if conditions are met
 * @returns {string} The name of the researched upgrade or empty string
 */
function researchSolarRevolution() {
  // Clear previous message
  GlobalMsg['solarRevolution'] = '';

  // Check if Solar Revolution is already researched or if atheism challenge is active
  const solarRevolution = gamePage.religion.getRU('solarRevolution');
  if (solarRevolution.val > 0 || gamePage.challenges.isActive("atheism")) {
    return GlobalMsg['solarRevolution'];
  }

  // Check if theology is researched to display the label
  if (gamePage.science.get('theology').researched) {
    GlobalMsg['solarRevolution'] = solarRevolution.label;
  }

  // Find the Solar Revolution button if it's visible and available
  const religionTab = gamePage.tabs[5];
  const solarRevolutionButton = religionTab.rUpgradeButtons.find(button =>
    button.model.metadata.name === "solarRevolution" &&
    button.model.visible &&
    button.model.enabled &&
    !button.model.resourceIsLimited
  );

  // Research Solar Revolution if the button is found
  if (solarRevolutionButton) {
    try {
      const result = solarRevolutionButton.controller.buyItem(
        solarRevolutionButton.model,
        {}
      );
      if (result.itemBought) {
        solarRevolutionButton.update();
        gamePage.msg('Religion researched: ' + solarRevolutionButton.model.name);
      }
    } catch (error) {
      console.error('Error researching Solar Revolution:', error);
    }
  }

  return GlobalMsg['solarRevolution'];
}

// These constants help explain some frequently used numeric thresholds
const VOID_COST_RATIO_THRESHOLD = 0.1;
const CRYOCHAMBER_FIXED_MSG = 'Cryochamber Fixed';
const BUILD_IN_TIME_MSG_PREFIX = 'Build in Time: ';

/**
 * Main automation function for the Kittens Game "Time" tab.
 * It orchestrates automation for Void Space buildings, Chronoforge buildings,
 * time-skips, and temporal flux acceleration.
 */
function timePage() {
  // Clears some globally tracked messages used elsewhere in the UI.
  resetGlobalMessages();

  // Updates the Time tab if certain research has been completed.
  if (gamePage.science.get('voidSpace').researched ||
    gamePage.workshop.get("chronoforge").researched)
  {
    gamePage.timeTab.update();
  }

  // Handles automation for Void Space buildings (e.g., Cryochambers).
  handleVoidSpaceAutomation();

  // Handles automation for Chronoforge buildings and time skipping.
  handleChronoforgeAutomation();

  // Enables temporal flux acceleration if relevant conditions are met.
  accelerateTimeIfNeeded();
}

/* ------------------------------------------------------------------
 *  1. Resetting Global Messages
 * ------------------------------------------------------------------*/

/**
 * Resets global messages related to relicStation and voidAspiration
 * at the start of each automation cycle.
 */
function resetGlobalMessages() {
  GlobalMsg['relicStation'] = '';
  GlobalMsg['voidAspiration'] = '';
}

/* ------------------------------------------------------------------
 *  2. Void Space Automation
 * ------------------------------------------------------------------*/

/**
 * Oversees building purchases in the Void Space panel.
 * Skips logic if Void Space research is not done or if a specific
 * global science condition ("Paradox Theory") is in effect.
 */
function handleVoidSpaceAutomation() {
  if (!gamePage.science.get('voidSpace').researched ||
    GlobalMsg['science'] === 'Paradox Theory')
  {
    return;
  }

  const voidBuilds = gamePage.timeTab.vsPanel.children[0].children;
  const voidCf = computeVoidCfThreshold(voidBuilds);

  // If time smoothing is researched and we're not in Iron Will mode,
  // handle early Void Space buildings (index 0 and 1) specifically.
  if (gamePage.workshop.get("turnSmoothly").researched && !gamePage.ironWill) {
    buildCryochamberIfAffordable(voidBuilds, voidCf);
    buildVoidItem1IfAffordable(voidBuilds, voidCf);
  }

  // Remaining Void Space buildings start at index 3
  try {
    for (let i = 3; i < voidBuilds.length; i++) {
      const vb = voidBuilds[i];
      if (!vb.model.metadata.unlocked || !vb.model.enabled) {
        continue;
      }
      if (switches['CollectResBReset']) {
        // If a certain flag is set, we skip automation for these items.
        continue;
      }
      handleOtherVoidBuildings(vb, i, voidBuilds, voidCf);
    }
  } catch (err) {
    console.log(err);
  }
}

/**
 * Calculates a reference threshold (voidCf) that helps decide
 * whether certain Void Space buildings are affordable or not,
 * based on the minimum "void" cost among selected buildings
 * and how many Markers have been built in religion.
 */
function computeVoidCfThreshold(voidBuilds) {
  const markerVal = gamePage.religion.getZU("marker").val;
  const costVoidBuild3 = voidBuilds[3].model.prices.filter(r => r.name === 'void')[0].val;
  const costVoidBuild5 = voidBuilds[5].model.prices.filter(r => r.name === 'void')[0].val;
  const minCost = Math.min(costVoidBuild3, costVoidBuild5);

  // If more than one Marker is built, clamp the min cost by the current void resource.
  // Otherwise, use just the min cost among the selected buildings.
  if (markerVal > 1) {
    return Math.max(minCost, gamePage.resPool.get("void").value);
  }
  return minCost;
}

/**
 * Automates purchasing a Cryochamber (voidBuilds[0]) if it meets
 * certain ratio thresholds related to its cost.
 */
function buildCryochamberIfAffordable(voidBuilds, voidCf) {
  const cryoChamber = voidBuilds[0];
  if (!cryoChamber.model.visible) {
    return;
  }

  // Enforces a specific comparison to decide if it's cheap enough to build.
  // The costCheck scales with the number of active items at index 2.
  const costCheck = Math.max(500, voidBuilds[2].model.on * 20);
  if (costCheck <= voidCf * VOID_COST_RATIO_THRESHOLD) {
    const result = cryoChamber.controller.buyItem(cryoChamber.model, {});
    if (result.itemBought) {
      gamePage.msg(CRYOCHAMBER_FIXED_MSG);
    }
  }
}

/**
 * Automates purchasing the Void Space building at index 1 if it meets
 * certain cost and count-based thresholds.
 */
function buildVoidItem1IfAffordable(voidBuilds, voidCf) {
  const item1 = voidBuilds[1];
  if (!item1.model.visible) {
    return;
  }

  const voidCost = item1.model.prices.filter(r => r.name === 'void')[0].val;
  const maxVal = Math.max(Math.ceil((voidBuilds[2].model.metadata.val + 1) * 0.1), 5);

  // If the item is too expensive relative to voidCf or its count is above maxVal, skip it.
  if (voidCost > voidCf * VOID_COST_RATIO_THRESHOLD ||
    item1.model.metadata.val >= maxVal)
  {
    return;
  }

  // Otherwise, purchase it.
  const result = item1.controller.buyItem(item1.model, {});
  if (result.itemBought) {
    item1.update();
    gamePage.msg(BUILD_IN_TIME_MSG_PREFIX + item1.model.name);
  }
}

/**
 * Coordinates purchasing of other Void Space items (index >= 3),
 * with detailed skip conditions to avoid suboptimal spending and
 * special cases for Iron Will mode.
 */
function handleOtherVoidBuildings(buildingBtn, index, voidBuilds, voidCf) {
  // If a specific workshop upgrade is available but not researched,
  // record that for the UI and skip further building logic.
  if (gamePage.workshop.get("voidAspiration").unlocked &&
    !gamePage.workshop.get("voidAspiration").researched)
  {
    GlobalMsg['voidAspiration'] = gamePage.workshop.get("voidAspiration").label;
    return;
  }

  // Skipping logic for certain items or cycles:
  // For instance, skip building #5 if "turnSmoothly" isn't researched and the
  // resource constraints aren't met; skip building #6 if time.meta is below 3, etc.
  if (
    (index === 5 &&
      !gamePage.workshop.get("turnSmoothly").researched &&
      voidBuilds[5].model.metadata.val > 0 &&
      (gamePage.resPool.get("temporalFlux").value -
        voidBuilds[5].model.prices.filter(res => res.name === "temporalFlux")[0].val)
      < gamePage.workshop.get("turnSmoothly")
      .prices.filter(res => res.name === "temporalFlux")[0].val
    ) ||
    (index === 6 && gamePage.time.meta[0].meta[5].val < 3)
  ) {
    return; // skip building
  }

  // If the item is neither index 3 nor 5, skip if item #3 or #5 would be cheaper than our threshold.
  if (
    index !== 3 && index !== 5 &&
    (
      (voidBuilds[3].model.metadata.unlocked &&
        voidBuilds[3].model.prices.filter(r => r.name === 'void')[0].val
        < voidCf * VOID_COST_RATIO_THRESHOLD
      ) ||
      (voidBuilds[5].model.metadata.unlocked &&
        voidBuilds[5].model.prices.filter(r => r.name === 'void')[0].val
        < voidCf * VOID_COST_RATIO_THRESHOLD
      )
    )
  ) {
    return; // skip building
  }

  // In Iron Will mode, skip if the building has an effect that increases max Kittens.
  // Otherwise, proceed with the purchase.
  if (gamePage.ironWill) {
    if (!buildingBtn.model.metadata.effects.maxKittens) {
      buyAndNotify(buildingBtn);
    }
  } else {
    buyAndNotify(buildingBtn);
  }
}

/**
 * Attempts to purchase the given building, then shows a success message
 * in the log if it was bought successfully.
 */
function buyAndNotify(buildingBtn) {
  const result = buildingBtn.controller.buyItem(buildingBtn.model, {});
  if (result.itemBought) {
    buildingBtn.update();
    gamePage.msg(BUILD_IN_TIME_MSG_PREFIX + buildingBtn.model.name);
  }
}

/* ------------------------------------------------------------------
 *  3. Chronoforge Automation
 * ------------------------------------------------------------------*/

/**
 * Oversees automation of Chronoforge buildings (e.g., Blast Furnace),
 * managing time-skips when feasible, and constructing relevant items.
 */
function handleChronoforgeAutomation() {
  if (!gamePage.workshop.get("chronoforge").researched) {
    return;
  }

  const chronoforge = gamePage.timeTab.cfPanel.children[0].children;
  const tcVal = gamePage.resPool.get("timeCrystal").value;
  // Depending on the "1000Years" challenge, we adjust the factor used in heat checks.
  const factor = gamePage.challenges.getChallenge("1000Years").researched ? 5 : 10;

  // fastCombust is a set of conditions that make it safer or more beneficial
  // to do rapid time-skips (like if we have excess Void or are early in a day).
  const fastCombust = checkFastCombust(tcVal);

  // The game might indicate if we are in a "Dark Future" or not, used in the original code:
  const notDark = checkDarkFuture();
  // 'notDark' isn't used further in this example, but we keep it in case
  // future expansions need to handle dark futures differently.

  // Toggles automation for the Blast Furnace if certain conditions are or aren't met.
  handleBlastFurnaceAutomation();

  // Shows progress toward building a Relic Station if that station is discovered but not researched.
  updateRelicStationMessage();

  // Checks if conditions allow for resource retrieval or big time-skips.
  handleResourceRetrievalAndTimeSkips(chronoforge, tcVal, factor, fastCombust);

  // Automates constructing other Chronoforge items if conditions allow it.
  buildOtherChronoforgeItems(chronoforge);
}

/**
 * Determines whether conditions are suitable for rapid "fast combustion."
 * This typically means we have enough void resources or we are early in a day
 * with low heat, plus at least one active Dark Nova, etc.
 */
function checkFastCombust(tcVal) {
  const hasEnoughVoid = (Math.max(tcVal, 600) < gamePage.resPool.get("void").value);
  const earlyDayLowHeat = (
    tcVal > 45 &&
    gamePage.calendar.day < 10 &&
    gamePage.time.heat < gamePage.getEffect("heatMax") * 0.9
  );

  // Return true if either we have ample void or we meet day/heat conditions,
  // plus at least one level in the "darkNova" upgrade and the correct time meta level.
  return (
    (hasEnoughVoid || earlyDayLowHeat) &&
    gamePage.time.meta[0].meta[5].val >= 1 &&
    gamePage.religion.getTU("darkNova").on > 0
  );
}

/**
 * Checks if the current timeline is not in a "Dark Future."
 * This is kept for potential expansions or conditions that might matter later.
 */
function checkDarkFuture() {
  // If darkFutureYears(true) < 0, it implies no dark future yet.
  return gamePage.calendar.darkFutureYears(true) < 0;
}

/**
 * Ensures automation for the Blast Furnace is toggled off or on as needed.
 * Here, it's currently forced off for safety or performance reasons.
 */
function handleBlastFurnaceAutomation() {
  const bf = gamePage.time.getCFU("blastFurnace");
  if (!bf.unlocked) {
    return;
  }

  // The original logic here permanently disables automation.
  if (bf.isAutomationEnabled) {
    bf.isAutomationEnabled = false;
  }

  // Additional toggling logic (commented out) could be re-enabled if needed.
  /*
    if (gamePage.calendar.cycle == 5 && bf.heat < 200 && bf.isAutomationEnabled) {
        bf.isAutomationEnabled = false;
    } else if (!bf.isAutomationEnabled && ...) {
        bf.isAutomationEnabled = true;
    }
    */
}

/**
 * Updates a global message to show progress toward unlocking the Relic Station.
 * Only triggers if Relic Station is discovered, not yet researched, and
 * "paradoxalKnowledge" is available.
 */
function updateRelicStationMessage() {
  const relicStation = gamePage.workshop.get("relicStation");
  if (
    relicStation.unlocked &&
    !relicStation.researched &&
    gamePage.science.get("paradoxalKnowledge").researched
  ) {
    const requiredAM = relicStation.prices.filter(r => r.name === 'antimatter')[0].val;
    const currentAM = gamePage.resPool.get("antimatter").value;
    const percent = Math.round((currentAM / requiredAM) * 100);
    GlobalMsg['relicStation'] = relicStation.label + ' ' + percent + '%';
  }
}

/**
 * Manages the logic around resource retrieval (RR) and time-skips (Chronoforge "shatter").
 * This can skip multiple years if conditions permit or do small single-year skips otherwise.
 */
function handleResourceRetrievalAndTimeSkips(chronoforge, tcVal, factor, fastCombust) {
  const rr = gamePage.time.getCFU("ressourceRetrieval");
  const rrVal = rr.val;

  // Only proceed if we're not in a mode that disallows building or if we have at least 1 RR.
  if (!switches['CollectResBReset'] || rrVal >= 1) {

    // Large skips are attempted only if we have at least some RR,
    // and if certain conditions (like void > 800 or challenge states) are satisfied.
    if (rrVal > 0 && (!gamePage.challenges.isActive("1000Years") ||
      gamePage.resPool.get("void").value > 800))
    {
      // This next condition ensures unobtainium, energy, timeCrystal, and
      // other factors line up before performing multi-year skips.
      if (shouldDoBigTimeSkips(tcVal, factor, fastCombust)) {
        attemptMultiYearSkips(chronoforge, tcVal, factor);
      }
    }
    // If the above was skipped, check if we can do a single-year skip
    // under simpler conditions (like being outside cycle 5, etc.).
    else if (
      gamePage.calendar.cycle !== 5 &&
      rrVal === 0 &&
      tcVal >= 1 &&
      gamePage.time.heat < (gamePage.getEffect("heatMax") / 2)
    ) {
      chronoforge[0].controller.doShatterAmt(chronoforge[0].model, 1);
      chronoforge[0].update();
    }
  }
}

/**
 * Determines if conditions allow for a "big" time skip (e.g., skipping entire cycles).
 * Includes checks on unobtainium levels, energy production, day checks, cycle, etc.
 */
function shouldDoBigTimeSkips(tcVal, factor, fastCombust) {
  // A partial breakdown of the logic used here:
  // 1) Unobtainium is below 90% of its capacity
  // 2) We have sufficient net energy or are at max antimatter
  // 3) We're not on day 0
  // 4) We pass a large bracket check of cycles, numerology perk, paragon thresholds, etc.

  const unobtainiumOk = (
    gamePage.resPool.get("unobtainium").value <
    gamePage.resPool.get("unobtainium").maxValue * 0.9
  );

  const energyOk = (
    (gamePage.resPool.energyProd - gamePage.resPool.energyCons >= 0) ||
    (gamePage.resPool.get("antimatter").value >=
      gamePage.resPool.get("antimatter").maxValue)
  );

  const dayOk = (gamePage.calendar.day > 1);

  return (
    unobtainiumOk &&
    energyOk &&
    dayOk &&
    checkTimeSkipCycleConditions(tcVal, factor, fastCombust)
  );
}

/**
 * Contains a complex set of logical gates determining if the game cycle,
 * perk availability, paragon count, or heat thresholds allow major time skips.
 * This is crucial for deciding whether to skip whole cycles or entire eras.
 */
function checkTimeSkipCycleConditions(tcVal, factor, fastCombust) {
  // The following condition captures multiple sub-checks:
  // - "numerology" research or a certain "meta[5]" level
  // - which cycle we're in
  // - paragon thresholds for timeCrystal usage
  // - synergy with relicStation, sunlifter, chronosphere counts, etc.
  // The code is intentionally verbose to ensure each sub-condition is met.

  return (
    (
      (
        (gamePage.calendar.cycle !== 5 &&
          gamePage.prestige.getPerk("numerology").researched)
        ||
        (
          gamePage.time.meta[0].meta[5].val >=
          (gamePage.resPool.get('paragon').value > 100 ? 1 : 3)
          &&
          tcVal >= (
            gamePage.resPool.get('paragon').value > 100
            ? 1
            : gamePage.time.meta[0].meta[5].val * 1000
          )
        )
      )
      &&
      (
        (
          gamePage.calendar.cycle !== 5 &&
          gamePage.prestige.getPerk("numerology").researched
        )
        ||
        (
          (
            gamePage.time.meta[0].meta[5].val >= 3 ||
            gamePage.time.heat < 50
          )
          &&
          gamePage.workshop.get("relicStation").unlocked &&
          !gamePage.workshop.get("relicStation").researched &&
          gamePage.science.get("paradoxalKnowledge").researched &&
          tcVal > (fastCombust ? 5 : 45) &&
          gamePage.bld.getBuildingExt('chronosphere').meta.val >= 10 &&
          gamePage.space.getBuilding('sunlifter').val > 0
        )
      )
    )
    ||
    (
      gamePage.time.meta[0].meta[5].val >=
      (gamePage.resPool.get('paragon').value > 100 ? 1 : 3)
      &&
      (
        (
          gamePage.time.heat === 0 &&
          (
            (gamePage.calendar.cycle !== 5 &&
              gamePage.prestige.getPerk("numerology").researched)
            ||
            (
              gamePage.calendar.season > 0 &&
              gamePage.time.meta[0].meta[5].val >= 3
            )
          )
        )
        ||
        (
          (fastCombust ? true :
            (gamePage.time.heat + 50 * factor) <
            gamePage.getEffect("heatMax")
          )
          &&
          tcVal > (
            gamePage.resPool.get('paragon').value > 100
            ? (gamePage.time.meta[0].meta[5].val >= 3 ? 5 : 5000)
            : gamePage.time.meta[0].meta[5].val * 1000
          )
          &&
          gamePage.calendar.cycle === 5
          &&
          (
            gamePage.calendar.season > 0 ||
            (
              fastCombust ||
              (
                gamePage.time.heat <
                gamePage.getEffect("heatMax") * 0.5
                && gamePage.calendar.day < 10
              )
            )
          )
        )
      )
    )
  );
}

/**
 * Attempts multiple time skips in descending order of magnitude
 * (e.g., skipping 45 years, 5 years, or a single year) depending on
 * current Time Crystal availability, heat thresholds, and cycle position.
 */
function attemptMultiYearSkips(chronoforge, tcVal, factor) {
  const shatterBtn = chronoforge[0];
  const heat = gamePage.time.heat;
  const heatMax = gamePage.getEffect("heatMax");
  const skip5Cost = shatterBtn.controller.getPricesMultiple(shatterBtn.model, 5).timeCrystal;
  const skip45Cost = shatterBtn.controller.getPricesMultiple(shatterBtn.model, 45).timeCrystal;
  const skip1Cost = shatterBtn.controller.getPricesMultiple(shatterBtn.model, 1).timeCrystal;
  const cycle = gamePage.calendar.cycle;
  const cycleYear = gamePage.calendar.cycleYear;
  const meta5Val = gamePage.time.meta[0].meta[5].val;
  const yearsPerCycle = gamePage.calendar.yearsPerCycle;
  const cyclesPerEra = gamePage.calendar.cyclesPerEra;

  // Various skip options: "Skip time (1)" for an entire cycle, "(2)" for multiple cycles, etc.
  // Conditions ensure we don't overheat the timeline or exceed Time Crystal availability.

  // Option 1: If heat is above 90% but we can handle cost for 5 shatters,
  // and the cycle is not 4 or 5, attempt skipping an entire cycle.
  if (
    heat > heatMax * 0.9 &&
    (factor * skip5Cost) <= heatMax &&
    ![4, 5].includes(cycle) &&
    meta5Val >= 1 &&
    tcVal >= skip5Cost
  ) {
    if ((heatMax - heat) > (skip5Cost * factor)) {
      gamePage.msg('Skip time (1): ' + yearsPerCycle);
      shatterBtn.controller.doShatterAmt(shatterBtn.model, yearsPerCycle);
      shatterBtn.update();
    }
  }
  // Option 2: If we can handle 45 shatters, cycle is not 4 or our heat is below 90%,
  // meta5Val is high enough, and we are at the start of the cycle (cycleYear==0).
  else if (
    (factor * skip45Cost) <= heatMax &&
    (cycle !== 4 || heat < heatMax * 0.9) &&
    meta5Val >= 3 &&
    tcVal >= skip45Cost &&
    cycleYear === 0
  ) {
    if (
      (heatMax - heat) > (skip45Cost * factor) &&
      (meta5Val >= 3 || (!gamePage.ironWill && meta5Val >= 1))
    ) {
      gamePage.msg('Skip time (2): ' + (yearsPerCycle * (cyclesPerEra - 1)));
      shatterBtn.controller.doShatterAmt(shatterBtn.model, yearsPerCycle * (cyclesPerEra - 1));
      shatterBtn.update();
    }
  }
  // Option 3: If we can handle 5 shatters, and cycle not 4 or heat < 90%,
  // we skip either the remainder of cycle 4 or an entire cycle otherwise.
  else if (
    (factor * skip5Cost) <= heatMax &&
    (cycle !== 4 || heat < heatMax * 0.9) &&
    meta5Val >= 1 &&
    tcVal >= skip5Cost
  ) {
    if ((heatMax - heat) > (skip5Cost * factor)) {
      if (cycle === 4) {
        gamePage.msg('Skip time (4): ' + (yearsPerCycle - cycleYear));
        shatterBtn.controller.doShatterAmt(shatterBtn.model, yearsPerCycle - cycleYear);
        shatterBtn.update();
      } else {
        gamePage.msg('Skip time (3): ' + yearsPerCycle);
        shatterBtn.controller.doShatterAmt(shatterBtn.model, yearsPerCycle);
        shatterBtn.update();
      }
    }
  }
  // Option 4: Fall back to a single-year skip if we still have enough Time Crystals
  // and enough heat margin.
  else if (
    tcVal >= skip1Cost &&
    (heatMax - heat) > (skip1Cost * factor)
  ) {
    try {
      const result = shatterBtn.controller.buyItem(shatterBtn.model, {});
      if (result.itemBought) {
        shatterBtn.update();
      }
    } catch (err) {
      console.log(err);
    }
  }
}

/**
 * Automates building of the other Chronoforge items (indexes 1..N),
 * respecting conditions about resource retrieval, cost thresholds, etc.
 */
function buildOtherChronoforgeItems(chronoforge) {
  const rr = gamePage.time.getCFU("ressourceRetrieval");

  // Only automate these if resourceRetrieval is unlocked or
  // the Blast Furnace is unlocked but has fewer than 2 built.
  if (
    rr.unlocked ||
    (gamePage.time.getCFU("blastFurnace").unlocked &&
      gamePage.time.getCFU("blastFurnace").val < 2)
  ) {
    try {
      for (let t = 1; t < chronoforge.length; t++) {
        if (switches['CollectResBReset']) {
          // If a certain reset-related switch is active, skip building these items.
          continue;
        }
        handleChronoforgeItemPurchase(chronoforge, t);
      }
    } catch (err) {
      console.log(err);
    }
  }
}

/**
 * Decides whether to purchase a specific Chronoforge item or skip it
 * based on cost thresholds, item indexing, or resource retrieval logic.
 */
function handleChronoforgeItemPurchase(chronoforge, t) {
  const cfItem = chronoforge[t];
  if (!cfItem.model.metadata.unlocked || !cfItem.model.enabled) {
    return;
  }

  // If skip conditions indicate we should not build this item, exit here.
  if (shouldSkipChronoforgeItem(chronoforge, t)) {
    return;
  }

  // Otherwise, buy it and notify the user via the message log.
  const result = cfItem.controller.buyItem(cfItem.model, {});
  if (result.itemBought) {
    cfItem.update();
    gamePage.msg(BUILD_IN_TIME_MSG_PREFIX + cfItem.model.name);
  }
}

/**
 * Determines if a Chronoforge item (index t) should be skipped
 * based on an extensive set of logic around resource retrieval levels,
 * item cost, year thresholds, etc.
 */
function shouldSkipChronoforgeItem(chronoforge, t) {
  const rr = gamePage.time.getCFU("ressourceRetrieval");
  const rrVal = rr.val;
  const cfItem = chronoforge[t];

  // Condition A: If this item is not "ressourceRetrieval" itself,
  // and resourceRetrieval is unlocked,
  // and its cost is deemed too high relative to item #6's cost.
  if (
    cfItem.model.metadata.name !== "ressourceRetrieval" &&
    rr.unlocked &&
    timeCrystalCostTooHigh(cfItem, rrVal) &&
    (rrVal <= 3 || gamePage.religion.getZU("marker").val > 1)
  ) {
    return true;
  }

  // Condition B: Additional checks for skipping items other than #2 or #6,
  // factoring in game year, timeCrystal count, or if resourceRetrieval <=3
  if (skipChronoforgeItemForYearCost(chronoforge, t, rrVal)) {
    return true;
  }

  // Condition C: If item #7 is present, always skip.
  if (t === 7) {
    return true;
  }

  // Condition D: If t == 2 and we haven't built enough of item #6 to justify more #2
  if (t === 2) {
    const val2 = cfItem.model.metadata.val;
    const val6 = chronoforge[6].model.metadata.val;
    if (((Math.floor(val2 / 8) - 1) * 5) > val6) {
      return true;
    }
  }

  // If none of these conditions are met, the item is safe to build.
  return false;
}

/**
 * Checks if a Chronoforge item's timeCrystal price is too high
 * relative to item #6's cost, factoring in resourceRetrieval level.
 */
function timeCrystalCostTooHigh(cfItem, rrVal) {
  const cfTimeCrystal = cfItem.model.prices.filter(res => res.name === "timeCrystal")[0].val;
  const currentTC = gamePage.resPool.get("timeCrystal").value;
  // If resourceRetrieval is above 2, we limit cost by the lesser of cfTimeCrystal and currentTC.
  // Otherwise, we just take currentTC as is.
  const effectiveCost = (rrVal > 2) ? Math.min(cfTimeCrystal, currentTC) : currentTC;

  const cfItem6 = gamePage.timeTab.cfPanel.children[0].children[6];
  const costItem6 = cfItem6.model.prices.filter(res => res.name === 'timeCrystal')[0].val;
  // If resourceRetrieval is over 3, multiply item #6's cost by 0.9; otherwise, use 0.05.
  const ratio = (rrVal > 3) ? 0.9 : 0.05;

  return (effectiveCost > costItem6 * ratio);
}

/**
 * Evaluates another block of skip logic for Chronoforge items, checking
 * conditions such as:
 *  - If an item is not #2 or #6
 *  - Year and timeCrystal thresholds
 *  - Low resourceRetrieval levels
 */
function skipChronoforgeItemForYearCost(chronoforge, t, rrVal) {
  if (t === 2 || t === 6) {
    return false; // this condition doesn't apply to items #2 and #6
  }

  const year = gamePage.calendar.year;
  const timeCrystalVal = gamePage.resPool.get("timeCrystal").value;
  const unobtainiumMax = gamePage.resPool.get("unobtainium").maxValue;

  const cfItem6 = chronoforge[6];
  const cfItem6Price = cfItem6.model.prices.filter(res => res.name === 'timeCrystal')[0].val;
  const thisItemPrice = chronoforge[t].model.prices.filter(res => res.name === 'timeCrystal')[0].val;

  // If current year < 40000 and we have fewer than 20000 time crystals, or
  // if this item is more expensive than item #6 by a certain ratio,
  // or if RR is <=3, we skip building.
  const condYearCrystal = (year < 40000 && timeCrystalVal < 20000);
  const condPriceRatio = (
    thisItemPrice >
    cfItem6Price * (timeCrystalVal > (unobtainiumMax * 0.01) ? 0.1 : 0.01)
  );
  const condRrVal = (rrVal <= 3);

  return (condYearCrystal || condPriceRatio || condRrVal);
}

/* ------------------------------------------------------------------
 *  4. Time Acceleration (turnSmoothly)
 * ------------------------------------------------------------------*/

/**
 * Enables temporal flux acceleration if "turnSmoothly" is researched
 * and the temporalFlux resource is currently at maximum capacity.
 */
function accelerateTimeIfNeeded() {
  if (!gamePage.workshop.get("turnSmoothly").researched) {
    return;
  }
  if (
    !gamePage.time.isAccelerated &&
    gamePage.resPool.get("temporalFlux").value >=
    gamePage.resPool.get("temporalFlux").maxValue
  ) {
    gamePage.time.isAccelerated = true;
  }
}

function service(){
  gamePage.ui.render();
  if (!switches["Iron Will"]) {
    gamePage.ironWill = false;
  }
}

const actualTabs = Object.values(gamePage.tabs.filter(tab => tab.tabName != "Stats"));

function renderNewTabs(){
  if(gamePage.tabs.filter(tab => tab.tabName != "Stats"  && !actualTabs.includes(tab)).length > 0) {
    gamePage.tabs.filter(tab => tab.tabName != "Stats" && !actualTabs.includes(tab)).forEach(tab => tab.render());
    actualTabs = Object.values(gamePage.tabs.filter(tab => tab.tabName != "Stats"));
  }
  //space render
  else if(gamePage.tabs[6].GCPanel.children.filter(res => res.model.on == 1).length != gamePage.tabs[6].planetPanels.length){
    gamePage.tabs[6].render();
    actualTabs = Object.values(gamePage.tabs.filter(tab => tab.tabName != "Stats"));
  }
}

if (gamePage.ironWill) {
  if (gamePage.resPool.get("burnedParagon").value + gamePage.resPool.get("paragon").value > 0) {
    if (gamePage.resPool.get("zebras").value == 0) {
      gamePage.msg('"Iron Will" mode will be off after 755 game ticks (if not switched)');
    } else if (!switches["Iron Will"]){
      autoSwitch('Iron Will',  'IronWill')
    }
  } else {
    gamePage.ironWill = false;
  }
}

function sellSpaceAndReset() {
  // Don't allow auto-reset during challenges
  if (gamePage.challenges.anyChallengeActive()) {
    gamePage.msg('You are in challenge now, please reset manually.');
    return;
  }
 
  // Ask for confirmation
  const confirmMessage = $I("reset.confirmation.title");
  const msg = "Sell all space and Reset?";
 
  gamePage.ui.confirm(confirmMessage, msg, () => {
    // Save and temporarily disable the sell option setting
    const originalHideSell = gamePage.opts.hideSell;
    gamePage.opts.hideSell = false;
   
    // Special handling for cryochambers (panel 4, child 1)
    const spacePanels = gamePage.tabs[6].planetPanels;
    if (spacePanels.length > 3) {
      const cryoPanel = spacePanels[4]?.children?.[1];
      if (cryoPanel?.model?.metadata) {
        cryoPanel.model.metadata.on = cryoPanel.model.metadata.val;
      }
    }
   
    // Sell all space buildings except containment chambers
    try {
      spacePanels.forEach(panel => {
        const spaceBuildings = panel.children || [];
       
        spaceBuildings.forEach(building => {
          const metadata = building.model?.metadata;
         
          if (metadata?.unlocked &&
              metadata.val > 1 &&
              metadata.name !== "containmentChamber") {
            building.controller.sellInternal(building.model, 1);
          }
        });
      });
    } catch (error) {
      console.error("Error while selling space buildings:", error);
    }
   
    // Restore original sell option setting
    gamePage.opts.hideSell = originalHideSell;
   
    // Schedule reset and provide user feedback
    const resetDelay = 10000; // 10 seconds
    console.log(`Reset will happen in ${resetDelay/1000} seconds`);
   
    if ($("#PriorityLabel").length) {
      $("#PriorityLabel").text(`Reset will happen in ${resetDelay/1000} seconds`);
    }
   
    // Stop automation before reset
    if (typeof runAllAutomation !== 'undefined') {
      clearInterval(runAllAutomation);
    }
   
    // Perform the reset after delay
    setTimeout(() => gamePage.resetAutomatic(), resetDelay);
  });
}

function LabelMsg(){
  GlobalMsg['chronosphere'] = ''
  if (gamePage.bld.getBuildingExt('chronosphere').meta.val < 10 && gamePage.bld.getBuildingExt('chronosphere').meta.unlocked && gamePage.resPool.get("unobtainium").value > 0  && gamePage.resPool.get("timeCrystal").value > 0){
    GlobalMsg['chronosphere'] = gamePage.bld.getBuildingExt('chronosphere').meta.label + '(1-10) ' +  Math.min(Math.round((gamePage.resPool.get("timeCrystal").value/calculateChronosphere10Prices()["timeCrystal"])*100),Math.round((gamePage.resPool.get("unobtainium").value/calculateChronosphere10Prices()["unobtainium"])*100)) + '%';
  }

  let gmsgarr = []
  for (let key of Object.keys(GlobalMsg)) {
    if (GlobalMsg[key]) {
      gmsgarr.push(GlobalMsg[key]);
    }
  }
  $("#PriorityLabel")[0].innerText =  gmsgarr.join(' / ')
}

/**
 * Calculates the cumulative prices for building 10 Chronospheres from current level
 * @returns {Object} An object mapping resource names to their total cost
 */
function calculateChronosphere10Prices() {
  // Get the Chronosphere building reference once
  const chronosphere = gamePage.bld.getBuildingExt('chronosphere');
 
  // Get the current level and price information
  const currentLevel = chronosphere.meta.val;
  const basePrices = chronosphere.get('prices');
  const priceRatio = gamePage.bld.getPriceRatioWithAccessor(chronosphere);
 
  // Calculate the target level (current + 10, or at least 10)
  const targetLevel = Math.max(currentLevel + 9, 10); // +9 because we're calculating 10 buildings including current level
 
  // Initialize the results object
  const totalPrices = {};
 
  // Calculate the cost for each resource
  basePrices.forEach(resource => {
    let totalCost = 0;
   
    // Sum up the costs from current level to target level
    for (let level = currentLevel; level <= targetLevel; level++) {
      totalCost += resource.val * Math.pow(priceRatio, level);
    }
   
    totalPrices[resource.name] = totalCost;
  });
 
  return totalPrices;
}

gamePage.tabs.filter(tab => tab.tabId != "Stats").forEach(tab => tab.render());

// This function keeps track of the game's ticks and uses math to execute these functions at set times relative to the game.
gamePage.ui.render();

let tick = 0;

const runAllAutomation = setInterval(function() {
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
      setTimeout(timePage, 0);
    }

    if (gamePage.timer.ticksTotal % 50 === 0) {
      setTimeout(researchSolarRevolution, 0);
      setTimeout(upgradeBuildings, 1);
    }

    if (gamePage.timer.ticksTotal % 151 === 0) {
      setTimeout(renderNewTabs, 1);
    }
    if (gamePage.timer.ticksTotal % 11 === 0) {
      setTimeout(autozig, 0);
    }
    if (gamePage.timer.ticksTotal % 755 === 0) {
      setTimeout(service, 2);
    }
  }
}, 50);

