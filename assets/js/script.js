/* jshint esversion: 6 */

"use strict";

let notRotatedAtStart = false;
let starterFishes = [];
let allFishes = [];
let clickedFish = null;
let selectedAquariumIndex = 0;
let selectedSaveFileIndex = 0;
let autoSaveTimeoutId = null;
let saveFiles = [];
var player;
let musicToggleCounterViaImg = 0;
let musicToggleCounterViaButton = 0;
let movingWaterFilter = false;
let movingNavalMine = false;
let clicksAfterMovingWaterFilter = 0;
let isHoldingClick = false;
let selectedModaloffsetX = 0;
let selectedModaloffsetY = 0;
let $grabbedModal = null;
let backgroundMusic = new Audio('assets/media/audio/backgroundMusic1.mp3');
let backgroundType;
let background;
let customColorActive = false;
const isOnMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

$(document).ready(function () {
    if (window.innerWidth < 600) {
        $('#rotatePhone').show();
        $('#fishTank').hide();
        $('#coinDisplayBlock').hide();
        $('#openShopImg').hide();
        $('#settingsImg').hide();
        notRotatedAtStart = true;
    } else {
        startNewGame();
        /*
        pushStarterFishes();
        */
    }
    //updateStats();
});

function toggleAutoSave() {
    if (player.AutoSaveOn) {
        player.AutoSaveOn = false;
        $("#modalAutoSaveButtonHolder p").css("background-color", "darkred");
        $("#modalAutoSaveButtonHolder p").text("auto-save: OFF");
        stopAutoSaver();
    }
    else {
        player.AutoSaveOn = true;
        $("#modalAutoSaveButtonHolder p").css("background-color", "darkgreen");
        $("#modalAutoSaveButtonHolder p").text("auto-save: ON");
        startAutoSaver();
    }
}

function autoSaver() {
    // Stop if auto-save is off
    if (!player.AutoSaveOn) return;

    // Perform save
    saveToLocalStorage();
    console.log("Game auto-saved on " + new Date().toLocaleString() + ".");
    spawnGameSavedText();

    // Clear any previous scheduled timeout to prevent double scheduling
    if (autoSaveTimeoutId !== null) {
        clearTimeout(autoSaveTimeoutId);
    }

    // Schedule next auto-save in 1 minute (60000 ms)
    autoSaveTimeoutId = setTimeout(autoSaver, 60000);
}

function startAutoSaver() {
    if (autoSaveTimeoutId === null) {
        // Initial delay of 5 seconds before first auto-save to prevent it from starting at same time as water filter cleaning
        setTimeout(() => {
            autoSaver();
        }, 5000);
    }
}

function stopAutoSaver() {
    if (autoSaveTimeoutId !== null) {
        clearTimeout(autoSaveTimeoutId);
        autoSaveTimeoutId = null;
    }
}

function animateWaterFilter() {
    if (!player.AquariumList[selectedAquariumIndex].HasWaterFilter) return;
    if (!player.AquariumList[selectedAquariumIndex].IsWaterFilterVisible) return;
    if (!player.AquariumList[selectedAquariumIndex].IsWaterFilterOn) return;
    const $waterFilter = $("#waterFilter");
    let bubbleSpotX;
    let bubbleSpotY;

    if ($waterFilter.hasClass("mirrored")) {
        bubbleSpotX = $waterFilter.parent().position().left - 5;
        bubbleSpotY = $waterFilter.parent().position().top - 100;
        spawnBubble(bubbleSpotX, bubbleSpotY);
    }
    else {
        bubbleSpotX = $waterFilter.parent().position().left + 120;
        bubbleSpotY = $waterFilter.parent().position().top - 100;
        spawnBubble(bubbleSpotX, bubbleSpotY);
    }
    const randomDelay = getRandomNumber(300, 8000);
    setTimeout(() => {
        animateWaterFilter();
    }, randomDelay);
}

function checkOrientation() {
    if (window.innerWidth < 600) {
        $('#rotatePhone').show();
        $('#fishTank').hide();
        $('#coinDisplayBlock').hide();
        $('#openShopImg').hide();
        $('#settingsImg').hide();
    } else {
        $('#rotatePhone').hide();
        $('#fishTank').show();
        $('#coinDisplayBlock').show();
        $('#openShopImg').show();
        $('#settingsImg').show();

        if (notRotatedAtStart) {
            startNewGame();
            notRotatedAtStart = false;
        }
    }
}

function initialiseGame() {
    backgroundType = player.AquariumList[selectedAquariumIndex].SelectedBackgroundType;
    background = player.AquariumList[selectedAquariumIndex].SelectedBackground;
    switch (backgroundType) {
        case "color":
            const selectedColor = player.AquariumList[selectedAquariumIndex].SelectedBackground.toLowerCase();
            document.documentElement.style.setProperty('--background-color', selectedColor);
            for (let i = 0; i < player.AquariumList[selectedAquariumIndex].OwnedBackgroundColors.length; i++) {
                if (selectedColor == player.AquariumList[selectedAquariumIndex].OwnedBackgroundColors[i] &&
                    selectedColor != "#Add8e6" && selectedColor != "#000000" && selectedColor != "#ffffff" &&
                    selectedColor != "#00008B" && selectedColor != "#7fffd4" && selectedColor != "#2e8b57" &&
                    selectedColor != "#ff7F50" && selectedColor != "#8B0000" && selectedColor != "#DAA520"
                ) {
                    customColorActive = true;
                }
            }
            break;
        case "image":
        case "gif":
            document.documentElement.style.setProperty('--background-image', player.AquariumList[selectedAquariumIndex].SelectedBackground);
            break;
        default:
            document.documentElement.style.setProperty('--background-color', "#ADD8E6");
            console.Error("Critical Error! Background type is not recognized! Reverting back to default background!");
            throw new Error("Critical Error! Background type is not recognized! Reverting back to default background!");
    }

    if (player.AquariumList[selectedAquariumIndex].SelectedBackgroundType === "color") {
        $("#customBackgroundColorInput").attr("value", getComputedStyle(document.documentElement).getPropertyValue("--background-color"));
    }

    updateStats();
    startBackGroundMusic();
    showWaterFilter();
    showNavalBomb();
    updateDecorationShop();
    hideHiddenDecoration()
}

function hideHiddenDecoration() {
    if (player.AquariumList[selectedAquariumIndex].HasWaterFilter && player.AquariumList[selectedAquariumIndex].IsWaterFilterVisible) {
        $("#waterFilterContainer").show();
        $("#toggleWaterFilterButtonHolder").find("p").text("hide");
        $("#toggleWaterFilterButtonHolder").removeClass("yellowGreen");
        $("#toggleWaterFilterButtonHolder").addClass("yellowButton");
    }
    else {
        $("#waterFilterContainer").hide();
        $("#toggleWaterFilterButtonHolder").find("p").text("show");
        $("#toggleWaterFilterButtonHolder").removeClass("yellowButton");
        $("#toggleWaterFilterButtonHolder").addClass("yellowGreen");
    }

    if (player.AquariumList[selectedAquariumIndex].HasNavalMine && player.AquariumList[selectedAquariumIndex].IsNavalMineVisible) {
        $("#landMineContainer").css("display", "flex");
        $("#toggleNavalMineButtonHolder").find("p").text("hide");
        $("#toggleNavalMineButtonHolder").removeClass("yellowGreen");
        $("#toggleNavalMineButtonHolder").addClass("yellowButton");
    }
    else {
        $("#landMineContainer").hide();
        $("#toggleNavalMineButtonHolder").find("p").text("show");
        $("#toggleNavalMineButtonHolder").removeClass("yellowButton");
        $("#toggleNavalMineButtonHolder").addClass("yellowGreen");
    }
}

function showAlert(title, messageBlock) {
    $("#alertModal").find(".modalTitle").find("strong").text(title);
    $("#alertMessageContainer").empty().append(messageBlock);
    closeBottomMenu();
    $("#alertModalBackground").show();
    $("#alertModalContainer").show();
}

function handleInfo(clickedInfoIcon) {
    const infoIconId = clickedInfoIcon.attr("id");
    console.log(infoIconId);

    let title = "";
    const alertMessageBlock = $("<div id='alertMessageBlock'></div>");

    switch (infoIconId) {
        case "waterFilterInfo":
            title = "Water Filter Info:";

            alertMessageBlock.append("<b>The water filter will clear out all the poos every x amount of minutes.</b>");
            alertMessageBlock.append("<p>(user can decide how many minutes).</p>");
            alertMessageBlock.append("<b>It will only grant 1 coin per poo cleaned.</b>");
            alertMessageBlock.append("<p>(by default, this can be increased)</p>");
            break;
        case "navalMineInfo":
            title = "Naval Mine Info:";

            alertMessageBlock.append("<b>The naval mine is purely decorative.</b>");
            alertMessageBlock.append("<p>It looks hella cool tho.</p>");
            break;
        case "fishFoodInfo":
            title = "Fish Food Info:";

            alertMessageBlock.append("<b>Providing your fish with fish food will allow them to grow!</b>");
            alertMessageBlock.append("<p>(0-4 food - size 1)</p>");
            alertMessageBlock.append("<p>(5-9 food - size 2)</p>");
            alertMessageBlock.append("<p>(10-19 food - size 3)</p>");
            alertMessageBlock.append("<p>(20-29 food - size 4)</p>");
            alertMessageBlock.append("<p>(30-49 food - size 5)</p>");
            alertMessageBlock.append("<p>(50-75 food - size 6)</p>");
            alertMessageBlock.append("<p>(76-100 food - size 7)</p>");
            alertMessageBlock.append("<p>(100-149 food - size 8)</p>");
            alertMessageBlock.append("<p>(150-199 food - size 9)</p>");
            alertMessageBlock.append("<p>(200+ food - size 10)</p>");
            break;
        case "speedCandyInfo":
            title = "Speed Candy Info:"

            alertMessageBlock.append("<b>When a fish eats speed candy it will become faster.</b>");
            alertMessageBlock.append("<b>But a fish's speed cannot exceed 5.</b>");
            alertMessageBlock.append("<b>So if a fish with speed 5 eats the candy,  the candy will be lost!</b>");
            break;
        default:
            title = "No info available";

            alertMessageBlock.append("<b>No info available.</b>");
            break;
    }

    showAlert(title, alertMessageBlock);

    clickedInfoIcon.attr("src", "images/GUI/modals/infoClicked.png");
    setTimeout(() => {
        clickedInfoIcon.attr("src", "images/GUI/modals/info.png");
    }, 400);
}

function buyItem($button, whichItem, amount = 1) {
    let costPrice;

    switch (whichItem) {
        case "fish food":
            costPrice = 2 * amount;
            break;
        case "speed candy":
            costPrice = 15 * amount;
            break;
    }
    if ($button.data('disabled')) return; // prevent spam clicking
    $button.data('disabled', true);
    if (player.MoneyAmount >= costPrice) {
        player.MoneyAmount -= costPrice;
        if (whichItem === "fish food") {
            player.FoodAmount += amount;
        }
        else if (whichItem === "speed candy") {
            player.SpeedCandyAmount += amount;
        }
        $button.find("p").css("background-color", "yellowgreen");
        setTimeout(() => {
            if ($button.attr("class").includes("yellowButton")) {
                $button.find("p").css("background-color", "goldenrod");
            }
            else {
                $button.find("p").css("background-color", "darkgreen");
            }
            $button.data('disabled', false);
        }, 400);
        updateStats();
    }
    else {
        alert(`You don't have enough money to buy ${whichItem}!`);
        $button.find("p").css("background-color", "darkred");
        setTimeout(() => {
            if ($button.attr("class").includes("yellowButton")) {
                $button.find("p").css("background-color", "goldenrod");
            }
            else {
                $button.find("p").css("background-color", "darkgreen");
            }
            $button.data('disabled', false);
        }, 400);
    }
}

function updateDecorationShop() {
    if (player.AquariumList[selectedAquariumIndex].HasWaterFilter) {
        $("#buyWaterFilterButtonHolder").hide();
        $("#toggleWaterFilterButtonHolder").css("display", "flex");
    }
    if (player.AquariumList[selectedAquariumIndex].HasNavalMine) {
        $("#buyNavalMineButtonHolder").hide();
        $("#toggleNavalMineButtonHolder").css("display", "flex");
    }
}

function disableShopButButton(id) {
    $(id).removeClass("greenButton");
    $(id).addClass("redButton");
    $(id).find("p").addClass("noClickCursor");
    $(id).find("p").text("SOLD");
}

function startNewGame() {
    loadFromLocalStorage();

    for (let i = 0; i < saveFiles.length; i++) {
        const saveFileBlock = $('<div class="saveFileBlock" id="saveFile' + (i + 1) + '"><div class="saveFileInfo"><strong>Save File ' + (i + 1) + '</strong><p>Amount of Fish: <span id="saveFile' + (i + 1) + 'FishAmount">' + saveFiles[i].FishAmount + '</span></p><p>Coins: <span id="saveFile' + (i + 1) + 'MoneyAmount">' + saveFiles[i].MoneyAmount + '</span></p></div><div id="startMenuButtonsContainer"><div class="modalButtonBlock greenButton loadFileButtonHolder" id="loadFileButton' + (i + 1) + '"><p class="clickAble">load</p></div><div class="modalButtonBlock redButton deleteFileButtonHolder" id="deleteFileButton' + (i + 1) + '"><p class="clickAble">delete</p></div></div></div>');

        $("#modalSaveFilesContainer").append(saveFileBlock);
    }

    const newGameBlock = $('<div id="startNewGameBlock"><div class="modalButtonBlock greenButton" id="startNewGameButtonHolder"><p class="clickAble" id="startNewGameButton">start new game</p></div></div>');

    $('#modalSaveFilesContainer').append(newGameBlock);
}

