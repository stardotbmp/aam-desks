/*global deskInfo, R, F, T, $, loadData, makeColorGradient */
/*jslint devel:true, unused:false, loopfunc:true */

function icon(ico) {
    'use strict';
    return [].concat(ico).map(function (i) {
        return $('<i>').attr('class', i)[0].outerHTML;
    }).join('');
}

String.prototype.format = function() {
    'use strict';

    var formatted = this, arg;
    for (arg in arguments) {
        if (arguments.hasOwnProperty(arg)) {
            formatted = formatted.replace('{' + arg + '}', arguments[arg]);
        }
    }
    return formatted;
};

function isIdentical(a, b) {
    'use strict';

    var attr, match;

    match = (Object.keys(a).length === Object.keys(b).length); // same number of properties in each object
    if (match) {
        for (attr in a) {
            if (a.hasOwnProperty(attr)) {
                if (b.hasOwnProperty(attr)) {
                    match = (match && (b[attr] === a[attr])); // true * true = true, true * false = false, false * false = false
                } else {
                    match = false; // if a property is present in a but not in b
                }
            }
        }
    }

    return match;
}

function filterDesks(id, locationRegister) {
    'use strict';
    return locationRegister.filter(function (desk) { return desk.email === id; });
}

function filterStaff(id, staffRegister, mode) {
    'use strict';

    mode = mode || 'current';

    // console.log(mode);
    // console.log(staffRegister);
    // console.log(id);

    return staffRegister.filter(
        function (s) {

            var result;

            if (s.hasOwnProperty('id')) {

                if (mode !== 'staff') {

                    if(deskInfo[id] && deskInfo[id][mode]) {
                        result = (deskInfo[id][mode].some(
                            function (occupant) {
                                return (occupant.email === s.id);
                            }
                        ));
                    }
                } else {

//                    console.log(mode, s, id);

                    result = (s.id === id);
                }
                return result;
            }
        }
    );
}

function returnDeskRegister(mode) {
    'use strict';
    return (mode === 'proposed') ? R.moves : R.desks;
}

function getId(teamName) {
    'use strict';
    var id;

    /*** doesn't assume proper project indexing ***/
    if (teamName.indexOf('--') > 0) {
        id = teamName.match(/(\S*?)\-/)[0];
    } else {
        id = teamName.replace(/[\s\W]/g, '');
    }
    return id.toLowerCase();
    /***/
}

