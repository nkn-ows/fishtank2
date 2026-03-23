const AllFishTypes = {
    normalBroadback: 'normalBroadback',
    normalOvalfin: 'normalOvalfin',
    normalPaddlefin: 'normalPaddlefin',
    normalRoundback: 'normalRoundback',
    normalSlimtail: 'normalSlimtail',
    bubblemark: 'bubblemark',
    tigerstripes: 'tigerstripes',
    longpaddlefin: 'longpaddlefin',
    clownfish: 'clownfish',
    bubbleback: 'bubbleback',
    wavyfin: 'wavyfin',
    piranha: 'piranha'
};

const backGroundColors = {
    lightblue: "#ADD8E6",
    darkblue: "#00008B",
    aquamarine: "#7FFFD4",
    seagreen: "#2E8B57",
    coral: "#FF7F50",
    darkred: "#8B0000",
    goldenrod: "#DAA520",
    black: "#000000",
    white: "#FFFFFF"
};

const FishParts = {
    Body: "body",
    Tail: "tailFin",
    TopFin: "topFin",
    BottomFin: "bottomFin",
    SideFin: "sideFin",
    Pattern: "pattern"
};

const FishSvgPaths = {
    bubbleback: 'assets/media/svgs/fish/bubbleBack.svg',
    bubblemark: 'assets/media/svgs/fish/bubbleMark.svg',
    clownfish: 'assets/media/svgs/fish/clownfish.svg',
    longpaddlefin: 'assets/media/svgs/fish/longpaddlefin.svg',
    normalBroadback: 'assets/media/svgs/fish/normalBroadback.svg',
    normalOvalfin: 'assets/media/svgs/fish/normalOvalfin.svg',
    normalPaddlefin: 'assets/media/svgs/fish/normalPaddlefin.svg',
    normalRoundback: 'assets/media/svgs/fish/normalRoundback.svg',
    normalSlimtail: 'assets/media/svgs/fish/normalSlimtail.svg',
    piranha: 'assets/media/svgs/fish/piranha.svg',
    tigerstripes: 'assets/media/svgs/fish/tigerstripes.svg',
    wavyfin: 'assets/media/svgs/fish/wavyfin.svg'
}

const NormalFishTypes = [
    AllFishTypes.normalBroadback,
    AllFishTypes.normalOvalfin,
    AllFishTypes.normalPaddlefin,
    AllFishTypes.normalRoundback,
    AllFishTypes.normalSlimtail
];

const StandardFishColors = {
    bubbleback: {
        body: "#ff5c5c",
        tailFin: "#ff3b3b",
        topFin: "#ff5c5c",
        bottomFin: "#ff5c5c",
        sideFin: null,
        pattern: "#ffffff"
    },
    bubblemark: {
        body: "#00dddd",
        tailFin: "#00cccc",
        topFin: "#33eeee",
        bottomFin: "#33eeee",
        sideFin: "#00aaaa",
        pattern: "#ffffff"
    },
    clownfish: {
        body: "#ff6600",
        tailFin: "#ff6600",
        topFin: "#ff6600",
        bottomFin: "#ff6600",
        sideFin: "#ff6600",
        pattern: "#ffffff"
    },
    longpaddlefin: {
        body: "#66ddff",
        tailFin: "#0077aa",
        topFin: "#3399cc",
        bottomFin: "#3399cc",
        sideFin: "#006699",
        pattern: "#33aaff"
    },
    normalBroadback: {
        body: "#ffcc00",
        tailFin: "#ffaa55",
        topFin: "#ffcc00",
        bottomFin: "#ffcc00",
        sideFin: "#bb8800",
        pattern: null
    },
    normalOvalfin: {
        body: "#44aaff",
        tailFin: "#66ccff",
        topFin: "#77aadd",
        bottomFin: "#77aadd",
        sideFin: "#66aacc",
        pattern: null
    },
    normalPaddlefin: {
        body: "#55dd55",
        tailFin: "#99ff99",
        topFin: "#66ee66",
        bottomFin: "#66ee66",
        sideFin: "#33cc33",
        pattern: null
    },
    normalRoundback: {
        body: "#5599ff",
        tailFin: "#77dddd",
        topFin: "#66aacc",
        bottomFin: "#66aacc",
        sideFin: "#33aa88",
        pattern: null
    },
    normalSlimtail: {
        body: "#ff7777",
        tailFin: "#ff9999",
        topFin: "#ffaaaa",
        bottomFin: "#ffaaaa",
        sideFin: "#cc4444",
        pattern: null
    },
    piranha: {
        body: "#1f9e6e",
        tailFin: "#1f9e6e",
        topFin: "#1f9e6e",
        bottomFin: "#1f9e6e",
        sideFin: null,
        pattern: "#a1f0cc"
    },
    tigerstripes: {
        body: "#ffdd00",
        tailFin: "#ffaa00",
        topFin: "#ffcc00",
        bottomFin: "#ffcc00",
        sideFin: "#ffaa00",
        pattern: "#000000"
    },
    wavyfin: {
        body: "#f28c28",
        tailFin: "#f28c28",
        topFin: "#f28c28",
        bottomFin: "#f28c28",
        sideFin: null,
        pattern: "#ffffff"
    }
};