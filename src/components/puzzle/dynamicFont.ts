var texts = ''

// 增加新字体时的CSS文本内容
function fontFaceStr(name: string, fontName: string, fontPath: string) {
    return `@font-face {font-family: "${fontName}-${name[0]}";src: url("${fontPath}-${name[0]}.woff") format('woff');font-display: swap;}`
}

// 增加新的字体
function addFontFace(name: string, fontName: string, fontPath: string) {
    const style = document.createElement('style');
    style.innerText = fontFaceStr(name, fontName, fontPath);
    document.documentElement.appendChild(style)
}

// 若有新的文字出现，则增加新的字体
export function contrastAddFont(text: string, fontName = 'JinMeiMaoCaoXing', fontPath = '/fonts/JinMeiMaoCaoXing/JinMeiMaoCaoXing') {
    const allSet = new Set(texts)
    const difSet = new Set(text.split('').filter(x => !allSet.has(x)))
    texts += [...difSet].join('')
    for (let text of difSet) {
        addFontFace(text, fontName, fontPath)
    }
}