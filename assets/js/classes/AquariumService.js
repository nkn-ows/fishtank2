class AquariumService {
    constructor(aquariumName, selectedBackgroundType, selectedBackground) {
        this._aquariumName = aquariumName;
        this._selectedBackgroundType = selectedBackgroundType
        this._selectedBackground = selectedBackground;
        this._maxFish = 10;
        this._aquariumLevel = 1;
        this._aquariumValue = 0;
        this._foodAmount = 0;
        this._waterQuality = 100;
        this._waterColor = 'blue';
        this._hasFood = false;
        this._fishList = [];
        this._ownedBackgroundColors = ["#ADD8E6"];
        this._ownedBackgroundImages = [];
        this._ownedBackgroundGifs = [];
        this._hasWaterFilter = false;
        this._waterFilterX = 0;
        this._waterFilterMirrored = false;
        this._waterFilterTimer = 60000; // Timer that will keep track of how long until next clean
        this._isWaterFilterOn = true; // To prevent multiple intervals,
        this._navalMineX = 70;
        this._hasNavalMine = false;
        this._navalMineHeight = 2;
        this._isWaterFilterVisible = true; // true, cuz it won't display the filter if the user doesn't have it and once they have it it should be true by default
        this._isNavalMineVisible = true;
    }

    // --- Getters and setters ---
    get AmountOfFish() {
        return this._fishList.length;
    }

    get AquariumName() { return this._aquariumName; }
    set AquariumName(value) { this._aquariumName = value; }

    get SelectedBackgroundType() { return this._selectedBackgroundType; }
    set SelectedBackgroundType(value) { this._selectedBackgroundType = value; }

    get SelectedBackground() { return this._selectedBackground; }
    set SelectedBackground(value) { this._selectedBackground = value; }

    get MaxFish() { return this._maxFish; }
    set MaxFish(value) { this._maxFish = value; }

    get AquariumLevel() { return this._aquariumLevel; }
    set AquariumLevel(value) { this._aquariumLevel = value; }

    get AquariumValue() { return this._aquariumValue; }
    set AquariumValue(value) { this._aquariumValue = value; }

    get FoodAmount() { return this._foodAmount; }
    set FoodAmount(value) { this._foodAmount = value; }

    get WaterQuality() { return this._waterQuality; }
    set WaterQuality(value) { this._waterQuality = value; }

    get WaterColor() { return this._waterColor; }
    set WaterColor(value) { this._waterColor = value; }

    get HasFood() { return this._hasFood; }
    set HasFood(value) { this._hasFood = value; }

    get FishList() { return this._fishList; }
    set FishList(value) { this._fishList = value; }

    get OwnedBackgroundColors() { return this._ownedBackgroundColors; }
    set OwnedBackgroundColors(value) { this._ownedBackgroundColors = value; }

    get OwnedBackgroundImages() { return this._ownedBackgroundImages; }
    set OwnedBackgroundImages(value) { this._ownedBackgroundImages = value; }

    get OwnedBackgroundGifs() { return this._ownedBackgroundGifs; }
    set OwnedBackgroundGifs(value) { this._ownedBackgroundGifs = value; }

    get HasWaterFilter() { return this._hasWaterFilter; }
    set HasWaterFilter(value) { this._hasWaterFilter = value; }

    get WaterFilterX() { return this._waterFilterX; }
    set WaterFilterX(value) { this._waterFilterX = value; }

    get WaterFilterMirrored() { return this._waterFilterMirrored; }
    set WaterFilterMirrored(value) { this._waterFilterMirrored = value; }

    get WaterFilterTimer() { return this._waterFilterTimer; }
    set WaterFilterTimer(value) { this._waterFilterTimer = value; }

    get IsWaterFilterOn() { return this._isWaterFilterOn; }
    set IsWaterFilterOn(value) { this._isWaterFilterOn = value; }

    get NavalMineX() { return this._navalMineX; }
    set NavalMineX(value) { this._navalMineX = value; }

    get HasNavalMine() { return this._hasNavalMine; }
    set HasNavalMine(value) { this._hasNavalMine = value; }

    get NavalMineHeight() { return this._navalMineHeight; }
    set NavalMineHeight(value) { this._navalMineHeight = value; }

    get IsWaterFilterVisible() { return this._isWaterFilterVisible; }
    set IsWaterFilterVisible(value) { this._isWaterFilterVisible = value; }

    get IsNavalMineVisible() { return this._isNavalMineVisible; }
    set IsNavalMineVisible(value) { this._isNavalMineVisible = value; }


    // --- Serialization (for localStorage) ---
    toJSON() {
        return {
            AquariumName: this.AquariumName,
            SelectedBackgroundType: this.SelectedBackgroundType,
            SelectedBackground: this.SelectedBackground,
            MaxFish: this.MaxFish,
            AquariumLevel: this.AquariumLevel,
            AquariumName: this.AquariumName,
            AquariumValue: this.AquariumValue,
            FoodAmount: this.FoodAmount,
            WaterQuality: this.WaterQuality,
            WaterColor: this.WaterColor,
            HasFood: false, // reset to false on load
            FishList: this.FishList.map(f => f.toJSON()), // serialize fish data only
            OwnedBackgroundColors: this.OwnedBackgroundColors,
            OwnedBackgroundImages: this.OwnedBackgroundImages,
            OwnedBackgroundGifs: this.OwnedBackgroundGifs,
            HasWaterFilter: this.HasWaterFilter,
            WaterFilterX: this.WaterFilterX,
            WaterFilterMirrored: this.WaterFilterMirrored,
            WaterFilterTimer: this.WaterFilterTimer,
            IsWaterFilterOn: this.IsWaterFilterOn,
            NavalMineX: this.NavalMineX,
            HasNavalMine: this.HasNavalMine,
            NavalMineHeight: this.NavalMineHeight,
            IsWaterFilterVisible: this.IsWaterFilterVisible,
            IsNavalMineVisible: this.IsNavalMineVisible
        };
    }

    static fromJSON(json) {
        const aquarium = new AquariumService(json.AquariumName);
        aquarium.AquariumName = json.AquariumName;
        aquarium.SelectedBackgroundType = json.SelectedBackgroundType;
        aquarium.SelectedBackground = json.SelectedBackground;
        aquarium.MaxFish = json.MaxFish;
        aquarium.AquariumLevel = json.AquariumLevel;
        aquarium.AquariumValue = json.AquariumValue;
        aquarium.FoodAmount = json.FoodAmount;
        aquarium.WaterQuality = json.WaterQuality;
        aquarium.WaterColor = json.WaterColor;
        aquarium.HasFood = false; // reset to false on load
        aquarium.FishList = (json.FishList || []).map(f => Fish.fromJSON(f));
        aquarium.OwnedBackgroundColors = json.OwnedBackgroundColors;
        aquarium.OwnedBackgroundImages = json.OwnedBackgroundImages;
        aquarium.OwnedBackgroundGifs = json.OwnedBackgroundGifs;
        aquarium.HasWaterFilter = json.HasWaterFilter || false;
        aquarium.WaterFilterX = json.WaterFilterX || 0;
        aquarium.WaterFilterMirrored = json.WaterFilterMirrored || false;
        aquarium.WaterFilterTimer = json.WaterFilterTimer || 1000;
        aquarium.IsWaterFilterOn = json.IsWaterFilterOn || false;
        aquarium.NavalMineX = json.NavalMineX || 50;
        aquarium.HasNavalMine = json.HasNavalMine || false;
        aquarium.NavalMineHeight = json.NavalMineHeight || 2;
        aquarium.IsWaterFilterVisible = json.IsWaterFilterVisible;
        aquarium.IsNavalMineVisible = json.IsNavalMineVisible;
        return aquarium;
    }
}
