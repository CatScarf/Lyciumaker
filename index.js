import {convertToTraditional} from "./util.js";

const canvas = document.getElementById('card_preview');
const ctx = canvas.getContext('2d');

const downloadCardButton = document.getElementById("download_card");
let downloadButtonLock = false;  // 避免重复点击下载按钮

const importIllustrationInput = document.getElementById("import_illustration");
const zoomInButton = document.getElementById("zoom_in");
const zoomOutButton = document.getElementById("zoom_out");
const resetScaleButton = document.getElementById("reset_scale");
const translateInput = document.getElementById("translateBox");
const isIllustratorButton = document.getElementById("isIllustrator");
const resetHeartLimitButton = document.getElementById("reset_heart_limit");
const powerSelect = document.getElementById("power_select");
const scaleNumberInput = document.getElementById("scale_number");
const heartLimitInput = document.getElementById("heart_limit");
const heroTitleInput = document.getElementById("hero_title");
const heroNameInput = document.getElementById("hero_name");
const skillNumberInput = document.getElementById("skill_number");
const s2ttip = document.getElementById("s2ttip");

const sizeName = ['dpr', 'clientWidth', 'clientHeight', 'innerWidth', 'innerHeight',
                    'canvasWidth', 'canvasHeight']
const size = new Array(sizeName.length);
let illustration;  // 插画
let outerFrame; // 外框
let miscellaneous; // 杂项

let isS2T = true; // 是否简繁转换
let isIllustrator = false; // 是否绘制画师
let heartLimit = 4; // 体力上限
let heartNumber = 4; // 初始体力值（暂未开发相关功能）
let power = "shu"; // 势力
let title = "乱世的枭雄"; // 称号
let name = "刘备"; // 称号

let skillNumber = 2; // 技能数量
let skills = []; // 所有技能

let x = 0;  // 鼠标位置
let y = 0;  // 鼠标位置
let isPressed = false; // 是否按下Canvas
let isTouched = false; // 是否触摸Canvas
let offsetX = 0;  // 拖拽开始时鼠标位置和图片位置的偏移量
let offsetY = 0;  // 拖拽开始时鼠标位置和图片位置的偏移量
let dragFirst = true;

// 插画
class Illustration{
    constructor(img) {
        this.img = img;
        this.width = img.width;
        this.height = img.height;
        this.scale = 1.0;
        this.x = 0;
        this.y = 0;
    }
    changeScale(newScale){
        newScale = newScale * 1.0;
        if(newScale < 0.01){
            newScale = 0.01;
        }
        newScale = Math.floor(newScale * 10000)/10000;
        this.scale = newScale;
    }
}

// 外框
class OuterFrame{
    constructor(wei, shu, wu, qun, shen){
        this.img = [];
        this.img["wei"] = wei;
        this.img["shu"] = shu;
        this.img["wu"] = wu;
        this.img["qun"] = qun;
        this.img["shen"] = shen;
    }
}

// 杂项
class Miscellaneous{
    constructor(img) {
        this.img = img;
        // 数组代表 ctx.drawImage 中的 sx, sy, sWidth, sHeight
        this.weiHeartS  = [350, 50,  100, 100];
        this.shuHeartS  = [350, 150, 100, 100];
        this.wuHeartS   = [350, 250, 100, 100];
        this.qunHeartS  = [350, 350, 100, 100];
        this.shenHeartS = [350, 450, 100, 100];

        this.weiSkillBox  = [100, 50, 200, 100];
        this.shuSkillBox  = [100, 150, 200, 100];
        this.wuSkillBox   = [100, 250, 200, 100];
        this.qunSkillBox  = [100, 350, 200, 100];
        this.shenSkillBox = [100, 450, 200, 100];

        this.weiColor = "#ccd5ec"
        this.shuColor = "#e9cfb2"
        this.wuColor = "#d6e3bf";
        this.qunColor = "#d2cbc8";
        this.shenColor = "#c2bd64";
    }
}

// 技能
class Skill{
    constructor(name, text){
        this.name = name;
        this.text = text;
        this.isBold = false;
        this.isItalic = false;
    }
}

// 按钮事件：下载（保存）卡牌到本地
downloadCardButton.onclick = downloadCard;

