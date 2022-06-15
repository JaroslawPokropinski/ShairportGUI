let r = document.querySelector(":root");

let backgroundType = "image";
const imgContainer = document.querySelector(".background-img");

const applyPallette = (palette) => {
    for (color in palette) {
        r.style.setProperty(`--${color}`, "rgb(" + palette[color] + ")");
        console.log(`${color}: rgb(${palette[color]})`);
        r.style.setProperty(`--${color}Raw`, palette[color]);
        console.log(`${color}Raw: ${palette[color]}`);
    }

    r.style.setProperty(
        `--brShadowColorForBoxShadow`,
        `${palette.brShadowColor}`
    );
    r.style.setProperty(
        `--tlShadowColorForBoxShadow`,
        `${palette.tlShadowColor}`
    );
};

const processTypes = (backgroundType) => {
    switch (backgroundType) {
        case "image":
            setBackgroundImage();
            break;
        case "blur":
            setBackgroundBlur();
            break;
        case "blurHash":
            setBackgroundBlurHash();
            break;
        default:
            setBackgroundImage();
            break;
    }
};

const onInit = () => {
    backgroundType = getBackgroundType();
    processTypes(backgroundType);
};

const changeStyle = (backgroundTypeVar) => {
    resetStyle();
    processTypes(backgroundTypeVar);
    saveBackgroundType(backgroundTypeVar);
    backgroundType = backgroundTypeVar;

};

// toggle background styles between image, blur and blurHash
const toggleBackgroundType = () => {
    const backgroundType = getBackgroundType();
    if (backgroundType === "image") {
        changeStyle("blur");
        console.log("background type set to blur");
    } else if (backgroundType === "blur") {
        changeStyle("blurHash");
        console.log("background type set to blurHash");
    }
    else if (backgroundType === "blurHash") {
        changeStyle("image");
        console.log("background type set to image");
    }
}


const resetStyle = () => {
    imgContainer.style.backgroundImage = "";
    imgContainer.style.filter = "";
    imgContainer.style.animation = "";
};

const setBackgroundImage = () => {
    imgContainer.style.backgroundImage = `url(${
        document.querySelector("#cover").src
    })`;
    imgContainer.style["filter"] = "blur(70px)";
};

const setBackgroundBlur = () => {
    imgContainer.style.backgroundImage = `radial-gradient(circle at left,
        rgba(var(--borderColorRaw), 1),
        rgba(255, 255, 255, 0) 50%),
      radial-gradient(circle at top left,
        rgba(var(--artistColorRaw), 0.4),
        rgba(255, 255, 255, 0) 60%),
      radial-gradient(circle at bottom,
        rgba(var(--songColorRaw), 0.3),
        rgba(255, 255, 255, 0) 60%),
      radial-gradient(circle at top right,
        rgba(var(--tlShadowColorRaw), 1),
        rgba(255, 255, 255, 0) 60%),
      radial-gradient(circle at bottom right,
        rgba(var(--brShadowColorRaw), 1),
        rgba(255, 255, 255, 0) 60%)`;
    imgContainer.style.filter = "brightness(0.8)";
};

const setBackgroundBlurHash = () => {
    imgContainer.style.animation = "positionChange 7s infinite alternate";
    imgContainer.style.filter = "saturate(1.5)";
    blurImage();
};

// get background type (either image, blur or blurHash) from browser local storage
const getBackgroundType = () => {
    let backgroundType = localStorage.getItem("backgroundType");
    if (backgroundType === null) {
        backgroundType = "image";
    }
    return backgroundType;
};

// save current backgroundType to browser local storage
const saveBackgroundType = (backgroundType) => {
    localStorage.setItem("backgroundType", backgroundType);
};

// blur image
const blurImage = () => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
        const imgData = blurhash.getImageData(img);
        blurhash
            .encodePromise(imgData, img.width, img.height, 4, 4)
            .then((hash) => {
                return blurhash.decodePromise(hash, img.width, img.height);
            })
            .then((blurhashImgData) => {
                // as image object with promise
                return blurhash.getImageDataAsImageWithOnloadPromise(
                    blurhashImgData,
                    img.width,
                    img.height
                );
            })
            .then((imgObject) => {
                imgContainer.style.backgroundImage = `url(${imgObject.src})`;
            });
    };
    img.src = document.querySelector("#cover").src;
};

const updateBackground = (backgroundType, pictureData) => {
    switch (backgroundType) {
        case "image":
            updateBackgroundImage(pictureData);
            break;
        case "blurHash":
            updateBackgroundBlurHash();
            break;
        default:
            updateBackgroundImage(pictureData);
            break;
    }
};

const updateBackgroundImage = (pictureData) => {
    imgContainer.style.backgroundImage = `url(data:image/png;base64,${pictureData})`;
    // fot initial load
    if (imgContainer.style.filter === "") {
        imgContainer.style.filter = "blur(70px)";
    }
    console.log("background picture set!");
};

const updateBackgroundBlurHash = () => {
    changeStyle("blurHash");    // maybe this?
    console.log("blur image set!");
};

let socket = io();
socket.on("metadata", (metadata) => {
    let title = document.querySelector("#title");
    let album = document.querySelector("#album");
    let artist = document.querySelector("#artist");
    title.textContent = metadata.title;
    album.textContent = metadata.album;
    artist.textContent = metadata.artist;
    console.log("data get!");
});

socket.on("pictureData", (pictureData) => {
    console.log("picture get!");
    let img = document.querySelector("#cover");
    img.src = `data:image/png;base64,` + pictureData;
    console.log("cover picture set!");
    updateBackground(backgroundType, pictureData);
});



socket.on("palette", (palette) => {
    console.log("palette get!");
    applyPallette(palette);
    console.log("palette set!");
});

onInit();