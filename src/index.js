const cube = new Cube();

const connectButton = document.getElementById('connectButton');

const onConnect = () => {
    console.log('connected');
}

const colors = {
    'U': '#E5E521',
    'L': 'blue',
    'F': '#f03031',
    'R': '#2ac44b',
    'B': 'orange',
    'D': 'white'
}

const stickers = [];

for (let i = 0; i < 9; i++) {
    stickers[i] = document.getElementById(`top${i + 1}`)
}
for (let i = 0; i < 9; i++) {
    stickers[i + 9] = document.getElementById(`right${i + 1}`)
}
for (let i = 0; i < 9; i++) {
    stickers[i + 18] = document.getElementById(`front${i + 1}`)
}

/*
cube.randomize();
const asString = cube.asString();
stickers.forEach((sticker, i) => sticker.style.fill = colors[asString[i]])
// */

const onTwist = (turn) => {
    //console.log(turn);

    cube.move(turn);

    const asString = cube.asString();

    console.log(asString);

    stickers.forEach((sticker, i) => sticker.style.fill = colors[asString[i]])

}

const onError = (error) => {
    console.log(error);
}

connectButton.addEventListener('click', () => {
    BtCube.connect(onConnect, onTwist, onError);
})