function downloadCard(){
    function download(){
        const downloadLink = document.createElement('a');
        // const date = new Date();
        let fileName = name;
        // fileName += Math.floor(date.getTime() / 1000);
        fileName += ".png";
        downloadLink.setAttribute('download', fileName);
        canvas.toBlob(
            function(blob){
                const url = URL.createObjectURL(blob);
                downloadLink.setAttribute('href', url);
                downloadLink.click();
            }
        );
    }

    if(downloadButtonLock){
        alert("正在处理，请勿重复点击下载按钮");
    }else{
        downloadButtonLock = true;
        // 准备好要发送的数据
        const cardInfo = {};
        cardInfo['illustrator'] = "" + document.getElementById("Illustrator").value;
        cardInfo['power'] = "" + power;
        cardInfo['name'] = "" + name;
        cardInfo['heartLimit'] = "" + heartLimit;
        cardInfo['title'] = "" + title;
        cardInfo['skillNumber'] = "" + skillNumber;
        for(let i=0; i < skillNumber; i++){
            cardInfo['skillName' + (i+1)] = skills[i].name;
            cardInfo['skill' + (i+1)] = skills[i].text;
        }

        let cardJson = JSON.stringify(cardInfo)

        // 发送
        $.ajax({
            type: "POST",
            url: "https://service-6suhxcdg-1253139667.gz.apigw.tencentcs.com/release/generate_sgs_card",
            data: cardJson,
            contentType: "application/json; charset=utf-8",
            success: function(msg){
                // alert(msg);
                download();
                downloadButtonLock = false;
            },
            error: function(errMsg) {
                downloadButtonLock = false;
                const r = confirm("保存失败，是否重试？");
                if(r == true){
                    downloadCard();
                }
            }
        });
    }
}

// 按钮事件：导入插画
importIllustrationInput.onchange = function(){
    const curFiles = importIllustrationInput.files;
    if(curFiles.length > 0){
        const url = URL.createObjectURL(curFiles[0]);
        importIllustration(url);
    }
}

// 按钮事件：放大插画
zoomInButton.onclick = function(){
    if(typeof(illustration) != "undefined"){
        illustration.changeScale(illustration.scale * 1.25);
        refresh_scale_text(illustration, scaleNumberInput);
    }
}

// 按钮事件：缩小插画
zoomOutButton.onclick = function(){
    if(typeof(illustration) != "undefined"){
        illustration.changeScale(illustration.scale * 0.8);
        refresh_scale_text(illustration, scaleNumberInput);
    }
}

// 按钮事件：重置图像缩放
resetScaleButton.onclick = function(){
    if(typeof(illustration) != "undefined"){
        illustration.x = 0;
        illustration.y = 0;
        illustration.scale = 1.0;
    }
}

// 按钮事件：是否简繁转换
translateInput.onchange = function(){
    isS2T = translateInput.checked;
    if(isS2T){
        for(let i of document.getElementsByClassName("traditional_please")){
            i.style = "display: none";
        }
        s2ttip.style = ""
    }else{
        for(let i of document.getElementsByClassName("traditional_please")){
            i.style = "";
            s2ttip.style = "display: none"
        }
    }
}

// 按钮事件：是否显示画师
isIllustratorButton.onchange = function(){
    isIllustrator = isIllustratorButton.checked;
    if(isIllustrator){
        document.getElementById("Illustrator").style = "";
    }else{
        document.getElementById("Illustrator").style = "display: none";
    }
}

// 按钮事件：重置体力上限
resetHeartLimitButton.onclick = function(){
    heartLimit = 4;
    heartLimitInput.value = 4;
}

