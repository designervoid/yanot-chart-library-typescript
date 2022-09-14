// https://t.me/contest/58

export const TChart = (container: HTMLDivElement) => {
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    function formatDate(time: string | number | Date, short: boolean) {
        const date = new Date(time);
        const s = `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
        if (short) return s;
        return `${DAY_NAMES[date.getDay()]}, ${s}`;
    }

    function formatNumber(n: number, short: boolean | undefined) {
        const abs = Math.abs(n);
        if (abs > 1000000000 && short) return `${(n / 1000000000).toFixed(2)}B`;
        if (abs > 1000000 && short) return `${(n / 1000000).toFixed(2)}M`;
        if (abs > 1000 && short) return `${(n / 1000).toFixed(1)}K`;

        if (abs > 1) {
            const s = abs.toFixed(0);
            let formatted = n < 0 ? '-' : '';
            for (let i = 0; i < s.length; i++) {
                formatted += s.charAt(i);
                if ((s.length - 1 - i) % 3 === 0) formatted += ' ';
            }
            return formatted;
        }

        return n.toString()
    }

    function createElement(parent: { appendChild: (arg0: any) => void; }, tag: string, clazz?: string) {
        const element = document.createElement(tag);
        if (clazz) element.classList.add(clazz);
        parent.appendChild(element);
        return element;
    }

    function removeAllChild(parent: { firstChild: any; removeChild: (arg0: any) => void; }) {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    }

    function addEventListener(element: Document | HTMLInputElement, event: string, listener: { ({ clientX, clientY }: { clientX: any; clientY: any; }): void; ({ touches }: { touches: any; }): void; ({ clientX, clientY }: { clientX: any; clientY: any; }): void; ({ touches }: { touches: any; }): void; (e: any): void; (e: any): void; (e: any): void; ({ currentTarget }: { currentTarget: any; }): void; }) {
        element.addEventListener(event, listener, false);
    }

    function removeEventListener(element: Document | HTMLInputElement, event: string, listener: { ({ clientX, clientY }: { clientX: any; clientY: any; }): void; ({ touches }: { touches: any; }): void; ({ clientX, clientY }: { clientX: any; clientY: any; }): void; ({ touches }: { touches: any; }): void; (e: any): void; (e: any): void; (e: any): void; }) {
        element.removeEventListener(event, listener);
    }

    function createAnimation(value: number, duration: number) {
        return {
            fromValue: value,
            toValue: value,
            value,
            startTime: 0,
            duration,
            delay: 0
        };
    }

    function play(anim: { fromValue: any; toValue: any; value: any; startTime: any; duration?: any; delay?: number; }, toValue: number) {
        anim.startTime = time;
        anim.toValue = toValue;
        anim.fromValue = anim.value;
    }

    function updateAnimation(anim: { fromValue: any; toValue: any; value: any; startTime: any; duration: any; delay: any; }) {
        if (anim.value === anim.toValue) return false;
        let progress = ((time - anim.startTime) - anim.delay) / anim.duration;
        if (progress < 0) progress = 0;
        if (progress > 1) progress = 1;
        const ease = -progress * (progress - 2);
        anim.value = anim.fromValue + (anim.toValue - anim.fromValue) * ease;
        return true;
    }

    const canvas = createElement(container, 'canvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d');
    const checksContainer = createElement(container, 'div', 'checks');
    const popup = createElement(container, 'div', 'popup');
    popup.style.display = 'none';
    let popupTitle: { innerText: string; } | null = null;

    let colors: { previewAlpha: any; preview: any; previewBorderAlpha: any; previewBorder: any; line: any; zeroLine: any; selectLine: any; circleFill: any; text: any; } | null = null;
    let data: { types?: any; columns: string | any[]; names?: { [x: string]: any; }; colors?: { [x: string]: any; }; } | null = null;
    let xColumn: { data: any; min: any; max: any; name?: any; alpha?: { fromValue: any; toValue: any; value: any; startTime: number; duration: any; delay: number; }; previewAlpha?: { fromValue: any; toValue: any; value: any; startTime: number; duration: any; delay: number; }; } | null = null;
    let columns: any[] | null = null;
    let popupColumns: any[] | null = null;
    let popupValues: any[] | null = null;

    let width = 0;
    let height = 0;
    let mainHeight = 0;

    let textCountX = 6;
    let textCountY = 6;

    const SCALE_DURATION = 400;
    const TEXT_X_FADE_DURATION = 200;

    const pixelRatio = window.devicePixelRatio;
    const previewMarginTop = 32 * pixelRatio;
    const previewHeight = 38 * pixelRatio;
    const mouseArea = 20 * pixelRatio;
    const previewUiW = 4 * pixelRatio;
    const previewUiH = 1 * pixelRatio;
    const lineWidth = 1 * pixelRatio;
    const previewLineWidth = 1 * pixelRatio;
    const mainLineWidth = 2 * pixelRatio;
    const circleRadius = 3 * pixelRatio;
    const circleLineWidth = 4 * pixelRatio;
    const font = `${10 * pixelRatio}px Arial`;
    const textYMargin = -6 * pixelRatio;
    const textXMargin = 16 * pixelRatio;
    const textXWidth = 30 * pixelRatio;
    const textYHeight = 45 * pixelRatio;
    const mainPaddingTop = 21 * pixelRatio;
    const paddingHor = 11 * pixelRatio;
    const popupLeftMargin = -25;
    const popupTopMargin = !('ontouchstart' in window) ? 8 : 40;

    let intervalX = 0;
    const forceMinY = 0;

    let mainMinX = 0;
    let mainMinY = 0;
    let mainMaxX = 0;
    let mainMaxY = 0;
    let mainRangeX = 0;
    const mainRangeY = createAnimation(0, SCALE_DURATION);
    let mainScaleX = 1;
    let mainScaleY = 1;
    let mainOffsetX = 0;
    let mainOffsetY = 0;

    let mainMinI = 0;
    let mainMaxI = 0;

    let previewMinX = 0;
    let previewMinY = 0;
    let previewMaxX = 0;
    let previewMaxY = 0;
    let previewRangeX = 0;
    const previewRangeY = createAnimation(0, SCALE_DURATION);
    let previewScaleX = 1;
    let previewScaleY = 1;
    let previewOffsetX = 0;
    let previewOffsetY = 0;

    let selectX = 0;
    let selectY = 0;
    let selectI = 0;

    const oldTextX = {delta: 1, alpha: createAnimation(0, TEXT_X_FADE_DURATION)};
    const newTextX = {delta: 1, alpha: createAnimation(0, TEXT_X_FADE_DURATION)};
    const oldTextY = {delta: 1, alpha: createAnimation(0, SCALE_DURATION)};
    const newTextY = {delta: 1, alpha: createAnimation(0, SCALE_DURATION)};

    let needRedrawMain = true;
    let needRedrawPreview = true;

    let canvasBounds = {left: 0, top: 0, width: 0, height: 0};

    let mouseX = 0;
    let mouseY = 0;
    let newMouseX = 0;
    let newMouseY = 0;
    let mouseStartX = 0;
    let mouseRange = 0;
    let previewUiMin = 0;
    let previewUiMax = 0;

    var time = 0;

    const NONE = 0;
    const DRAG_START = 1;
    const DRAG_END = 2;
    const DRAG_ALL = 3;

    let mouseMode = NONE;

    function onMouseDown({clientX, clientY}: any) {
        newMouseX = mouseX = (clientX - canvasBounds.left) * pixelRatio;
        newMouseY = mouseY = (clientY - canvasBounds.top) * pixelRatio;

        const inPreview = (mouseY > height - previewHeight) && (mouseY < height) && (mouseX > -mouseArea) && (mouseX < width + mouseArea);
        if (inPreview) {
            if (mouseX > previewUiMin - mouseArea && mouseX < previewUiMin + mouseArea / 2) {
                mouseMode = DRAG_START;
            } else if (mouseX > previewUiMax - mouseArea / 2 && mouseX < previewUiMax + mouseArea) {
                mouseMode = DRAG_END;
            } else if (mouseX > previewUiMin + mouseArea / 2 && mouseX < previewUiMax - mouseArea / 2) {
                mouseMode = DRAG_ALL;

                mouseStartX = previewUiMin - mouseX;
                mouseRange = mainMaxX - mainMinX;
            }
        }
    }

    function onTouchDown({touches}: any) {
        onMouseDown(touches[0])
    }

    function onMouseMove({clientX, clientY}: any) {
        newMouseX = (clientX - canvasBounds.left) * pixelRatio;
        newMouseY = (clientY - canvasBounds.top) * pixelRatio;
    }

    function onTouchMove({touches}: any) {
        onMouseMove(touches[0])
    }

    function onMouseUp(e: any) {
        mouseMode = NONE;
    }

    addEventListener(document, 'mousedown', onMouseDown);
    addEventListener(document, 'touchstart', onTouchDown);
    addEventListener(document, 'mousemove', onMouseMove);
    addEventListener(document, 'touchmove', onTouchMove);
    addEventListener(document, 'mouseup', onMouseUp);
    addEventListener(document, 'touchend', onMouseUp);
    addEventListener(document, 'touchcancel', onMouseUp);

    let destroyed = false;

    const destroy = () => {
        destroyed = true;
        removeAllChild(container);
        removeEventListener(document, 'mousedown', onMouseDown);
        removeEventListener(document, 'touchstart', onTouchDown);
        removeEventListener(document, 'mousemove', onMouseMove);
        removeEventListener(document, 'touchmove', onTouchMove);
        removeEventListener(document, 'mouseup', onMouseUp);
        removeEventListener(document, 'touchend', onMouseUp);
        removeEventListener(document, 'touchcancel', onMouseUp);
    };

    requestAnimationFrame(render);

    function screenToMainX(screenX: number) {
        return (screenX - mainOffsetX) / mainScaleX;
    }

    function mainToScreenX(x: number) {
        return x * mainScaleX + mainOffsetX;
    }

    function mainToScreenY(y: number) {
        return y * mainScaleY + mainOffsetY;
    }

    function screenToPreviewX(screenX: number) {
        return (screenX - previewOffsetX) / previewScaleX;
    }

    function previewToScreenX(x: number) {
        return x * previewScaleX + previewOffsetX;
    }

    const setColors = (newColors: any) => {
        colors = newColors;
        needRedrawMain = needRedrawPreview = true;
    };

    const setData = (newData: { columns: string | any[]; }) => {
        function findNameOfX(types: { [x: string]: string; }) {
            for (const name in types) {
                if (types[name] === 'x') return name;
            }
            return null;
        }

        popupColumns = [];
        popupValues = [];
        columns = [];

        removeAllChild(checksContainer);
        removeAllChild(popup);
        popupTitle = createElement(popup, 'div', 'title');

        if (newData.columns.length < 2 || newData.columns[0].length < 3) {
            data = null;
            return;
        }

        data = newData;
        const nameOfX = findNameOfX(data.types);

        for (let c = 0; c < data.columns.length; c++) {
            const columnData = data.columns[c];
            const name = columnData[0];
            const column = {
                name,
                data: columnData,
                min: forceMinY !== undefined ? forceMinY : columnData[1],
                max: columnData[1],
                alpha: createAnimation(1, SCALE_DURATION),
                previewAlpha: createAnimation(1, SCALE_DURATION / 2)
            };

            if (name === nameOfX) {
                column.min = columnData[1];
                column.max = columnData[columnData.length - 1];
                xColumn = column
            } else {
                for (let i = 2; i < columnData.length; i++) {
                    const value = columnData[i];
                    if (value < column.min) column.min = value;
                    else if (value > column.max) column.max = value;
                }
                columns.push(column);

                // create checkbox
                

                if (data && data.columns.length > 2 && data.names) {
                    const label = createElement(checksContainer, 'label', 'checkbox');
                    label.innerText = data.names[name];

                    const input = createElement(label, 'input') as HTMLInputElement;
                    input.setAttribute('data-id', (columns.length - 1).toString());
                    input.checked = true;
                    input.type = 'checkbox';
                    addEventListener(input, 'change', ({currentTarget}) => {
                        const id = currentTarget.getAttribute('data-id');
                        const checked = currentTarget.checked;
                        if (columns && columns[id]) {
                            const checkedColumn = columns[id];
                            checkedColumn.saveScaleY = previewScaleY;
                            checkedColumn.saveOffsetY = previewOffsetY;
    
                            play(checkedColumn.alpha, checked ? 1 : 0);
    
                            checkedColumn.previewAlpha.delay = checked ? SCALE_DURATION / 2 : 0;
                            play(checkedColumn.previewAlpha, checked ? 1 : 0);
    
                            needRedrawMain = needRedrawPreview = true;
                            updatePreviewRangeY();
                            updateMainRangeY();
                        }
                    });

                    if (data.colors) {
                        let span = createElement(label, 'span', 'circle');
                        span.style.borderColor = data.colors[name];

                        span = createElement(label, 'span', 'symbol');
                    }
                }

                // create popup column

                if (data.names && data.colors) {
                    const popupColumn = createElement(popup, 'div', 'column');
                    popupColumn.style.color = data.colors[name];
                    popupColumns.push(popupColumn);

                    const popupValue = createElement(popupColumn, 'div', 'value');
                    popupValues.push(popupValue);

                    const popupLabel = createElement(popupColumn, 'div', 'label');
                    popupLabel.innerText = data.names[name];
                }
            }
        }

        if (xColumn) {
            intervalX = xColumn.data[2] - xColumn.data[1];
            previewMinX = xColumn.min;
            previewMaxX = xColumn.max;
            previewRangeX = previewMaxX - previewMinX;
        }

        onResize();
        previewRangeY.value = previewRangeY.toValue;

        setMainMinMax(previewMaxX - previewRangeX / 4, previewMaxX);
        mainRangeY.value = mainRangeY.toValue;

        needRedrawMain = needRedrawPreview = true;
    };

    function updateMainRangeX() {
        mainRangeX = mainMaxX - mainMinX;
        mainScaleX = (width - paddingHor * 2) / mainRangeX;
        mainOffsetX = -mainMinX * mainScaleX + paddingHor;

        let delta = mainRangeX / intervalX / textCountX;

        let pow = 1;
        while (pow <= delta) pow *= 2;
        delta = pow;

        if (delta < newTextX.delta) { // add dates
            oldTextX.delta = newTextX.delta;
            oldTextX.alpha.value = 1;
            play(oldTextX.alpha, 1);

            newTextX.delta = delta;
            newTextX.alpha.value = 0;
            play(newTextX.alpha, 1);
        } else if (delta > newTextX.delta) {  // remove dates
            oldTextX.delta = newTextX.delta;
            oldTextX.alpha.value = newTextX.alpha.value;
            play(oldTextX.alpha, 0);

            newTextX.delta = delta;
            newTextX.alpha.value = 1;
            play(newTextX.alpha, 1);
        }
    }

    function updateMainRangeY() {
        mainMinY = forceMinY !== undefined ? forceMinY : Number.MAX_VALUE;
        mainMaxY = Number.MIN_VALUE;

        if (columns) {
            for (let c = 0; c < columns.length; c++) {
                const column = columns[c];
                if (column.alpha.toValue === 0) continue;
                for (let i = mainMinI; i < mainMaxI; i++) {
                    const y = column.data[i];
                    if (y < mainMinY) mainMinY = y;
                    if (y > mainMaxY) mainMaxY = y;
                }
            }
        }

        if (mainMaxY === Number.MIN_VALUE) mainMaxY = 1;

        const range = mainMaxY - mainMinY;
        if (mainRangeY.toValue !== range) {
            play(mainRangeY, range);

            oldTextY.delta = newTextY.delta;
            oldTextY.alpha.value = newTextY.alpha.value;
            play(oldTextY.alpha, 0);

            newTextY.delta = Math.floor(mainRangeY.toValue / textCountY);
            newTextY.alpha.value = 1 - oldTextY.alpha.value;
            play(newTextY.alpha, 1);
        }
    }

    function updatePreviewRangeX() {
        previewScaleX = (width - paddingHor * 2) / previewRangeX;
        previewOffsetX = -previewMinX * previewScaleX + paddingHor;
    }

    function updatePreviewRangeY() {
        previewMinY = forceMinY !== undefined ? forceMinY : Number.MAX_VALUE;
        previewMaxY = Number.MIN_VALUE;

        if (columns) {
            for (let c = 0; c < columns.length; c++) {
                const column = columns[c];
                if (column.alpha.toValue === 0) continue;
                if (column.min < previewMinY) previewMinY = column.min;
                if (column.max > previewMaxY) previewMaxY = column.max;
            }
        }

        if (previewMaxY === Number.MIN_VALUE) previewMaxY = 1;

        play(previewRangeY, previewMaxY - previewMinY);
    }

    function setMainMinMax(min: number | null, max: number | null) {
        let changed = false;

        if (min !== null && mainMinX !== min) {
            mainMinX = min;
            mainMinI = Math.floor((mainMinX - previewMinX - paddingHor / mainScaleX) / intervalX) + 1;
            if (mainMinI < 1) mainMinI = 1;
            changed = true;
        }

        if (max !== null && mainMaxX !== max) {
            mainMaxX = max;
            mainMaxI = Math.ceil((mainMaxX - previewMinX + paddingHor / mainScaleX) / intervalX) + 2;
            if (xColumn && mainMaxI > xColumn.data.length) mainMaxI = xColumn.data.length;
            changed = true;
        }

        if (changed) {
            updateMainRangeX();
            updateMainRangeY();
            needRedrawPreview = needRedrawMain = true;
        }
    }

    function select(mouseX: number | null, mouseY: number | null) {
        if (selectX !== mouseX && mouseX) {
            selectX = mouseX;
            needRedrawMain = true;

            if (selectX === null) {
                selectI = -1;
                popup.style.display = 'none';
            } else {
                popup.style.display = 'block';

                let newSelectI = Math.round((mouseX - previewMinX) / intervalX) + 1;
                if (newSelectI < 1) newSelectI = 1;
                if (xColumn && newSelectI > xColumn.data.length - 1) newSelectI = xColumn.data.length - 1;

                if (selectI !== newSelectI && xColumn && popupTitle && columns && popupColumns && popupValues) {
                    selectI = newSelectI;
                    const x = xColumn.data[selectI];
                    popupTitle.innerText = formatDate(x, false);

                    for (let c = 0; c < columns.length; c++) {
                        const yColumn = columns[c];
                        const y = yColumn.data[selectI];
                        popupColumns[c].style.display = yColumn.alpha.toValue === 0 ? 'none' : 'block';
                        popupValues[c].innerText = formatNumber(y, false);
                    }
                }

                var popupBounds = popup.getBoundingClientRect();
                let popupX = (mainToScreenX(mouseX) / pixelRatio) + popupLeftMargin;
                if (popupX < 0) popupX = 0;
                if (popupX + popupBounds.width > canvasBounds.width) popupX = canvasBounds.width - popupBounds.width;
                popup.style.left = `${popupX}px`;
            }
        }

        if (selectY !== mouseY && mouseY) {
            selectY = mouseY;
            popupBounds = popup.getBoundingClientRect();
            let popupY = mouseY / pixelRatio + 39 - popupBounds.height - popupTopMargin;
            if (popupY < 0) popupY = mouseY / pixelRatio + 39 + popupTopMargin;
            popup.style.top = `${popupY}px`;
        }
    }

    function onResize() {
        canvasBounds = canvas.getBoundingClientRect();
        const newWidth = canvasBounds.width * pixelRatio;
        const newHeight = canvasBounds.height * pixelRatio;

        if (width !== newWidth || height !== newHeight) {
            width = newWidth;
            height = newHeight;
            mainHeight = height - previewHeight - previewMarginTop;
            textCountX = Math.max(1, Math.floor(width / (textXWidth * 2)));
            textCountY = Math.max(1, Math.floor(mainHeight / textYHeight));

            canvas.setAttribute('width', width.toString());
            canvas.setAttribute('height', height.toString());
            updateMainRangeX();
            updateMainRangeY();
            updatePreviewRangeX();
            updatePreviewRangeY();

            needRedrawMain = needRedrawPreview = true;
        }
    }

    function render(t: number) {
        if (destroyed) return;
        time = t;

        if (data !== null) {

            // resize

            onResize();

            if (width > 0 && height > 0) {
                // mouse

                if (mouseMode > 0) {
                    mouseX += (newMouseX - mouseX) * 0.5;
                    mouseY += (newMouseY - mouseY) * 0.5;
                } else {
                    mouseX = newMouseX;
                    mouseY = newMouseY;
                }

                if (mouseMode === DRAG_START) {
                    var x = mouseX;
                    if (x > previewUiMax - mouseArea * 2) x = previewUiMax - mouseArea * 2;
                    var newMinX = screenToPreviewX(x);
                    if (newMinX < previewMinX) newMinX = previewMinX;
                    setMainMinMax(newMinX, null);
                } else if (mouseMode === DRAG_END) {
                    var x = mouseX;
                    if (x < previewUiMin + mouseArea * 2) x = previewUiMin + mouseArea * 2;
                    let newMaxX = screenToPreviewX(x);
                    if (newMaxX > previewMaxX) newMaxX = previewMaxX;
                    setMainMinMax(null, newMaxX);
                } else if (mouseMode === DRAG_ALL) {
                    const startX = mouseX + mouseStartX;
                    var newMinX = screenToPreviewX(startX);
                    if (newMinX < previewMinX) newMinX = previewMinX;
                    if (newMinX > previewMaxX - mouseRange) newMinX = previewMaxX - mouseRange;
                    setMainMinMax(newMinX, newMinX + mouseRange);
                }

                const inMain = (mouseY > 0) && (mouseY < height - previewHeight) && (mouseX > 0) && (mouseX < width);
                if (inMain) {
                    select(screenToMainX(Math.floor(mouseX)), Math.floor(mouseY));
                } else {
                    select(null, null);
                }

                // animation

                if (updateAnimation(oldTextX.alpha)) needRedrawMain = true;
                if (updateAnimation(newTextX.alpha)) needRedrawMain = true;
                if (updateAnimation(oldTextY.alpha)) needRedrawMain = true;
                if (updateAnimation(newTextY.alpha)) needRedrawMain = true;
                if (updateAnimation(mainRangeY)) needRedrawMain = true;
                if (updateAnimation(previewRangeY)) needRedrawPreview = true;

                if (columns) {
                    for (let c = 0; c < columns.length; c++) {
                        const yColumn = columns[c];
                        if (updateAnimation(yColumn.alpha)) needRedrawMain = true;
                        if (updateAnimation(yColumn.previewAlpha)) needRedrawPreview = true;
                    }
                }

                // render

                if (needRedrawPreview) {
                    needRedrawPreview = false;
                    renderPreview();
                }
                if (needRedrawMain) {
                    needRedrawMain = false;
                    renderMain();
                }

            }
        }

        requestAnimationFrame(render);
    }

    function renderTextsX(textX: { delta: any; alpha: any; }, skipStep: boolean) {
        if (textX.alpha.value > 0 && context && xColumn) {
            context.globalAlpha = textX.alpha.value;

            let delta = textX.delta;
            if (skipStep) delta *= 2;

            let endI = Math.min(Math.ceil(mainMaxX / intervalX / delta) * delta, xColumn.data.length);
            if (skipStep) endI -= textX.delta;
            const startI = Math.max(mainMinI - 1, 1);

            for (let i = endI - 1; i >= startI; i -= delta) {
                const value = xColumn.data[i];
                const x = mainToScreenX(value);
                let offsetX = 0;
                if (i === xColumn.data.length - 1) {
                    offsetX = -textXWidth;
                } else if (i > 1) {
                    offsetX = -(textXWidth / 2);
                }
                context.fillText(formatDate(value, true), x + offsetX, mainHeight + textXMargin);
            }
        }
    }

    function renderTextsY({alpha, delta}: any) {
        if (alpha.value > 0 && context) {
            context.globalAlpha = alpha.value;

            for (let i = 1; i < textCountY; i++) {
                const value = mainMinY + delta * i;
                const y = mainToScreenY(value);
                context.fillText(formatNumber(value, true), paddingHor, y + textYMargin);
            }
        }
    }

    function renderLinesY({alpha, delta}: any) {
        if (alpha.value > 0 && context) {
            context.globalAlpha = alpha.value;

            for (let i = 1; i < textCountY; i++) {
                const value = mainMinY + delta * i;
                const y = mainToScreenY(value);
                context.beginPath();
                context.moveTo(paddingHor, y);
                context.lineTo(width - paddingHor, y);
                context.stroke();
            }
        }
    }

    function renderPreview() {
        if (context && columns && colors) {
            context.clearRect(0, height - previewHeight - 1, width, previewHeight + 1);

        // paths

        previewScaleY = -previewHeight / previewRangeY.value;
        previewOffsetY = height - previewMinY * previewScaleY;

        for (let c = 0; c < columns.length; c++) {
            const yColumn = columns[c];

            if (yColumn.previewAlpha.value === 0) continue;

            let columnScaleY = previewScaleY;
            let columnOffsetY = previewOffsetY;

            if (yColumn.alpha.toValue === 0) {
                columnScaleY = yColumn.saveScaleY;
                columnOffsetY = yColumn.saveOffsetY;
            } else {
                const columnRangeY = yColumn.max - yColumn.min;
                if (columnRangeY > previewRangeY.value) {
                    columnScaleY = -previewHeight / columnRangeY;
                    columnOffsetY = height - previewMinY * columnScaleY;
                }
            }

            context.globalAlpha = yColumn.previewAlpha.value;
            context.lineWidth = previewLineWidth;
            renderPath(yColumn, 1, yColumn.data.length, previewScaleX, columnScaleY, previewOffsetX, columnOffsetY)
        }

        // draw preview ui

        previewUiMin = previewToScreenX(mainMinX);
        previewUiMax = previewToScreenX(mainMaxX);

        context.globalAlpha = colors.previewAlpha;
        context.beginPath();
        context.rect(paddingHor, height - previewHeight, previewUiMin - paddingHor, previewHeight);
        context.rect(previewUiMax, height - previewHeight, width - previewUiMax - paddingHor, previewHeight);
        context.fillStyle = colors.preview;
        context.fill();

        context.globalAlpha = colors.previewBorderAlpha;
        context.beginPath();
        context.rect(previewUiMin, height - previewHeight, previewUiW, previewHeight);
        context.rect(previewUiMax - previewUiW, height - previewHeight, previewUiW, previewHeight);
        context.rect(previewUiMin, height - previewHeight, previewUiMax - previewUiMin, previewUiH);
        context.rect(previewUiMin, height - previewUiH, previewUiMax - previewUiMin, previewUiH);
        context.fillStyle = colors.previewBorder;
        context.fill();
        }
    }

    function renderMain() {
        if (context && colors && columns && xColumn && data?.colors) {
            context.clearRect(0, 0, width, mainHeight + previewMarginTop);

            mainScaleY = -(mainHeight - mainPaddingTop) / mainRangeY.value;
            mainOffsetY = mainHeight - mainMinY * mainScaleY;
    
            // lines
    
            context.strokeStyle = colors.line;
            context.lineWidth = lineWidth;
    
            renderLinesY(oldTextY);
            renderLinesY(newTextY);
    
            context.globalAlpha = 1;
            context.strokeStyle = colors.zeroLine;
            context.beginPath();
            context.moveTo(paddingHor, mainHeight);
            context.lineTo(width - paddingHor, mainHeight);
            context.stroke();

            // paths

        for (var c = 0; c < columns.length; c++) {
            var yColumn = columns[c];

            if (yColumn.alpha.value === 0) continue;

            context.globalAlpha = yColumn.alpha.value;
            context.lineWidth = mainLineWidth;

            renderPath(yColumn, mainMinI, mainMaxI, mainScaleX, mainScaleY, mainOffsetX, mainOffsetY);
        }

        // select

        if (selectX) {
            context.globalAlpha = 1;
            context.strokeStyle = colors.selectLine;
            context.lineWidth = lineWidth;
            context.beginPath();
            var x = mainToScreenX(selectX);
            context.moveTo(x, 0);
            context.lineTo(x, mainHeight);
            context.stroke();

            var x = xColumn.data[selectI] as number;
            for (var c = 0; c < columns.length; c++) {
                var yColumn = columns[c];
                if (yColumn.alpha.toValue === 0) continue;
                const y = yColumn.data[selectI];
                context.strokeStyle = data.colors[yColumn.name];
                context.fillStyle = colors.circleFill;
                context.lineWidth = circleLineWidth;
                context.beginPath();
                context.arc(x * mainScaleX + mainOffsetX, y * mainScaleY + mainOffsetY, circleRadius, 0, Math.PI * 2);
                context.stroke();
                context.fill();
            }
        }

        // text

        context.fillStyle = colors.text;
        context.font = font;
        const skipStepNew = oldTextX.delta > newTextX.delta;
        renderTextsX(oldTextX, !skipStepNew);
        renderTextsX(newTextX, skipStepNew);

        renderTextsY(oldTextY);
        renderTextsY(newTextY);

        context.globalAlpha = 1;
        context.fillText(formatNumber(mainMinY, false), paddingHor, mainHeight + textYMargin);
        }
    }

    function renderPath(yColumn: { name: string | number; data: { [x: string]: any; }; }, minI: number, maxI: number, scaleX: number, scaleY: number, offsetX: number, offsetY: number) {
        if (context && data?.colors && xColumn) {
            context.strokeStyle = data.colors[yColumn.name];

            context.beginPath();
            context.lineJoin = 'bevel';
            context.lineCap = 'butt';

            const firstX = xColumn.data[minI];
            const firstY = yColumn.data[minI];
            context.moveTo(firstX * scaleX + offsetX, firstY * scaleY + offsetY);

            let step = Math.floor((maxI - minI) / (width - paddingHor * 2));
            if (step < 1) step = 1;

            for (let i = minI + 1; i < maxI; i += step) {
                const x = xColumn.data[i];
                const y = yColumn.data[i];
                context.lineTo(x * scaleX + offsetX, y * scaleY + offsetY);
            }
            context.stroke();
        }
    }

    return {
        setColors,
        setData,
        destroy,
    };
};