function applyFishColors(fish) {
    const $svg = fish.SvgElement;

    $svg.css({
        '--body-color': fish.BodyColor,
        '--tail-color': fish.TailFinColor,
        '--top-fin-color': fish.TopFinColor,
        '--bottom-fin-color': fish.BottomFinColor,
        '--side-fin-color': fish.SideFinColor,
        '--pattern-color': fish.PatternColor
    });
}

function checkToMirrorFilter() {
    if (movingWaterFilter) {
        if ($("#waterFilter").hasClass("mirrored")) {
            $("#waterFilter").removeClass("mirrored");
        }
        else {
            $("#waterFilter").addClass("mirrored");
        }
    }
}

function toggleMusic() {
    if (player.BackgroundMusicOn) {
        backgroundMusic.pause();
        player.BackgroundMusicOn = false;
    }
    else {
        backgroundMusic.play();
        player.BackgroundMusicOn = true;
    }
    updateStats();
}

function startBackGroundMusic() {
    if (player.BackgroundMusicOn === false) return;
    backgroundMusic.loop = true;
    backgroundMusic.play();
}

function checkForMusicClicksEasterEgg() {
    if (musicToggleCounterViaImg === 4) {
        const underTheWater = new Audio('assets/media/audio/helloIAmUnderTheWater.mp3');
        underTheWater.volume = 0.7;
        backgroundMusic.pause();
        underTheWater.loop = false;
        underTheWater.play();

        // Force-stop the meme sound 0.2s before it naturally ends
        underTheWater.addEventListener('loadedmetadata', () => {
            const cutoffTime = Math.max(underTheWater.duration - 0.2, 0);
            setTimeout(() => {
                if (!underTheWater.paused) {
                    underTheWater.pause();
                    underTheWater.currentTime = 0;
                    backgroundMusic.play();
                }
            }, cutoffTime * 1000);
        });
    }
    musicToggleCounterViaImg++;
}

function checkForMusicClicksEasterEgg2() {
    if (musicToggleCounterViaButton === 9) {
        const underTheSheets = new Audio('assets/media/audio/underTheSheets.mp3');
        underTheSheets.volume = 0.7;
        backgroundMusic.pause();
        underTheSheets.loop = false;
        underTheSheets.play();

        // Force-stop the meme sound 0.2s before it naturally ends
        underTheSheets.addEventListener('loadedmetadata', () => {
            const cutoffTime = Math.max(underTheSheets.duration - 0.2, 0);
            setTimeout(() => {
                if (!underTheSheets.paused) {
                    underTheSheets.pause();
                    underTheSheets.currentTime = 0;
                    backgroundMusic.play();
                }
            }, cutoffTime * 1000);
        });
    }
    musicToggleCounterViaButton++;
}

async function loadAquarium() {
    $("#swimZone").empty(); // clear the DOM

    const aquarium = player.AquariumList[0];
    if (!aquarium || !aquarium.FishList) return;

    // Only assign SVGs if they don't already have one
    for (let fish of aquarium.FishList) {
        if (!fish.SvgElement) {
            fish = await assignSvgToFish(fish);
        }

        applyFishColors(fish);
        prepareAndAppendFishToSwimZone(fish);
        finalSpawn(fish);
    }

    pushShopFishes();
}

function updateModalColorsOwnedVisually() {
    const ownedBackgroundColors = player.AquariumList[selectedAquariumIndex].OwnedBackgroundColors;

    if (ownedBackgroundColors.includes("#000000")) {
        $("#previewBackgroundBlack .rowItempriceInfo").text("OWNED");
        $("#backgroundBlackButtonHolder p").text("choose");
    }
    if (ownedBackgroundColors.includes("#FFFFFF")) {
        $("#previewBackgroundWhite .rowItempriceInfo").text("OWNED");
        $("#backgroundWhiteButtonHolder p").text("choose");
    }
    if (ownedBackgroundColors.includes("#00008B")) {
        $("#previewBackgroundDarkblue .rowItempriceInfo").text("OWNED");
        $("#backgroundDarkblueButtonHolder p").text("choose");
    }
    if (ownedBackgroundColors.includes("#7FFFD4")) {
        $("#previewBackgroundAquamarine .rowItempriceInfo").text("OWNED");
        $("#backgroundAquamarineButtonHolder p").text("choose");
    }
    if (ownedBackgroundColors.includes("#2E8B57")) {
        $("#previewBackgroundSeagreen .rowItempriceInfo").text("OWNED");
        $("#backgroundSeagreenButtonHolder p").text("choose");
    }
    if (ownedBackgroundColors.includes("#FF7F50")) {
        $("#previewBackgroundCoral .rowItempriceInfo").text("OWNED");
        $("#backgroundCoralButtonHolder p").text("choose");
    }
    if (ownedBackgroundColors.includes("#8B0000")) {
        $("#previewBackgroundDarkred .rowItempriceInfo").text("OWNED");
        $("#backgroundDarkredButtonHolder p").text("owned");
    }
    if (ownedBackgroundColors.includes("#DAA520")) {
        $("#previewBackgroundGoldenrod .rowItempriceInfo").text("OWNED");
        $("#backgroundGoldenrodButtonHolder p").text("choose");
    }

    if (player.AquariumList[selectedAquariumIndex].SelectedBackgroundType === "color") {
        $("#customBackgroundColorInput").attr("value", getComputedStyle(document.documentElement).getPropertyValue("--background-color"));
    }
}

async function assignSvgToFish(fish) {
    const path = FishSvgPaths[fish.FishTypeName];
    if (!path) throw new Error(`No SVG path defined for fish type ${fish.FishTypeName}`);

    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to load SVG for ${fish.FishTypeName}`);

    const svgText = await response.text();
    const $svg = $(svgText);
    $svg.addClass('spawned-fish');
    $svg.addClass('clickAble');

    // --- Generate unique ID for patterns ---
    $svg.find('pattern').each((i, pattern) => {
        const $pattern = $(pattern);
        const oldId = $pattern.attr('id');
        if (!oldId) return;

        const newId = `${oldId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        $pattern.attr('id', newId);

        // Update all references inside this SVG
        $svg.find(`[fill="url(#${oldId})"]`).attr('fill', `url(#${newId})`);
    });

    // Apply colors via CSS variables
    $svg.css({
        '--body-color': fish.BodyColor,
        '--tail-color': fish.TailFinColor,
        '--top-fin-color': fish.TopFinColor,
        '--bottom-fin-color': fish.BottomFinColor,
        '--side-fin-color': fish.SideFinColor,
        '--pattern-color': fish.PatternColor
    });

    fish.SvgElement = $svg;
    return fish;
}

async function pushStarterFishes() {
    let starterFishTypes = [];
    while (starterFishTypes.length < 3) {
        let fishType = getRandomNormalFishType();
        if (!starterFishTypes.includes(fishType)) {
            starterFishTypes.push(fishType);
        }
    }

    const fish1 = await createNewFish(starterFishTypes[0], true, true);
    addStrokeToFish(fish1);
    addFishToBlock(fish1, "#starterFish1Block");
    starterFishes.push(fish1);

    const fish2 = await createNewFish(starterFishTypes[1], true, true);
    addStrokeToFish(fish2);
    addFishToBlock(fish2, "#starterFish2Block");
    starterFishes.push(fish2);

    const fish3 = await createNewFish(starterFishTypes[2], true, true);
    addStrokeToFish(fish3);
    addFishToBlock(fish3, "#starterFish3Block");
    starterFishes.push(fish3);
}

async function pushShopFishes() {
    const allFishTypeValues = Object.values(AllFishTypes);
    const newBlockWrapper = $('<div class="shopRows"></div>');

    for (let i = 0; i < allFishTypeValues.length; i += 3) {

        const fishType1 = allFishTypeValues[i];
        const fishType2 = allFishTypeValues[i + 1];
        const fishType3 = allFishTypeValues[i + 2];

        const newBlock = $('<div class="shopRowForItems"><div class="rowItem" id="fishBlock' + i + '"><b id="fishTypeName' + i + '">' + fishType1 + '</b></div><div class="rowItem" id="fishBlock' + (i + 1) + '"><b id="fishTypeName' + (i + 1) + '">' + fishType2 + '</b></div><div class="rowItem" id="fishBlock' + (i + 2) + '"><b id="fishTypeName' + (i + 2) + '">' + fishType3 + '</b></div></div>');

        const buyButton1 = $('<div class="modalButtonBlock greenButton buyFishButton" id="modalBuyFish' + i + '"><p class="clickAble">buy</p></div>');
        const buyButton2 = $('<div class="modalButtonBlock greenButton buyFishButton" id="modalBuyFish' + (i + 1) + '"><p class="clickAble">buy</p></div>');
        const buyButton3 = $('<div class="modalButtonBlock greenButton buyFishButton" id="modalBuyFish' + (i + 2) + '"><p class="clickAble">buy</p></div>');

        if (i === 0) {
            const subTitleBlock = $('<div class="subTitleContainer"><strong>Fish for sale:</strong></div>');
            $('#fishShopItemsContainer').append(subTitleBlock);
        }

        newBlockWrapper.append(newBlock);

        const fishTypeNameBlock1 = newBlock.find('#fishTypeName' + i);
        const fishTypeNameBlock2 = newBlock.find('#fishTypeName' + (i + 1));
        const fishTypeNameBlock3 = newBlock.find('#fishTypeName' + (i + 2));

        fishTypeNameBlock1.text(camelCaseToCapitalizedText(fishType1));
        fishTypeNameBlock2.text(camelCaseToCapitalizedText(fishType2));
        fishTypeNameBlock3.text(camelCaseToCapitalizedText(fishType3));

        const innerFishBlock1 = newBlock.find('#fishBlock' + i);
        const innerFishBlock2 = newBlock.find('#fishBlock' + (i + 1));
        const innerFishBlock3 = newBlock.find('#fishBlock' + (i + 2));

        const fish1 = await createNewFish(fishType1, false);
        const fish2 = await createNewFish(fishType2, false);
        const fish3 = await createNewFish(fishType3, false);

        allFishes.push(fish1);
        allFishes.push(fish2);
        allFishes.push(fish3);

        const CostPriceBlock = $('<p class="costPrice">Price: ' + fish1.CostPrice + '</p>')
        const CostPriceBlock2 = $('<p class="costPrice">Price: ' + fish2.CostPrice + '</p>')
        const CostPriceBlock3 = $('<p class="costPrice">Price: ' + fish3.CostPrice + '</p>')

        addFishToBlock(fish1, innerFishBlock1);
        addFishToBlock(fish2, innerFishBlock2);
        addFishToBlock(fish3, innerFishBlock3);

        innerFishBlock1.append(buyButton1);
        innerFishBlock2.append(buyButton2);
        innerFishBlock3.append(buyButton3);

        innerFishBlock1.append(CostPriceBlock);
        innerFishBlock2.append(CostPriceBlock2);
        innerFishBlock3.append(CostPriceBlock3);
    }

    $('#fishShopItemsContainer').append(newBlockWrapper);
}

function addStrokeToFish(fish) {
    fish.SvgElement.add(fish.SvgElement.find('*')).css({
        "stroke": "black",
        "stroke-width": "0.6px",
        "stroke-linejoin": "round"
    });
}

function createNewFish(fishType, useRandomColors, isStarterFish = false) {
    let bodyColor;
    let tailFinColor;

    if (useRandomColors) {
        bodyColor = getRandomColor();
        tailFinColor = getRandomColor();
    }
    else {
        bodyColor = getStandardColor(fishType, FishParts.Body);
        tailFinColor = getStandardColor(fishType, FishParts.Tail);
    }

    return new Promise((resolve, reject) => {
        // name, fishType, size, speed, bodyColor, tailFinColor, sideFinColor (=null), patternColor (=null), topFinColor (=null), bottomFinColor (=null)
        const newFish = new Fish(
            // name
            "fish" + parseInt(player.AquariumList[selectedAquariumIndex].AmountOfFish + 1),
            // fishTypeName
            fishType,
            // bodyColor
            bodyColor,
            // tailFinColor
            tailFinColor,
            player.AquariumList[selectedAquariumIndex].AmountOfFish + 1, // id
            isStarterFish, // isStarterFish
        );

        if (useRandomColors) {
            if (newFish.HasTopFin) newFish.TopFinColor = getRandomColor();
            if (newFish.HasBottomFin) newFish.BottomFinColor = getRandomColor();
            if (newFish.HasSideFin) newFish.SideFinColor = getRandomColor();
            if (newFish.HasPattern) newFish.PatternColor = getRandomColor();
        }
        else {
            if (newFish.HasTopFin) newFish.TopFinColor = getStandardColor(fishType, FishParts.TopFin);
            if (newFish.HasBottomFin) newFish.BottomFinColor = getStandardColor(fishType, FishParts.BottomFin);
            if (newFish.HasSideFin) newFish.SideFinColor = getStandardColor(fishType, FishParts.SideFin);
            if (newFish.HasPattern) newFish.PatternColor = getStandardColor(fishType, FishParts.Pattern);
        }

        $.get(`assets/media/svgs/fish/${fishType}.svg`, function (data) {
            const svg = $(data).find('svg');
            svg.css({
                '--body-color': newFish.BodyColor,
                '--tail-color': newFish.TailFinColor,
            });

            if (newFish.HasTopFin) svg.css('--top-fin-color', newFish.TopFinColor);
            if (newFish.HasBottomFin) svg.css('--bottom-fin-color', newFish.BottomFinColor);
            if (newFish.HasSideFin) svg.css('--side-fin-color', newFish.SideFinColor);
            if (newFish.HasPattern) svg.css('--pattern-color', newFish.PatternColor);

            svg.attr({ width: 80, height: 30, position: 'relative' });
            /*
            svg.add(svg.find('*')).css({
                "stroke": "black",
                "stroke-width": "0.6px",
                "stroke-linejoin": "round"
            });
            */
            svg.data('fish', newFish);
            newFish.SvgElement = svg;

            resolve(newFish);
        }, 'xml').fail(reject);
    });
}