// 输入框事件：更改技能数量
skillNumberInput.onchange = function(){
    const editor = document.getElementById("editor");
    let number = skillNumberInput.value;
    number = Math.floor(number);
    number = number < 0 ? 0 : number;
    number = number > 10 ? 10 : number;
    skillNumberInput.value = number;
    skillNumber = number;
    for(let i = 0; i < number; i++){
        const skBlock = document.getElementById("sk" + (i+1) + "Block");
        if(skBlock){
            skBlock.style = "";
        }else{
            const style = isS2T ? "display: none" : "";
            const content =
                "<div id=\"sk" + (i+1) + "Block\" class=\"block\">\n" +
                "        <div class=\"verticalBlock\">" +
                "        <div class=\"description leftDescription\">技能" + (i+1) + "</div>\n" +
                "            <input type=\"checkbox\" id=\"isItalic" + (i+1) + "\" value=\"first_checkbox\">" +
                "            <label class=\"description description2\" for=\"isItalic" + (i+1) + "\">斜体</label>" +
                "        </div>" +
                "        <div style=\"clear:both\"></div>\n" +
                "        <div class=\"verticalBlock\">" +
                "            <div class=\"description leftDescription\">技能名</div>\n" +
                "            <input id=\"sk" + (i+1) + "n\" type=\"text\" onfocus=\"this.select()\" value=\"\">\n" +
                "            <div class=\"tip traditional_please\" style=\"" + style +"\">请输入繁体</div>" +
                "        </div>" +
                "        <div class=\"verticalBlock\">" +
                "            <div class=\"description leftDescription\">技能描述</div>\n" +
                "            <textarea rows=\"4\" id=\"sk" + (i+1) + "\" onfocus=\"this.select()\"></textarea>" +
                "        </div>" +
                "    </div>";
            editor.insertAdjacentHTML('beforeend', content);
        }
    }
    for(let i = number; i < 10; i++ ){
        const skBlock = document.getElementById("sk" + (i+1) + "Block");
        if(skBlock){
            skBlock.style = "display: none";
        }
    }
}

// 输入框事件：修改缩放比例
scaleNumberInput.onchange = function(){
    if(typeof(illustration) != "undefined"){
        illustration.changeScale(scaleNumberInput.value / 100);
        refresh_scale_text(illustration, scaleNumberInput);
    }
}

// 输入框事件：修改体力上限
heartLimitInput.onchange = function(){
    let value = heartLimitInput.value;
    value = Math.floor(value);
    value = value < 1 ? 1 : value;
    value = value > 100 ? 100 : value;
    heartLimitInput.value = value;
    heartLimit = value;
}

// 下拉选框事件：修改势力
powerSelect.onchange = function (e){
    const newPower = powerSelect.value;
    if(newPower === "wei" || newPower === "shu" ||
        newPower === "wu" || newPower === "qun" ||
        newPower === "shen"){
        power = newPower;
    }
}

// 禁用默认的触屏滚动
canvas.addEventListener('touchmove',
    function(e){e.preventDefault();},
    {passive: false});

// 更新当前鼠标位置
canvas.onmousemove = function(e){
    x = e.offsetX;
    y = e.offsetY;
}

// 更新当前鼠标位置
canvas.ontouchmove = function(e){
    x = e.changedTouches[0].clientX;
    y = e.changedTouches[0].clientY;
}

// 检测鼠标按下
canvas.onmousedown = function(){
    isPressed = true;
    dragFirst = true;
}

// 检测鼠标抬起
canvas.onmouseup = function(){
    isPressed = false;
}

// 检测触摸按下
canvas.ontouchstart = function(e){
    x = e.changedTouches[0].clientX;
    y = e.changedTouches[0].clientY;
    isTouched = true;
    dragFirst = true;
}

// 检测鼠标抬起
canvas.ontouchend = function(){
    isTouched = false;
}

// 刷新缩放输入框的文本
function refresh_scale_text(illustration, scaleNumberInput){
    scaleNumberInput.value = Math.floor(illustration.scale * 100);
}

// 获取窗口大小
function getWindowSize(){
    size[0] = window.devicePixelRatio;
    size[1] = document.body.clientWidth;
    size[2] = document.body.clientHeight;
    size[3] = window.innerWidth;
    size[4] = window.innerHeight;
    size[5] = canvas.width;
    size[6] = canvas.height;
}

// 设置Canvas大小，返回逻辑分辨率
function setCanvasSize(canvas){
    let dpr = window.devicePixelRatio * 2;  // 超分辨率绘制，提高绘制效果
    const ctx = canvas.getContext('2d');
    const clientWidth = document.body.clientWidth;
    const logicalWidth = 400;
    const logicalHeight = logicalWidth * (88/63);
    const styleWidth = Math.min(400, clientWidth);
    const styleHeight = styleWidth * (88/63);

    canvas.width = logicalWidth * dpr;
    canvas.height = logicalHeight * dpr;
    canvas.style.width = styleWidth + 'px';
    canvas.style.height = styleHeight + 'px';
    ctx.scale(dpr, dpr);

    return [logicalWidth, logicalHeight];
}

