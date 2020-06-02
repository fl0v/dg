// ==UserScript==
// @name         Dark Galaxy - Replace planets images
// @namespace    https://darkgalaxy.com/
// @version      0.1
// @description  All mine i tell you!
// @author       Biggy & helloweenpt
// @match        https://beta.darkgalaxy.com/planets/
// @match        https://beta.darkgalaxy.com/planet/*
// @match        https://beta.darkgalaxy.com/navigation/*
// @grant        none
// ==/UserScript==

(function() {
    const imgIdPattern = /\/([\d]+)\./;
    const imgBaseUrl = 'https://helloweenpt.com/darkgalaxy/images/planets';
    const imgExt = '.jpg';
    const replaceImage = function (img, size) {
        const [,id] = img.src.match(imgIdPattern);
        img.src = imgBaseUrl + (size ? '/' + size : '') + '/' + id + imgExt;
    };

    if (location.href.match(/planet\/[0-9]+/)) { // on single planet overview use big image
        Array.from(document.querySelectorAll('#planetImage > img')).forEach((img) => replaceImage(img));
    } else { // small images for anything else (planet list, nav other planets, nav own planets)
        Array.from(document.querySelectorAll('.planetImage img, .planets > img, .planets > a > img')).forEach((img) => replaceImage(img, 'icon'));
    }

})();