function cleanWater() {
    console.log("Cleaning water on " + new Date().toLocaleString());
    if (player.AquariumList[selectedAquariumIndex].HasWaterFilter && player.AquariumList[selectedAquariumIndex].IsWaterFilterOn) {
        spawnWaterFilteredText();

        const $poos = $("#fishTank .poo"); // all divs with class "poo" inside #myContainer
        player.MoneyAmount += $poos.length; // earn 1 coin per poo
        updateStats();

        $poos.remove(); // remove them from the DOM


        setTimeout(() => cleanWater(), player.AquariumList[selectedAquariumIndex].WaterFilterTimer); // schedule next cleaning
    }
}

function showWaterFilter() {
    if (player.AquariumList[selectedAquariumIndex].HasWaterFilter) {
        $("#waterFilterContainer").show();
        $("#waterFilterContainer").css("left", player.AquariumList[selectedAquariumIndex].WaterFilterX + "vw");
        $("#waterFilterTimerDisplay").text(player.AquariumList[selectedAquariumIndex].WaterFilterTimer / 60000);
        if (player.AquariumList[selectedAquariumIndex].WaterFilterMirrored) {
            $("#waterFilterContainer img").addClass("mirrored");
        }
        animateWaterFilter();
        cleanWater();
    }
}

function addFishToBlock(fish, blockSelector) {
    fish.SvgElement.css({ top: '', left: '' });
    fish.SvgElement.css({ position: 'relative', scale: '3', transform: 'scaleX(1)' });
    fish.SvgElement.css("margin", "5vh auto 5vh auto");
    $(blockSelector).append(fish.SvgElement);
}

function prepareFishForSpawning(fish) {
    fish.SvgElement.css({ scale: '' });

    const fishFlipWrapper = $('<span class="fish-flip-wrapper"><span class="fish-rotate-wrapper"></span></span>');
    fishFlipWrapper.find('.fish-rotate-wrapper').append(fish.SvgElement);

    fishFlipWrapper.css({
        position: 'absolute',
        left: 100,
        top: 100,
        zIndex: 5
    });
}

function showNavalBomb() {
    if (player.AquariumList[selectedAquariumIndex].HasNavalMine) {
        $("#landMineContainer").css("display", "flex");
        $("#landMineContainer").css("left", player.AquariumList[0].NavalMineX + "vw");
        for (let i = 0; i < player.AquariumList[selectedAquariumIndex].NavalMineHeight; i++) {
            $("#navalMineChains").append('<img src="images/chain.png" alt="landmine chain" class="landMineChain">');
        }
        animateWaterFilter();
        cleanWater();
    }
}

function spawnFish(fish) {
    player.AquariumList[selectedAquariumIndex].FishList.push(fish);
    fish.SvgElement.addClass('spawned-fish');
    fish.SvgElement.addClass('clickAble');

    const fishFlipWrapper = fish.SvgElement.parent().parent();
    $('#swimZone').append(fishFlipWrapper);

    moveFishRandomly(fish);
}

function moveFishRandomly(fish) {
    havePooChance(fish);

    const computeRotation = (angle, scaleX) =>
        normalizeAngle(scaleX === -1 ? 180 - angle : angle);


    const fishFlipWrapper = fish.SvgElement.parent().parent();
    const fishRotateWrapper = fish.SvgElement.parent();
    const swimZone = $('#swimZone');
    const zoneOffset = swimZone.offset();
    const tankOffset = $('#fishTank').offset();

    // Calculate swimZone boundaries relative to #fishTank
    const zoneX = zoneOffset.left - tankOffset.left;
    const zoneY = zoneOffset.top - tankOffset.top;
    const zoneWidth = swimZone.width();
    const zoneHeight = swimZone.height();

    // Current position
    const currentPos = fishFlipWrapper.position();

    // Pick target pos far enough away
    let newX, newY, dx, dy, distance, tries = 0;
    do {
        if (tries++ > 500) throw new Error("Could not find valid fish position.");
        newX = zoneX + Math.random() * (zoneWidth - fishFlipWrapper.width());
        newY = zoneY - 40 + Math.random() * (zoneHeight - fishFlipWrapper.height() + 40);
        dx = newX - currentPos.left;
        dy = newY - currentPos.top;
        distance = Math.hypot(dx, dy);
    } while (distance < 100);

    // Direction and speed
    const directionAngle = Math.atan2(dy, dx) * 180 / Math.PI;
    const scaleX = dx < 0 ? -1 : 1;
    const rotationToApply = computeRotation(directionAngle, scaleX);

    const speed = (fish.Speed / 0.6) * 30; // px/sec
    const duration = clamp((distance / speed) * 1000, 2000, 10000);

    // Flip + rotate
    fishFlipWrapper.css({
        transform: `scaleX(${scaleX})`
    });

    fishRotateWrapper.css({
        transform: `rotate(${rotationToApply}deg)`
    });

    // Animate position
    fishFlipWrapper.animate(
        { left: newX, top: newY },
        {
            duration,
            easing: 'linear',
            step: () => havePooChance(fish),
            complete: () => {
                const delay = getRandomNumber(0, 4) === 0
                    ? getRandomNumber(0, 1000)
                    : 0;
                setTimeout(() => moveFishRandomly(fish), delay);
            }
        }
    );
}

function restartMovingAllFish() {
    player.AquariumList[selectedAquariumIndex].FishList.forEach(fish => {
        if (fish.SvgElement) {
            const fishFlipWrapper = fish.SvgElement.parent().parent();
            fishFlipWrapper.stop(true);
            moveFishRandomly(fish);
        }
        else {
            throw new Error(`Fish ${fish.Name} has no SVG element!`);
        }
    });
}

function directFishToFood(fish, foodX, foodY, foodType) {
    const fishFlipWrapper = fish.SvgElement.parent().parent();
    const fishRotateWrapper = fish.SvgElement.parent();

    const fishOffset = fishFlipWrapper.position(); // relative to parent
    const fishX = fishOffset.left;
    const fishY = fishOffset.top;

    const dx = foodX - fishX;
    const dy = foodY - fishY;
    const distance = Math.hypot(dx, dy);

    // --- Check if fish reached the food ---
    if (distance < 10) {
        player.AquariumList[selectedAquariumIndex].HasFood = false;
        switch (foodType) {
            case "food":
                console.log(`${fish.Name} has reached the food!`);
                fish.FoodEaten += 1;
                break;
            case "speedCandy":
                console.log(`${fish.Name} has reached the speed candy!`);
                if (fish.Speed < 5) {
                    fish.Speed += 1;
                }
                break;
        }

        $('#CBMI').attr('id', 'closeBottomMenuImg');

        // Remove the food using the stored target data
        $('img.food').each(function () {
            const foodPos = $(this).data('foodTarget');
            if (!foodPos) return;
            const dist = Math.hypot(foodPos.x - foodX, foodPos.y - foodY);
            if (dist < 10) $(this).remove();
        });

        updateStats();
        restartMovingAllFish();
        return;
    }

    // --- Movement step ---
    const stepSize = (fish.Speed / 0.6) * 7; // tweak for realism
    const directionX = dx / distance;
    const directionY = dy / distance;
    const newX = fishX + directionX * stepSize;
    const newY = fishY + directionY * stepSize;

    // --- Angle + flipping ---
    const rawAngle = Math.atan2(dy, dx) * 180 / Math.PI;
    const scaleX = dx < 0 ? -1 : 1;
    const normalizeAngle = angle => (((angle + 180) % 360 + 360) % 360) - 180;
    const rotationToApply = normalizeAngle(scaleX === -1 ? 180 - rawAngle : rawAngle);

    fishFlipWrapper.css({ transform: `scaleX(${scaleX})` });
    fishRotateWrapper.css({ transform: `rotate(${rotationToApply}deg)` });

    // --- Animate towards food ---
    fishFlipWrapper.animate(
        { left: newX, top: newY },
        {
            duration: 100,
            easing: 'linear',
            step: () => havePooChance(fish),
            complete: () => directFishToFood(fish, foodX, foodY, foodType)
        }
    );
}

function havePooChance(fish) {
    // increase when buying fish gets possible
    let random = getRandomNumber(1, 15000 - (((fish.CostPrice * 5) * (fish.Size * 5))));
    if (random === 1) {
        const fishFlipWrapper = fish.SvgElement.parent().parent();
        const fishY = fishFlipWrapper.position().top;

        let fishX;
        if (getScaleX(fishFlipWrapper) === 1) {
            fishX = fishFlipWrapper.position().left;
        }
        else {
            fishX = fishFlipWrapper.position().left + 25;
        }
        spawnPoo(fishX, fishY);
    }
}

function updateStats() {
    if (player.BackgroundMusicOn) {
        $("#modalMusicButtonHolder").removeClass("redButton").addClass("greenButton").find("p").text("music: ON");
        $('#musicOnIcon').show();
        $('#musicOffIcon').hide();
    }
    else {
        $("#modalMusicButtonHolder").removeClass("greenButton").addClass("redButton").find("p").text("music: OFF");
        $('#musicOnIcon').hide();
        $('#musicOffIcon').show();
    }

    if (player.AutoSaveOn) {
        $("#modalAutoSaveButtonHolder").removeClass("redButton").addClass("greenButton").find("p").text("auto-save: ON");
        $('#autoSaveOnIcon').show();
        $('#autoSaveOffIcon').hide();
        setTimeout(startAutoSaver(), 30000);
    }
    else {
        $("#modalAutoSaveButtonHolder").removeClass("greenButton").addClass("redButton").find("p").text("auto-save: OFF");
        $('#autoSaveOnIcon').hide();
        $('#autoSaveOffIcon').show();
        stopAutoSaver();
    }

    if (isDarkColor(getComputedStyle(document.documentElement).getPropertyValue("--background-color"))) {
        $("#moneyAmount").css("color", "white");
        $("#fishFoodAmount").css("color", "white");
        $("#bottomMenuSlot2 p").css("color", "white");
        $(".bottomMenuSlot>img").css("filter", "drop-shadow(2px 2px white)");
    }
    else {
        $("#moneyAmount").css("color", "black");
        $("#fishFoodAmount").css("color", "black");
        $("#bottomMenuSlot2 p").css("color", "black");
        $(".bottomMenuSlot>img").css("filter", "drop-shadow(2px 2px black)");
    }

    $('#fishFoodAmount').text(player.FoodAmount);
    $("#moneyAmount").text(player.MoneyAmount);
    $("#speedCandyAmount").text(player.SpeedCandyAmount);
}

function spawnGameSavedText(autoSave = true) {
    let savedText;
    if (autoSave) {
        savedText = $('<div class="bottomLeftRiseText">💾 game auto-saved ✅</div>');
    }
    else {
        savedText = $('<div class="bottomLeftRiseText">💾 game saved ✅</div>');
    }

    $("#fishTank").append(savedText);

    setTimeout(() => {
        savedText.fadeOut(500, function () {
            $(this).remove();
        });
    }, 4100);
}

function spawnWaterFilteredText() {
    const waterFilteredText = $('<div class="bottomLeftRiseText">💧 water filtered ✅</div>');
    $("#fishTank").append(waterFilteredText);

    setTimeout(() => {
        waterFilteredText.fadeOut(500, function () {
            $(this).remove();
        });
    }, 4100);
}

function spawnBubble(x, y) {
    // Create a new bubble element
    const bubble = $('<img class="bubble" src="images/airBubble.png" alt="air bubble">');

    // Position the bubble at the click location
    bubble.css({
        left: `${x}px`,
        top: `${y + 100}px`
    });

    // Append to fish tank
    $("#fishTank").append(bubble);

    // remove the bubble after animation ends
    setTimeout(() => {
        bubble.remove();
    }, 2000); // match animation duration
}