// 导入外框
function importOuterFrame(type){
    if(type === "old1"){
        const imgName = ["wei", "shu", "wu", "qun", "shen"];
        let imgArray = new Array(imgName.length);
        let cnt = 0;
        for(let i in imgName){
            imgArray[i] = new Image();
            imgArray[i].src = "./resources/old1_" + imgName[i] + ".png";
            imgArray[i].onload = function(){
                cnt += 1;
                if(cnt >= imgName.length){
                    outerFrame = new OuterFrame(imgArray[0], imgArray[1], imgArray[2], imgArray[3], imgArray[4]);
                }
            }
        }
    }
}

// 绘制外框
function drawOuterFrame(ctx, power, outerFrame, logicalWidth, logicalHeight){
    if(typeof(outerFrame) != "undefined"){
        const img = outerFrame.img[power];
        const drawWidth = logicalWidth * 1.0;
        const drawHeight = drawWidth * img.height / img.width;
        const drawX = 0;
        const drawY = 0;
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    }
}

// 导入插画
function importIllustration(path){
    const img = new Image();
    img.src = path;
    img.onload = function(){
        illustration = new Illustration(img);
    }
}

// 导入杂项
function importMiscellaneous(path){
    if(typeof(miscellaneous) == "undefined"){
        const path = "./resources/miscellaneous.png";
        const img = new Image();
        img.src = path;
        img.onload = function(){
            miscellaneous = new Miscellaneous(img);
        }
    }
}

// 绘制插画
function drawIllustration(ctx, illustration, logicalWidth, logicalHeight){
    if(typeof(illustration) != "undefined"){
        const cardRatio = 1.0 * logicalWidth / logicalHeight;
        const illustrationRatio = 1.0 * illustration.width / illustration.height;
        let drawWidth = 0;
        let drawHeight = 0;
        if(cardRatio < illustrationRatio){ // 如果图片更宽，则高度和卡面设为一致
            drawHeight = 1.0 * logicalHeight * illustration.scale;
            drawWidth = drawHeight * illustrationRatio;
        }else{  // 如果图片更高，则宽度和卡面设为一致
            drawWidth = 1.0 * logicalWidth * illustration.scale;
            drawHeight = drawWidth / illustrationRatio;
        }
        const centerX = logicalWidth*1.0/2;
        const centerY = logicalHeight*1.0/2;
        let drawX = centerX + illustration.x - drawWidth/2;
        let drawY = centerY + illustration.y - drawHeight/2;


        ctx.drawImage(illustration.img, drawX, drawY, drawWidth, drawHeight);
    }
}

// 绘制体力与体力上限
function drawHeartLimit(type, power, heartLimit, heartNumber){
    const length = 40;
    const dx = 100;
    const dy = 15;
    let offset = 20;
    const maxHeartNumber = 12;
    heartLimit = Math.floor(heartLimit);
    heartLimit = heartLimit < 1 ? 1 : heartLimit;
    heartLimit = heartLimit > 100 ? 100 : heartLimit;
    if(heartLimit >= maxHeartNumber){
        offset = 20 * (maxHeartNumber - 1) / (heartLimit - 1);
    }
    if(type === "old"){
        if(typeof(miscellaneous) != "undefined"){
            let S;
            if(power === "wei"){
                S = miscellaneous.weiHeartS;
            }else if(power === "shu"){
                S = miscellaneous.shuHeartS;
            }else if(power === "wu"){
                S = miscellaneous.wuHeartS;
            }else if(power === "qun"){
                S = miscellaneous.qunHeartS;
            }else if(power === "shen"){
                S = miscellaneous.shenHeartS;
            }
            if(typeof(S) != "undefined"){
                for(let i=0; i < heartLimit; i++){
                    ctx.drawImage(miscellaneous.img, S[0], S[1], S[2], S[3], dx+offset*i, dy, length, length);
                }
            }
        }
    }
}

