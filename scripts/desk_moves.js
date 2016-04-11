/*global $, R, S, T, M, deskInfo, findStaff, icon */
/*jslint devel: true */

function cloneSort(objectArray, property) {
    'use strict';
    var obSort;

    if (objectArray && objectArray.map) {
        obSort = objectArray
            .map(function (el, i) {
                return {
                    index: i,
                    prop: el[property]
                };
            })
            .sort(function (a, b) {
                return (a.prop < b.prop) ? 1 : (a.prop > b.prop) ? -1 : 0;
            })
            .map(function (el) {
                return objectArray[el.index];
            });
    }

    return obSort || objectArray;
}

function compareDesks(desk) {
    'use strict';

    var d, curr, prop, match, i, attr;

    d = deskInfo[desk];

    // deal with deleted and added desks as a factor of change.
    match = (d.current && d.proposed) && (d.current.length === d.proposed.length);

    if (match) { // matching ooccupancy level
        // sort and clone
        curr = cloneSort(d.current, 'email');
        prop = cloneSort(d.proposed, 'email');

        for (i = 0; i < curr.length; i += 1) { // any constituent property not matching returns false
            for (attr in curr[i]) {
                if (curr[i].hasOwnProperty(attr)) {
                    if (curr[i][attr] !== prop[i][attr]) {
                        match = false;
                    }
                }
            }
        }
    } else {
        // console.log('array length is different');
    }

    return !match;
}

