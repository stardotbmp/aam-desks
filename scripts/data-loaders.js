/*global $, people: true, deskJSON, M, unhideTabs */
/*jslint devel: true */
function PersonList() {
    'use strict';
    this.resolutionCount = 0;
    this.resolutionMax = 16;
    this.list = {};
}

PersonList.prototype.add = function (person) {
    'use strict';
    var initString;
    if (person.hasOwnProperty('initials')) {
        initString = person.initials.string;
        if (this.list.hasOwnProperty(initString)) {
            this.list[initString].push(person);
        } else {
            this.list[initString] = [person];
        }
    } else {
        console.warn('no initials property of added person');
    }
};

PersonList.prototype.resolveDuplicateInitials = function (count) {
    'use strict';
    var k, dupeKeys, thisList, dupeCounter = 1;
    thisList = this;
    if (count !== undefined) { this.resolutionMax = count; }


    if (this.resolutionCount < this.resolutionMax) {
        k = Object.keys(this.list);
        dupeKeys = k.filter(function (init) { return thisList.list[init].length > 1; });

        dupeKeys.forEach(function (init) {
            var i = init, initials, lastInitial, posLastInitial, newLastInitial;
            if (thisList.list[i]) {
                thisList.list[i].forEach(function (person) {
                    delete thisList.list[init];
                    initials = person.initials;
                    lastInitial = initials.array.slice(-1)[0];
                    posLastInitial = person.name.lastIndexOf(lastInitial);
                    newLastInitial = person.name.substr(posLastInitial, lastInitial.length + 1);
                    if (newLastInitial.length < lastInitial.length + 1) {
                        newLastInitial += dupeCounter;
                        dupeCounter += 1;
                    } else {
                        dupeCounter = 1;
                    }
                    if (initials.locked === false) {
                        initials.array.pop();
                        initials.array.push(newLastInitial);
                        initials.string = initials.array.join('');
                    }
                    thisList.add(person, true);
                });
            }
        });
    }
    this.resolutionCount += 1;
    if (this.resolutionCount <= this.resolutionMax) {
        this.resolveDuplicateInitials();
    }
    return thisList;
};

PersonList.prototype.byId = function() {
    'use strict';
    var idList = {};
    Object.keys(this.list).forEach(function (i) {
        idList[i] = i;
    });
    return this.list;
};

PersonList.prototype.asArray = function() {
    'use strict';
    var arr = [], record, i, j, tl, tli;
    tl = this.list;
    for (i in tl) {
        if (tl.hasOwnProperty(i)) {
            tli = tl[i];
            for (j in tli) {
                if (tli.hasOwnProperty(j)) {
                    record = tli[j];
                    arr.push({
                        name: record.name,
                        initials: record.initials.string,
                        id: record.id
                    });
                }
            }
        }
    }
    arr.sort(function (a, b) { return (a.name < b.name) ? -1 : (a.name > b.name) ? 1 : 0; });
    return arr;
};

function Initial(person) {
    'use strict';

    var defaultInitialsPattern = /[A-Z]{1}/g,
        firstPassInitials = person.name.replace(/O[’\']/g, '').match(defaultInitialsPattern),
        initalsString = firstPassInitials.join(''),
        i = person.initials;
    if (i === undefined) {
        person.initials = {array: firstPassInitials, string: initalsString, locked: false};
    } else {
        person.initials = {string: i, locked: true, array: i.match(/([A-Z]{1}[a-z]*)/g)};
    }

    return person;
}

function loadData(url, register, type, jsonp) {
    'use strict';

    register = register || 'staff';
    type = type || 'GET';
    jsonp = jsonp || null;

    var json;

    $.ajax({
        'async': false,
        'global': false,
        'url': url,
        'dataType': 'json',
        'success': function (data) {
            json = data;
            // console.log(json);
            unhideTabs();
        }
    });

    return json;
}

function parseJSON(data) {
    'use strict';
    return data;
}

function Registers() {
    'use strict';
    var allInitials = [], staffRegister, deskRegister, staffList;

    staffRegister = loadData('https://eaafd143433918df45b84e850467109eff93342d.googledrive.com/host/0B5noKR0hV7YVfmtncUVTbHBnNTR4eExWcFB3Q3R1WW5OdHVnTC1vUjh3VFBNVnYybWFRbFE/staff.json', 'staff');
    // deskRegister = loadData('https://docs.google.com/spreadsheet/pub?key=0AlktlYt5-E-DdDBmR1NMejVFTm9CYVg3cm5oR2RsTlE&single=true&gid=3&range=a1&output=txt', 'locations');
    // deskRegister = loadData('https://script.google.com/macros/s/AKfycbw87ukfkjFCVztHzeAQba0z73eoaTJ5VogPkPJrip28sRQHPJo/exec?callback=?', 'locations', 'GET', 'jsonp');

    if (deskJSON.hasOwnProperty('moves') && deskJSON.moves.length > 0) {
        deskRegister = deskJSON;
    } else {
        // deskRegister = loadData('https://docs.google.com/spreadsheet/pub?key=0AlktlYt5-E-DdDBmR1NMejVFTm9CYVg3cm5oR2RsTlE&single=true&gid=3&range=a1&output=txt', 'locations');
    }

    staffList = new PersonList();

    // console.log(staffRegister)


    staffRegister
        .map(function (row) {
            var nameCount = row.name.match(/\b[a-z]{2}?/gi),
                initials = [];
// console.log(row.name, nameCount, initials)
            initials = nameCount.map(function (i) { return i.slice(0, 1); });
            if (nameCount.length === 2) {
                initials.pop();
                initials.push(nameCount[nameCount.length - 1]);
            }
            allInitials.push(initials.join(''));
            row.initials = initials.join('');
            return row;
        })
        .forEach(function (row) {
            // console.log(row);
            var hasInitials = ''

            try {
                hasInitials = new Initial({name: row.name, id: row.id});
                staffList.add(hasInitials);
            } catch (err) {
                // bad user object
                // move on nothing to see
            }
        });

    staffList.resolveDuplicateInitials(1);
    this.staff = staffList.asArray();
    this.desks = deskRegister.desks.map(function (row) {
//         console && console.log(row);
        row.index = row.index.replace(/\ \/\ /g, '-');
        row.free = (row.available !== "Yes" || row.occupiedby !== ""|| row.email !== "") ? "" : "Free";
        return row;
    });

    this.moves = deskRegister.moves.map(function (row) {
        row.index = row.index.replace(/\ \/\ /g, '-');
        // if (row.index==="85-3-18") { console.log(row.index, row.available !== "Yes", row.occupiedby !== "", row.email !== ""); }
        row.free = (row.available !== "Yes" || row.occupiedby !== ""|| row.email !== "") ? "" : "Free";
        // if (row.index==="85-3-18") { console.log(row.index, row.available !== "Yes", row.occupiedby !== "", row.email !== ""); }
        row.originaldesk = row.originaldesk.replace(/\ \/\ /g, '-');
        return row;
    });

    this.phones = deskRegister.phones.map(function (row) {
        var newRow = {id: row.login, mobile: row.mobile, ext: row.extension};
        return newRow;
    });

    M.savedMoves = deskRegister.moveDates.map(function (row) {
        return row;
    });

    M.setMovesToSaved();
}