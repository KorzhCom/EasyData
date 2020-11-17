export function mask(input: HTMLInputElement, maskPattern: string) {
    const d = {9: '[0-9]', a: '[a-z]'}
    const mask = maskPattern.split('');

    const keyDownHandler = (e: KeyboardEvent) => {
        // backspace key or delete key
        if (e.keyCode === 8 || e.keyCode === 46) {
            e.preventDefault();

            let mskd = [];
            let startSelection = input.selectionStart;
            if (startSelection == 0)
                return;

            let selection = startSelection;
            let onlyLodash = true;

            for(let index = mask.length - 1; index >= 0; index--) {
                const el = mask[index];

                if (d[el]) {
                    let t = new RegExp(d[el], 'i').test(input.value.charAt(index));

                    if (t && index != startSelection - 1) {
                        onlyLodash = false;
                    }

                    if (index === startSelection - 1)
                        selection--;

                    mskd.push(t && index != startSelection - 1
                        ? input.value.charAt(index) 
                        : '_');

                } 
                else {
                    if (index === selection - 1)
                        selection--;

                    if (startSelection - 1 === index) 
                        startSelection--;

                    mskd.push(el);
                }
            }
            
            input.value = !onlyLodash ? mskd.reverse().join('') : '';
            input.selectionStart = input.selectionEnd = selection < 0 ? 0 : selection;

            const event = document.createEvent('Event')
            event.initEvent('input', true, true);
            input.dispatchEvent(event);
        }
    }

    const keyPressHandler = (e: KeyboardEvent) => {
        const char = String.fromCharCode(e.charCode);
        if (char) {
            e.preventDefault();

            let mskd = [];

            let selectionStart = input.selectionStart
            let selection = selectionStart;

            mask.forEach((el, index) => {
                if (d[el]) {
                    const ch = (index != selectionStart)
                        ? input.value.charAt(index)
                        : char;

                    let t = new RegExp(d[el], 'i').test(ch);

                    mskd.push(t ? ch : '_');

                    if (t && selectionStart === index)
                        selection++;
                } 
                else {
                    mskd.push(el);

                    if (selection === index)
                        selection++;

                    if (selectionStart === index)
                        selectionStart++;
                }
            });
    
            input.value = mskd.join('');
            input.selectionStart = input.selectionEnd = selection;

            const event = document.createEvent('Event')
            event.initEvent('input', true, true);
            input.dispatchEvent(event);
        }
    }

    const inputHandler = (e: Event) => {
    
        if (e.type === 'focus' && input.value !== '') 
            return;

        let mskd = [];

        let startSelection = input.selectionStart;

        mask.forEach((el, index) => {
            if (d[el]) {
                let t = new RegExp(d[el], 'i').test(input.value.charAt(index));
                mskd.push(t ? input.value.charAt(index) : '_');
                
            } else {
                mskd.push(el);
            }
        });

        input.value = mskd.join('');
        input.selectionStart = input.selectionEnd = startSelection;
    }

    input.addEventListener('keydown', keyDownHandler);
    input.addEventListener('keypress', keyPressHandler);
    input.addEventListener('input', inputHandler);
    input.addEventListener('focus', inputHandler);
}