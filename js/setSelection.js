const sets = {
    'ZBLL': zbll,
    'ZBLS': zbls
};

const setsConfig = {
    'ZBLS': {
        'img': `http://cube.rider.biz/visualcube.php?fmt=png&stage=vh&bg=t&case=$alg`,
        'solveState': '.U.U.U.U'
    }
}

const getAlg = (code) => {
    const parts = code.split('-');
    let alg = sets[parts[0]];
    parts.slice(1).forEach(sub => {
        alg = alg[sub];
    })
    return alg;
}

const getSelected = () => {
    const selectedStorage = localStorage.getItem('selected');
    selected = selectedStorage ? selectedStorage.split(',') : [];
    const selectedCountStorage = localStorage.getItem('selectedCount');
    selectedCount = selectedCountStorage ? JSON.parse(selectedCountStorage) : {};
}

const updateCountColors = (element, counter) => {
    if (counter.count == counter.total) {
        element.classList.remove('some');
        element.classList.add('all');
    } else if (counter.count > 0) {
        element.classList.remove('all');
        element.classList.add('some');
    } else {
        element.classList.remove('all');
        element.classList.remove('some');
    }
}

const selectAlg = (code) => {
    selected.push(code);
    const parts = code.split('-');
    let section = selectedCount;
    let codeSoFar = '';
    parts.slice(0, -1).forEach((part, i) => {
        section[part]['count']++

        codeSoFar += (i == 0 ? part : '-' + part);
        Array.from(document.querySelectorAll(`#${codeSoFar}`)).forEach(element => {
            element.innerHTML = section[part]['count'];
            updateCountColors(element.parentNode.parentNode, section[part]);
        })

        section = section[part]['subs']
    })
    localStorage.setItem('selected', selected);
    localStorage.setItem('selectedCount', JSON.stringify(selectedCount));
}

const removeAlg = (code) => {
    selected.splice(selected.indexOf(code), 1);
    const parts = code.split('-');
    let section = selectedCount;
    let codeSoFar = '';
    parts.slice(0, -1).forEach((part, i) => {
        section[part]['count']--

        codeSoFar += (i == 0 ? part : '-' + part);
        Array.from(document.querySelectorAll(`#${codeSoFar}`)).forEach(element => {
            element.innerHTML = section[part]['count'];
            updateCountColors(element.parentNode.parentNode, section[part]);
        })

        section = section[part]['subs']
    })
    localStorage.setItem('selected', selected);
    localStorage.setItem('selectedCount', JSON.stringify(selectedCount));
}

const createElementWithClasses = (elementName, classArr, inner = '') => {
    const element = document.createElement(elementName);
    classArr.forEach(className => {
        element.classList.add(className);
    })
    element.innerHTML = inner;
    return element;
}

const createSetCounter = (set, count) => {
    const counter = { 'count': 0, 'total': 0, 'subs': {} };
    count = 0
    Object.entries(set).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            counter['subs'][key] = { 'count': 0, 'total': value.length }
            count += value.length;
        } else if (value != null) {
            const [child, increment] = createSetCounter(value, count);
            counter['subs'][key] = child;
            count += increment;
        }
    })
    counter['total'] = count;
    return [counter, count]
}

const createCubeImgElements = (algs, code = '') => {
    const cubesWrapper = document.createElement('div');
    cubesWrapper.classList.add('cubesWrapper')

    const codeParts = code.split('-');

    algs.forEach((alg, i) => {
        const cubeImgBox = document.createElement('div');
        cubeImgBox.classList.add('cubeImgBox')
        const cubeImg = document.createElement('img');
        cubeImg.classList.add('cubeImg')
        if (setsConfig[codeParts[0]]) {
            cubeImg.src = setsConfig[codeParts[0]].img.replace('$alg', alg);
        } else {
            cubeImg.src = `http://www.cubing.net/api/visualcube/?fmt=svg&view=plan&bg=t&case=${alg}`;
        }
        cubeImgBox.append(cubeImg);
        const algCode = `${code}-${i}`;
        if (selected.includes(algCode)) cubeImgBox.classList.add('active');

        cubeImgBox.addEventListener('click', () => {
            if (cubeImgBox.classList.contains('active')) {
                cubeImgBox.classList.remove('active');
                removeAlg(algCode)
            } else {
                cubeImgBox.classList.add('active');
                selectAlg(algCode);
            }
        })

        cubesWrapper.append(cubeImgBox);

    })
    return cubesWrapper;
}

