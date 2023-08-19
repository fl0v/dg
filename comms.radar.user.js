// ==UserScript==
// @name         Dark Galaxy - Global radar page enhancement
// @namespace    https://darkgalaxy.com/
// @version      0.13
// @description  My God Its Full Of Stars!
// @author       Biggy
// @homepage     https://github.com/fl0v/dg
// @supportURL   https://github.com/fl0v/dg/issues
// @downloadURL  https://github.com/fl0v/dg/raw/master/comms.radar.user.js
// @match        https://*.darkgalaxy.com/radar/
// @grant        none
// ==/UserScript==

(function() {
    /*
     * @todo Change companion layout
     * @todo Filter by score
     */

    const pattern = /([1-9]+)\.(\d+)\.(\d+)[\s]+(.*)/;
    const radarsSelector = '#planetList .planetHeadSection';
    const fleetsSelector = '#planetList .entry';
    const planetShortcut = (p) => `
        <a class="planet" href="#${p.id}">${p.coords.split('\.')[0]}.${p.coords.split('\.')[1]}</a>
    `;
    const searchMinLength = 3; // search only if atleast 3 chars
    const toggleFleet = (el,toggle) => { el.style = toggle ? 'display:block;' : 'display:none;'; };
    const showAllFleets = () => {
        document.querySelectorAll(fleetsSelector).forEach((el) => toggleFleet(el,true));
        checkEntries();
    };
    const checkEntries = () => {
        // will hide a radar if all entries are hidden
        document.querySelectorAll(radarsSelector).forEach((el) => {
            const hasFleets = Array.from(el.querySelectorAll('.entry'))
                .reduce((carry, entry) => {
                    return carry || entry.style.display !== 'none';
                }, false)
            ;
            el.parentNode.classList.toggle('hide', ! hasFleets);
        });
    };

    let planets = [];
    let systems = [];
    document.querySelectorAll(radarsSelector).forEach((el) => {
        const planet = el.querySelector(':first-child').innerText;
        if (planet.match(pattern)) {
            const [,g,s,p,n] = pattern.exec(planet);
            const id = 'p-'+g+'-'+s+'-'+p;
            const sys = g+'-'+s;
            el.id = id;
            planets.push({
                id: id,
                coords: g + '.' + s + '.' + p,
                name: n
            });
            if (! systems.includes(sys)) {
                systems.push(sys);
            } else {
                el.parentNode.classList.add('collapsed');
            }
            el.querySelector('.planetName').insertAdjacentHTML('afterend',`
                <div class="actions right">
                    <span class="collapse">[&minus;]</span>
                    <span class="expand">[&plus;]</span>
                </div>
            `);
            el.querySelector('.actions')
                .addEventListener('click', (event) => {
                    el.parentNode.classList.toggle('collapsed', ! event.target.classList.contains('expand'));
                })
            ;
        }
     });

    /**
     * Lets build a companion box with shortcuts to each radar
     */
    let singlePlanetSystem = [];
    let uniqueSystems = [];
    planets.forEach((p) => {
        const [g,s] = p.coords.split('\.');
        if (!uniqueSystems.includes(g + '.' + s)) {
            uniqueSystems.push(g + '.' + s);
            singlePlanetSystem.push(p);
        }
    });
    const tplPlanets = singlePlanetSystem.reduce((carry, p) => carry + planetShortcut(p),'');

    const container = document.querySelector('#contentBox');
    if (container) {
        container.classList.add("relative-container");
        container.insertAdjacentHTML('afterbegin',`
            <div class="radar-companion-container">
            <div class="lightBorder opacDarkBackground radar-companion">
                <div class="links-container">
                    ${tplPlanets}
                    <span class="top"><a href="#">Top</a></span>
                </div>
            </div>
            </div>
        `);
    }

    /**
     * Add a quick filter/search box
     */
    const buildFilterOption = (label, value) => {
        return `
            <label for="id-qf-${value}">
                <input type="radio" name="quickFilter" id="id-qf-${value}" value="${value}" />
                <span class="label">${label}</span>
            </label>
        `;
    };
    const header = document.querySelector('#contentBox > .header');
    if (header) {
        header.classList.add('d-flex');
        header.insertAdjacentHTML('beforeend',`
        <span id="quick-filter">
            ${buildFilterOption('All fleets', 'any-any')}
            ${buildFilterOption('Only owned','friendly-any')}
            ${buildFilterOption('Alliance', 'friendly_allied-any')}
            ${buildFilterOption('Alliance attacking', 'friendly_allied-hostile')}
            ${buildFilterOption('Hostile', 'hostile-any')}
            ${buildFilterOption('Hostile attacking', 'hostile-friendly_allied')}
        </span>
        <span id="quick-search">
            <input id="input-quick-search" type="text" name="quickSearch" value="" placeholder="Quick search..." />
        </span>
        `);
    }
    const inputSearch = document.querySelector('#input-quick-search');
    const inputFilterAll = document.querySelector('#id-qf-any-any');
    const parseEntry = (entry) => {
        const elName = entry.querySelector('.name');
        const elOwner = entry.querySelector('.owner');
        const elOwnerType = entry.querySelector('.owner > *');
        const elDestinationType = entry.querySelector('.destination .friendly, .destination .allied, .destination .hostile, .destination .neutral');
        const elDestination = entry.querySelector('.destination');
        const elScore = entry.querySelector('.score');
        const elTurns = entry.querySelector('.turns');
        const elParent = entry.closest('.planetHeadSection');
        return {
            owner: elOwner ? elOwner.innerText.trim() : '',
            ownerType: elOwnerType ? elOwnerType.className : '',
            destinationType: elDestinationType ? elDestinationType.className : '',
            destination: elDestination ? elDestination.innerText.trim() : '',
            name: elName ? elName.innerText.trim() : '',
            score: elScore ? elScore.innerText.trim() : '',
            turns: elTurns ? elTurns.innerText.trim() : '',
            parent: elParent ? elParent.id : '',
            //el: entry.cloneNode(true),
        };
    };

    // quick filter fleets
    document.querySelector('#quick-filter')
        .addEventListener('input', (event) => {
            inputSearch.value = '';
            const [owner,destination] = event.target.value.split('-');
            document.querySelectorAll(fleetsSelector).forEach((el) => {
                const info = parseEntry(el);
                let valid = true;
                    valid = valid && (owner == 'any' || owner.includes(info.ownerType));
                    valid = valid && (destination == 'any' || destination.includes(info.destinationType));
                toggleFleet(el,valid);
            });
            checkEntries();
        })
    ;

    // quick search action
    const filterFleets = (search) => {
        showAllFleets();
        document.querySelectorAll(fleetsSelector).forEach((el) => {
            const searchPattern = new RegExp(search, 'gi');
            toggleFleet(el, el.innerText.match(searchPattern));
        });
        checkEntries();
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
     * Incoming warning
     */
    let incoming = {};
    document.querySelectorAll(fleetsSelector).forEach((entry) => {
        const info = parseEntry(entry);
        if (info.ownerType == 'hostile' && ['friendly','allied'].includes(info.destinationType)) {
            if (! incoming[info.destination]) {
                incoming[info.destination] = info;
            }
            entry.insertAdjacentHTML('beforeend', '<span class="incoming-warning blinking">!</span>');
        }
    });
    const incomingMessages = Object.entries(incoming)
        .reduce((carry, fleet) => {
            carry.push('<a class="incoming-destination" href="#'+fleet[1].parent+'">'+fleet[1].destination+'</a>');
            return carry;
        },[])
    ;
    if (header && incomingMessages.length) {
        header.insertAdjacentHTML('afterend',`
            <div id="incoming" class="opacBackground padding">
            Incoming on: ${incomingMessages.join(', ')} <span class="incoming-warning blinking">!</span>
            </div>
        `);
        document.querySelector('#incoming').addEventListener('click', (event) => {
            event.preventDefault();
            inputSearch.value = event.target.innerText;
            inputSearch.dispatchEvent(new Event('input'));
            return false;
        });
    }

    /**
     * Custom css
     */
    const style = document.createElement('style');
    style.innerHTML = `
        .d-flex { display:flex; }
        .radar-companion-container { position:fixed; top:190px; width:900px; left:50%; transform: translateX(-50%); }
        .radar-companion { width:50px; padding:5px; position:absolute; top:0; right:-100px; z-index:9999; overflow:hidden; }
        .radar-companion .links-container { display:flex;flex-direction:column;  }
        .radar-companion .planet { display:block; margin:2px; font-size:14px; white-space: nowrap; }
        .radar-companion .top { display:block; margin:15px 2px 5px 2px; font-size:12px; text-align:left;}
        .relative-container { position:relative; }
        #quick-search { display:inline-block; margin-right:15px; }
        #quick-filter { font-family: Tahoma, sans-serif; font-size:12px; text-shadow:none; text-align:center; flex-grow:1; }
        #incoming { text-align:center; }
        #planetList .hide { display:none; }
        #planetList .actions { padding:4px; }
        #planetList .actions .collapse { display:block; cursor:pointer; }
        #planetList .actions .expand { display:none; cursor:pointer; }
        #planetList .collapsed #radarList { display:none; }
        #planetList .collapsed .actions .collapse { display:none; }
        #planetList .collapsed .actions .expand { display:block; }
        .incoming-warning {
            display:inline-block; border-radius:50%; padding:0 5px;
            font-weight:bold; font-size:14px; line-height:14px; background-color:#fff; color:red;
        }
        .blinking { animation: blinker 1s linear infinite; }
        @keyframes blinker {
            50% { opacity: 0; }
        }
    `;
    document.getElementsByTagName('head')[0].appendChild(style);


})();