function spawnPoo(x, y) {
    // Create a new bubble element
    const poo = $('<img class="poo" src="images/poo.png" alt="poo">');

    // Position the bubble at the click location
    poo.css({
        left: `${x}px`,
        top: `${y + 120}px`
    });

    // Append to poo tank
    $("#fishTank").append(poo);
}

function spawnFood(x, y, foodType) {
    setTimeout(function () {
        if (!player.AquariumList[selectedAquariumIndex].HasFood) {
            const swimZone = $('#swimZone');
            const zoneOffset = swimZone.offset();

            // Food position relative to #swimZone
            const foodX = x - zoneOffset.left;
            const foodY = y - zoneOffset.top;

            // Offset for fish animation if you move them up visually
            const fishTargetY = foodY - 80;

            let food;
            switch (foodType) {
                case "food":
                    food = $('<img class="food" src="images/fishFood.png" alt="fish food">');
                    break;
                case "speedCandy":
                    food = $('<img class="food" src="images/speedCandy.png" alt="speed candy">');
                    break;
            }
            food.css({
                position: 'absolute',
                left: `${foodX}px`,
                top: `${foodY}px` // food stays at original visual position
            });

            // Store the **same target the fish are swimming to**
            food.data('foodTarget', { x: foodX, y: fishTargetY });

            swimZone.append(food);

            player.AquariumList[selectedAquariumIndex].HasFood = true;

            $("#closeBottomMenuImg").off("click touchstart");
            $('#closeBottomMenuImg').attr('id', 'CBMI');

            // Make all fish swim toward the **offset target**
            player.AquariumList[selectedAquariumIndex].FishList.forEach(fish => {
                if (fish.SvgElement) {
                    const fishFlipWrapper = fish.SvgElement.parent().parent();
                    fishFlipWrapper.stop();
                    directFishToFood(fish, foodX, fishTargetY, foodType);
                } else {
                    throw new Error(`Fish ${fish.Name} has no SVG element!`);
                }
            });
        }
    }, 100);
}


function closeStarterFishModal() {
    $("#modalStarterFishContainer").hide();
}

function closeFishInfoModal() {
    $("#modalFishInfoContainer").hide();
}

function openBottomMenu() {
    $("#fishTank").css("height", "85vh");
    $("#bottomMenu").css("display", "flex");
    $("#openBottomMenuImg").css("display", "none");
    $("#closeBottomMenuImg").css("display", "inline-block");
    if (player.AquariumList[selectedAquariumIndex].HasFood === false) {
        restartMovingAllFish();
    }
}

function closeBottomMenu() {
    $("#fishTank").css("height", "100vh");
    $("#bottomMenu").css("display", "none");
    $("#openBottomMenuImg").css("display", "inline-block");
    $("#closeBottomMenuImg").css("display", "none");
    restartMovingAllFish();
}

function closeShopModal() {
    $("#modalShopContainer").hide();
}

function closeFishShopModal() {
    $("#modalFishShopContainer").hide();
}

function handleWaterFilterTimerInput(element) {
    const inputField = element.find("input");
    const input = inputField.val().trim();
    const inputNumber = parseInt(input);
    if (!isNaN(inputNumber) && inputNumber >= 1 && inputNumber <= 60) {
        player.AquariumList[0].WaterFilterTimer = inputNumber * 60000; // convert minutes to milliseconds
        element.find("b").text(inputNumber);
    }
    else {
        alert("Please enter a valid number between 1 and 60!");
    }
}

function handleRedoClick(element) {
    element = $(element); // ensure it's a jQuery object
    const arrowImg = $(element).find("img");
    const elementBlock = $(element).parent();
    const inputField = elementBlock.find("input");
    inputField.value = getComputedStyle(document.documentElement).getPropertyValue("--background-color");

    if (arrowImg.hasClass("rotateArrows")) {
        arrowImg.removeClass("rotateArrows");
        arrowImg.addClass("rotateArrowsBack");
        arrowImg.attr("placeholder", "redo button arrows");
        $(element).css("background-color", "darkgreen");
        inputField.addClass("hidden");

        if (elementBlock.attr("id") === "modalFishName") {
            elementBlock.find("strong").show();
        }
        else {
            elementBlock.find("b").show();
        }
    } else if (arrowImg.hasClass("checkMark")) {
        if (elementBlock.attr("id") !== "modalFishName" && element.attr("id") !== "redoWaterFilterTimerButton") {
            handleColorInput(elementBlock);
            arrowImg.attr("placeholder", "check mark");
        }
        else {
            if (elementBlock.attr("id") === "modalFishName") {
                handleNameInput(elementBlock);
            }
            else if (element.attr("id") === "redoWaterFilterTimerButton") {
                handleWaterFilterTimerInput(elementBlock);
            }
            arrowImg.attr("placeholder", "check mark");
        }
        arrowImg.removeClass("checkMark");
        arrowImg.attr("src", "images/GUI/modals/redoButtonArrows.png");
        arrowImg.addClass("rotateArrowsBack");
        $(element).css("background-color", "darkgreen");
        inputField.addClass("hidden");
        if (elementBlock.attr("id") === "modalFishName") {
            elementBlock.find("strong").show();
        }
        else {
            elementBlock.find("b").show();
        }
    } else {
        arrowImg.removeClass("rotateArrowsBack");
        arrowImg.addClass("rotateArrows");
        $(element).css("background-color", "yellowgreen");
        inputField.removeClass("hidden").focus();
        if (elementBlock.attr("id") === "modalFishName") {
            elementBlock.find("strong").hide();
        }
        else {
            elementBlock.find("b").hide();
        }
    }
}

function handleColorInput(element) {
    const inputField = element.find("input");
    let input = inputField.val().toUpperCase();
    if (clickedFish) {
        switch (element.parent().attr("id")) {
            case "modalBodyColor":
                $("#modalFishImgContainer svg").css('--body-color', input);
                break;
            case "modalTailFinColor":
                $("#modalFishImgContainer svg").css('--tail-color', input);
                break;
            case "modalTopFinColor":
                if (clickedFish.HasTopFin) $("#modalFishImgContainer svg").css('--top-fin-color', input);
                break;
            case "modalBottomFinColor":
                if (clickedFish.HasBottomFin) $("#modalFishImgContainer svg").css('--bottom-fin-color', input);
                break;
            case "modalSideFinColor":
                if (clickedFish.HasSideFin) $("#modalFishImgContainer svg").css('--side-fin-color', input);
                break;
            case "modalPatternColor":
                if (clickedFish.HasPattern) $("#modalFishImgContainer svg").css('--pattern-color', input);
                break;
            default:
                throw new Error("Unknown color part for fish!");
        }
        element.parent().css("background-color", input);
        element.parent().find("b").text(input);
        if (isDarkColor(input)) {
            element.parent().find("b").css("color", "white");
            element.parent().find("strong").css("color", "white");
        } else {
            element.parent().find("b").css("color", "black");
            element.parent().find("strong").css("color", "black");
        }
    }
    else {
        // this should never happen, it's an extra failsafe
        throw new Error("No fish selected for color change!");
    }
}

function handleNameInput(element) {
    const inputField = element.find("input");
    const input = inputField.val().trim();
    checkIfStringIsValid(input, "fish name");
    if (input !== "") {
        if (input.length > 35) {
            alert("Name cannot be longer than 35 characters!");
        }
        else {
            if (clickedFish) {
                element.find("strong").text(input);
            }
            else {
                // this should never happen, it's an extra failsafe
                throw new Error("No fish selected for name change!");
            }
        }
    }
    else {
        alert("Name cannot be empty!");
    }
}

function updateFishColors(element) {
    const $el = $(element); // wrap once
    const inputField = $el.find("input");
    const input = inputField.val().trim();

    switch ($el.parent().attr("id")) {
        case "modalBodyColor":
            clickedFish.BodyColor = input;
            break;
        case "modalTailFinColor":
            clickedFish.TailFinColor = input;
            break;
        case "modalTopFinColor":
            if (clickedFish.HasTopFin) clickedFish.TopFinColor = input;
            break;
        case "modalBottomFinColor":
            if (clickedFish.HasBottomFin) clickedFish.BottomFinColor = input;
            break;
        case "modalSideFinColor":
            if (clickedFish.HasSideFin) clickedFish.SideFinColor = input;
            break;
        case "modalPatternColor":
            if (clickedFish.HasPattern) clickedFish.PatternColor = input;
            break;
        default:
            throw new Error("Unknown color part for fish!");
    }
}

function saveToLocalStorage() {
    // players = array of PlayerService instances
    saveFiles[selectedSaveFileIndex] = player;
    localStorage.setItem("playerSaves", JSON.stringify(saveFiles.map(p => p.toJSON())));
}

function loadFromLocalStorage() {
    const savedData = JSON.parse(localStorage.getItem("playerSaves")) || [];
    saveFiles = savedData
        .filter(d => d && typeof d === "object") // ignore null or garbage
        .map(data => PlayerService.fromJSON(data));
}

function changeArrowsToCheckMark(element) {
    let elementBlock;
    if ($(element).parent().attr("id") === "modalFishName") {
        elementBlock = $(element).parent();
    }
    else {
        elementBlock = $(element).parent().parent();
    }
    const arrowImg = elementBlock.find(".redoButton").find("img");
    arrowImg.removeClass("rotateArrows");
    arrowImg.removeClass("rotateArrowsBack");
    arrowImg.attr("src", "images/GUI/modals/checkMark.png");
    arrowImg.addClass("checkMark");
    arrowImg.attr("placeholder", "check mark");
}

function saveGameViaMenu() {
    if ($("#saveGameButtonHolder").data("disabled")) return; // prevent spam clicking
    saveToLocalStorage();
    updateStats();
    spawnGameSavedText(false);
    $("#saveGameButtonHolder").data("disabled", true);
    $("#saveGameButtonHolder").find("p").css("background-color", "yellowgreen");
    setTimeout(function () {
        $("#saveGameButtonHolder").find("p").css("background-color", "darkgreen");
        $("#saveGameButtonHolder").data("disabled", false);
    }, 400);
}

function stopMovingNavalMine() {
    const newXPx = parseInt($("#landMineContainer").css("left"), 10);
    const newXVw = (newXPx / window.innerWidth) * 100;
    movingNavalMine = false;
    spawnGameSavedText(false);
    player.AquariumList[selectedAquariumIndex].NavalMineX = newXVw; // save in vw
    player.AquariumList[selectedAquariumIndex].NavalMineHeight = $(".landMineChain").length;
    saveToLocalStorage();
    $("#navalMine").attr("src", "images/naval-mine.png");
    $("#navalMine").attr("alt", "naval mine");
    $(".landMineChain").attr("src", "images/chain.png");
    $(".landMineChain").attr("alt", "chain");
    $("#landMineChainBottom").attr("src", "images/chainBottom.png");
    $("#landMineChainBottom").attr("alt", "landmine chain bottom");
    $("#fishTank").css("cursor", "default");
    $("#navalMine").css("cursor", "pointer");
}

function stopMovingWaterFilter() {
    const newXPx = parseInt($("#waterFilterContainer").css("left"), 10);
    const newXVw = (newXPx / window.innerWidth) * 100;
    movingWaterFilter = false;
    spawnGameSavedText(false);
    player.AquariumList[selectedAquariumIndex].WaterFilterX = newXVw; // save in vw
    if ($("#waterFilter").hasClass("mirrored")) {
        player.AquariumList[selectedAquariumIndex].WaterFilterMirrored = true;
    }
    else {
        player.AquariumList[selectedAquariumIndex].WaterFilterMirrored = false;
    }
    saveToLocalStorage();
    $("#waterFilter").attr("src", "images/waterFilter.png");
    $("#waterFilter").attr("alt", "water filter");
    $("#fishTank").css("cursor", "default");
}

function updateFishInAquarium() {
    console.log("updating colors of fish in aquarium");
    $(".colorInfoBlock").each(function () {
        if ($(this).find("input").val().trim() !== "") {
            updateFishColors(this);
        }
    });
    player.AquariumList[selectedAquariumIndex].FishList.forEach(fish => {
        if (fish.FishId === clickedFish.FishId) {
            fish.Name = $("#modalFishName strong").text();
            fish.SvgElement.css('--body-color', clickedFish.BodyColor);
            fish.SvgElement.css('--tail-color', clickedFish.TailFinColor);
            if (clickedFish.HasTopFin) fish.SvgElement.css('--top-fin-color', clickedFish.TopFinColor);
            if (clickedFish.HasBottomFin) fish.SvgElement.css('--bottom-fin-color', clickedFish.BottomFinColor);
            if (clickedFish.HasSideFin) fish.SvgElement.css('--side-fin-color', clickedFish.SideFinColor);
            if (clickedFish.HasPattern) fish.SvgElement.css('--pattern-color', clickedFish.PatternColor);
        }
    });
}

function renumberSaveFileBlocks() {
    $('.saveFileBlock').each((i, block) => {
        const $block = $(block);
        $block.attr('id', 'saveFile' + (i + 1));
        $block.find('.loadFileButtonHolder').attr('id', 'loadFileButton' + (i + 1));
        $block.find('.deleteFileButtonHolder').attr('id', 'deleteFileButton' + (i + 1));
        $block.find('.newGameButtonHolder').attr('id', 'newGameButton' + (i + 1));

        // Also update displayed FishAmount and MoneyAmount IDs
        $block.find(`#saveFile${i + 2}FishAmount`).attr('id', `saveFile${i + 1}FishAmount`);
        $block.find(`#saveFile${i + 2}MoneyAmount`).attr('id', `saveFile${i + 1}MoneyAmount`);
    });
}