const getCount = (code) => {
    const parts = code.split('-');
    let section = selectedCount;
    parts.slice(0, -1).forEach(part => {
        section = section[part]['subs']
    })
    return [section[parts.slice(-1)].count, section[parts.slice(-1)].total]
}

const createSetElements = (sub, i = 0, code = '') => {
    const wrapper = createElementWithClasses('div', ['wrapper', 'expanding'])
    if (i) wrapper.classList.add('body')
    Object.entries(sub).forEach(([key, value]) => {
        const subCode = i == 0 ? key : `${code}-${key}`;

        const subWrapper = createElementWithClasses('div', ['wrapper', 'expanding'])
        const head = createElementWithClasses('div', ['head'], `<div class="subTitle">${key}</div>`);
        const [count, total] = getCount(subCode);
        const counter = createElementWithClasses('div', ['algCount'], `<div id='${subCode}' class='count'>${count}</div>
                                                                        <div class='slash'>/</div>
                                                                        <div class='total'>${total}</div>`)
        updateCountColors(head, { count, total })
        head.append(counter);
        subWrapper.append(head);

        if (!Array.isArray(value)) {
            subWrapper.append(createSetElements(value, 1, subCode));
        } else {
            const body = createElementWithClasses('div', ['body']);
            body.append(createCubeImgElements(value, subCode))
            subWrapper.append(body);
        }

        wrapper.append(subWrapper)

    })

    return wrapper;
}

function isObjectEmpty(obj) {
    for (const key in obj) {
        return false;
    }
    return true;
}

const initSets = (sets) => {
    const setSelecion = document.getElementById('setSelection');
    Object.entries(sets).forEach(([key, value]) => {
        if (!selectedCount[key]) selectedCount[key] = createSetCounter(value)[0];
    })
    const setsElements = createSetElements(sets);
    setSelecion.append(setsElements);
}

const chevronElement = () => {
    const chevron = createElementWithClasses('img', ['chevron']);
    chevron.src = './img/down-chevron.svg'
    return chevron;
}

const initExpandingCards = () => {
    const expandingCardHeads = document.querySelectorAll('.expanding .head');
    Array.from(expandingCardHeads).forEach(head => {
        const checkbox = document.createElement('div');
        checkbox.type = 'checkbox';
        checkbox.classList.add('checkbox');

        const countID = head.querySelector('.count').id;
        const [count, total] = getCount(countID);

        if (count == total) {
            checkbox.checked = true;
        }

        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();

            if (checkbox.classList.contains('checked')) {
                checkbox.classList.remove('checked')
            } else {
                checkbox.classList.add('checked')
            }

            const innerCheckboxes = checkbox.parentNode.parentNode.querySelectorAll('.checkbox');

            if (innerCheckboxes.length > 1) {
                Array.from(innerCheckboxes).forEach(innerBox => {
                    if (innerBox.classList.contains('checked') != checkbox.classList.contains('checked')) innerBox.click();
                })
            } else {
                const cubeImgs = checkbox.parentNode.parentNode.querySelectorAll('.cubeImgBox');
                Array.from(cubeImgs).forEach(cubeImg => {
                    if (cubeImg.classList.contains('active') != checkbox.classList.contains('checked')) cubeImg.click();
                });
            }

        })
        const chevron = chevronElement();
        head.prepend(checkbox);
        head.append(chevron);
        head.addEventListener('mousedown', function (event) {
            if (event.detail > 1) {
                event.preventDefault();
            }
        }, false);
        head.addEventListener('click', () => {
            const body = head.parentNode.querySelector('.body');
            if (body.classList.contains('visible')) {
                body.classList.remove('visible');
                chevron.classList.remove('up')
            } else {
                body.classList.add('visible');
                chevron.classList.add('up')
            }
        });
    })
}

let selected = [];
let selectedCount = {};
getSelected()
initSets(sets);
initExpandingCards();