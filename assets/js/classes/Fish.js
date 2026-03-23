class Fish {
    constructor(
        name,
        fishTypeName,
        bodyColor,
        tailFinColor,
        fishId,
        isStarterFish = false,
        speed = 1,
        size = 1,
        sideFinColor = null,
        patternColor = null,
        topFinColor = null,
        bottomFinColor = null,
        eyeWhiteColor = "white",
        pupilColor = "black",
        hungerAmount = 0,
        svgElement = null,
        foodEaten = 0,
        isAlive = true,
        currentValue = 0,
    ) {
        // Basic properties
        this._name = name;
        this.FishTypeName = fishTypeName;
        this._bodyColor = bodyColor;
        this._tailFinColor = tailFinColor;
        this._fishId = fishId;
        // Optional with defaults
        this._isStarterFish = isStarterFish;
        this.Speed = speed;
        this.Size = size;
        this._sideFinColor = sideFinColor;
        this._patternColor = patternColor;
        this._topFinColor = topFinColor;
        this._bottomFinColor = bottomFinColor;
        this._eyeWhiteColor = eyeWhiteColor;
        this._pupilColor = pupilColor;
        this._hungerAmount = hungerAmount;
        this._svgElement = svgElement;
        this._foodEaten = foodEaten;
        this._isAlive = isAlive;
        this._currentValue = currentValue;
        // unsettable param
        this._momentCreated = ReturnCurrentTime();
    }

    // Getters and setters

    get Name() { return this._name; }
    set Name(value) {
        if (value === undefined || value === null || value.trim() === "") {
            throw new Error("The name of the fish can't be empty!");
        }
        else {
            this._name = value;
        }
    }

    get FishTypeName() { return this._fishTypeName; }
    set FishTypeName(value) {
        if (isInEnum(value, AllFishTypes)) {
            this._fishTypeName = value;
        } else {
            throw new Error("This fishtype is not recognized!");
        }
    }

    get BodyColor() { return this._bodyColor; }
    set BodyColor(value) { this._bodyColor = value; }

    get TailFinColor() { return this._tailFinColor; }
    set TailFinColor(value) { this._tailFinColor = value; }

    get Size() { return this._size; }
    set Size(value) {
        if (value < 1) {
            throw new Error("Size cannot be less than 1!");
        }
        if (value > 10) {
            throw new Error("Size cannot exceed 10!");
        }
        this._size = value;
    }

    get FishId() { return this._fishId; }
    set FishId(value) { this._fishId = value; }

    get Speed() { return this._speed; }
    set Speed(value) {
        if (value < 0) {
            throw new Error("Speed cannot be negative!");
        }
        if (value > 5) {
            throw new Error("Speed cannot exceed 5!");
        }
        this._speed = value;
    }

    get HasBottomFin() {
        if (
            this.FishTypeName === AllFishTypes.bubbleback ||
            this.FishTypeName === AllFishTypes.bubblemark ||
            this.FishTypeName === AllFishTypes.longpaddlefin ||
            this.FishTypeName === AllFishTypes.normalBroadback ||
            this.FishTypeName === AllFishTypes.normalOvalfin ||
            this.FishTypeName === AllFishTypes.normalPaddlefin ||
            this.FishTypeName === AllFishTypes.normalRoundback ||
            this.FishTypeName === AllFishTypes.normalSlimtail ||
            this.FishTypeName === AllFishTypes.piranha ||
            this.FishTypeName === AllFishTypes.tigerstripes ||
            this.FishTypeName === AllFishTypes.wavyfin
        ) {
            return true;
        } else {
            return false;
        }
    }

    get HasTopFin() {
        if (
            this.FishTypeName === AllFishTypes.bubbleback ||
            this.FishTypeName === AllFishTypes.bubblemark ||
            this.FishTypeName === AllFishTypes.clownfish ||
            this.FishTypeName === AllFishTypes.longpaddlefin ||
            this.FishTypeName === AllFishTypes.normalBroadback ||
            this.FishTypeName === AllFishTypes.normalOvalfin ||
            this.FishTypeName === AllFishTypes.normalPaddlefin ||
            this.FishTypeName === AllFishTypes.normalRoundback ||
            this.FishTypeName === AllFishTypes.normalSlimtail ||
            this.FishTypeName === AllFishTypes.piranha ||
            this.FishTypeName === AllFishTypes.tigerstripes ||
            this.FishTypeName === AllFishTypes.wavyfin
        ) {
            return true;
        } else {
            return false;
        }
    }

    get HasPattern() {
        if (
            this.FishTypeName === AllFishTypes.normalBroadback ||
            this.FishTypeName === AllFishTypes.normalOvalfin ||
            this.FishTypeName === AllFishTypes.normalPaddlefin ||
            this.FishTypeName === AllFishTypes.normalRoundback ||
            this.FishTypeName === AllFishTypes.normalSlimtail
        ) {
            return false;
        } else {
            return true;
        }
    }

    get HasSideFin() {
        if (
            this.FishTypeName === AllFishTypes.bubblemark ||
            this.FishTypeName === AllFishTypes.clownfish ||
            this.FishTypeName === AllFishTypes.longpaddlefin ||
            this.FishTypeName === AllFishTypes.normalBroadback ||
            this.FishTypeName === AllFishTypes.normalOvalfin ||
            this.FishTypeName === AllFishTypes.normalPaddlefin ||
            this.FishTypeName === AllFishTypes.normalRoundback ||
            this.FishTypeName === AllFishTypes.normalSlimtail ||
            this.FishTypeName === AllFishTypes.tigerstripes
        ) {
            return true;
        } else {
            return false;
        }
    }

    get SideFinColor() { return this._sideFinColor; }
    set SideFinColor(value) { this._sideFinColor = value; }

    get PatternColor() { return this._patternColor; }
    set PatternColor(value) { this._patternColor = value; }

    get BottomFinColor() { return this._bottomFinColor; }
    set BottomFinColor(value) { this._bottomFinColor = value; }

    get TopFinColor() { return this._topFinColor; }
    set TopFinColor(value) { this._topFinColor = value; }

    get EyeWhiteColor() { return this._eyeWhiteColor; }
    set EyeWhiteColor(value) { this._eyeWhiteColor = value; }

    get PupilColor() { return this._pupilColor; }
    set PupilColor(value) { this._pupilColor = value; }

    get HungerAmount() { return this._hungerAmount; }
    set HungerAmount(value) { this._hungerAmount = value; }

    get CostPrice() {
        if (this.IsStarterFish) {
            return 0;
        }

        if (this.FishTypeName === AllFishTypes.bubbleback) {
            return 85;
        }
        else if (this.FishTypeName === AllFishTypes.bubblemark) {
            return 80;
        }
        else if (this.FishTypeName === AllFishTypes.clownfish) {
            return 90;
        }
        else if (this.FishTypeName === AllFishTypes.longpaddlefin) {
            return 80;
        }
        else if (this.FishTypeName === AllFishTypes.normalBroadback) {
            return 40;
        }
        else if (this.FishTypeName === AllFishTypes.normalOvalfin) {
            return 40;
        }
        else if (this.FishTypeName === AllFishTypes.normalPaddlefin) {
            return 40;
        }
        else if (this.FishTypeName === AllFishTypes.normalRoundback) {
            return 40;
        }
        else if (this.FishTypeName === AllFishTypes.normalSlimtail) {
            return 40;
        }
        else if (this.FishTypeName === AllFishTypes.piranha) {
            return 100;
        }
        else if (this.FishTypeName === AllFishTypes.tigerstripes) {
            return 80;
        }
        else if (this.FishTypeName === AllFishTypes.wavyfin) {
            return 85;
        }
        else {
            // should never happen
            throw new Error("This fishtype is not recognized!");
        }
    }

    get SvgElement() { return this._svgElement; }
    set SvgElement(value) {
        if (!value) {
            this._svgElement = null;
        }
        else if (value.jquery) {
            // Already a jQuery object
            this._svgElement = value;
        }
        else {
            // Wrap raw DOM node
            this._svgElement = $(value);
        }
    }

    get FoodEaten() {
        return this._foodEaten;
    }
    set FoodEaten(value) {
        if (value < 0) {
            throw new Error("Food eaten cannot be negative!");
        }
        else if (value >= 200) {
            this.Size = 10;
            this.SvgElement.attr('width', 200);
            this.SvgElement.attr('height', 120);
        }
        else if (value >= 150) {
            this.Size = 9;
            this.SvgElement.attr('width', 180);
            this.SvgElement.attr('height', 110);
        }
        else if (value >= 100) {
            this.Size = 8;
            this.SvgElement.attr('width', 170);
            this.SvgElement.attr('height', 100);
        }
        else if (value >= 75) {
            this.Size = 7;
            this.SvgElement.attr('width', 160);
            this.SvgElement.attr('height', 90);
        }
        else if (value >= 50) {
            this.Size = 6;
            this.SvgElement.attr('width', 150);
            this.SvgElement.attr('height', 80);
        }
        else if (value >= 30) {
            this.Size = 5;
            this.SvgElement.attr('width', 140);
            this.SvgElement.attr('height', 70);
        }
        else if (value >= 20) {
            this.Size = 4;
            this.SvgElement.attr('width', 130);
            this.SvgElement.attr('height', 60);
        }
        else if (value >= 10) {
            this.Size = 3;
            this.SvgElement.attr('width', 120);
            this.SvgElement.attr('height', 50);
        }
        else if (value >= 5) {
            this.Size = 2;
            this.SvgElement.attr('width', 100);
            this.SvgElement.attr('height', 40);
        }
        this._foodEaten = value;
    }

    get IsAlive() { return this._isAlive; }
    set IsAlive(value) { this._isAlive = value; }

    get Age() { return this._age; }
    set Age(value) { this._age = value; }

    get CurrentValue() {
        let value = Math.floor(this.CostPrice + (this.Speed * 5) + (this.FoodEaten * 0.5) + (this.Size * 2 * 2));
        if (StandardFishColors[this.FishTypeName].body !== this.BodyColor) {
            value += 1;
        }
        if (StandardFishColors[this.FishTypeName].tailFin !== this.TailFinColor) {
            value += 1;
        }
        if (StandardFishColors[this.FishTypeName].topFin !== this.TopFinColor) {
            value += 1;
        }
        if (StandardFishColors[this.FishTypeName].bottomFin !== this.BottomFinColor) {
            value += 1;
        }
        if (StandardFishColors[this.FishTypeName].sideFin !== this.SideFinColor) {
            value += 1;
        }
        if (StandardFishColors[this.FishTypeName].pattern !== this.PatternColor) {
            value += 1;
        }
        return value;
    }
    set CurrentValue(value) { this._currentValue = value; }

    get IsStarterFish() { return this._isStarterFish; }
    set IsStarterFish(value) { this._isStarterFish = value; }

    get MomentCreated() { return this._momentCreated; }
    set MomentCreated(value) { this._momentCreated = value; }

    getSpeedInPixelsPerSecond() {
        return this.Speed * 10;
    }

    toString() {
        return this.Name;
    }

    toJSON() {
        return {
            _name: this._name,
            _fishTypeName: this.FishTypeName,
            _bodyColor: this.BodyColor,
            _tailFinColor: this.TailFinColor,
            _fishId: this.FishId,
            _isStarterFish: this.IsStarterFish,
            _speed: this.Speed,
            _size: this.Size,
            _sideFinColor: this.SideFinColor,
            _patternColor: this.PatternColor,
            _topFinColor: this.TopFinColor,
            _bottomFinColor: this.BottomFinColor,
            _eyeWhiteColor: this.EyeWhiteColor,
            _pupilColor: this.PupilColor,
            _hungerAmount: this.HungerAmount,
            _foodEaten: this.FoodEaten,
            _isAlive: this.IsAlive,
            _currentValue: this.CurrentValue,
            _momentCreated: this.MomentCreated
            // note: no SvgElement here
        };
    }

    static fromJSON(json) {
        return new Fish(
            json._name,
            json._fishTypeName,
            json._bodyColor,
            json._tailFinColor,
            json._fishId,
            json._isStarterFish,
            json._speed,
            json._size,
            json._sideFinColor,
            json._patternColor,
            json._topFinColor,
            json._bottomFinColor,
            json._eyeWhiteColor,
            json._pupilColor,
            json._hungerAmount,
            null, // SvgElement will be assigned later
            json._foodEaten,
            json._isAlive,
            json._currentValue,
            json._momentCreated
        );
    }
}

function isInEnum(value, enumObj) {
    return Object.values(enumObj).includes(value);
}

function ReturnCurrentTime() {
    const now = new Date();
    return `${now.toDateString()} | ${now.getHours()}:${now.getMinutes()}`
}