function processMoves() {
    'use strict';

    // take all original desks & proposed desks and compare
    var desk, changedDesks = [],
        i, j, staff, destinations, curr, prop,
        moves = {
            register: {},
            inward: {
                desks: [],
                people: {}
            },
            outward: {
                desks: [],
                people: {}
            },
            unmoved: {
                desks: [],
                people: {}
            }
        },
        matches,
        person,
        movesTable,

        compareFilter = function(c, s, p, i) {
            if (c) {
                return c.filter(function (o) {
                    return (o[p] === s[i][p]);
                });
            }
            return c;
        },

        filterEachDesk = function(sourceList, compareList, desks, filterEmptyDesk, property) {
            property = property || 'email';
            filterEmptyDesk = filterEmptyDesk || false;

            var filterMatches;

            if (sourceList) {
                for (j = 0; j < sourceList.length; j += 1) {

                    filterMatches = compareFilter(compareList, sourceList, property, j);

                    if (filterMatches && filterMatches.length <= 0 && (sourceList[j][property] !== '' || !filterEmptyDesk)) { // empty desks dont move out
                        desks.push(sourceList[j]);
                    }
                }
            }
        },

        shufflePeople = function(desks, people, subProperty, property) {

            subProperty = subProperty || 'destinations';
            property = property || 'email';

            var j;

            for (j = 0; j < desks.length; j += 1) {
                if (people.hasOwnProperty(desks[j][property])) {
                    if (people[desks[j][property]].hasOwnProperty(subProperty)) {
                        if (people[desks[j][property]][subProperty].indexOf(desks[j]) < 0) {
                            people[desks[j][property]][subProperty].push(desks[j]);
                        }
                    }
                } else {
                    people[desks[j][property]] = {};
                    people[desks[j][property]][subProperty] = [desks[j]];
                }
            }
        },

        fillArray = function fillArray(value, len) {
            if (len === 0) {
                return [];
            }
            var a = [value];
            while (a.length * 2 <= len) {
                a = a.concat(a);
            }
            if (a.length < len) {
                a = a.concat(a.slice(0, len - a.length));
            }
            return a;
        },

        rp,
        fs,
        mode,
        origins,
        otherDesks,
        resources,
        tableRow,
        changeResources,
        movedata,
        finalTableRows = [];

    changedDesks = Object.keys(deskInfo).filter(compareDesks);

    for (i = 0; i < changedDesks.length; i += 1) {

        desk = deskInfo[changedDesks[i]];
        curr = cloneSort(desk.current, 'email');
        prop = cloneSort(desk.proposed, 'email');

        filterEachDesk(curr, prop, moves.outward.desks, true);
        filterEachDesk(prop, curr, moves.inward.desks);
        filterEachDesk(prop, curr, moves.unmoved.desks, true, 'teamId');

        shufflePeople(moves.outward.desks, moves.outward.people, 'origins');
        shufflePeople(moves.inward.desks, moves.inward.people);
        shufflePeople(moves.unmoved.desks, moves.unmoved.people, 'resources');
    }


    // Populate the Register with new allocations
    for (person in moves.inward.people) {
        if (moves.inward.people.hasOwnProperty(person)) {

            rp = {};

            if (person !== '') {
                destinations = moves.inward.people[person].destinations;
                otherDesks = findStaff(person).proposed.filter(function(desk) {
                    return (desk.index !== destinations[0].index);
                });

                rp.moveDate = null;
                rp.name = destinations[0].occupiedby.split('|')[0];
                rp.team = destinations.map(function(o) {
                    return o.team;
                });
                rp.teamId = destinations.map(function(o) {
                    return o.teamId;
                });
                rp.destinations = destinations.map(function(o) {
                    return o.index;
                });
                rp.origins = fillArray('-', rp.destinations.length);
                rp.notes = destinations.map(function(o) {
                    return o.notes;
                });
                rp.move = [(otherDesks.length === 0) ? 'in' : 'additional'];

                if (moves.outward.people.hasOwnProperty(person)) {

                    origins = moves.outward.people[person].origins;
                    rp.origins = origins.map(function(o) {
                        return o.index;
                    });

                }

                moves.register[person] = rp;
            }
        }
    }

    // Populate the Register with asymmetric removed allocations
    for (person in moves.outward.people) {
        if (moves.outward.people.hasOwnProperty(person)) {

            rp = {};

            // Moving out but not moving in anywhere
            if (!moves.inward.people.hasOwnProperty(person)) {
                origins = moves.outward.people[person].origins;
                rp.name = origins[0].occupiedby.split('|')[0];
                rp.origins = origins.map(function(o) {
                    return o.index;
                });
                rp.notes = origins.map(function(o) {
                    return o.notes;
                });
                rp.destinations = fillArray('-', rp.origins.length);
                rp.move = 'out';
                moves.register[person] = rp;
            }
        }
    }

    // Populate the Register with changed resources
    for (person in moves.unmoved.people) {
        if (moves.unmoved.people.hasOwnProperty(person)) {

            rp = {};

            // Not moving but changing teams
            if (person !== '') {

                resources = moves.unmoved.people[person].resources;

                if (moves.inward.people.hasOwnProperty(person) || moves.outward.people.hasOwnProperty(person)) {

                    rp = moves.register[person];
                    fs = findStaff(person);

                    // filter inward moves from resource change list
                    changeResources = resources.filter(function(o) {
                        var indexmatch = rp.destinations.indexOf(o.index) < 0, // only non matching indexes
                            namematch = (o.email === person); // only for the current person
                        return (indexmatch && namematch);
                    });

                    if (changeResources.length > 0) {

                        rp.origins = rp.origins.concat(changeResources.map(function(o) {
                            return o.index;
                        }));
                        rp.team = rp.team.concat(changeResources.map(function(o) {
                            return o.team;
                        }));
                        rp.teamId = rp.team.concat(changeResources.map(function(o) {
                            return o.teamId;
                        }));
                        rp.move = rp.move.concat('none');
                        rp.destinations = rp.destinations.concat('-');
                        rp.notes = rp.notes.concat(resources.map(function(o) {
                            return o.notes + ', Team Change Only';
                        }));
                        moves.register[person] = rp;
                    }

                } else {

                    rp.name = resources[0].occupiedby.split('|')[0];
                    rp.team = resources.map(function(o) {
                        return o.team;
                    });
                    rp.teamId = resources.map(function(o) {
                        return o.teamId;
                    });
                    rp.move = 'none';
                    rp.origins = resources.map(function(o) {
                        return o.index;
                    });
                    rp.destinations = fillArray('-', rp.origins.length);
                    moves.register[person] = rp;
                    rp.notes = resources.map(function(o) {
                        return o.notes + ', Team Change Only';
                    });
                }
            }
        }
    }

    movesTable = $('#deskmoves table tbody').empty();

    M.reset();

    for (staff in moves.register) {
        if (moves.register.hasOwnProperty(staff)) {

            mode = {
                id: staff,
                destinations: moves.register[staff].destinations.length,
                origins: (moves.register[staff].origins[0] !== '-') ? moves.register[staff].origins.length : 0,
                currentDesks: findStaff(staff).current.length,
                proposedDesks: findStaff(staff).proposed.length
            };

            // determine move type
            moves.register[staff].move =
                (function(mode, current, proposed, origins, destinations) {
                    var modeValue;
                    if (mode === 'none') {
                        modeValue = 'project';
                    } else if (proposed.count === 0) {
                        modeValue = 'unseated';
                    } else if (current.count > proposed.count && proposed.count > 0) {
                        modeValue = 'reducing';
                    } else if (proposed.count === destinations.count && destinations.count > 1 && current.count === 0) {
                        modeValue = 'newplus';
                    } else if (proposed.count === destinations.count && current.count === 0) {
                        modeValue = 'new';
                    } else if (proposed.count > destinations.count) {
                        modeValue = 'increasing';
                    } else if (proposed.count === destinations.count && destinations.count > origins.count) {
                        modeValue = 'moveplus';
                    } else {
                        modeValue = 'move';
                    }
                    return modeValue;
                }(
                    moves.register[staff].move, {
                        count: mode.currentDesks
                    }, {
                        count: mode.proposedDesks
                    }, {
                        count: mode.origins
                    }, {
                        count: mode.destinations
                    }
                ));

            movedata = moves.register[staff];

            M.row = {
                moveType: movedata.move,
                who: {
                    id: staff,
                    full: movedata.name
                },
                from: (movedata.origins.filter(function(from) {
                    return (from !== '-');
                }) || [])[0],
                to: (movedata.destinations.filter(function(to) {
                    return (to !== '-');
                }) || [])[0],
                team: {
                    name: (movedata.team) ? movedata.team[0] : '',
                    id: (movedata.teamId) ? movedata.teamId[0] : ''
                }
            };

            tableRow = $('tfoot.template tr').clone();

            M.row = M.match(M.row)[0] || M.row;

            if (M.row.notes !== undefined) {
                M.row.buildNotes = movedata.notes + " ";
                movedata.notes = [M.row.notes];
            } else {
                M.row.buildNotes = movedata.notes + "";
                M.row.notes = movedata.notes + "";
            }

            $(tableRow)
                .attr('data-movetype', M.row.moveType)
                .attr('data-moveID', M.moves.length)
                .find('.picker input').attr({
                    'value': (M.row.date || ''),
                    'min': (new Date()).toISOString().slice(0, 10)
                }).end()
                .find('.date').html((function(movedate) {
                    if (movedate) {
                        return movedate.substr(8, 2) + '/' + movedate.substr(5, 2) + '/' + movedate.substr(0, 4);
                    }
                }(M.row.date)) || '').end()
                .find('.name').attr('data-id', staff).html((movedata.name || '').split('|')[0]).end()
                .find('.origins').html((movedata.origins || ['']).join('<br />\n')).end()
                .find('.destinations').html(
                    [].concat(movedata.destinations || [''])
                    .map(
                        function(hd) {
                            if (deskInfo[hd] && deskInfo[hd].hasOwnProperty('proposed')) {
                                var sharers;
                                sharers = deskInfo[hd].proposed
                                    .filter(
                                        function(o) {
                                            return o.email !== staff;
                                        }
                                    )
                                    .map(
                                        function(o) {
                                            return o.occupiedby;
                                        }
                                    ).join(' & ');
                                hd += (sharers !== '') ? $('<span class="hotdesk"> with: ' + sharers + '</span>')[0].outerHTML : '';
                            }
                            return hd;
                        }
                    )
                    .join('<br />\n')
                ).end()
                .find('.team').html(((movedata.teamId && movedata.teamId[0].match(/\d/)) ? [movedata.teamId[0].replace(".", "_")] : ['']).join('<br />\n') + ' ' + (movedata.team || ['']).join('<br />\n')).end()
                .find('.notes').html((movedata.notes || ['']).map(function(note) {
                    return '<span class="notesText">' + note + '</span>';
                }).join('<br />\n'))
                .attr('style', 'cursor: pointer;')
                .click(clickNotes).end()
                .find('.name').prepend(
                    (function(mode) {
                        switch (mode) {
                            case 'project':
                                return icon('icon-group');
                            case 'unseated':
                                return icon('icon-signout');
                            case 'new':
                                return icon('icon-signin');
                            case 'newplus':
                                return icon(['icon-signin', 'icon-plus']);
                            case 'increasing':
                            case 'moveplus':
                                return icon('icon-plus');
                            default:
                                return icon('icon-exchange');
                        }
                    }(movedata.move))
                );
            $(movesTable).append(tableRow);

            M.add();
        }
    }

    finalTableRows = $(movesTable)
        .find('[data-movetype]')
        .sort(function(a, b) {

            var A = $(a)[0].firstElementChild.firstElementChild,
                B = $(b)[0].firstElementChild.firstElementChild,

                valA = ((!isNaN(A.valueAsNumber)) ? A.valueAsNumber : 2000000000000),
                valB = ((!isNaN(B.valueAsNumber)) ? B.valueAsNumber : 2000000000000);

            return (valA < valB) ? -1 : (valA > valB) ? 1 : 0;
        });
    $(movesTable).empty()

    for (i = 0; i < finalTableRows.length; i += 1) {
        $(movesTable).append(finalTableRows[i]);
    }

    return movesTable;
}

