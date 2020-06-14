// ==UserScript==
// @name         Dark Galaxy - Global radar page enhancement
// @namespace    https://darkgalaxy.com/
// @version      0.2
// @description  My God Its Full Of Stars!
// @author       Biggy
// @source       https://github.com/fl0v/dg
// @supportURL   https://github.com/fl0v/dg/issues
// @downloadURL  https://github.com/fl0v/dg/raw/master/comms.radar.user.js
// @match        https://*.darkgalaxy.com/radar/
// @grant        none
// ==/UserScript==

(function() {
    /*
     * @todo Remove duplicate systems
     * @todo Warning for incoming hostiles
     * @todo Change companion layout
     * @todo Filter by score
     */

    const pattern = /([1-9]+)\.(\d+)\.(\d+)[\s]+(.*)/;
    const radarsSelector = '#planetList .planetHeadSection';
    const fleetsSelector = '#planetList .entry';
    const planetShortcut = (p) => '<a class="planet" href="#'+p.id+'">('+p.coords+') ' + p.name+'</a>';
    const searchMinLength = 3; // search only if atleast 3 chars
    const hideFleet = (el) => { el.style = 'display:none;'; };
    const showFleet = (el) => { el.style = 'display:block;'; };
    const showAllFleets = () => { document.querySelectorAll(fleetsSelector).forEach(showFleet); };
    let planets = [];

    Array.from(document.querySelectorAll(radarsSelector)).forEach((el) => {
        const planet = el.querySelector(':first-child').innerText;
        if (planet.match(pattern)) {
            const [,g,s,p,n] = pattern.exec(planet);
            const id = 'p-'+g+'-'+s+'-'+p;
            el.id = id;
            planets.push({
                id: id,
                coords: g+'.'+s+'.'+p,
                name: n
            });
        }
     });

    /**
     * Lets build a companion box with shortcuts to each radar
     */
    let companion = '<div class="lightBorder opacDarkBackground radar-companion">';
    companion += '<div class="links-container">';
    companion += planets.reduce((carry, p) => {
        return carry + planetShortcut(p);
    },'');
    companion += '<span class="top"><a href="#">Top</a></span>';
    companion += '</div></div>';
    const container = document.querySelector('#contentBox');
    container.classList.add("relative-container");
    container.insertAdjacentHTML('afterbegin',companion);

    /**
     * Add a quick filter/search box
     */
    const buildFilterOption = (label, value) => {
        return ''
            + '<label for="id-qf-'+value+'">'
            + '<input type="radio" name="quickFilter" id="id-qf-' + value + '" value="' + value +'" />'
                + '<span class="label">'+label+'</span>'
            + '</label>'
        ;
    };
    const header = document.querySelector('#contentBox > .header');
    header.classList.add('d-flex');
    header.insertAdjacentHTML('beforeend',''
        + '<span id="quick-filter">'
            + buildFilterOption('All fleets', 'any-any')
            + buildFilterOption('Only owned','friendly-any')
            + buildFilterOption('Alliance', 'friendly_allied-any')
            + buildFilterOption('Alliance attacking', 'friendly_allied-hostile')
            + buildFilterOption('Hostile', 'hostile-any')
            + buildFilterOption('Hostile attacking', 'hostile-friendly_allied')
        + '</span>'
        + '<span id="quick-search">'
            +'<input id="input-quick-search" type="text" name="quickSearch" value="" placeholder="Quick search..." />'
        + '</span>'
    );
    const inputSearch = document.querySelector('#input-quick-search');
    const inputFilterAll = document.querySelector('#id-qf-any-any');

    // quick filter fleets
    document.querySelector('#quick-filter')
        .addEventListener('input', (event) => {
            inputSearch.value = '';
            const [owner,destination] = event.target.value.split('-');
            Array.from(document.querySelectorAll(fleetsSelector)).forEach((el) => {
                const entryOwner = el.querySelector('.owner > *').className;
                const entryDestination = el.querySelector('.destination .friendly, .destination .allied, .destination .hostile').className;
                let valid = true;
                    valid = valid && (owner == 'any' || owner.includes(entryOwner));
                    valid = valid && (destination == 'any' || destination.includes(entryDestination));
                if (valid) {
                    showFleet(el);
                } else {
                    hideFleet(el);
                }
            });
        })
    ;

    // quick search action
    const filterFleets = (search) => {
        Array.from(document.querySelectorAll(fleetsSelector)).forEach((el) => {
            const searchPattern = new RegExp(search, 'gi');
            if (!el.innerText.match(searchPattern)) {
                hideFleet(el);
            } else {
                showFleet(el);
            }
        });
    };
    inputSearch.addEventListener('keydown', (event) => {
            if (event.keyCode == 27) {
                event.target.value = '';
                showAllFleets();
            }
    });
    inputSearch.addEventListener('input', (event) => {
        const search = event.target.value;
        if (String(search).length >= searchMinLength) {
            inputFilterAll.checked = true;
            filterFleets(search);
        }
    });

    /**
     * Custom css
     */
    const style = document.createElement('style');
          style.type = 'text/css';
          style.innerHTML = ''
            + ' .d-flex { display:flex; }'
            + ' .radar-companion { width:100px; padding:5px; position:fixed; top:190px; right:0; z-index:9999; overflow:hidden; }'
            + ' .radar-companion:hover { width:300px; }'
            + ' .radar-companion .links-container { display:flex;flex-direction:column;  }'
            + ' .radar-companion .planet { display:block; margin:2px; font-size:14px; white-space: nowrap; }'
            + ' .radar-companion .top { display:block; margin-top:5px; font-size:12px; text-align:right; }'
            + ' .relative-container { position:relative; }'
            + ' #quick-search { display:inline-block; margin-right:15px; }'
            + ' #quick-filter { font-family: Tahoma, sans-serif; font-size:12px; text-shadow:none; text-align:center; flex-grow:1; }'

    ;
    document.getElementsByTagName('head')[0].appendChild(style);





})();