// 绘制称号和姓名
function drawTitleAndName(ctx, title, name, skillTop){
    let titleNum = 0;
    for(let i of title){
        titleNum += 1;
    }
    let nameNum = 0;
    for(let i of name){
        nameNum += 1;
    }

    skillTop -= 16;
    let ratio = 0.5; // 称号与姓名的比例
    if(nameNum > 3){
        ratio = 0.35
    }

    let nameBottomY = skillTop < 380 ? skillTop : 380; // 名字的最下端
    let titleTopY = 110; // 称号的最上端（固定）
    let titleBottomY = titleTopY + (nameBottomY - titleTopY) * ratio; // 称号的最下端
    let nameTopY = titleBottomY;  // 名字的最上端

    // 绘制称号
    let offset = Math.floor((titleBottomY - titleTopY) / titleNum);
    offset *= 0.9
    offset = offset > 24 ? 24 : offset;
    let x = power === "shen" ? 355 - offset / 2 : 61 - offset / 2;
    let y = titleTopY + Math.floor((titleBottomY - titleTopY)*1.0 / titleNum / 2.0 + offset/2.0);
    ctx.font = offset + "px DFNewChuan";
    const lineWidth =2.5; // 称号描边宽度
    if(isS2T){
        title = convertToTraditional(title);
    }
    for(let i in title){
        ctx.strokeStyle = "rgb(0, 0, 0)";
        ctx.lineWidth = lineWidth;
        ctx.strokeText(title[i], x, y + offset * i);

        ctx.fillStyle = "rgb(255, 255, 0)";
        ctx.fillText(title[i], x, y + offset * i);
    }

    // 绘制名字
    offset = Math.floor((nameBottomY - nameTopY) / nameNum);
    if(nameNum <= 2){
        offset *= 0.85;
    }
    offset = offset > 57 ? 57 : offset;
    x = power === "shen" ? 355 - offset / 2 : 60 - offset / 2;
    y = nameTopY + Math.floor((nameBottomY - nameTopY) / nameNum / 2.0 + offset * 0.3);
    ctx.font = offset + "px JinMeiMaoCaoXing";
    if(isS2T){
        name = convertToTraditional(name);
    }
    for(let i in name){
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.fillText(name[i], x, y + 4 + offset * i);

        ctx.strokeStyle = "rgb(0, 0, 0)";
        ctx.lineWidth = 4;
        ctx.strokeText(name[i], x, y + offset * i);

        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.fillText(name[i], x, y + offset * i);
    }
}

// 拖拽插画
function dragIllustration(){
    if(typeof(illustration) != "undefined" && (isPressed || isTouched)){
        if(dragFirst == true){
            offsetX = illustration.x - x;
            offsetY = illustration.y - y;
            dragFirst = false;
        }else{
            illustration.x = x + offsetX;
            illustration.y = y + offsetY;
        }
    }
}

// 刷新技能名与技能内容
function refreshAll(){
    skills = []; // 清空技能列表
    for(let i = 0; i < skillNumber; i++){
        const skn = document.getElementById("sk" + (i+1) + "n");
        const sk = document.getElementById("sk" + (i+1));
        const skill = new Skill(skn.value, sk.value);
        for(let j in skill.text){
            if(j == 2 && skill.text[j] === "技"){
                skill.isBold = true;
            }else if(j > 2){
                break;
            }
        }
        const checked = document.getElementById('isItalic' + (i+1)).checked;
        if(checked){
            skill.isItalic = true;
        }
        skills.push(skill);
    }
    title = heroTitleInput.value;
    name = heroNameInput.value;
}