function clickNotes(e) {
    // console.log('click ', e);

    var notesField = $(e),
        ta = $('<textarea class="notesField">'),
        editNotes = $('<span class="editNotes">'),
        saveNotes = $('<span class="saveNotes">');
    $(ta).empty(); // .autosize();
    $(saveNotes)
        .append($('<i class="icon-ok-circle" data-function="saveNotes">').click(
            function(e) {
                e.stopPropagation();
                var propNotes, index;

                propNotes = $(e.currentTarget).parents('.editNotes').find('textarea').val();
                index = $(e.currentTarget).parents('tr').attr('data-moveid');
                console.log(index);

                $(e.currentTarget).parents('.notes').find('.notesText').text(propNotes);
                M.moves[index].notes = propNotes;

                $(this).parents('td').removeClass('editing');
                $(this).parents('.editNotes').remove();
            }))
        .append($('<i class="icon-remove-circle" data-function="cancelNotes">').click(
            function(e) {
                e.stopPropagation();
                $(this).parents('td').removeClass('editing');
                $(this).parents('.editNotes').remove();
            }
        ))
        .append($('<i class="icon-undo" data-function="revertNotes">').click(
            function(e) {
                e.stopPropagation();
                var propNotes, index;

                index = $(e.currentTarget).parents('tr').attr('data-moveid');

                $(e.currentTarget).parents('.notes').find('.notesText').text(M.moves[index].buildNotes);
                delete(M.moves[index].notes);

                $(this).parents('td').removeClass('editing');
                $(this).parents('.editNotes').remove();
            }
        ));
    $(editNotes).append(ta).append(saveNotes);


    if (!$(notesField).hasClass('editing')) {
        $(ta).val($(notesField).find('notesText').text());
        $(notesField).addClass('editing');
        $(notesField).append(editNotes);
    }
    $(ta)[0].value = $(notesField).find('.notesText').text();
}

function datePickerChange(that) {
    'use strict';

    var datefield = $(that).parents('td').siblings('.date'),
        movedate = $(that).val();

    // console.log(datefield, movedate);

    M.moves[$(that).parents('tr').attr('data-moveID')].date = movedate;
    $(datefield).html(
        movedate.substr(8, 2) + '/' + movedate.substr(5, 2) + '/' + movedate.substr(0, 4)
    );
    var start = new Date();
        start.setHours(0,0,0,0);

    if (isNaN((new Date(movedate)).getTime()) || (new Date(movedate)).getTime() >= start.getTime()) {
        $(that).parents('tr').addClass('future').removeClass('past');
    } else {
        $(that).parents('tr').addClass('past').removeClass('future');
    }

    // console.log(M.moves[$(that).parents('tr').attr('data-moveID')].date);
}
