const sets = {
    'ZBLL': zbll
};

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

    algs.forEach((alg, i) => {
        const cubeImgBox = document.createElement('div');
        cubeImgBox.classList.add('cubeImgBox')
        const cubeImg = document.createElement('img');
        cubeImg.classList.add('cubeImg')
        cubeImg.src = `http://www.cubing.net/api/visualcube/?fmt=svg&view=plan&bg=t&case=${alg}`;
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

const initExpandingCards = () => {
    const expandingCardHeads = document.querySelectorAll('.expanding .head');
    Array.from(expandingCardHeads).forEach(head => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('checkbox');

        const countID = head.querySelector('.count').id;
        const [count, total] = getCount(countID);

        if (count == total) {
            checkbox.checked = true;
        }

        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();

            const innerCheckboxes = checkbox.parentNode.parentNode.querySelectorAll('.checkbox');

            if (innerCheckboxes.length > 1) {
                Array.from(innerCheckboxes).forEach(innerBox => {
                    if (innerBox.checked != checkbox.checked) innerBox.click();
                })
            } else {
                const cubeImgs = checkbox.parentNode.parentNode.querySelectorAll('.cubeImgBox');
                Array.from(cubeImgs).forEach(cubeImg => {
                    if (cubeImg.classList.contains('active') != checkbox.checked) cubeImg.click();
                });
            }

        })
        const chevron = document.createElement('div');
        chevron.classList.add('chevron');
        chevron.innerHTML = 'v';
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
                chevron.innerHTML = 'v';
            } else {
                body.classList.add('visible');
                chevron.innerHTML = 'ʌ';
            }
        });
    })
}

let selected = [];
let selectedCount = {};
getSelected()
initSets(sets);
initExpandingCards();