// 绘制技能名与技能
function drawSkill(ctx, skills){
    // 与绘制技能有关的所有属性
    class SkillTextDrawingAttr{
        constructor() {
            this.skillTopX = 104;  // 技能区最顶部的X坐标
            this.skillTopMinY = 435; // 技能区最顶部的Y坐标不得低于此值
            this.sillTopY = this.skillTopMinY; // 技能区最顶部的Y坐标
            this.skillBottomY = 510; // 技能区最底部的Y坐标

            this.maxHeight = (this.skillBottomY - this.sillTopY) * 3;  // 技能区最大高度
            this.skillWidth = 228;  // 技能区宽度
            this.indent = 0.5; // 首字缩进为0.25个汉字宽度
            this.paragraphSpacing = 0.3;  // 段间距，实际段间距为此值*yOffset

            this.fontSize = 12;  // 技能字号
            this.yOffset = this.fontSize * 1.2;  // 行间距，当字体缩小时变为与字体大小相同

        }
    }

    const skillTextDrawingAttr = new SkillTextDrawingAttr();  // 与绘制技能有关的所有属性
    let skillBoxY = [];  // 技能名外框的位置

    // 绘制一行文本
    function drawLine(ctx, firstLine, lastLine, lineString, skillTextDrawingAttr, line, bold, italic, i){
        let lineCharNum = 0;  // 这一行的文字数量
        for(let char of lineString){
            lineCharNum += char.charCodeAt(0) > 255 ? 2 : 1;
        }
        let xOffset;  // X偏移量
        let cur = skillTextDrawingAttr.skillTopX;  // 当前绘制的位置（X坐标）

        // 确定文字间距和起始坐标
        if(firstLine && !lastLine){
            xOffset = (skillTextDrawingAttr.skillWidth - skillTextDrawingAttr.indent * skillTextDrawingAttr.fontSize) / (lineCharNum - 1);
            cur += skillTextDrawingAttr.indent * skillTextDrawingAttr.fontSize;
        }else if(firstLine && lastLine){
            xOffset = skillTextDrawingAttr.fontSize / 2;
            cur += skillTextDrawingAttr.indent * skillTextDrawingAttr.fontSize;
        }else if(lastLine){
            xOffset = skillTextDrawingAttr.fontSize / 2;
        }
        else{
            xOffset = skillTextDrawingAttr.skillWidth / (lineCharNum - 1);
        }

        // 逐字绘制
        let italicStr = "";
        if(italic){
            italicStr = "Italic "
        }

        for(let k in lineString){
            if(firstLine && bold && k < 3){
                ctx.font = italicStr + "bold " + skillTextDrawingAttr.fontSize + "px FangZhengZhunYuan"
            }else{
                ctx.font = italicStr + "" + skillTextDrawingAttr.fontSize + "px FangZhengZhunYuan"
            }
            ctx.fillText(lineString[k], cur, skillTextDrawingAttr.sillTopY + skillTextDrawingAttr.yOffset * line + i * skillTextDrawingAttr.yOffset * skillTextDrawingAttr.paragraphSpacing);
            cur += lineString[k].charCodeAt(0) > 255 ? 2 * xOffset : 1 * xOffset;
        }
    }

    // 遍历所有文字，也可以绘制文字
    function iterationText(draw){
        let line = 0;  // 当前行数
        let cur = skillTextDrawingAttr.indent * skillTextDrawingAttr.fontSize;  // 当前绘制的位置（X坐标）
        let isFirstLine = true;  // 用来判断是否是首行
        let hasReturn = false;  // 避免重复换行
        skillBoxY = [];
        // 绘制所有技能
        for(let i in skills){
            skillBoxY.push(skillTextDrawingAttr.sillTopY + skillTextDrawingAttr.yOffset * line + i * skillTextDrawingAttr.yOffset * skillTextDrawingAttr.paragraphSpacing);
            let lineOfThisSkill = 0;
            let lineString = [];
            let skillCharNum = 0;
            for(let j in skills[i].text){
                skillCharNum += 1;
            }

            // 绘制每个技能
            for(let j in skills[i].text){
                const char = skills[i].text[j];
                if(draw){
                    lineString.push(char);
                }
                cur += char.charCodeAt(0) > 255 ? skillTextDrawingAttr.fontSize : skillTextDrawingAttr.fontSize/2;
                if(cur > skillTextDrawingAttr.skillWidth){
                    // 绘制非最后一行
                    if(draw){
                        drawLine(ctx, isFirstLine, false, lineString, skillTextDrawingAttr, line, skills[i].isBold, skills[i].isItalic, i)
                    }

                    lineString = [];
                    lineOfThisSkill += 1;
                    line += 1;
                    cur = 0;
                    isFirstLine = false;
                    hasReturn = true;
                }else{
                    hasReturn = false;
                }
            }

            // 绘制最后一行
            if(draw){
                drawLine(ctx, isFirstLine, true, lineString, skillTextDrawingAttr, line, skills[i].isBold, skills[i].isItalic, i)
            }

            cur = skillTextDrawingAttr.indent * skillTextDrawingAttr.fontSize;
            isFirstLine = true;
            line = hasReturn ? line : line + 1;
            if(lineOfThisSkill < 1 || lineOfThisSkill === 1 && hasReturn){
                line += 1;
            }
        }

        // 更改第一行的位置
        skillTextDrawingAttr.sillTopY = skillTextDrawingAttr.skillBottomY;
        skillTextDrawingAttr.sillTopY -= (line-1) * skillTextDrawingAttr.yOffset;
        skillTextDrawingAttr.sillTopY -= skillTextDrawingAttr.paragraphSpacing * skillTextDrawingAttr.yOffset * (skills.length-1);
        skillTextDrawingAttr.sillTopY = skillTextDrawingAttr.skillTopMinY < skillTextDrawingAttr.sillTopY ? skillTextDrawingAttr.skillTopMinY : skillTextDrawingAttr.sillTopY;
        return line;
    }

    // 第一次遍历，仅用于统计行数
    let numLine = iterationText(false);
    while (numLine * skillTextDrawingAttr.yOffset + skills.length * skillTextDrawingAttr.yOffset * skillTextDrawingAttr.paragraphSpacing > skillTextDrawingAttr.maxHeight){
        skillTextDrawingAttr.fontSize -= 1;
        if(skillTextDrawingAttr.fontSize === 1){
            break;
        }
        skillTextDrawingAttr.yOffset = skillTextDrawingAttr.fontSize;
        numLine = iterationText(false)
    }

    ctx.font = "" + skillTextDrawingAttr.fontSize + "px FangZhengZhunYuan";
    ctx.fillStyle = "rgb(0, 0, 0)";

    // 第二次遍历，获取顶部位置
    iterationText(false);

    // 绘制外框
    if(typeof(skillBoxY[0]) != "undefined"){
        const alpha = 0.8;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        if(typeof(miscellaneous) != "undefined"){
            let color;
            if(power === "wei"){
                color = miscellaneous.weiColor;
            }else if(power === "shu"){
                color = miscellaneous.shuColor;
            }else if(power === "wu"){
                color = miscellaneous.wuColor;
            }else if(power === "qun"){
                color = miscellaneous.qunColor;
            }else if(power === "shen"){
                color = miscellaneous.shenColor;
            }
            let r = color.substr(1, 2);
            let g = color.substr(3, 2);
            let b = color.substr(5, 2);
            r = parseInt(r, 16);
            g = parseInt(g, 16);
            b = parseInt(b, 16);
            ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
            ctx.strokeStyle = ctx.fillStyle;
        }

        const drawY = skillBoxY[0]-23;
        const drawX = 84;
        const drawWidth = 275;
        const drawHeight = 520 - drawY;
        const corner = 10;
        const margin = 3;
        ctx.beginPath();
        ctx.moveTo(drawX, drawY + corner);
        ctx.lineTo(drawX + corner, drawY + corner);
        ctx.lineTo(drawX + corner, drawY);

        ctx.lineTo(drawX + drawWidth - corner, drawY);
        ctx.lineTo(drawX + drawWidth - corner, drawY + corner);
        ctx.lineTo(drawX + drawWidth, drawY + corner);

        ctx.lineTo(drawX + drawWidth, drawY + drawHeight - corner);
        ctx.lineTo(drawX + drawWidth - corner, drawY + drawHeight - corner);
        ctx.lineTo(drawX + drawWidth - corner, drawY + drawHeight);

        ctx.lineTo(drawX + corner, drawY + drawHeight);
        ctx.lineTo(drawX + corner, drawY + drawHeight - corner);
        ctx.lineTo(drawX, drawY + drawHeight - corner);

        ctx.lineTo(drawX, drawY + corner);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.moveTo(drawX + margin, drawY + corner + margin);
        ctx.lineTo(drawX + corner + margin, drawY + corner + margin);
        ctx.lineTo(drawX + corner + margin, drawY + margin);

        ctx.lineTo(drawX + drawWidth - corner - margin, drawY + margin);
        ctx.lineTo(drawX + drawWidth - corner - margin, drawY + corner + margin);
        ctx.lineTo(drawX + drawWidth - margin, drawY + corner + margin);

        ctx.lineTo(drawX + drawWidth - margin, drawY + drawHeight - corner - margin);
        ctx.lineTo(drawX + drawWidth - corner - margin, drawY + drawHeight - corner - margin);
        ctx.lineTo(drawX + drawWidth - corner - margin, drawY + drawHeight - margin);

        ctx.lineTo(drawX + corner + margin, drawY + drawHeight - margin);
        ctx.lineTo(drawX + corner + margin, drawY + drawHeight - corner - margin);
        ctx.lineTo(drawX + margin, drawY + drawHeight - corner - margin);

        ctx.lineTo(drawX + margin, drawY + corner + margin);
        ctx.fill();
    }

    ctx.fillStyle = 'rgb(0, 0, 0)';
    // 第三次遍历，绘制文字
    iterationText(true);

    // 绘制技能名外框与技能名
    if(typeof(miscellaneous) != "undefined"){
        for(let i in skillBoxY){
            const length = 68;
            let S;
            if(power === "wei"){
                S = miscellaneous.weiSkillBox;
            }else if(power === "shu"){
                S = miscellaneous.shuSkillBox;
            }else if(power === "wu"){
                S = miscellaneous.wuSkillBox;
            }else if(power === "qun"){
                S = miscellaneous.qunSkillBox;
            }else if(power === "shen"){
                S = miscellaneous.shenSkillBox;
            }

            if(power === "shen"){
                ctx.fillStyle = "rgb(239, 227, 111)"
            }else{
                ctx.fillStyle = "rgb(0, 0, 0)"
            }
            ctx.drawImage(miscellaneous.img, S[0], S[1], S[2], S[3], skillTextDrawingAttr.skillTopX-69, skillBoxY[i]-22, length, length/2);
            ctx.font = "20px FangZhengLiShu";
            let str = skills[i].name.substr(0, 2);
            if(isS2T){
                str = convertToTraditional(str);
            }
            ctx.fillText(str, skillTextDrawingAttr.skillTopX-57, skillBoxY[i]+1.5);
        }
    }

    return skillBoxY.length > 1 ? skillBoxY[0] : 65534;
}