function TeamsList() {
    'use strict';

    var register, lists, teamName, r, reg, floor, mode, teamId, that;

    register = {};
    lists = {};
    register.current = R.desks;
    register.proposed = R.moves;
    that = this;

    for (reg in register) {
        if (register.hasOwnProperty(reg)) {
            for (r = 0; r < register[reg].length; r += 1) {
                teamName = register[reg][r].team;
                teamId = register[reg][r].teamId || getId(teamName); // corrected to allow for properly indexed projects

                floor = register[reg][r].floor;

                if (teamName !== '') {
                    if (!lists.hasOwnProperty(teamId)) {
                        lists[teamId] = {name: teamName};
                    }
                    if (!lists[teamId].hasOwnProperty(floor)) {
                        lists[teamId][floor] = {current: 0, proposed: 0};
                    }
                    lists[teamId][floor][reg] += 1;
                }
            }
        }
    }

    delete lists[''];
    this.list = lists;
    this.teams = {};
    this.modes = {current: {}, proposed: {}};

    this.update = function (property) {

        var newLists, newTeams, Register, Reg, c, Teamname, Teamid, Floor;

        for (Reg in Register) {
            if (Register.hasOwnProperty(Reg)) {
                for (c = 0; c < register[reg].length; c += 1) {
                    Teamname = Register[Reg][c].team;
                    Teamid = Register[Reg][c].teamId || getId(Teamname); // corrected to allow for properly indexed projects

                    Floor = Register[Reg][c].floor;

                    if (Teamname !== '') {
                        if (!newLists.hasOwnProperty(Teamid)) {
                            newLists[Teamid] = {name: Teamname};
                        }
                        if (!newLists[Teamid].hasOwnProperty(Floor)) {
                            newLists[Teamid][Floor] = {current: 0, proposed: 0};
                        }
                        newLists[Teamid][Floor][Reg] += 1;
                    }
                }
            }
        }

        switch (property) {
        case 'teams' :
            // console.log(newLists);
            break;
        default:
            // console.log('here');
        }
    };

    for (teamName in lists) {
        if (lists.hasOwnProperty(teamName)) {

            this.teams[teamName] = lists[teamName].name;

            for (floor in lists[teamName]) {
                if (lists[teamName].hasOwnProperty(floor)) {
                    if (F.indexes.indexOf(floor) >= 0) {
                        for (mode in this.modes) {
                            if (this.modes.hasOwnProperty(mode)) {
                                if (!this.modes[mode].hasOwnProperty(teamName)) {
                                    this.modes[mode][teamName] = {};
                                }
                                this.modes[mode][teamName] = {};

                                if (F.register[floor][mode]) {
                                    // console.log(this.modes,teamName, floor,mode,F.register[floor],F.register[floor][mode])
                                    this.modes[mode][teamName][floor] = F.register[floor][mode][teamName];
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    this.length = Object.keys(this.teams).length;

    // this.refreshTeams = function() {};
}

function MoveList() {
    'use strict';

    var that = this;

    this.matchingRows = [];
    this.moves = [];
    this.savedMoves = [];

    this.reset = function () {
        that.moves = [];

        return that;
    };

    this.setMovesToSaved = function () {
        that.moves = that.savedMoves.map(function (o) { return o; });
        return that;
    };

    this.setSavedMoves = function () {
        that.savedMoves = that.moves.map(function (o) { return o; });
        return that;
    };

    this.row = {};

    this.match = function (row) {
        var r, r2, match, param;
        that.matchingRows = that.savedMoves.map(function(o) { return o; });

        var rKeys = Object.keys(row).filter(function(key) { return row[key] !== undefined; });

        // console.debug({row:row, match: that.matchingRows});
        // console.log(rKeys);

        for (r = 0; r < rKeys.length; r += 1) {

            if (typeof row[rKeys[r]] === 'object') {
                // console.log(typeof row[rKeys[r]]);
                for (r2 = 0; r2 < Object.keys(row[rKeys[r]]).length; r2 +=1) {
                    param = Object.keys(row[rKeys[r]])[r2];
                    match = row[rKeys[r]][param];

                    // console.log({param: param, match: match});
                    that.matchingRows = that.matchingRows.filter(function (fRow) {
                        // console.log(fRow[rKeys[r]][param]);
                        return fRow[rKeys[r]][param] === match;
                    });
                }
            } else {
                param = rKeys[r];
                that.matchingRows = that.matchingRows.filter(function (fRow) {
                    return fRow[param] === row[param];
                });
            }
        }
        return that.matchingRows;
    };

    this.add = function () {
        that.moves.push({
            date: that.row.date,
            moveType: that.row.moveType,
            who: that.row.who,
            from: that.row.from,
            to: that.row.to,
            notes: that.row.notes,
            buildNotes: that.row.buildNotes,
            sharingWith: that.row.shareDetails,
            team: {
                id: that.row.team.id,
                name: that.row.team.name
            },
            it: {
                hardware: that.row.hardware,
                software: that.row.software
            }
        });

        return that;
    };
}

function PhoneList() {
    'use strict';

    this.phones = {};

    var p, phoneRegister, s;

    phoneRegister = R.phones;

    for (s = 0; s < R.staff.length; s += 1) {
        this.phones[R.staff[s].id] = {phone: null, mobile: null};
    }

    for (p = 0; p < phoneRegister.length; p += 1) {
        this.phones[phoneRegister[p].id] = {
            phone: phoneRegister[p].ext,
            mobile: phoneRegister[p].mobile
        };
    }
}

function FloorsList() {
    'use strict';

    var register, floor, f, reg, r, teamName, teamId, staff, count, team, building;

    this.register = {'1': {}, '2': {}, '3': {}, '4': {}, 'B': {}, '0': {}, 'isis2': {}, 'isis1': {}, 'isis3': {}};
    this.teams = {'1': {}, '2': {}, '3': {}, '4': {}, 'B': {}, '0': {}, 'isis2': {}, 'isis1': {}, 'isis3': {}};
    this.staff = {'1': {}, '2': {}, '3': {}, '4': {}, 'B': {}, '0': {}, 'isis2': {}, 'isis1': {}, 'isis3': {}};
    this.count = {'1': {}, '2': {}, '3': {}, '4': {}, 'B': {}, '0': {}, 'isis2': {}, 'isis1': {}, 'isis3': {}};
    this.indexes = Object.keys(this.register).sort(function (a, b) {
        return (a > b) ? 1 : (a < b) ? -1 : 0;
    });

    register = {};
    staff = {};
    count = {};

    register.current = R.desks;
    register.proposed = R.moves;
    for (reg in register) {
        if (register.hasOwnProperty(reg)) {
            for (r = 0; r < register[reg].length; r += 1) {

                teamName = register[reg][r].team;
                teamId = register[reg][r].teamId || getId(teamName); // corrected to allow for properly indexed projects

                floor = register[reg][r].floor;
                building = register[reg][r].building;

                if (building.toString().indexOf('IS') >= 0) { floor = "isis" + floor; }

                if (teamId !== '') {
                    if (!this.register[floor].hasOwnProperty(reg)) {
                        this.register[floor][reg] = {};
                    }
                    if (!this.register[floor][reg].hasOwnProperty(teamId)) {
                        this.register[floor][reg][teamId] = [];
                    }
                    this.register[floor][reg][teamId].push(register[reg][r]);
                }
            }
        }
    }

    for (f in this.register) {
        if (this.register.hasOwnProperty(f)) {
            for (reg in this.register[f]) {
                if (this.register[f].hasOwnProperty(reg)) {
                    staff[f] = {current: [], proposed: []};
                    count[f] = {current: 0, proposed: 0};
                    for (team in this.register[f][reg]) {
                        if (this.register[f][reg].hasOwnProperty(team)) {
                            this.register[f][reg][team].forEach(function (desk) {
                                count[f][reg] += 1;
                                staff[f][reg].push(filterStaff(desk.email, R.staff, 'staff')[0]);
                            });
                        }
                    }
                    this.count[f][reg] = count[f][reg];
                    this.staff[f][reg] = staff[f][reg];
                    this.teams[f][reg] = Object.keys(this.register[f][reg]);
                }
            }
        }
    }

    this.refreshFloor = function (mode, floor) {
        floor = floor || 0;
        mode = mode || 'current';
    };
}


function FloorKey(mode, floor) {
    'use strict';

    mode = mode || 'current';
    floor = floor || 3;
}

function posted(e) {
    'use strict';
    // console.log(e);
}

function postProposal() {
    'use strict';
    var url = aam.activeSrc() + '?callback=?',

    // $.ajax({
    //     url: url,
    //     async: false,
    //     type: 'POST',
    //     dataType: 'json',
    //     jsonp: 'posted'
    //     //,
    //     // crossDomain: true
    // });

        json;

    json = loadData(url);
    // console.log(json);
}

function success(test) {
    'use strict';

    // console.log('banana');
}

function testPOST() {
    'use strict';

    var result = '',
        url = aam.activeSrc(),
        data = deskInfo['FP-1-1'],
        success,
        options = {
            dataType: 'json',
            data: data,
            type: 'POST',
            success: function (d, status, jqxhr) {
                d = d;
                status = status;
                jqxhr = jqxhr;
            }
        };
    $.ajax(url, options);
}

function result(test) {
    'use strict';

    return test;
}

function hideTabs() {
    // $("#loading .spinner").css("font-size", $(".tabwindow").css("height"));
    'use strict';

     if (deskJSON.activeUser == "") {

       $('body').attr({"data-unauth":"true"});
     }
    $('#loading.tab').fadeIn();
}

function unhideTabs() {
    // $("#loading .spinner").css("font-size", $(".tabwindow").css("height"));
    'use strict';

    if(deskJSON.activeUser !== "") {
      $('#loading.tab').fadeOut();
      $('.tabwindow').attr({"data-email": deskJSON.activeUser});
    }
    if (deskJSON.activeUser == "") {
       $('body').attr({"data-unauth":"true"});
      $('.tab').fadeOut();
      $('#auth').fadeIn();

    }

    // console.log('unhide');
}

function buildKeys() {
    'use strict';

    /** CODE BELOW TO BUILD TEAM KEYS PER FLOOR, PER MODE **/
    var keyText = '',
        t,
        teamKey = $('.key .toggleSwatches'),
        keyModes = ['current', 'proposed'],
        buildings = ['southwark','isis'];

    $(teamKey).empty();

    for (t in F.teams) {
        if (F.teams.hasOwnProperty(t)) {
            keyModes.forEach(function(mode) {
                var keyTeam;
                var floorRegister = F.register[t][mode];
                // var buildingTeam = floorRegister.filter(function(r){ return r; });




                keyText = $('<ul data-building="" data-floor="' + t + '" data-mode="' + mode + '"></ul>');
                for (keyTeam in floorRegister) {
                    if (floorRegister.hasOwnProperty(keyTeam)) {


                        $(keyText).append('<li data-team="' + keyTeam + '"><span class="keySwatch"></span><span class="teamId">' + ((keyTeam.match(/[0-9]{2,}/g)) ? keyTeam : '') + '</span><span class="teamName">' + T.teams[keyTeam] + '</span><span class="count">' + floorRegister[keyTeam].length + '</span></li>');
                    }
                }
                $(teamKey).append(keyText);
            });
        }
    }

    $('.key li[data-team]').each(function () {
        $(this)
            .mouseenter(function (e) {
                $('[data-team]:not([data-team="' + $(e.currentTarget).attr('data-team') + '"])')
                    .each(function () {
                        $($(this)[0]).attr('class', $($(this)[0]).attr('class') + ' inactive');
                    });
                $('[data-team="' + $(e.currentTarget).attr('data-team') + '"]')
                    .each(function () {
                        $($(this)[0]).attr('class', $($(this)[0]).attr('class') + ' active');
                    });
            })
            .mouseleave(function () {
                $('[data-team]')
                    .each(function () {
                        $($(this)[0]).attr('class', $($(this)[0]).attr('class')
                                .replace('undefined', '')
                                .replace(' inactive', '')
                                .replace(' active', '')
                            );
                    });
            });
    });

    $('ul[data-floor="' + $('.lines.live').attr('data-floor') + '"]')
        .each(function () {
            $(this).attr('class', $(this).attr('class') + ' live');
        });

    /** END OF TEAM KEY CODE **/

    return teamKey;
}

function buildTeamCSS() {
    // build the custom css for team colors
    'use strict';

    var team, teamsCSS = '', t = 0, teamColor, colRange, cols;

    colRange = T.length; // + Math.floor(Math.random() * 10);
    cols = makeColorGradient(2, 2, 2, 0, 2, 4, 150, 80, colRange);

    for (team in T.list) {
        if (T.list.hasOwnProperty(team)) {
            teamColor = cols.roundedColors[t];
            teamsCSS += '[data-mode="current"] .desks g[data-team="' + team + '"],\n';
            teamsCSS += '[data-mode="current"] li[data-team="' + team + '"] .keySwatch,\n';
            teamsCSS += '[data-mode="proposed"] .desks g[data-proposed-team="' + team + '"],\n';
            teamsCSS += '[data-mode="proposed"] li[data-team="' + team + '"] .keySwatch {\n';
            teamsCSS += '\tfill: rgb(' + teamColor.red + ',' + teamColor.grn + ',' + teamColor.blu + ');\n';
            teamsCSS += '\tbackground: rgb(' + teamColor.red + ',' + teamColor.grn + ',' + teamColor.blu + ');\n';
            teamsCSS += '}\n';
            t += 1;
        }
    }
    $('#teamColors').text(teamsCSS);
}

function consoleDump() {
    'use strict';

    // console.log('Current Desks', R.desks);
    // console.log('Proposed Desks', R.moves);
    // console.log('Staff', R.staff);
    // // console.log('Floors', F.indexes);
    // console.log('Floor Desks', F.register);
    // console.log('Teams by Floor', F.teams);
    // console.log('Floor Counts', F.count);
    // console.log('Floor Roster', F.staff);
    // console.log('Teams', T.list);
    // console.log('Teams by Status', T.modes);
}