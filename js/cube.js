const randomFromArray = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
}

const cube = {
    colors: {
        'U': '#E5E521',
        'L': 'blue',
        'F': '#f03031',
        'R': '#2ac44b',
        'B': 'orange',
        'D': 'white'
    },
    init: () => {
        cube.stickers = [];

        for (let i = 0; i < 9; i++) {
            cube.stickers[i] = document.getElementById(`top${i + 1}`)
        }
        for (let i = 0; i < 9; i++) {
            cube.stickers[i + 9] = document.getElementById(`right${i + 1}`)
        }
        for (let i = 0; i < 9; i++) {
            cube.stickers[i + 18] = document.getElementById(`front${i + 1}`)
        }

        cube.cube = new Cube();

    },
    setUpCase: (turns, code = '') => {
        cube.cube.move(Cube.inverse(turns));
        cube.updateSVG();
        cube.currentCase = turns;
        cube.currentCode = code;
        cube.currentSet = code.split('-')[0];
    },
    reset: () => {
        cube.cube.identity();
        cube.updateSVG();
    },
    move: (turns) => {
        cube.cube.move(turns)
        cube.updateSVG();
        cube.history = [...cube.history, ...turns.split(' ')];
    },
    updateSVG: () => {
        const asString = cube.cube.asString();
        cube.stickers.forEach((sticker, i) => sticker.style.fill = cube.colors[asString[i]]);
    },
    isSolved: () => (cube.cube.isSolved()),
    history: [],
    clearHistory: () => {
        cube.history = [];
    },
    checkCommands: () => {
        const history = cube.history.slice().reverse();

        if (history[0] == 'U'
            && history[1] == 'U'
            && history[2] == 'U'
            && history[3] == 'U'
        ) {
            cube.reset();
            cube.setUpCase(cube.currentCase, cube.currentCode);
            cube.clearHistory();
            setMessage('case reset')
            setTimeout(() => {
                clearMessage();
            }, 500);
            return;
        } else if (history[0] == 'D'
            && history[1] == 'D'
            && history[2] == 'D'
            && history[3] == 'D'
        ) {
            cube.clearHistory();
            cube.reset();
            setMessage('next case')
            cube.randomFromSelected();
            setTimeout(() => {
                clearMessage();
            }, 500);
        }
    },
    randomAUF: false,
    setAUF: '',
    nextImmediate: true,
    randomFromSelected: () => {
        cube.reset()
        const algCode = randomFromArray(selected);
        const randomU = ' U '.repeat(Math.floor(Math.random() * 4));
        const alg = getAlg(algCode);
        let auf = ''

        if (cube.randomAUF) {
            auf = randomFromArray(['', ' U ', ' U\' ', ' U2 ']);
        } else if (cube.setAUF) {
            auf = cube.setAUF == 'none' ? '' : ` ${cube.setAUF} `
        }

        cube.setUpCase(auf + alg + randomU, algCode);
        cube.wasSolved = false
    },
    wasSolved: true,
    onTwist: (turn) => {
        cube.move(turn);

        if ((setsConfig[cube.currentSet]
            && setsConfig[cube.currentSet].solveState
            && matchState(cube.cube, setsConfig[cube.currentSet].solveState))
            || (!cube.wasSolved && cube.isSolved())) {
            cube.onSolved()
        } else {
            cube.checkCommands();
        }
    },
    onSolved: () => {
        cube.wasSolved = true;
        setMessage('solved!', 1);
        document.getElementById('tempCounter').innerHTML++;
        cube.clearHistory();
        setTimeout(() => {
            clearMessage();
            if (cube.nextImmediate) cube.randomFromSelected();
        }, 500);
    }
}

const setMessage = (message, positive) => {
    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;
    console.log(positive != null ? (positive ? 'lime' : 'red') : 'white')
    messageDiv.style.color = positive != null ? (positive ? 'lime' : 'red') : 'white'

}

const clearMessage = () => {
    const messageDiv = document.getElementById('message');
    messageDiv.style.opacity = 0;
    messageDiv.innerHTML = '.';
}

cube.init();

if (selected.length != 0) {
    cube.randomFromSelected();
}

const connectButton = document.getElementById('connectButton');

const updateBattery = async () => {
    const level = await BtCube.getBattery();
    document.getElementById('battery').textContent = level + '%';
}

const onConnect = async () => {
    connectButton.innerHTML = 'connected';
    connectButton.style.borderColor = 'lime';
    updateBattery()
    setInterval(() => updateBattery(), 60 * 1000)
}

const matchState = (cube, pattern) => {
    const state = cube.asString()
    console.log(state)
    for (let i = 0; i < pattern.length; i++) {
        if (pattern[i] != '.' && pattern[i] != state[i]) return false;
    }
    return true;
}

const onError = (error) => {
    console.log(error);
    connectButton.innerHTML = 'connect';
    connectButton.style.borderColor = 'white';
}

connectButton.addEventListener('click', () => {
    BtCube.connect(onConnect, (turn) => cube.onTwist(turn), onError);
    connectButton.innerHTML = 'connecting...';
})
