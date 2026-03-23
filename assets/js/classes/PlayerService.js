class PlayerService {
    constructor(
        name,
        dateMade = new Date(),
        foodAmount = 10,
        moneyAmount = 100,
        aquariumList = [],
        backgroundMusicOn = true,
        autoSaveOn = true,
        selectedAquariumIndex = 0,
        speedCandyAmount = 0
    ) {
        this._name = name;
        this._dateMade = dateMade;
        this._foodAmount = foodAmount;
        this._moneyAmount = moneyAmount;
        this._aquariumList = aquariumList;
        this._backgroundMusicOn = backgroundMusicOn;
        this._autoSaveOn = autoSaveOn;
        this._selectedAquariumIndex = selectedAquariumIndex;
        this._speedCandyAmount = speedCandyAmount;
    }

    // --- Getters & Setters ---
    get Name() { return this._name; }
    set Name(value) { this._name = value; }

    get DateMade() { return this._dateMade; }
    set DateMade(value) { this._dateMade = value; }

    get FoodAmount() { return this._foodAmount; }
    set FoodAmount(value) {
        if (value < 0) throw new Error("You can't use more food than you have!");
        this._foodAmount = value;
    }

    get MoneyAmount() { return this._moneyAmount; }
    set MoneyAmount(value) { this._moneyAmount = value; }

    get AquariumList() { return this._aquariumList; }
    set AquariumList(value) { this._aquariumList = value; }

    get BackgroundMusicOn() { return this._backgroundMusicOn; }
    set BackgroundMusicOn(value) { this._backgroundMusicOn = value; }

    get AutoSaveOn() { return this._autoSaveOn; }
    set AutoSaveOn(value) { this._autoSaveOn = value; }

    get SelectedAquariumIndex() { return this._selectedAquariumIndex; }
    set SelectedAquariumIndex(value) { this._selectedAquariumIndex = value; }

    get SpeedCandyAmount() { return this._speedCandyAmount; }
    set SpeedCandyAmount(value) {
        if (value < 0) throw new Error("You can't use more speed candy than you have!");
        this._speedCandyAmount = value;
    }

    get FishAmount() {
        return this._aquariumList.reduce((total, aquarium) => total + aquarium.FishList.length, 0);
    }

    // --- Serialization (to JSON-safe object) ---
    toJSON() {
        return {
            Name: this.Name,
            DateMade: this.DateMade,
            FoodAmount: this.FoodAmount,
            MoneyAmount: this.MoneyAmount,
            AquariumList: this.AquariumList.map(aq => aq.toJSON()),
            BackgroundMusicOn: this.BackgroundMusicOn,
            AutoSaveOn: this.AutoSaveOn,
            SelectedAquariumIndex: this.SelectedAquariumIndex,
            SpeedCandyAmount: this.SpeedCandyAmount
        };
    }

    static fromJSON(json) {
        return new PlayerService(
            json.Name,
            json.DateMade,
            json.FoodAmount,
            json.MoneyAmount,
            (json.AquariumList || []).map(aq => AquariumService.fromJSON(aq)),
            json.BackgroundMusicOn,
            json.AutoSaveOn,
            json.SelectedAquariumIndex,
            json.SpeedCandyAmount
        );
    }
}
