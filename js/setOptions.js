const setAUF = document.getElementById('setAUF')
const AUFpicker = document.getElementById('AUF')

const nextCaseImmediately = document.getElementById('nextCaseImmediately')

const getSavedOptions = () => {
    const randomAUF = localStorage.getItem('randomAUF')
    if (randomAUF == 'true') {
        toggleRandomAUF(true)
        document.getElementById('randomAUF').classList.add('checked')
    }

    const setAUFValue = localStorage.getItem('setAUF');
    if (setAUFValue) AUFpicker.value = setAUFValue;

}

const toggleRandomAUF = (value) => {
    cube.randomAUF = value
    localStorage.setItem('randomAUF', value)

    if (value) {
        setAUF.classList.add('disabled')
        AUFpicker.disabled = true
    } else {
        setAUF.classList.remove('disabled')
        AUFpicker.disabled = false
    }

}

const toggleNextImmediate = () => {

}

const initInput = () => {

    const onInput = (element, checked) => {
        switch (element.id) {
            case 'randomAUF':
                toggleRandomAUF(checked)
                break;
            case 'nextCaseImmediately':

                break;
        }
    }

    Array.from(document.querySelectorAll('div.checkbox:not(.selection)')).forEach(checkbox => {
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation()

            if (checkbox.classList.contains('checked')) {
                checkbox.classList.remove('checked')
            } else {
                checkbox.classList.add('checked')
            }

            onInput(checkbox, checkbox.classList.contains('checked'))

        })
    })

    AUFpicker.addEventListener('change', () => {
        cube.setAUF = AUFpicker.value
        localStorage.setItem('setAUF', AUFpicker.value)
    })

}

getSavedOptions()
initInput()