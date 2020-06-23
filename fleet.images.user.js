// ==UserScript==
// @name         Dark Galaxy - Replace planets images
// @namespace    https://darkgalaxy.com/
// @version      0.2
// @description  All mine i tell you!
// @author       Sniky
// @homepage     https://github.com/fl0v/dg
// @supportURL   https://github.com/fl0v/dg/issues
// downloadURL  https://github.com/fl0v/dg/raw/master/fleet.images.user.js
// @match        https://beta.darkgalaxy.com/fleet/*
// @match        https://beta.darkgalaxy.com/planet/*/production/
// @grant        none
// ==/UserScript==

(function() {
    const imgIdPattern = /\/([\s\w]+)\/([\s\w]+)\.gif/;
    const imgBaseUrl = 'https://beta.darkgalaxy.com/images/units/';
    const imgExt = '.gif';
    const replaceImage = function (img) {
        const [,size,id] = img.src.match(imgIdPattern);
        if (id.indexOf('holo')>-1 || id =='projector')
            {
            img.style.opacity ='0.5';
            }
        let image =img.src.replace('main/ships/holo_','small/').replace('main/ships/projector','small/trader').replace('main/ships/trader','small/trader').replace('projector','trader').replace('holo_','');
        img.src = image;
    };
         Array.from(document.querySelectorAll('.transferRow img')).forEach((img) => replaceImage(img));
    Array.from(document.querySelectorAll('.entry .left.structureImage img')).forEach((img) => replaceImage(img));
    Array.from(document.querySelectorAll(' .structureImageSmall img')).forEach((img) => replaceImage(img));
    })();