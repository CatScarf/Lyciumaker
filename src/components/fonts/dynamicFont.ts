export const fontsTexts = {
    jinmeiTexts: '',     // 已获取的金梅字体表
    fangzhengTexts: '',  // 已获取的隶书字体表
    newchuanTexts: ''        // 已获取的新篆字体表
}

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
export function contrastAddFont(texts: string, text: string, fontName = 'JinMeiMaoCaoXing', fontPath = '/fonts/JinMeiMaoCaoXing/JinMeiMaoCaoXing') {
    const allSet = new Set(texts)
    const difSet = new Set(text.split('').filter(x => !allSet.has(x)))
    texts += [...difSet].join('')
    for (let text of difSet) {
        addFontFace(text, fontName, fontPath)
    }

    return texts
}