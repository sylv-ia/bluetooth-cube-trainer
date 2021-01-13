const setSelecion = document.getElementById('setSelection');

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

const selectedStorage = localStorage.getItem('selected');
const selected = selectedStorage ? selectedStorage.split(',') : [];
const selectedCountStorage = localStorage.getItem('selectedCount');
const selectedCount = selectedCountStorage ? JSON.parse(selectedCountStorage) : {};

const setCounters = () => {

}

const selectAlg = (code) => {
    selected.push(code);
    const parts = code.split('-');
    let section = selectedCount;
    let codeSoFar = '';
    parts.slice(0, -1).forEach((part, i) => {
        section[part]['count']++

        codeSoFar += (i == 0 ? part : '-' + part);
        Array.from(document.querySelectorAll(`.${codeSoFar}`)).forEach(element => {
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
        Array.from(document.querySelectorAll(`.${codeSoFar}`)).forEach(element => {
            element.innerHTML = section[part]['count'];
        })

        section = section[part]['subs']
    })
    localStorage.setItem('selected', selected);
    localStorage.setItem('selectedCount', JSON.stringify(selectedCount));
}

const createElementWithClasses = (elementName, classArr) => {
    const element = document.createElement(elementName);
    classArr.forEach(className => {
        element.classList.add(className);
    })
    return element;
}

const initSets = () => {
    Object.entries(sets).forEach(([title, set]) => {
        if (!selectedCount[title]) selectedCount[title] = { 'count': 0, 'total': 0, 'subs': {} };
        let totalTotalCounter = 0;
        const setWrapper = document.createElement('div');
        setWrapper.classList.add('set');
        setWrapper.classList.add('expanding');
        const titleDiv = document.createElement('div');
        titleDiv.classList.add('setTitle');
        titleDiv.classList.add('head');
        titleDiv.innerHTML = title;
        setWrapper.append(titleDiv);

        Object.entries(set).forEach(([name, subset]) => {
            if (!selectedCount[title]['subs'][name]) selectedCount[title]['subs'][name] = { 'count': 0, 'total': 0, 'subs': {} };

            let totalCounter = 0;
            const subNode = document.createElement('div');
            const subWrapper = document.createElement('div');
            const subTitle = document.createElement('div');
            const totalAlgCount = document.createElement('div');
            subNode.classList.add('expanding');
            subNode.classList.add('subWrapper');
            subTitle.classList.add('head');
            subTitle.classList.add('subTitleBox');
            subTitle.innerHTML = `<div class="subTitle">${name}</div>`;
            totalAlgCount.classList.add('algCount');
            subNode.append(subTitle);
            subWrapper.classList.add('body');
            subWrapper.classList.add('subBody');

            Object.entries(subset).forEach(([subName, algs]) => {
                if (!selectedCount[title]['subs'][name]['subs'][subName]) selectedCount[title]['subs'][name]['subs'][subName] = { 'count': 0, 'total': 0, 'subs': {} };

                const head = document.createElement('div');
                const body = document.createElement('div');
                const algCount = document.createElement('div');
                head.classList.add('head');
                head.classList.add('subsubHead');
                head.innerHTML = `<div class="subTitle">${subName}</div>`;
                body.classList.add('body');
                body.classList.add('subsubBody');
                algCount.classList.add('algCount');
                let algCounter = 0;

                const cubesWrapper = document.createElement('div');
                cubesWrapper.classList.add('cubesWrapper')

                algs.forEach((alg, i) => {
                    algCounter++;
                    const cubeImgBox = document.createElement('div');
                    cubeImgBox.classList.add('cubeImgBox')
                    const cubeImg = document.createElement('img');
                    cubeImg.classList.add('cubeImg')
                    cubeImg.src = `http://www.cubing.net/api/visualcube/?fmt=svg&view=plan&bg=t&case=${alg}`;
                    cubeImgBox.append(cubeImg);
                    const code = `${title}-${name}-${subName}-${i}`;
                    cubeImgBox.addEventListener('click', () => {
                        if (cubeImgBox.classList.contains('active')) {
                            cubeImgBox.classList.remove('active');
                            removeAlg(code)
                        } else {
                            cubeImgBox.classList.add('active');
                            selectAlg(code);
                        }
                    })

                    cubesWrapper.append(cubeImgBox);
                    if (selected.includes(code)) {
                        window.onload = () => {
                            cubeImgBox.click();

                        }
                    }

                })
                body.append(cubesWrapper);

                selectedCount[title]['subs'][name]['subs'][subName]['total'] = algCounter;
                algCount.innerHTML = `<div class='num ${title}-${name}-${subName}'>0</div><div class='slash'>/</div><div class='total'>${algCounter}</div>`;
                totalCounter += algCounter;
                head.append(algCount);
                const sub = document.createElement('div');
                sub.classList.add('expanding');
                sub.classList.add('subsubWrapper');
                sub.appendChild(head);
                sub.appendChild(body);
                subWrapper.append(sub);

            })

            selectedCount[title]['subs'][name]['total'] = totalCounter;
            totalAlgCount.innerHTML = `<div class='num ${title}-${name}'>0</div><div class='slash'>/</div><div class='total'>${totalCounter}</div>`;
            totalTotalCounter += totalCounter;

            subTitle.append(totalAlgCount);
            subNode.append(subWrapper);
            setWrapper.append(subNode);
        })

        selectedCount[title]['total'] = totalTotalCounter;
        // add total zbll counter here
        setSelecion.append(setWrapper);


    })
}

const initExpandingCards = () => {
    const expandingCardHeads = document.querySelectorAll('.expanding .head');
    Array.from(expandingCardHeads).forEach(head => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('checkbox');
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
            } else {
                body.classList.add('visible');
            }
        });
    })
}

initSets();
initExpandingCards();