function removePreviousCursor(ignore) {
    if ($("#swimZone").hasClass("foodCursor") && ignore !== "foodCursor") {
        $("#swimZone").removeClass("foodCursor");
    }
    if ($("#swimZone").hasClass("dustpanCursor") && ignore !== "dustpanCursor") {
        $("#swimZone").removeClass("dustpanCursor");
    }
    if ($("#swimZone").hasClass("speedCandyCursor") && ignore !== "speedCandyCursor") {
        $("#swimZone").removeClass("speedCandyCursor");
    }
}


//#region BASIC HELPER FUNCTIONS

// converts 'camelCase' to 'Capitalized Words'
function checkIfStringIsValid(str, name = 'string') {
    if (str === null || str === undefined) throw new Error(`Passed param '${name}' cannot be null or undefined`);
    if (typeof str !== 'string') throw new Error(`Passed param '${name}' must be a string`);
    if (str.trim() === '') console.warn(`Passed param '${name}' is an empty string`);
}

// converts 'camelCase' to 'Capitalized Words'
function camelCaseToCapitalizedText(str) {
    checkIfStringIsValid(str, 'str');
    return str.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, match => match.toUpperCase());
}

/*
// returns a random color in the specified format (HEX, RGB, or RGBA)
// type = 'HEX' (default), 'RGB', or 'RGBA' */
function getRandomColor(type = 'HEX') {
    const r = getRandomNumber(0, 255);
    const g = getRandomNumber(0, 255);
    const b = getRandomNumber(0, 255);
    switch (type.toUpperCase()) {
        case 'HEX':
            return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`
        case 'RGB':
            return `rgb(${r}, ${g}, ${b})`;
        case 'RGBA':
            const a = Math.random().toFixed(2);
            return `rgba(${r}, ${g}, ${b}, ${a})`;
        default:
            throw new Error(`Unknown color type: ${type}. Use 'HEX', 'RGB', or 'RGBA'.`);
    }
}

/*
// Helper function to parse and validate number parameters
// Throws an error if the parameter is not a valid number
// If the parameter is a numeric string, it converts it to a number and logs a warning
// 'name' is used in the error/warning messages to identify the parameter */
function parseNumber(number, integerOnly = false, name = 'input') {
    if (typeof number === 'string') number = number.trim();
    const num = Number(number);
    if (typeof number === 'string' && !isNaN(num)) console.warn(`${name} is a numeric string. Converting to number.`);
    if (isNaN(num)) throw new Error(`${name} must be a valid number.`);
    if (integerOnly) return Math.round(num);
    return num;
}

// returns a random integer between (and including) 2 passed numbers with a certain amount of decimals (default 0)
function getRandomNumber(min, max, decimals = 0) {
    min = parseNumber(min, 'Min');
    max = parseNumber(max, 'Max');
    if (min > max) throw new Error("Min cannot be greater than max in getRandomNumber function!");
    if (!Number.isInteger(decimals) || decimals < 0) throw new Error("Decimals param must be a positive integer in getRandomNumber function!");
    const factor = 10 ** decimals;
    return Math.round((Math.random() * (max - min) + min) * factor) / factor;
}

// checks if a value is between (and including) min and max
function isBetween(value, min, max) {
    value = parseNumber(value, 'Value');
    min = parseNumber(min, 'Min');
    max = parseNumber(max, 'Max');
    if (min > max) throw new Error("Min cannot be greater than max in isBetween function!");
    return value >= min && value <= max;
}

// clamps a value to be between min and max
function clamp(value, min, max) {
    value = parseNumber(value, 'Value');
    min = parseNumber(min, 'Min');
    max = parseNumber(max, 'Max');
    if (min > max) throw new Error("Min cannot be greater than max in clamp function!");
    return Math.min(Math.max(value, min), max);
}

// returns the number with the opposite sign
function swapSign(num) {
    return -num;
}

// Checks if the passed string is a valid color in HEX or RGB(A) format
function isValidColor(color) {
    checkIfStringIsValid(color, 'color');
    return CSS.supports('color', color);
}

/*
// Determines if a color is "dark" based on its brightness
// Accepts colors in HEX (#RRGGBB or #RGB) or RGB/RGBA (rgb(r,g,b) or rgba(r,g,b,a)) formats
// brightnessThreshold (optional): number between 0 and 255 to define the cutoff for "dark" (default is 100) */
function isDarkColor(color, brightnessThreshold = 100) {
    brightnessThreshold = parseNumber(brightnessThreshold, 'brightnessThreshold');
    if (brightnessThreshold < 0 || brightnessThreshold > 255) {
        throw new Error("Brightness threshold must be between 0 and 255.");
    }
    if (!color) {
        throw new Error("Color cannot be null or empty in isDarkColor function!");
    }
    color = color.trim();
    if (color.toLowerCase() === "transparent") {
        console.warn("Color is transparent or empty, treating as light color.");
        return false;
    }
    if (!isValidColor(color)) {
        throw new Error("Invalid color. Please use valid, css supported color format.");
    }

    let rgb, alpha = 1;

    // HEX format
    if (color.startsWith("#")) {
        const bigint = parseInt(color.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        rgb = [r, g, b];
    }
    // RGB or RGBA format
    else if (color.toLowerCase().startsWith("rgb")) {
        // Extract numbers and percentages, including alpha if present
        const parts = color.match(/(\d+\.?\d*%?)/g);
        rgb = parts.slice(0, 3).map(v => {
            if (v.endsWith("%")) {
                return Math.round(parseFloat(v) * 2.55); // Convert % to 0-255
            }
            return Math.min(255, Math.max(0, Number(v)));
        });
        if (parts.length === 4) {
            let a = parts[3];
            if (a.endsWith("%")) {
                alpha = parseFloat(a) / 100;
            } else {
                alpha = Number(a);
            }
            alpha = Math.min(1, Math.max(0, alpha)); // Clamp between 0 and 1
        }
    }

    // Treat fully transparent as light
    if (alpha === 0) {
        console.warn("Alpha channel is 0 (fully transparent), treating as light color.");
        return false;
    }

    const [r, g, b] = rgb;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // check if brightness is over or under the threshold to decide what's "dark."
    // Brightness scale goes 0 (black) to 255 (white).
    // 128 is a middle-ish cutoff. Below = "dark", above = "light."
    return brightness < brightnessThreshold;
}

//#endregion


//#region helper functions

function getScaleX(element) {
    const transform = element.css('transform');
    if (transform && transform !== 'none') {
        const values = transform.match(/matrix\(([^)]+)\)/);
        if (values) {
            const parts = values[1].split(', ');
            // parts[0] is scaleX
            return parseFloat(parts[0]);
        }
    }
    return 1; // default scaleX
}

function isAnyModalOpen() {
    let open = false;
    $(".modalContainer").each(function () {
        if ($(this).is(":visible")) {
            open = true;
            return false; // stop looping here || return false != function return false; this is to step out of each loop (Jquery break)
        }
    });
    return open;
}

const normalizeAngle = angle => (((angle + 180) % 360 + 360) % 360) - 180;

function getRandomNormalFishType() {
    const randomIndex = Math.floor(Math.random() * NormalFishTypes.length);
    return NormalFishTypes[randomIndex];
}

function getStandardColor(fishType, part) {
    const fishData = StandardFishColors[fishType];
    if (!fishData) throw new Error("This fishtype is not recognized!");

    const color = fishData[part];
    if (color == null) throw new Error("This fish has no " + part + "!");

    return color;
}


//#endregion


//#region EVENT HANDLERS

$(window).on('resize', function () {
    checkOrientation();
});

$("#fishTank").on("pointerdown", function (event) {
    // Check if the click target is the #swimZone
    const swimZone = $("#swimZone");
    if (event.target !== swimZone[0]) return;

    const x = event.offsetX;
    const y = event.offsetY;

    if (swimZone.hasClass("foodCursor")) {
        if (!player.AquariumList[selectedAquariumIndex].HasFood) {
            closeBottomMenu();
            try {
                player.FoodAmount -= 1;
                spawnFood(x, y, "food");
            }
            catch (errorMsg) {
                alert(errorMsg.message);
            }
        }
    }
    else if (swimZone.hasClass("speedCandyCursor")) {
        if (!player.AquariumList[selectedAquariumIndex].HasFood) {
            closeBottomMenu();
            try {
                player.SpeedCandyAmount -= 1;
                spawnFood(x, y, "speedCandy");
            }
            catch (errorMsg) {
                alert(errorMsg.message);
            }
        }
    }
    else {
        spawnBubble(x, y);
    }
});

$("#fishFoodImg").on("pointerdown", function () {
    closeBottomMenu();
    removePreviousCursor("foodCursor");
    $("#swimZone").toggleClass("foodCursor");
});

$("#speedCandyImg").on("pointerdown", function () {
    closeBottomMenu();
    removePreviousCursor("speedCandyCursor");
    $("#swimZone").toggleClass("speedCandyCursor");
});

$("#dustpanImg").on("pointerdown", function () {
    closeBottomMenu();
    removePreviousCursor("dustpanCursor");
    $("#swimZone").toggleClass("dustpanCursor");
})

$('#closeFishInfoModal').on("pointerdown", function () {
    closeFishInfoModal();
});

$("#starterFish1ButtonHolder").on("pointerdown", function () {
    const fish = starterFishes[0];
    prepareFishForSpawning(fish);
    closeStarterFishModal();
    spawnFish(fish);
});

$("#starterFish2ButtonHolder").on("pointerdown", function () {
    const fish = starterFishes[1];
    prepareFishForSpawning(fish);
    closeStarterFishModal();
    spawnFish(fish);
});

$("#starterFish3ButtonHolder").on("pointerdown", function () {
    const fish = starterFishes[2];
    prepareFishForSpawning(fish);
    closeStarterFishModal();
    spawnFish(fish);
});

$("#openShopImg").on("pointerdown", function () {
    if (!isAnyModalOpen()) {
        closeBottomMenu();
        $("#modalShopContainer").show();
    }
});

$("#openShopImg").hover(function () {
    if (isAnyModalOpen()) {
        $("#openShopImg").addClass("noClickCursor");
    }
    else {
        $("#openShopImg").removeClass("noClickCursor");
    }
});

$('#closeStarterFishModal').on("pointerdown", function () {
    closeStarterFishModal();
});

$('#closeShopModal').on("pointerdown", function () {
    closeShopModal();
});

$(document).on('pointerdown', '#closeBottomMenuImg', function () {
    closeBottomMenu();
});

$("#openBottomMenuImg").on("pointerdown", function () {
    if (!isAnyModalOpen()) {
        if (!player.AquariumList[selectedAquariumIndex].HasFood) {
            openBottomMenu();
        }
    }
});

$("#openBottomMenuImg").hover(function () {
    if (!isAnyModalOpen()) {
        if (player.AquariumList[selectedAquariumIndex].HasFood) {
            $("#openBottomMenuImg").addClass("noClickCursor");
        }
        else {
            $("#openBottomMenuImg").removeClass("noClickCursor");
        }
    }
    else {
        $("#openBottomMenuImg").addClass("noClickCursor");
    }
});

$("#fishTank").on("mouseenter", ".poo", function () {
    if ($("#swimZone").hasClass("dustpanCursor")) {
        $(this).addClass("dustpanGreenCursor");
    }
});

$("#fishTank").on("mouseleave", ".poo", function () {
    $(this).removeClass("dustpanGreenCursor");
});

$("#fishTank").on("pointerdown", ".poo", function () {
    if ($("#swimZone").hasClass("dustpanCursor")) {
        $(this).remove();
        player.MoneyAmount += 3;
        updateStats();
    }
});

$(document).on("mouseenter", ".spawned-fish", function () {
    if (isAnyModalOpen()) {
        $(this).removeClass("clickAble");
        $(this).addClass("noClickCursor");
    }
});

$(document).on("mouseleave", ".spawned-fish", function () {
    if (!isAnyModalOpen()) {
        $(this).removeClass("noClickCursor");
        $(this).addClass("clickAble");
    }
});

$('#fishTank').on("pointerdown", '.spawned-fish', function () {
    if (isAnyModalOpen()) return;

    const fish = $(this).data('fish');

    clickedFish = fish;
    console.log("--------------------------------------------------");
    console.log("Clicked on fish:");
    console.log(fish);
    console.log("--------------------------------------------------");
    closeBottomMenu();
    $("#modalFishInfoContainer").show();
    $('#fishInfoModal').show();
    $('#modalFishImgContainer').empty();
    $('#modalFishImgContainer').append(fish.SvgElement.clone());
    $('#modalFishImgContainer svg').removeClass('spawned-fish');
    $('#modalFishImgContainer svg').css("position", "relative");
    $('#modalFishImgContainer svg').css("top", "0");
    $('#modalFishImgContainer svg').css("left", "0");
    $('#modalFishImgContainer svg').css("scale", "3");
    $('#modalFishImgContainer svg').css("width", "80");
    $('#modalFishImgContainer svg').css("height", "30");
    $('#modalFishImgContainer svg').css("transform", "scaleX(1)");
    $('#modalFishName strong').text(fish.Name);
    $('#modalStatFishType p').text(camelCaseToCapitalizedText(fish.FishTypeName));
    $('#modalTailFinColor b').text(`${fish.TailFinColor}`);

    $("#tailFinColorInput").val(fish.TailFinColor);
    $("#topFinColorInput").val(fish.TopFinColor);
    $("#bottomFinColorInput").val(fish.BottomFinColor);
    $("#bodyColorInput").val(fish.BodyColor);
    $("#sideFinColorInput").val(fish.SideFinColor);
    $("#patternColorInput").val(fish.PatternColor);

    if (isDarkColor(fish.TailFinColor)) {
        $("#modalTailFinColor strong").css("color", "white");
        $('#modalTailFinColor b').css('color', 'white');
    }
    else {
        $("#modalTailFinColor strong").css("color", "black");
        $('#modalTailFinColor b').css('color', 'black');
    }

    $('#modalTailFinColor').css("background-color", fish.TailFinColor);

    $('#modalBodyColor b').text(`${fish.BodyColor}`);

    if (isDarkColor(fish.BodyColor)) {
        $("#modalBodyColor strong").css("color", "white");
        $('#modalBodyColor b').css('color', 'white');
    }
    else {
        $("#modalBodyColor strong").css("color", "black");
        $('#modalBodyColor b').css('color', 'black');
    }

    $('#modalBodyColor').css("background-color", fish.BodyColor);

    if (fish.HasTopFin) {
        $('#modalTopFinColor b').text(`${fish.TopFinColor}`);
        $("#modalTopFinColor b").css("margin-left", "");
        $('#redoTopFinColorButton').css("visibility", "visible");
        if (isDarkColor(fish.TopFinColor)) {
            $("#modalTopFinColor strong").css("color", "white");
            $('#modalTopFinColor b').css('color', 'white');
        }
        else {
            $("#modalTopFinColor strong").css("color", "black");
            $('#modalTopFinColor b').css('color', 'black');
        }
        $('#modalTopFinColor').css("background-color", fish.TopFinColor);
    }
    else {
        $('#modalTopFinColor b').text(`No Top Fin`);
        $("#modalTopFinColor b").css("margin-left", "2.5vw");
        $('#redoTopFinColorButton').css("visibility", "hidden");
        $('#modalTopFinColor b').css("color", "black");
        $('#modalTopFinColor strong').css("color", "black");
        $('#modalTopFinColor').css("background-color", "transparent");
    }

    if (fish.HasBottomFin) {
        $('#modalBottomFinColor b').text(`${fish.BottomFinColor}`);
        $("#modalBottomFinColor b").css("margin-left", "");
        $('#redoBottomFinColorButton').css("visibility", "visible");
        if (isDarkColor(fish.BottomFinColor)) {
            $("#modalBottomFinColor strong").css("color", "white");
            $('#modalBottomFinColor b').css('color', 'white');
        }
        else {
            $("#modalBottomFinColor strong").css("color", "black");
            $('#modalBottomFinColor b').css('color', 'black');
        }
        $('#modalBottomFinColor').css("background-color", fish.BottomFinColor);
    }
    else {
        $('#modalBottomFinColor b').text(`No Bottom Fin`);
        $("#modalBottomFinColor b").css("margin-left", "2.5vw");
        $('#redoBottomFinColorButton').css("visibility", "hidden");
        $('#modalBottomFinColor b').css("color", "black");
        $('#modalBottomFinColor strong').css("color", "black");
        $('#modalBottomFinColor b').css("margin", "1vh 0 1vh 0");
        $('#modalBottomFinColor').css("background-color", "transparent");
    }

    $('#modalSpeed p').text(`${fish.Speed}`);
    $('#modalStatAge p').text(`${fish.MomentCreated}`);
    $('#modalStatSize p').text(`${fish.Size}`);
    $('#modalStatFoodEaten p').text(`${fish.FoodEaten}`);
    $("#modalStatCostPrice p").text(`${fish.CostPrice}`);
    $("#modalStatCurrentValue p").text(`${fish.CurrentValue}`);

    if (fish.HasSideFin) {
        $('#modalSideFinColor b').text(`${fish.SideFinColor}`);
        $("#modalSideFinColor b").css("margin-left", "");
        $('#redoSideFinColorButton').css("visibility", "visible");
        if (isDarkColor(fish.SideFinColor)) {
            $("#modalSideFinColor strong").css("color", "white");
            $('#modalSideFinColor b').css('color', 'white');
        }
        else {
            $("#modalSideFinColor strong").css("color", "black");
            $('#modalSideFinColor b').css('color', 'black');
        }
        $('#modalSideFinColor').css("background-color", fish.SideFinColor);
    }
    else {
        $('#modalSideFinColor b').text(`No Side Fin`);
        $("#modalSideFinColor b").css("margin-left", "2.5vw");
        $('#redoSideFinColorButton').css("visibility", "hidden");
        $('#modalSideFinColor b').css("color", "black");
        $('#modalSideFinColor strong').css("color", "black");
        $('#modalSideFinColor').css("background-color", "transparent");
    }

    if (fish.HasPattern) {
        $('#modalPatternColor b').text(`${fish.PatternColor}`);
        $("#modalPatternColor b").css("margin-left", "");
        $('#redoPatternColorButton').css("visibility", "visible");
        if (isDarkColor(fish.PatternColor)) {
            $("#modalPatternColor strong").css("color", "white");
            $('#modalPatternColor b').css('color', 'white');
        }
        else {
            $("#modalPatternColor strong").css("color", "black");
            $('#modalPatternColor b').css('color', 'black');
        }
        $('#modalPatternColor').css("background-color", fish.PatternColor);
    }
    else {
        $('#modalPatternColor b').text(`No Pattern`);
        $("#modalPatternColor b").css("margin-left", "2.5vw");
        $('#redoPatternColorButton').css("visibility", "hidden");
        $('#modalPatternColor b').css("color", "black");
        $('#modalPatternColor strong').css("color", "black");
        $('#modalPatternColor').css("background-color", "transparent");
    }
});

$("#redoTailFinColorButton").on("pointerdown", function () {
    const element = this;
    handleRedoClick(element);
});

$("#redoBodyColorButton").on("pointerdown", function () {
    const element = this;
    handleRedoClick(element);
});

$("#redoTopFinColorButton").on("pointerdown", function () {
    const element = this;
    handleRedoClick(element);
});

$("#redoBottomFinColorButton").on("pointerdown", function () {
    const element = this;
    handleRedoClick(element);
});

$("#redoSideFinColorButton").on("pointerdown", function () {
    const element = this;
    handleRedoClick(element);
});

$("#redoPatternColorButton").on("pointerdown", function () {
    const element = this;
    handleRedoClick(element);
});

$("#redoNameButton").on("pointerdown", function () {
    const element = this;
    handleRedoClick(element);
});

$("#redoWaterFilterTimerButton").on("pointerdown", function () {
    const element = this;
    handleRedoClick(element);
});

$("#modalFishInfoContainer input").on("input", function () {
    const element = this;
    changeArrowsToCheckMark(element);
});

$("#waterFilterTimerInput").on("input", function () {
    const element = this;
    changeArrowsToCheckMark(element);
});

$("#modalFishInfoSaveBlock").on("pointerdown", function () {
    updateFishInAquarium();
    closeFishInfoModal();
});

$("#closeFishShopModal").on("pointerdown", function () {
    closeFishShopModal();
});

$("#waterFilterToggleButtonHolder").on("pointerdown", function () {
    const $element = $(this);
    if (player.AquariumList[selectedAquariumIndex].IsWaterFilterOn) {
        $element.removeClass("greenButton");
        $element.addClass("redButton");
        $element.find("p").text("OFF");
        player.AquariumList[selectedAquariumIndex].IsWaterFilterOn = false;
    }
    else {
        $element.removeClass("redButton");
        $element.addClass("greenButton");
        $element.find("p").text("ON");
        player.AquariumList[selectedAquariumIndex].IsWaterFilterOn = true;
        cleanWater();
    }
});

$(document).on("pointerdown", "#startNewGameButton", function () {
    var aquarium = new AquariumService("My Aquarium", "color", "#ADD8E6");
    var newPlayer = new PlayerService(`Player${saveFiles.length}1`);
    newPlayer.AquariumList.push(aquarium);
    saveFiles.push(newPlayer);
    player = newPlayer;
    selectedSaveFileIndex = saveFiles.length - 1;

    $("#modalStartMenuContainer").hide();
    saveToLocalStorage();
    pushStarterFishes();
    pushShopFishes();
    initialiseGame();
    $("#modalStarterFishContainer").show();
});

$(document).on("pointerdown", ".loadFileButtonHolder", function () {
    const $btn = $(this);

    if ($btn.data('disabled')) return; // prevent spam clicking
    $btn.data('disabled', true);

    const id = $btn.attr('id') || '';
    const idx = parseInt(id.replace(/^loadFileButton/, ''), 10) - 1;

    selectedSaveFileIndex = idx;

    if (!Number.isInteger(idx) || idx < 0 || idx >= saveFiles.length) {
        throw new Error("Could not parse valid save file index from id: " + id);
    }
    else {
        $btn.find("p").css("background-color", "yellowgreen");
        setTimeout(async () => {
            $btn.find("p").css("background-color", "darkgreen");
            player = saveFiles[idx];
            await loadAquarium();
            if (player.AquariumList.length === 1 && player.AquariumList[0].FishList.length === 0) {
                pushStarterFishes();
                $("#modalStarterFishContainer").show();
            }
            $btn.data('disabled', false); // re-enable
            $("#modalStartMenuContainer").hide();
            initialiseGame();
        }, 400);
    }
});

$(document).on("pointerdown", ".deleteFileButtonHolder", function () {
    const $btn = $(this);
    const saveFileContainer = $btn.closest('.saveFileBlock');

    if ($btn.data('disabled')) return; // prevent spam clicking
    $btn.data('disabled', true);

    const id = $btn.attr('id') || '';
    const idx = parseInt(id.replace(/^deleteFileButton/, ''), 10) - 1;

    if (!Number.isInteger(idx) || idx < 0 || idx >= saveFiles.length) {
        $btn.data('disabled', false);
        throw new Error("Could not parse valid save file index from id: " + id);
    }

    if (!confirm("Are you sure you want to delete this save file? This action cannot be undone.")) {
        $btn.data('disabled', false);
        return; // exit if user cancels
    }

    // Animate the button
    $btn.find("p").css("background-color", "red");
    setTimeout(() => {
        // Remove the save from array
        saveFiles.splice(idx, 1);

        // Remove the DOM element
        saveFileContainer.remove();

        renumberSaveFileBlocks();

        // Update localStorage
        localStorage.setItem("playerSaves", JSON.stringify(saveFiles.map(p => p.toJSON())));
    }, 400);
});

$("#musicOnIcon").on("pointerdown", function () {
    toggleMusic();
});

$("#musicOffIcon").on("pointerdown", function () {
    toggleMusic();
    checkForMusicClicksEasterEgg();
});

$("#modalMusicButtonHolder").on("pointerdown", function () {
    toggleMusic();
    checkForMusicClicksEasterEgg2();
});

// Helper to create a clean fish instance from a template
function createFishFromTemplate(template) {
    const fish = new Fish(
        "fish" + (player.AquariumList[selectedAquariumIndex].AmountOfFish + 1),
        template.FishTypeName,
        template.BodyColor,
        template.TailFinColor,
        player.AquariumList[selectedAquariumIndex].AmountOfFish + 1,
        false, // isStarterFish
        template.Speed || 1,
        template.Size || 1,
        template.SideFinColor,
        template.PatternColor,
        template.TopFinColor,
        template.BottomFinColor,
        template.EyeWhiteColor,
        template.PupilColor,
        template.HungerAmount || 0,
        null, // SvgElement will be assigned later
        template.FoodEaten || 0,
        true, // IsAlive
        template.CurrentValue || 0,
        template.MomentCreated || 0,
    );

    // Assign fresh SVG separately (don’t save it!)
    if (template.SvgElement && template.SvgElement.length) {
        fish.SvgElement = template.SvgElement.clone(false);
        fish.SvgElement.removeAttr('id');
    }

    return fish;
}

// Prepare (wrap) and append fish to DOM inside #swimZone, returns fish with wrappers set
function prepareAndAppendFishToSwimZone(fish) {
    if (!fish.SvgElement) {
        throw new Error("Fish has no SvgElement to spawn");
    }

    const swimZone = $('#swimZone');

    // Create *fresh* wrappers
    const fishFlipWrapper = $('<span class="fish-flip-wrapper"><span class="fish-rotate-wrapper"></span></span>');
    const fishRotateWrapper = fishFlipWrapper.find('.fish-rotate-wrapper');

    // Append SVG clone into rotate wrapper
    fishRotateWrapper.append(fish.SvgElement);

    // Put it in a valid start position (numeric left/top)
    const zoneW = swimZone.width();
    const zoneH = swimZone.height();
    const startX = Math.floor(Math.random() * Math.max(0, zoneW - 150));
    const startY = Math.floor(Math.random() * Math.max(0, zoneH - 80));

    fishFlipWrapper.css({
        position: 'absolute',
        left: startX + 'px',
        top: startY + 'px',
        zIndex: 5
    });

    addStrokeToFish(fish);

    // Then reapply proper pattern stroke for paths using CSS vars
    // this is for the wavyFin pattern (and other patterns but these don't seem to take effect)
    fish.SvgElement.find('path').each(function () {
        const strokeAttr = this.getAttribute('stroke');
        if (strokeAttr && strokeAttr.includes('var(--pattern-color')) {
            // Restore the color + make pattern thicker again
            this.style.stroke = `var(--pattern-color)`;
            this.style.strokeWidth = "6px";
        }
    });


    // Append wrapper to swimZone (this is crucial)
    swimZone.append(fishFlipWrapper);

    // Keep references on fish object
    fish.SvgElement.data('fish', fish);
    fish.SvgElement.css("scale", "");
    if (fish.Size === 1) {
        fish.SvgElement.attr("width", 80);
        fish.SvgElement.attr("height", 30);
    }
    else if (fish.Size === 2) {
        fish.SvgElement.attr("width", 100);
        fish.SvgElement.attr("height", 40);
    }
    else if (fish.Size === 3) {
        fish.SvgElement.attr("width", 120);
        fish.SvgElement.attr("height", 50);
    }
    else if (fish.Size === 4) {
        fish.SvgElement.attr("width", 140);
        fish.SvgElement.attr("height", 60);
    }
    else if (fish.Size === 5) {
        fish.SvgElement.attr('width', 140);
        fish.SvgElement.attr('height', 70);
    }
    else if (fish.Size === 6) {
        fish.SvgElement.attr('width', 150);
        fish.SvgElement.attr('height', 80);
    }
    else if (fish.Size === 7) {
        fish.SvgElement.attr('width', 160);
        fish.SvgElement.attr('height', 90);
    }
    else if (fish.Size === 8) {
        fish.SvgElement.attr('width', 170);
        fish.SvgElement.attr('height', 100);
    }
    else if (fish.Size === 9) {
        fish.SvgElement.attr('width', 180);
        fish.SvgElement.attr('height', 110);
    }
    else if (fish.Size === 10) {
        fish.SvgElement.attr('width', 200);
        fish.SvgElement.attr('height', 120);
    }
    else {
        // should never happen
        throw new Error("Fish size is out of bounds!");
    }

    fish.FlipWrapper = fishFlipWrapper;
    fish.RotateWrapper = fishRotateWrapper;

    // Set a class so CSS is consistent
    fish.SvgElement.addClass('spawned-fish');

    return fish;
}

// Final spawn: push into aquarium and start movement
function finalSpawn(fish, isLoadedIn = false) {
    if (isLoadedIn) {
        player.AquariumList[selectedAquariumIndex].FishList.push(fish);
    }
    moveFishRandomly(fish);
}

function handleBoughtBackgroundColorInput($button, color, costPrice) {
    const ownedBackgroundColors = player.AquariumList[selectedAquariumIndex].OwnedBackgroundColors;
    if ($button.data('disabled')) return; // prevent spam clicking
    $button.data('disabled', true);
    if (customColorActive) {
        if (!(color == player.AquariumList[selectedAquariumIndex].SelectedBackground.toLowerCase()) &&
            (color == "#Add8e6" || color == "#000000" || color == "#ffffff" ||
                color == "#00008B" || color == "#7fffd4" || color == "#2e8b57" ||
                color == "#ff7F50" || color == "#8B0000" || color == "#DAA520"
            )) {
            player.AquariumList[selectedAquariumIndex].OwnedBackgroundColors.pop();
            customColorActive = false;
        }
    }
    if (player.MoneyAmount >= costPrice) {
        player.MoneyAmount -= costPrice;
        document.documentElement.style.setProperty('--background-color', color);
        if (!ownedBackgroundColors.includes(color)) {
            ownedBackgroundColors.push(color);
        }
        updateModalColorsOwnedVisually();
        backgroundType = "color";
        player.AquariumList[selectedAquariumIndex].SelectedBackgroundType = backgroundType;
        player.AquariumList[selectedAquariumIndex].SelectedBackground = color;
        $button.find("p").css("background-color", "yellowgreen");
        setTimeout(() => {
            if ($button.attr("class").includes("yellowButton")) {
                $button.find("p").css("background-color", "goldenrod");
            }
            else {
                $button.find("p").css("background-color", "darkgreen");
            }
            $button.data('disabled', false);
        }, 400);
        updateStats();
    }
    else {
        alert("You don't have enough money to buy this background color!");
        $button.find("p").css("background-color", "darkred");
        setTimeout(() => {
            if ($button.attr("class").includes("yellowButton")) {
                $button.find("p").css("background-color", "goldenrod");
            }
            else {
                $button.find("p").css("background-color", "darkgreen");
            }
            $button.data('disabled', false);
        }, 400);
    }

    updateStats();
}

$(document).on("pointerdown", ".buyFishButton", function () {
    const $btn = $(this);

    // Prevent spam clicking
    if ($btn.data('disabled')) return;
    $btn.data('disabled', true);

    const id = $btn.attr('id') || '';
    const idx = parseInt(id.replace(/^modalBuyFish/, ''), 10);
    if (!Number.isInteger(idx)) throw new Error("Could not parse fish index from id: " + id);

    const cost = allFishes[idx].CostPrice;

    if (player.MoneyAmount >= cost) {
        player.MoneyAmount -= cost;
        updateStats();

        // Visual feedback
        $btn.find("p").css("background-color", "yellowgreen");
        setTimeout(() => {
            $btn.find("p").css("background-color", "darkgreen");
            $btn.data('disabled', false); // re-enable
        }, 500);
    } else {
        // Visual feedback for failure
        alert("You don't have enough money to buy this fish!");
        $btn.find("p").css("background-color", "darkred");
        setTimeout(() => {
            $btn.find("p").css("background-color", "darkgreen");
            $btn.data('disabled', false); // re-enable
        }, 500);
        return;
    }

    // Create instance from template
    const template = allFishes[idx];
    if (!template) return console.error('no template for index', idx);

    const fish = createFishFromTemplate(template);

    prepareAndAppendFishToSwimZone(fish);
    finalSpawn(fish, true);
});

$("#fishShopButtonHolder").on("pointerdown", function () {
    closeShopModal();
    closeBottomMenu();
    $("#modalFishShopContainer").show();
});

$("#decorationShopButtonHolder").on("pointerdown", function () {
    closeShopModal();
    closeBottomMenu();
    updateDecorationShop();
    hideHiddenDecoration()
    $("#modalDecorationShopContainer").show();
});

$("#closeDecorationShopModal").on("pointerdown", function () {
    $("#modalDecorationShopContainer").hide();
});

$("#settingsImg").on("pointerdown", function () {
    if (!isAnyModalOpen()) {
        closeBottomMenu();
        $(this).removeClass("rotateSettingsBack");
        $(this).addClass("rotateSettings");
        $("#modalSettingsContainer").show();
    }
});

$("#settingsImg").hover(function () {
    if (isAnyModalOpen()) {
        $("#settingsImg").addClass("noClickCursor");
    }
    else {
        $("#settingsImg").removeClass("noClickCursor");
    }
});

$("#waterFilter").hover(function () {
    if (isAnyModalOpen()) {
        $("#waterFilter").removeClass("clickAble");
        $("#waterFilter").addClass("noClickCursor");
    }
    else {
        $("#waterFilter").removeClass("noClickCursor");
        $("#waterFilter").addClass("clickAble");
    }
});

$("#closeSettingsModal").on("pointerdown", function () {
    $("#modalSettingsContainer").hide();
    $("#settingsImg").removeClass("rotateSettings");
    $("#settingsImg").addClass("rotateSettingsBack");
});

$("#saveGameIcon").on("pointerdown", function () {
    saveGameViaMenu();
});

$("#saveGameButtonHolder").on("pointerdown", function () {
    saveGameViaMenu();
});

$("#modalAutoSaveButtonHolder").on("pointerdown", function () {
    toggleAutoSave();
});

$("#autoSaveOnIcon").on("pointerdown", function () {
    toggleAutoSave();
});

$("#waterFilter").on("pointerdown", function () {
    if (!isAnyModalOpen()) {
        closeBottomMenu();
        $("#modalWaterFilterContainer").show();
    }
});

$("#waterFilterModalCloseButton").on("pointerdown", function () {
    $("#modalWaterFilterContainer").hide();
});

$("#moveWaterFilterButtonHolder").on("pointerdown", function (e) {
    clicksAfterMovingWaterFilter = 0;
    $("#modalWaterFilterContainer").hide();
    $("#waterFilter").attr({
        src: "images/waterFilterSelected.png",
        alt: "selected water filter"
    });

    movingWaterFilter = true;
    $("#fishTank").css("cursor", "grabbing");

    const $filterContainer = $("#waterFilterContainer");
    const offsetX = $filterContainer.width() / 2;

    $filterContainer.css("position", "absolute");

    // Clamp horizontal position
    const maxX = $(window).width() - $filterContainer.width();
    let newX = e.pageX - offsetX;
    newX = Math.max(0, Math.min(newX, maxX));

    // Move immediately to cursor
    $filterContainer.css({
        left: newX + "px",
    });

    // Track movement
    $(document).on("pointermove.waterFilter", function (moveEvent) {
        if (!movingWaterFilter) return;

        let moveX = moveEvent.pageX - offsetX;

        // Clamp horizontal movement
        moveX = Math.max(0, Math.min(moveX, maxX));

        $filterContainer.css({
            left: moveX + "px",
        });
    });
});

// whether we're currently placing
let lastMoveY = 0;

$("#navalMine").on("pointerdown", function (e) {
    e.preventDefault();

    $("#navalMine").attr({
        src: "images/naval-mineSelected.png",
        alt: "selected naval mine"
    });

    $(".landMineChain").attr({
        src: "images/chainSelected.png",
        alt: "selected chain"
    });

    $("#landMineChainBottom").attr({
        src: "images/chainBottomSelected.png",
        alt: "selected chain bottom"
    });

    // --- SECOND CLICK: CONFIRM PLACEMENT ---
    if (movingNavalMine) {
        stopMovingNavalMine();
        return;
    }

    // --- FIRST CLICK: ACTIVATE PLACEMENT MODE ---
    clicksAfterMovingWaterFilter = 0;
    movingNavalMine = true;
    $("#fishTank").css("cursor", "grabbing");
    $("#navalMine").css("cursor", "grabbing");

    const $MineContainer = $("#landMineContainer");
    $MineContainer.css("position", "absolute");

    const startOffsetX = e.pageX - $MineContainer.offset().left;

    const maxX = $(window).width() - $MineContainer.width();


    let newX = e.pageX - startOffsetX;
    newX = Math.max(0, Math.min(newX, maxX));
    $MineContainer.css({ left: newX + "px" });

    lastMoveY = e.pageY;

    // --- TRACK MOVEMENT UNTIL SECOND CLICK ---
    $(document).on("pointermove.navalMine", function (moveEvent) {
        if (!movingNavalMine) return;

        let moveX = moveEvent.pageX - startOffsetX;
        moveX = Math.max(0, Math.min(moveX, maxX));

        // Move mine horizontally with cursor
        $MineContainer.css({ left: moveX + "px" });

        if (moveEvent.pageY > $(window).height() - $MineContainer.height() - 20 && moveEvent.pageY < lastMoveY - 25) {
            return;
        }

        // Handle chain logic
        if (moveEvent.pageY < lastMoveY - 25) {
            // Moving upward → add chain
            $("#navalMineChains").append('<img src="images/chain.png" alt="landmine chain" class="landMineChain">');

            $(".landMineChain").last().attr({
                src: "images/chainSelected.png",
                alt: "selected chain"
            });

            lastMoveY = moveEvent.pageY;
        } else if (moveEvent.pageY > lastMoveY + 25) {
            // Moving downward → remove chain
            $(".landMineChain").last().remove();
            lastMoveY = moveEvent.pageY;
        }
    });
});


$("#buyWaterFilterButtonHolder").on("pointerdown", function () {
    if ($(this).find("p").hasClass("noClickCursor")) return;
    if ($(this).data('disabled')) return; // prevent spam clicking
    $(this).data('disabled', true);
    if (player.MoneyAmount >= 500) {
        if (!player.AquariumList[selectedAquariumIndex].HasWaterFilter) {
            disableShopButButton(this);
            player.MoneyAmount -= 500;
            player.AquariumList[selectedAquariumIndex].HasWaterFilter = true;
            updateStats();
            showWaterFilter();
            $(this).find("p").css("background-color", "yellowgreen");
            setTimeout(() => {
                $(this).find("p").css("background-color", "darkred");
                $(this).data('disabled', false);
            }, 400);
        }
    }
    else {
        alert("You don't have enough money to buy a water filter!");
        $(this).find("p").css("background-color", "darkred");
        setTimeout(() => {
            $(this).find("p").css("background-color", "darkgreen");
            $(this).data('disabled', false);
        }, 400);
    }
});

$("#toggleWaterFilterButtonHolder").on("pointerdown", function () {
    if ($(this).data('disabled')) return; // prevent spam clicking
    $(this).data('disabled', true);
    if (player.AquariumList[selectedAquariumIndex].IsWaterFilterVisible) {
        player.AquariumList[selectedAquariumIndex].IsWaterFilterVisible = false;
    }
    else {
        player.AquariumList[selectedAquariumIndex].IsWaterFilterVisible = true;
    }
    hideHiddenDecoration();
    setTimeout(() => {
        $(this).data('disabled', false);
    }, 400);
});

$("#buyNavalMineButtonHolder").on("pointerdown", function () {
    if ($(this).find("p").hasClass("noClickCursor")) return;
    if ($(this).data('disabled')) return; // prevent spam clicking
    $(this).data('disabled', true);
    if (player.MoneyAmount >= 100) {
        if (!player.AquariumList[selectedAquariumIndex].HasNavalMine) {
            disableShopButButton(this);
            player.MoneyAmount -= 100;
            player.AquariumList[selectedAquariumIndex].HasNavalMine = true;
            updateStats();
            showNavalBomb();
            $(this).find("p").css("background-color", "yellowgreen");
            setTimeout(() => {
                $(this).find("p").css("background-color", "darkred");
                $(this).data('disabled', false);
            }, 400);
        }
    }
    else {
        alert("You don't have enough money to buy a naval mine!");
        $(this).find("p").css("background-color", "darkred");
        setTimeout(() => {
            $(this).find("p").css("background-color", "darkgreen");
            $(this).data('disabled', false);
        }, 400);
    }
});

$("#toggleNavalMineButtonHolder").on("pointerdown", function () {
    if ($(this).data('disabled')) return; // prevent spam clicking
    $(this).data('disabled', true);
    if (player.AquariumList[selectedAquariumIndex].IsNavalMineVisible) {
        player.AquariumList[selectedAquariumIndex].IsNavalMineVisible = false;
    }
    else {
        player.AquariumList[selectedAquariumIndex].IsNavalMineVisible = true;
    }
    hideHiddenDecoration();
    setTimeout(() => {
        $(this).data('disabled', false);
    }, 400);
});

$("#itemShopButtonHolder").on("pointerdown", function () {
    closeShopModal();
    closeBottomMenu();
    $("#modalItemsShopContainer").show();
});

$("#closeItemsShopModal").on("pointerdown", function () {
    $("#modalItemsShopContainer").hide();
});

$("#buyFishFoodButtonHolder").on("pointerdown", function () {
    buyItem($(this), "fish food", 1);
});

$("#buy10FishFoodButtonHolder").on("pointerdown", function () {
    buyItem($(this), "fish food", 10);
});

$("#buySpeedCandyButtonHolder").on("pointerdown", function () {
    buyItem($(this), "speed candy", 1);
});

$("#buy10SpeedCandyButtonHolder").on("pointerdown", function () {
    buyItem($(this), "speed candy", 10);
});

$(".shopItemInfo").on("pointerdown", function () {
    handleInfo($(this));
});

$("#backgroundLightblueButtonHolder p").on("pointerdown", function () {
    handleBoughtBackgroundColorInput($(this).parent(), '#ADD8E6', 0);
});

$("#backgroundBlackButtonHolder p").on("pointerdown", function () {
    let cost = 5;
    if (player.AquariumList[selectedAquariumIndex].OwnedBackgroundColors.includes("#000000")) { cost = 0; }
    handleBoughtBackgroundColorInput($(this).parent(), '#000000', cost);
});

$("#backgroundWhiteButtonHolder p").on("pointerdown", function () {
    let cost = 5;
    if (player.AquariumList[selectedAquariumIndex].OwnedBackgroundColors.includes("#FFFFFF")) { cost = 0; }
    handleBoughtBackgroundColorInput($(this).parent(), '#FFFFFF', cost);
});

$("#backgroundDarkblueButtonHolder p").on("pointerdown", function () {
    let cost = 10;
    if (player.AquariumList[selectedAquariumIndex].OwnedBackgroundColors.includes("#00008B")) { cost = 0; }
    handleBoughtBackgroundColorInput($(this).parent(), '#00008B', cost);
});

$("#backgroundAquamarineButtonHolder p").on("pointerdown", function () {
    let cost = 10;
    if (player.AquariumList[selectedAquariumIndex].OwnedBackgroundColors.includes("#7FFFD4")) { cost = 0; }
    handleBoughtBackgroundColorInput($(this).parent(), '#7FFFD4', cost);
});

$("#backgroundSeagreenButtonHolder p").on("pointerdown", function () {
    let cost = 10;
    if (player.AquariumList[selectedAquariumIndex].OwnedBackgroundColors.includes("#2E8B57")) { cost = 0; }
    handleBoughtBackgroundColorInput($(this).parent(), '#2E8B57', cost);
});

$("#backgroundCoralButtonHolder p").on("pointerdown", function () {
    let cost = 10;
    if (player.AquariumList[selectedAquariumIndex].OwnedBackgroundColors.includes("#FF7F50")) { cost = 0; }
    handleBoughtBackgroundColorInput($(this).parent(), '#FF7F50', cost);
});

$("#backgroundDarkredButtonHolder p").on("pointerdown", function () {
    let cost = 10;
    if (player.AquariumList[selectedAquariumIndex].OwnedBackgroundColors.includes("#8B0000")) { cost = 0; }
    handleBoughtBackgroundColorInput($(this).parent(), '#8B0000', cost);
});

$("#backgroundGoldenrodButtonHolder p").on("pointerdown", function () {
    let cost = 10;
    if (player.AquariumList[selectedAquariumIndex].OwnedBackgroundColors.includes("#DAA520")) { cost = 0; }
    handleBoughtBackgroundColorInput($(this).parent(), '#DAA520', cost);
});

$("#backgroundCustomColorButtonHolder p").on("pointerdown", function () {
    const newColor = document.getElementById("customBackgroundColorInput").value;
    if (newColor == getComputedStyle(document.documentElement).getPropertyValue("--background-color")) {
        alert("No new color was selected, no money was charged!");
    }
    else {
        customColorActive = true;
        handleBoughtBackgroundColorInput($(this).parent(), newColor, 25);
    }
});

$("#closeAlertModal").on("pointerdown", function () {
    $("#alertModalContainer").hide();
    $("#alertModalBackground").hide();
    $("#alertModalContainer").find(".modalTitle").find("strong").text("");
    $("#alertModalContainer").find(".alertMessageContainer").empty();
});

$("#changeBackgroundButtonHolder").on("pointerdown", function () {
    if (player.AquariumList[selectedAquariumIndex].SelectedBackgroundType === "color") {
        const backgroundColor = player.AquariumList[selectedAquariumIndex].SelectedBackground;
        document.documentElement.style.setProperty("--background-color", backgroundColor);
    }

    $("#modalDecorationShopContainer").hide();
    updateModalColorsOwnedVisually();
    closeBottomMenu();
    $("#modalChangeBackgroundContainer").show();

    if (player.AquariumList[selectedAquariumIndex].SelectedBackgroundType === "color") {
        $("#customBackgroundColorInput").attr("value", getComputedStyle(document.documentElement).getPropertyValue("--background-color"));
    }
    if (isDarkColor(player.AquariumList[selectedAquariumIndex].SelectedBackground)) {
        $("#previewCurrentBackground").css("color", "white");
    }
    else {
        $("#previewCurrentBackground").css("color", "black");
    }
});

$("#closeChangeBackgroundModal").on("pointerdown", function () {
    $("#modalChangeBackgroundContainer").hide();
});

$(document).on("keydown", function (e) {
    if (e.key === "r" && movingWaterFilter) {
        checkToMirrorFilter();
    }
});

$(document).on("pointerdown", ".grabModal", function (e) {
    e.preventDefault();

    $grabbedModal = $(this).closest(".modal");

    console.log($grabbedModal.attr("id") + " is being grabbed");
    $grabbedModal.find(".grabModal").addClass("grabbing");
    $grabbedModal.find(".grabModal").removeClass("grabbable");

    isHoldingClick = true;

    const modalOffset = $grabbedModal.offset();
    selectedModaloffsetX = e.pageX - modalOffset.left;
    selectedModaloffsetY = e.pageY - modalOffset.top;

    const viewportWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;
    const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;

    // Attach pointermove only once per drag
    $(document).on("pointermove.modal", function (e) {
        if (!isHoldingClick) return;

        const vw = viewportWidth / 100;
        const vh = viewportHeight / 100;

        const modalWidthVw = $grabbedModal.outerWidth() / vw;
        const modalHeightVh = $grabbedModal.outerHeight() / vh;

        // Calculate unclamped positions
        let newLeftVw = (e.pageX - selectedModaloffsetX) / vw;
        let newTopVh = (e.pageY - selectedModaloffsetY) / vh;

        // Extra offset to prevent touching edges (different offset for mobile devices)
        let extraOffsetVw = 1;
        if (viewportWidth < 1000) {
            extraOffsetVw = 5;
        }

        // Clamp within viewport
        const maxLeftVw = 100 - modalWidthVw - extraOffsetVw;
        const maxTopVh = 100 - modalHeightVh - 2;

        newLeftVw = Math.min(Math.max(newLeftVw, 1), maxLeftVw);
        newTopVh = Math.min(Math.max(newTopVh, 1), maxTopVh);

        $grabbedModal.css({
            left: newLeftVw + "vw",
            top: newTopVh + "vh"
        });
    });
});

$(document).on("pointerup", function () {
    if (isHoldingClick) {
        isHoldingClick = false;
        $grabbedModal.find(".grabModal").addClass("grabbable");
        $grabbedModal.find(".grabModal").removeClass("grabbing");
        $(document).off("pointermove.modal");
        $grabbedModal = null;
    }
});

$(document).on("pointerdown", function (e) {
    if (e.button === 0) { // left mouse button
        clicksAfterMovingWaterFilter++;
        if (clicksAfterMovingWaterFilter > 1) {
            if (movingWaterFilter) {
                stopMovingWaterFilter();
            }
            if (movingNavalMine) {
                stopMovingNavalMine();
            }
            clicksAfterMovingWaterFilter = 0;
        }
    }
    else if (e.button === 1 || e.button === 2) { // middle mouse button or right mouse button
        checkToMirrorFilter();
    }
});

$(".colorInput").on("input", function () {
    const color = $(this).val();

    const mainInputContainer = $(this).parent().parent();
    mainInputContainer.css("background-color", color);

    let changeTextColorElement = mainInputContainer;

    if ($(this).hasClass("fishInfoColorInput")) {
        changeTextColorElement = $(this).parent().parent().find("strong");
    }

    if (isDarkColor(color)) {
        changeTextColorElement.css("color", "white");
    } else {
        changeTextColorElement.css("color", "black");
    }
});

//#endregion


//#region test functions

/* THESE FUNCTIONS ARE CURRENTLY NOT IN USE */

function spawnNewRandomFish(fishType) {
    const newFish = new Fish(
        "fish" + (player.AquariumList[selectedAquariumIndex].AmountOfFish + 1),
        fishType,
        getRandomColor(),
        getRandomColor(),
        player.AquariumList[selectedAquariumIndex].AmountOfFish + 1
    );

    if (newFish.HasSideFin) newFish.SideFinColor = getRandomColor();
    if (newFish.HasPattern) newFish.PatternColor = getRandomColor();
    if (newFish.HasTopFin) newFish.TopFinColor = getRandomColor();
    if (newFish.HasBottomFin) newFish.BottomFinColor = getRandomColor();

    player.AquariumList[selectedAquariumIndex].FishList.push(newFish);

    $.get(`assets/media/svgs/fish/${fishType}.svg`, function (data) {
        const svg = $(data).find('svg');

        svg.addClass('spawned-fish').css({
            '--body-color': newFish.BodyColor,
            '--tail-color': newFish.TailFinColor,
            position: 'absolute',
            top: 0,
            left: 0,
            width: 80,
            height: 30,
            stroke: 'black',
            'stroke-width': 1,
            'stroke-linejoin': 'round',
            scale: ''
        });

        if (newFish.HasPattern) svg.css('--pattern-color', newFish.PatternColor);
        if (newFish.HasSideFin) svg.css('--side-fin-color', newFish.SideFinColor);
        if (newFish.HasTopFin) svg.css('--top-fin-color', newFish.TopFinColor);
        if (newFish.HasBottomFin) svg.css('--bottom-fin-color', newFish.BottomFinColor);

        svg.data('fish', newFish);
        newFish.SvgElement = svg;

        // Wrap SVG
        const fishFlipWrapper = $('<span class="fish-flip-wrapper"><span class="fish-rotate-wrapper"></span></span>');
        fishFlipWrapper.find('.fish-rotate-wrapper').append(svg);

        fishFlipWrapper.css({
            position: 'absolute',
            left: 200,
            top: 200,
            zIndex: 5
        });

        // Append wrapper to swimZone
        $('#swimZone').append(fishFlipWrapper);

        moveFishRandomly(newFish);
    }, 'xml');
}


function spawnAllFishForTesting() {
    console.log("spawning all fish types for testing");
    Object.values(AllFishTypes).forEach(fishType => {
        spawnNewRandomFish(fishType);
    });
}

//#endregion