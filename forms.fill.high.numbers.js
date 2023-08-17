// ==UserScript==
// @name         Dark Galaxy - Fill forms with high numbers
// @namespace    https://darkgalaxy.com/
// @version      0.3
// @description  All your planet are belong to us
// @author       Riddick
// @homepage     https://github.com/fl0v/dg
// @supportURL   https://github.com/fl0v/dg/issues
// @downloadURL  https://github.com/fl0v/dg/raw/master/forms.fill.high.numbers.js
// @match        https://*.darkgalaxy.com/planet/*/production/
// @match        https://*.darkgalaxy.com/planet/*/training/
// @match        https://*.darkgalaxy.com/fleet/*
// @grant        none
// ==/UserScript==

(function () {

    getInputNumber = function(element) {
        return getInputOfType(element, 'number');
    }

    getInputOfType = function(element, type) {
        if (element) {
            inputs = element.getElementsByTagName('input');
            for (let i=0; i<inputs.length; i++) {
                if (inputs[i].type.toLowerCase() == type) {
                    return inputs[i];
                }
            }
        }
        return null;
    }

    onCheck = function(event) {
        fillTextForm(event.target.parentNode.parentNode, !event.target.checked);
    }

    fillTextForm = function(lineDiv, clear) {
        let input = getInputNumber(lineDiv);
        if (input) {
            input.value = clear ? '' : 999999999;
        }
    }

    submitForm = function() {
        HTMLFormElement.prototype.submit.call(document.getElementById('addQueue'));
    }

    fillTextFormThenSubmit = function(event) {
        fillTextForm(event.target.parentNode.parentNode);
        submitForm();
    }

    getTrainingFormDiv = function(doc) {
        return (doc ? doc : document).querySelector('form#addQueue .trainList.availableItem.entry');
    }

    fillTrainingFormThenSubmit = function(event) {
        fillTextForm(getTrainingFormDiv());
        submitForm();
    }

    const parser = new DOMParser();
    ajaxTrainMultiple = function(event) {
        fillTextForm(getTrainingFormDiv());
        let div = event.target.parentNode;
        let nb = parseInt(div.dataset.nb);
        ajaxTrainRecursive(div, nb);
    }

    ajaxTrainRecursive = function(div, nb) {
        document.getElementById('fillQueueBt').disabled = true;
        if (nb >= 2 && nb <= 16) {
            $.ajax({
                type: 'POST',
                url: $("form#addQueue").attr("action"),
                data: $("form").serialize(),
                success: function(response) {
                    nb--;
                    updateAjaxButton(div, nb);
                    if (getInputNumber(getTrainingFormDiv(parser.parseFromString(response, "text/html")))) {
                        ajaxTrainRecursive(div, nb);
                    } else {
                        submitForm();
                    }
                },
                error: function() {
                    submitForm();
                }
            });
        } else {
            submitForm();
        }
    }

    incrAjaxCount = function(event, incr) {
        let div = event.target.parentNode;
        let newNb = parseInt(div.dataset.nb) + parseInt(incr);
        if (newNb >= 1 && newNb <= parseInt(div.dataset.max)) {
            updateAjaxButton(div, newNb);
        }
    }

    updateAjaxButton = function(div, nb) {
        div.dataset.nb = nb;
        div.getElementsByClassName('ajax')[0].value = '1G, ' + div.dataset.nb + ' times';
    }

    let checkbox = function(css) {
        return '<div class="'+css+'" style="width:22px">'
            + '<input type="checkbox" onchange="onCheck(event)"></div>';
    }
    let button = function(css, funct) {
        return '<div class="'+css+'" style="width:33px">'
            + '<input type="button" value="1G" onclick="' + funct + '(event)" style="padding:2px 4px"></div>';
    }
    // Shipyard production
    document.querySelectorAll('.prodList .nameCol')
        .forEach(element => element.style = 'width:125px');
    document.querySelectorAll('.prodList .buildButton')
        .forEach(element => element.insertAdjacentHTML('beforebegin',
            checkbox('left buildButton') + button('left', 'fillTextFormThenSubmit')));

    // Barracks training
    let trainingFormDiv = getTrainingFormDiv();
    let trainingSubmitBtn = getInputOfType(document.getElementById('addQueue'), 'submit');
    if (trainingSubmitBtn && getInputNumber(trainingFormDiv)) {
        queuedItems = document.getElementsByClassName('queueItem').length;
        if (window.location.hostname.startsWith('speedgame')) {
            var defaultItemsToQueue = 10 - queuedItems;
        } else {
            var defaultItemsToQueue = -6 - queuedItems;
        }
        const maxItemsToQueue = defaultItemsToQueue + 6;
        let styleIncrBtn = ' style="height:17px;width:17px;float:none;vertical-align:middle;'
            + 'background-color:transparent"';
        let trainMultipleBt = '';
        if (maxItemsToQueue > 1) {
            defaultItemsToQueue = Math.max(defaultItemsToQueue, 1);
            trainMultipleBt = '<div class="right queueButtons" style="width: 160px" '
                    + 'data-nb="' + defaultItemsToQueue + '" data-max="' + maxItemsToQueue + '">'
                + '<input type="button" onclick="incrAjaxCount(event, -1)" class="queueRemoveButton"'
                    + styleIncrBtn + '">'
                + '<input type="button" onclick="ajaxTrainMultiple(event)" '
                    + 'value="1G, ' + defaultItemsToQueue + ' times" id="fillQueueBt" '
                    + 'class="ajax" style="width:86px;padding:2px 4px;margin:0 4px;vertical-align:middle">'
                + '<input type="button" onclick="incrAjaxCount(event, 1)" class="addQueue"'
                        + styleIncrBtn + '></div>';
        }
        trainingSubmitBtn.parentNode.insertAdjacentHTML('afterend',
            button('right', 'fillTrainingFormThenSubmit') + trainMultipleBt);
    }

    // Fleet management
    let addHeader  = function(row) {
        let table = row.parentNode;
        if (!table.dataset.isColumnAdded) {
            table.dataset.isColumnAdded = true;
            let colHeadList = table.getElementsByClassName('tableHeader');
            if (colHeadList.length >= 1) {
                let colHeads = colHeadList[0].children;
                if (colHeads.length >= 2) {
                    let lastCol = colHeads[colHeads.length - 1];
                    lastCol.style='width:150px';
                    lastCol.insertAdjacentHTML('afterend',
                        '<div class="title" style="width:36px;text-align:right">1G</div>');
                }
            }
        }
    }
    document.querySelectorAll('.transferRow')
        .forEach(row => {
            if (getInputNumber(row)) {
                row.insertAdjacentHTML('beforeend', checkbox('right'));
                addHeader(row);
            }
        });

})();