// 绘制底部信息
function drawBottomInfo(ctx, isIllustrator){
    if(isIllustrator){
        let str = "illustration: " + document.getElementById("Illustrator").value;
        ctx.font = "9px FangZhengZhunYuan";
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.fillText(str, 85, 539);
    }
}

// 绘制版本信息
function drawVersionInformation(ctx){
    const drawX = 20;
    const drawY = 553;
    ctx.font = "8px FangZhengZhunYuan";
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    const info = "" + document.getElementById("AppName").innerText;
    ctx.fillText(info, drawX, drawY);
}

let oldmsg = "";
// 绘图
function draw(){
    getWindowSize();

    // 获取技能名和技能描述
    refreshAll();

    // 获取Canvas的物理分辨率
    let logicalSize = setCanvasSize(canvas);
    const logicalWidth = logicalSize[0];
    const logicalHeight = logicalSize[1];

    // 拖拽插画
    dragIllustration();

    // 绘制插画
    if(typeof(illustration) != "undefined"){
        drawIllustration(ctx, illustration, logicalWidth, logicalHeight);
    }

    // 绘制外框
    if(typeof(outerFrame) != "undefined"){
        drawOuterFrame(ctx, power, outerFrame, logicalWidth, logicalHeight);
    }

    // 绘制体力
    drawHeartLimit("old", power, heartLimit, heartNumber);

    // 绘制技能
    let skillTop = drawSkill(ctx, skills);

    // 绘制称号
    drawTitleAndName(ctx, title, name, skillTop);

    // 绘制底部信息
    drawBottomInfo(ctx, isIllustrator);

    // 绘制版本信息
    drawVersionInformation(ctx);

    window.requestAnimationFrame(draw);
}

draw();
importOuterFrame("old1");
importIllustration("./resources/刘备-六星耀帝.png");
importMiscellaneous();