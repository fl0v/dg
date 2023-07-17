// ==UserScript==
// @name         Dark Galaxy - Useful links
// @namespace    https://darkgalaxy.com/
// @version      0.4
// @description  try to take over the world!
// @author       Biggy
// @homepage     https://github.com/fl0v/dg
// @supportURL   https://github.com/fl0v/dg/issues
// @downloadURL  https://github.com/fl0v/dg/raw/master/menu.useful.links.user.js
// @match        https://*.darkgalaxy.com/*
// @grant        none
// ==/UserScript==

(function() {
    const links = [
        {
            label: 'Manual',
            url: 'https://manual.darkgalaxy.com/',
        },
        {
            label: 'Forums',
            url: 'https://forums.darkgalaxy.com/',
        },
        {
            label: 'Discord',
            url: 'https://discord.gg/rmsMdPM',
        },
    ];
    const other = [
        {
            label: 'helloweenpt.com tools',
            url: 'https://helloweenpt.com/darkgalaxy/',
        },
        {
            label: 'Resource calculator',
            url: 'https://n00b.org.uk/res.html',
        },
        {
            label: 'BO builder',
            url: 'https://bo.n00b.org.uk',
        },
        /*
        {
            label: 'Arcopix user scripts',
            url: 'https://github.com/Arcopix/dg-tools',
        },
        {
            label: 'Fl0v user scripts',
            url: 'https://github.com/fl0v/dg',
        },
        */
    ];


    let tpl = '';
    tpl += '<div class="lightBorder customLinks">';
    tpl += '<div class="opacBackground content padding">';
    links.forEach((l) => {
        tpl += '<a class="item" href="'+l.url+'" target="_blank">'+l.label+'</a>';
    });
    tpl += '<div class="item dropdown">';
    tpl += 'Other links';
    tpl += '<div class="dropdown-content opacBackground">';
    other.forEach((l) => {
           tpl += '<a href="'+l.url+'" target="_blank">'+l.label+'</a>';
    });
    tpl += '</div>'; // dropdown-content
    tpl += '</div>'; // dropdown
    tpl += '</div>'; // opacBackground content
    tpl += '</div>'; // lightBorder customLinks

    const container = document.querySelector('#playerBox');
    container.insertAdjacentHTML('afterend',tpl);

    /**
     * Custom css
     */
    const menuStyle = 'color: #fff; text-shadow: rgba(0, 0, 0, 0.5) 0 -1px 0; display: block; padding:0 10px; outline: none; line-height: 20px; font-weight: bold;';
    const style = document.createElement('style');
          style.type = 'text/css';
          style.innerHTML = ''
              + ' .customLinks { float:right; margin:13px; }'
              + ' .customLinks > div { display:flex; white-space: nowrap; }'
              + ' .customLinks .item { flex-grow:1; '+menuStyle+'}'
              + ' .customLinks .dropdown { position: relative; display: inline-block; }'
              + ' .customLinks .dropdown-content { display: none; position: absolute; right:-5px; top:20px; }'
              + ' .customLinks .dropdown-content a { flex-grow:1; flex-wrap:wrap; '+menuStyle+' padding:10px; }'
              + ' .customLinks .dropdown:hover .dropdown-content { display: flex; flex-direction: row-reverse; }'
           ;
    document.getElementsByTagName('head')[0].appendChild(style);

})();
