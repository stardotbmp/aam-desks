/*global $, deskInfo, filterDesks, filterStaff, buildKeys, R, T, P */
/*jslint debug: true, browser: true, devel: true, nomen: true  */

function findStaff(email) {
    'use strict';

    var foundDesks = {current: [], proposed: []}, d, mode, i;

    for (d in deskInfo) {
        if (deskInfo.hasOwnProperty(d)) {
            for (mode in deskInfo[d]) {
                if (deskInfo[d].hasOwnProperty(mode)) {
                    for (i = 0; i < deskInfo[d][mode].length; i += 1) {
                        if (deskInfo[d][mode][i].email === email) {
                            foundDesks[mode].push(deskInfo[d][mode][i]);
                        }
                    }
                }
            }
        }
    }

    return foundDesks;
}

function updateDataBlock(block, deskObject, mode) {

    'use strict';

    mode = mode || 'current';

    var dataBlockObject = {},
        targetId,
        dataBlockStaff,
        dataInitials,
        db,
        dataBlockText,
        otherDesks,
        spacerGIF;

    targetId = deskObject.id || deskObject.index;
    dataBlockStaff = filterStaff(deskObject.email, R.staff, 'staff')[0]; // Expects only 1 result - email is a unique id
    dataInitials = (dataBlockStaff !== undefined) ? dataBlockStaff.initials : '';
    otherDesks = (deskObject.email) ? findStaff(deskObject.email).proposed.filter(function (desk) { return (desk.index !== targetId); }) : [];

    dataBlockObject = {
        name: deskObject.occupiedby.split('|')[0],
        team: T.teams[deskObject.teamId],
        teamId: deskObject.teamId,
        desk: targetId,
        phone: (deskObject.email) ? (P.phones[deskObject.email]) ? P.phones[deskObject.email].phone : null : null,
        initials: dataInitials,
        otherDesks: otherDesks,
        notes: deskObject.notes
    };

    spacerGIF = $($('[src*="spacer.gif"]')[0]).attr('src');

    // console.debug(spacerGIF);

    db = $('<div class="staff-data-block" >');

    dataBlockText = '<img src="' + spacerGIF + '" class="profilepicture ' + deskObject.email + '">';
    dataBlockText += '<ul>';
    dataBlockText += (dataBlockObject.name) ? '<li class="name">' + dataBlockObject.name + '<span class="initials">' + dataBlockObject.initials + '</span></li>' : '';
    dataBlockText += (dataBlockObject.team) ? '<li class="team" data-teamId="' + dataBlockObject.teamId + '" ><span>' + dataBlockObject.team + '</span></li>' : '';
    dataBlockText += '<li class="index">' + dataBlockObject.desk;
    dataBlockText += (dataBlockObject.otherDesks.length === 0) ? '' : '<span class="otherdesks"><i class="icon-plus-sign" data-function="showOtherDesks"></i></span>';
    dataBlockText += '</li>';
    dataBlockText += (dataBlockObject.phone) ? '<li class="phone"><i class="icon-phone">' + dataBlockObject.phone + '</i></li>' : '';
    dataBlockText += '<ul class="app-person">';
    dataBlockText += '<li title="Set as Primary Allocation" data-function="primary"><i class="icon-chevron-sign-left" data-function="primary"></i></li>';
    dataBlockText += '<li title="Lock this Desk" data-function="lock"';
    dataBlockText += (deskObject.available !== 'Yes') ? 'class="hidden" ' : '';
    dataBlockText += '><i class="icon-lock" data-function="lock"></i></li>';
    dataBlockText += '<li title="Unlock this Desk"  data-function="unlock"';
    dataBlockText += (deskObject.available === 'Yes') ? 'class="hidden" ' : '';
    dataBlockText += '><i class="icon-unlock" data-function="unlock"></i></li>';
    dataBlockText += '<li title="Edit Team/Group" data-function="editGroup"><i class="icon-group" data-function="editGroup"></i></li>';
    dataBlockText += '<li title="Remove This Desk Allocation" data-function="removeStaff"><i class="icon-signout" data-function="removeStaff"></i></li>';
    dataBlockText += '<li title="Add and Allocation to this Desk" data-function="addStaff"><i class="icon-signin" data-function="addStaff"></i></li>';
    dataBlockText += '<li title="Change Hardware Allocation" disabled="disabled"><i class="icon-desktop"></i></li>';
    dataBlockText += '<li title="Change Software Allocations" disabled="disabled"><i class="icon-cogs"></i></li>';
    dataBlockText += '<li title="Edit Notes"><i class="icon-edit" data-function="notes"></i></li>';
    dataBlockText += '<li title="Undo Changes" data-function="restore" ><i class="icon-undo" data-function="restore" ></i></li>';
    dataBlockText += '</ul>';
    dataBlockText += '<li class="notes"><span>' + dataBlockObject.notes + '</span></li>';
    dataBlockText += '</ul>';

    $(db).append(dataBlockText);
    $(block).append(db);
    $(block).attr('data-locked', (deskObject.available !== 'Yes'));
}


function Desk() {
    'use strict';

    var thisDesk = this;

    this.node = $('svg #desk-template').clone()[0];
    this.attributes = {};
    this.info = {};
    this.occupants = {};

    this.iconFunctions = function() {
        return function (e) {
            var f = (e.target.attributes['data-function'] || e.mockTarget || {}).value;
            // console.debug(f);
            if (typeof thisDesk[f] === 'function') {
                thisDesk[f](e);
            }
        };
    };
}


Desk.prototype.build = function () {
    'use strict';
    var attributes, a, index, desk, params, occupants = {};
    params = arguments;
    attributes = arguments[Object.keys(arguments).filter(
        function (key) {
            return params[key].hasOwnProperty('id');
        }
    )] || this.attributes;
    this.attributes = attributes;
    this.id = attributes.id;

    occupants.current = filterStaff(this.id, R.staff) || {};
    occupants.proposed = filterStaff(this.id, R.staff, 'proposed') || {};

    desk = this.node;
    for (a in attributes) {
        if (attributes.hasOwnProperty(a)) { // _attributes are not added as DOM attributes
            if (a.indexOf('_') < 0) {
                $(desk).attr(a, attributes[a]);
            } else {
                this[a.replace(/_/g, '')] = attributes[a];
            }
        }
    }

    this.occupants = occupants;
    index = this.id.split('-').pop();

    $(desk)
        .find('.index').text(index).end()
        .find('.current.initials').text((occupants.current[0]) ? occupants.current[0].initials : '').end()
        .find('.proposed.initials').text((occupants.proposed[0]) ? occupants.proposed[0].initials : '').end();

    this.addActions();
    return desk;
};


Desk.prototype.lock = function (e) {
    'use strict';
    //remove all allocations from this desk
    var newInfo, newInfoObject, attribute;

    newInfo = this.info.proposed.slice(0, 1);
    newInfoObject = {
        available: "No",
        email: "",
        extension: "",
        free: "",
        fulltime: "",
        hotdesk: "",
        movedate: "",
        occupiedby: "",
        originaldesk: "",
        team: "",
        teamId: ""
    };

    for (attribute in newInfoObject) {
        if (newInfoObject.hasOwnProperty(attribute)) {
            newInfo[0][attribute] = newInfoObject[attribute];
        }
    }

    this.info.proposed = newInfo;

    // ADJUST LOCKED STATUS ATTRIBUTE

    $(this.node).attr({
        'data-proposed-locked': true,
        'data-proposed-team': '',
        'data-proposed-occupied': false
    }).find('.initials.proposed').text('');

    // UPDATE STAFF INFO BLOCK - i.e. clear
    updateDataBlock($(e.delegateTarget).empty(), this.info.proposed[0], 'proposed');
    $(e.delegateTarget).attr('data-locked', true);

    // UPDATE TALLIES

};


Desk.prototype.unlock = function (e) {
    'use strict';

    this.info.proposed[0].available = "Yes";
    this.info.proposed[0].free = "Free";

    // change desk svg status
    $(this.node).attr({
        'data-proposed-locked': false,
        'data-proposed-free': true,
        'data-proposed-occupied': false
    });

    // change desk info div
    updateDataBlock($(e.delegateTarget).empty(), this.info.proposed[0], 'proposed');
    $(e.delegateTarget).attr('data-locked', false);
};


Desk.prototype.restore = function (e) {
    'use strict';

    var p,
        i,
        tempObject,
        dataSuffix,
        deskAttribute,
        deskAttributes,
        proposedAttribute,
        dataBlock;

    this.info.proposed = []; // Clean slate

    // update desk info object
    for (i = 0; i < this.info.current.length; i += 1) {
        tempObject = {};
        for (p in this.info.current[i]) {
            if (this.info.current[i].hasOwnProperty(p)) {
                tempObject[p] = this.info.current[i][p];
            }
        }
        this.info.proposed.push(tempObject);
    }

    // update desk svg
    deskAttributes = this.attributes;
    for (deskAttribute in deskAttributes) {
        if (deskAttributes.hasOwnProperty(deskAttribute)) {
            dataSuffix = deskAttribute.replace('data-', '');
            proposedAttribute = 'data-proposed-' + dataSuffix;
            if (deskAttributes.hasOwnProperty(proposedAttribute)) {
                $(this.node).attr(proposedAttribute, deskAttributes[deskAttribute]);
                $(this.node).find('.initials.proposed').text($(this.node).find('.initials.current').text());
            }
        }
    }

    // update staff info block
    $(e.delegateTarget).empty();
    for (dataBlock in this.info.proposed) {
        if (this.info.proposed.hasOwnProperty(dataBlock)) {
            updateDataBlock($(e.delegateTarget), this.info.proposed[dataBlock], 'proposed');
        }
    }
};


Desk.prototype.addStaff = function (e) {
    'use strict';

    if (
        $(e.currentTarget).parents('.staff-data-block').find('.groupSelector').length === 0 &&
            $(e.currentTarget).parents('.staff-data-block').find('.nameSelector').length === 0
    ) {

        var occupied,
            occupiedCount,
            hasName,
            // hasTeam,
            thisBlock,
            dupeObj,
            dupeInfo,
            newInfo,
            newInfoObject,
            attribute,
            selectedIndex,
            selectedAllocation,
            teams,
            newNameRow,
            newTeamRow,
            newPhoneRow,
            phoneRow,
            teamRow,
            nameRow,
            nameSpan,
            teamSpan,
            teamWidget,
            nameWidget,
            optGroupProject,
            optGroupGeneral,
            optGroupGuests,
            optGroupUnseatedStaff,
            optGroupSeatedStaff,
            nameButtons,
            teamButtons,
            newOption,
            t,
            n,
            d,
            opt,
            optGroupNew,
            newOpt,
            found;


        newInfoObject = {
            email: "",
            extension: "",
            free: "",
            fulltime: "",
            hotdesk: "",
            movedate: "",
            occupiedby: "",
            originaldesk: "",
            team: "",
            teamId: ""
        };

        selectedAllocation = $(e.currentTarget).parents('.staff-data-block')[0];
        selectedIndex = $(selectedAllocation).index();
        occupiedCount = $(e.delegateTarget).find('.staff-data-block').length;

        thisBlock = $(e.delegateTarget).find('.staff-data-block')[selectedIndex];

        hasName = ($(thisBlock).find('.name')[0]) ? $($(thisBlock).find('.name')[0]).text().length > 0 : false;
        occupied = (hasName !== false);

        if ($(e.delegateTarget).attr('data-locked') === 'false') {
            if (occupied) {
                dupeObj = $($(e.delegateTarget).find('.staff-data-block')[occupiedCount - 1]).clone();
                $(dupeObj)
                    .find('li')
                        .remove('.name')
                        .remove('.team')
                        .remove('.phone')
                    .end().find('img.profilepicture')
                        .attr('class', 'profilepicture');
                $(e.delegateTarget).append(dupeObj);

                newInfo = {};
                dupeInfo = this.info.proposed[occupiedCount - 1];

                for (attribute in dupeInfo) {
                    if (dupeInfo.hasOwnProperty(attribute)) {
                        newInfo[attribute] = dupeInfo[attribute];
                        if (newInfoObject.hasOwnProperty(attribute)) {
                            newInfo[attribute] = newInfoObject[attribute];
                        }
                    }
                }

                this.info.proposed.push(newInfo);

            } else {

                // allocate empty block and/or block with no person
                teams = Object.keys(T.teams).sort(function(a, b) { return (a > b) ? 1 : (a < b) ? -1 : 0; });
                newNameRow = '<li class="name"></li>';
                newPhoneRow = '<li class="phone"><i class="icon-phone"></i></li>';
                newTeamRow = '<li class="team" data-teamId=""></li>';
                nameRow = $(e.currentTarget).parents('.staff-data-block').find('.name')[0] || newNameRow;
                phoneRow = $(e.currentTarget).parents('.staff-data-block').find('.phone')[0] || newPhoneRow;
                teamRow = $(e.currentTarget).parents('.staff-data-block').find('.team')[0] || newTeamRow;

                if (teamRow === newTeamRow) {
                    if (($(e.currentTarget).parents('.staff-data-block').find('.name').length !== 0)) {
                        teamRow = $(e.currentTarget).parents('.staff-data-block').find('.name').after(teamRow).end().find('.team');
                    } else {
                        teamRow = $(e.currentTarget).parents('.staff-data-block').find('img.profilepicture + ul').prepend(teamRow).end().find('.team');
                    }
                }

                if (newNameRow === nameRow) {
                    nameRow = $(e.currentTarget).parents('.staff-data-block').find('img.profilepicture + ul').prepend(nameRow).end().find('.name');
                }

                if (phoneRow === newPhoneRow) {
                    phoneRow = $(e.currentTarget).parents('.staff-data-block').find('.index').after(phoneRow).end().find('.phone');
                }

                nameSpan = $('<span class="nameSelector">');
                teamSpan = $('<span class="groupSelector">');

                teamWidget = $('<select data-group="other">');
                nameWidget = $('<select>');
                optGroupProject = $('<optgroup class="projects" label="Project Teams">');
                optGroupGeneral = $('<optgroup label="General Teams">');
                optGroupGuests = $('<optgroup label="Guests">');
                optGroupUnseatedStaff = $('<optgroup label="Unseated Staff">');
                optGroupSeatedStaff = $('<optgroup label="Seated Staff">');
                nameButtons = $('<i class="icon-ok-circle" data-function="confirmName"></i><i class="icon-remove-circle" data-function="cancelName"></i>');
                teamButtons = $('<i class="icon-ok-circle" data-function="confirmGroup"></i><i class="icon-remove-circle" data-function="cancelGroup"></i>');
                newOption = $('<span class="newProjectDetails"><input type="text" name="id" placeholder="Job No." /><input type="text" name="name" placeholder="Team/Project Name" /></span>');

                for (n = 0; n < R.staff.length; n += 1) {
                    opt = $("<option>").attr({
                        name: 'assignName',
                        value: R.staff[n].id
                    }).text(R.staff[n].name);
                    for (d in deskInfo) {
                        if (deskInfo.hasOwnProperty(d)) {
                            found = deskInfo[d].proposed.filter(function(desk) {
                                return desk.email === R.staff[n].id;
                            });
                            if (found.length > 0) {
                                break;
                            }
                        }
                    }

                    if (found.length > 0) {
                        $(optGroupSeatedStaff).append(opt);
                    } else {
                        $(optGroupUnseatedStaff).append(opt);
                    }
                }

/**** ADD GUESTS - THIS SHOULD BE AN ADMIN FUNCTION AND NOT HARWIRED ****/
                $(optGroupGuests).append($("<option>").attr({
                    name: 'assignName',
                    value: 'guestNew_Starter|' + Math.random()
                }).text("New Starter"));
                $(optGroupGuests).append($("<option>").attr({
                    name: 'assignName',
                    value: 'guestWork_Experience|' + Math.random()
                }).text("Work Experience"));
                $(optGroupGuests).append($("<option>").attr({
                    name: 'assignName',
                    value: 'guestOMA|' + Math.random()
                }).text("OMA"));
                $(optGroupGuests).append($("<option>").attr({
                    name: 'assignName',
                    value: 'guestFKA|' + Math.random()
                }).text("FKA"));
                $(optGroupGuests).append($("<option>").attr({
                    name: 'assignName',
                    value: 'guestAuditor|' + Math.random()
                }).text("Auditor / QAA"));
                $(optGroupGuests).append($("<option>").attr({
                    name: 'assignName',
                    value: 'guestModelmaker|' + Math.random()
                }).text("Modelmaker"));
                $(optGroupGuests).append($("<option>").attr({
                    name: 'assignName',
                    value: 'guestLibraria|' + Math.random()
                }).text("Libraria"));
                $(optGroupGuests).append($("<option>").attr({
                    name: 'assignName',
                    value: 'guestContractor|' + Math.random()
                }).text("Contractor"));
                /*** END GUESTS ***/

                for (t = 0; t < teams.length; t += 1) {
                    opt = $("<option>").attr({
                        name: 'newteam',
                        value: teams[t]
                    }).text(T.teams[teams[t]]);
                    if (teams[t] === $(teamRow).attr('data-teamid')) {
                        $(opt).attr('selected', 'selected');
                        $(teamWidget).attr('data-group', teams[t]);
                    }
                    if (teams[t].match(/[0-9]{2,}/g)) {
                        $(opt).text(teams[t] + ' - ' + $(opt).text());
                        $(optGroupProject).append(opt);
                    } else {
                        $(optGroupGeneral).append(opt);
                    }
                }

                optGroupNew = $('<optgroup label="Add a New Team">');
                newOpt = $('<option name="team" value="other">Other…</option>');
                $(optGroupNew).append(newOpt);

                if ($(teamRow).attr('data-teamid') === '') {
                    $(newOpt).attr('selected', 'selected');
                }

                $(teamWidget).change(function() { $(this).attr('data-group', $(this).val()); });
                $(teamWidget).append(optGroupProject, optGroupGeneral, optGroupNew);
                $(nameWidget).append(optGroupGuests, optGroupUnseatedStaff, optGroupSeatedStaff);
                $(nameSpan).prepend(nameButtons).prepend(nameWidget);
                $(teamSpan).prepend(teamButtons).prepend(newOption).prepend(teamWidget);
                $(nameRow).prepend(nameSpan);
                $(teamRow).prepend(teamSpan);
            }
        }
    }
};

Desk.prototype.primary = function (e) {
    'use strict';

    var selectedAllocation,
        selectedIndex,
        dataBlock,
        dataBlockStaff,
        dataInitials,
        deskAttributes,
        deskAttribute,
        dataSuffix,
        proposedAttribute;

    // update desk info object
    selectedAllocation = $(e.currentTarget).parents('.staff-data-block')[0];
    selectedIndex = $(selectedAllocation).index();
    this.info.proposed.unshift(this.info.proposed.splice(selectedIndex, 1)[0]);
    this.attributes['data-proposed-team'] = this.info.proposed[0].teamId;

    // update staff block
    $(e.delegateTarget).empty();
    for (dataBlock in this.info.proposed) {
        if (this.info.proposed.hasOwnProperty(dataBlock)) {
            updateDataBlock($(e.delegateTarget), this.info.proposed[dataBlock], 'proposed');
        }
    }

    // update desk svg
    dataBlockStaff = filterStaff(this.info.proposed[0].email, R.staff, 'staff')[0]; // Expects only 1 result - email is a unique id
    dataInitials = (dataBlockStaff !== undefined) ? dataBlockStaff.initials : '';
    deskAttributes = this.attributes;
    for (deskAttribute in deskAttributes) {
        if (deskAttributes.hasOwnProperty(deskAttribute)) {
            dataSuffix = deskAttribute.replace('data-', '');
            proposedAttribute = 'data-proposed-' + dataSuffix;
            if (deskAttributes.hasOwnProperty(proposedAttribute)) {
                $(this.node).attr(proposedAttribute, deskAttributes[proposedAttribute]);
                $(this.node).find('.initials.proposed').text(dataInitials);
            }
        }
    }
};


Desk.prototype.cancelGroup = function (e) {
    'use strict';
    $(e.currentTarget).parents('.team').find('.groupSelector').remove();
};


Desk.prototype.cancelName = function (e) {
    'use strict';
    $(e.currentTarget).parents('.name').find('.nameSelector').remove();
};

Desk.prototype.cancelNotes = function (e) {
    'use strict';
    $(e.currentTarget).parents('.notes').find('.notesWidget').remove();
};

Desk.prototype.confirmNotes = function (e) {
    'use strict';

    var newNotes, selectedAllocation, selectedIndex;

    newNotes = $(e.currentTarget).parents('.notes').find('textarea').val();
    selectedAllocation = $(e.currentTarget).parents('.staff-data-block')[0];
    selectedIndex = $(selectedAllocation).index();

    $(e.currentTarget).parents('.notes').find('.notesWidget + span').text(newNotes);
    this.info.proposed[selectedIndex].notes = newNotes;

    this.cancelNotes(e);
};

Desk.prototype.confirmName = function (e) {
    'use strict';

    var selectedAllocation,
        selectedIndex,
        dataBlock,
        dataBlockStaff,
        dataInitials,
        deskAttributes,
        deskAttribute,
        dataSuffix,
        proposedAttribute,
        liveSelectors,
        thisBlock;

    // amend desk info object
    selectedAllocation = $(e.currentTarget).parents('.staff-data-block')[0];
    selectedIndex = $(selectedAllocation).index();
    this.info.proposed[selectedIndex].email = $(e.currentTarget).parents('.nameSelector').find('select').val();
    this.info.proposed[selectedIndex].occupiedby = (this.info.proposed[selectedIndex].email.indexOf('guest') < 0) ? filterStaff(this.info.proposed[selectedIndex].email, R.staff, 'staff')[0].name : this.info.proposed[selectedIndex].email.replace('guest', '').replace('_', ' ');
    this.attributes['data-proposed-occupied'] = this.info.proposed.length > 1 || this.info.proposed[0].occupiedby !== '';

    dataBlockStaff = filterStaff(this.info.proposed[0].email, R.staff, 'staff')[0]; // Expects only 1 result - email is a unique id
    dataInitials = (dataBlockStaff !== undefined) ? dataBlockStaff.initials : '';
    deskAttributes = this.attributes;

    // limited staff block change
    thisBlock = $(e.delegateTarget).find('.staff-data-block')[selectedIndex];
    $($(thisBlock).find('.name')[0]).text(this.info.proposed[selectedIndex].occupiedby.split('|')[0]);
    $($(thisBlock).find('.phone i')[0]).append(P.phones[this.info.proposed[selectedIndex].email] && P.phones[this.info.proposed[selectedIndex].email].phone);
    $(thisBlock).find('img.profilepicture').attr('class', 'profilepicture ' + this.info.proposed[selectedIndex].email);

    // extensive block change if all selectors are gone
    liveSelectors = $('.groupSelector')[0];
    if (!liveSelectors) {
        $(e.delegateTarget).empty();
        for (dataBlock in this.info.proposed) {
            if (this.info.proposed.hasOwnProperty(dataBlock)) {
                updateDataBlock($(e.delegateTarget), this.info.proposed[dataBlock], 'proposed');
            }
        }
    }

    // amend desk svg
    for (deskAttribute in deskAttributes) {
        if (deskAttributes.hasOwnProperty(deskAttribute)) {
            dataSuffix = deskAttribute.replace('data-', '');
            proposedAttribute = 'data-proposed-' + dataSuffix;
            if (deskAttributes.hasOwnProperty(proposedAttribute)) {
                $(this.node).attr(proposedAttribute, deskAttributes[proposedAttribute]);
                $(this.node).find('.initials.proposed').text(dataInitials);
            }
        }
    }

    // remove selector
    this.cancelName({currentTarget: $(e.currentTarget)[0]});
};


Desk.prototype.confirmGroup = function (e) {
    'use strict';

    var selectedAllocation,
        selectedIndex,
        dataBlockStaff,
        dataInitials,
        deskAttributes,
        deskAttribute,
        dataSuffix,
        proposedAttribute,
        thisBlock,
        pName,
        pId,
        oId,
        oName;

    /*
    *   NEEDS A HANDLER FOR "OTHER" AND THE SPECIFIED JOB NAMES
    *   NEW JOBS MEANS THE KEY AND THE TEAMS LIST WILL NEED REFRESHING
    *   ACTUALLY THE REGISTER REFRESHER FUNCTIONS ALL NEED DOING ANYWAY!!!
    */

    // amend desk info object
    selectedAllocation = $(e.currentTarget).parents('.staff-data-block')[0];
    selectedIndex = $(selectedAllocation).index();
    this.info.proposed[selectedIndex].teamId = $(e.currentTarget).parents('.groupSelector').find('select').val();
    this.info.proposed[selectedIndex].team = T.teams[this.info.proposed[selectedIndex].teamId];
    this.attributes['data-proposed-team'] = this.info.proposed[0].teamId;

    // limited staff block change
    thisBlock = $(e.delegateTarget).find('.staff-data-block')[selectedIndex];

    /*** cope with new group ***/
    pId = this.info.proposed[selectedIndex].teamId;
    oId = $(e.currentTarget).parents('.groupSelector').find('.newProjectDetails [name="id"]').val();
    oName = $(e.currentTarget).parents('.groupSelector').find('.newProjectDetails [name="name"]').val();

    if (pId === "other") {
        pId = (oId.length > 0) ? oId : (oName.length > 0) ? oName.toLowerCase() : '';
        pName = (oName.length > 0) ? oName : '';
        this.info.proposed[selectedIndex].teamId = pId;
        this.info.proposed[selectedIndex].team = pName;
        this.attributes['data-proposed-team'] = pId;
    } else {
        pName = T.teams[pId];
    }

    /*** end cope with new group ***/
    dataBlockStaff = filterStaff(this.info.proposed[0].email, R.staff, 'staff')[0]; // Expects only 1 result - email is a unique id
    dataInitials = (dataBlockStaff !== undefined) ? dataBlockStaff.initials : '';
    deskAttributes = this.attributes;

    $($(thisBlock).find('.team')[0])
        .attr('data-teamid', pId)
        .text(pName);

    // amend desk svg
    for (deskAttribute in deskAttributes) {
        if (deskAttributes.hasOwnProperty(deskAttribute)) {
            dataSuffix = deskAttribute.replace('data-', '');
            proposedAttribute = 'data-proposed-' + dataSuffix;
            if (deskAttributes.hasOwnProperty(proposedAttribute)) {
                $(this.node).attr(proposedAttribute, deskAttributes[proposedAttribute]);
                $(this.node).find('.initials.proposed').text(dataInitials);
            }
        }
    }
    // update key
    buildKeys();

    // remove selector
    this.cancelGroup({currentTarget: $(e.currentTarget)[0]});
    buildKeys(); // needs the register to be refreshed to be valuable
};

Desk.prototype.notes = function (e) {
    'use strict';

    var thisBlock, notesField, currNotes, buttons, widget;

    thisBlock = $(e.currentTarget).parents('.staff-data-block').find('ul:not(.app-person)');
    widget = $('<span class="notesWidget"></span>');
    notesField = $('<textarea class="desk-notes")>');
    currNotes = $(thisBlock).find('li.notes span')[0];
    buttons = $('<i class="icon-ok-circle" data-function="confirmNotes"></i><i class="icon-remove-circle" data-function="cancelNotes"></i>');
    // $(notesField).attr({disabled: 'disabled'});


    switch ($(currNotes).length) {
    case 0:
        $(thisBlock).append(widget);
        break;
    default:
        $(notesField).text($(currNotes).text());
        $(widget).insertBefore(currNotes);
        break;
    }

    $(widget).append(notesField).append(buttons);

    // console.log(notesField);
};

Desk.prototype.editGroup = function (e) {
    'use strict';

    if ($(e.currentTarget).parents('.staff-data-block').find('.groupSelector').length === 0) {

        var widget,
            buttons,
            queryBox,
            teamRow,
            newOpt,
            newOption,
            newRow,
            t,
            opt,
            teams,
            span,
            optGroupProject,
            optGroupGeneral,
            optGroupNew;

        teams = Object.keys(T.teams).sort(function(a, b) { return (a > b) ? 1 : (a < b) ? -1 : 0; });
        newRow = '<li class="team" data-teamId=""></li>';
        teamRow = $(e.currentTarget).parents('.staff-data-block').find('.team')[0] || newRow;

        if (teamRow === newRow) {
            if (($(e.currentTarget).parents('.staff-data-block').find('.name').length !== 0)) {
                teamRow = $(e.currentTarget).parents('.staff-data-block').find('.name').after(teamRow).end().find('.team');
            } else {
                teamRow = $(e.currentTarget).parents('.staff-data-block').find('img.profilepicture + ul').prepend(teamRow).end().find('.team');
            }
        }

        span = $('<span class="groupSelector">');
        queryBox = $('<input ng-model="groupQuery">');
        widget = $('<select data-group="other">');
        optGroupProject = $('<optgroup class="projects" label="Project Teams">');
        optGroupGeneral = $('<optgroup label="General Teams">');
        buttons = $('<i class="icon-ok-circle" data-function="confirmGroup"></i><i class="icon-remove-circle" data-function="cancelGroup"></i>');
        newOption = $('<span class="newProjectDetails"><input type="text" name="id" placeholder="Job No." /><input type="text" name="name" placeholder="Team/Project Name" /></span>');

        for (t = 0; t < teams.length; t += 1) {
            opt = $("<option>").attr({
                name: 'newteam',
                value: teams[t]
            }).text(T.teams[teams[t]]);
            if (teams[t] === $(teamRow).attr('data-teamid')) {
                $(opt).attr('selected', 'selected');
                $(widget).attr('data-group', teams[t]);
            }
            if (teams[t].match(/[0-9]{1,}/g)) {
                $(opt).text(teams[t] + ' - ' + $(opt).text());
                $(optGroupProject).append(opt);
            } else {
                $(optGroupGeneral).append(opt);
            }
        }

        optGroupNew = $('<optgroup label="Add a New Team">');
        newOpt = $('<option name="team" value="other">Other…</option>');
        $(optGroupNew).append(newOpt);

        if ($(teamRow).attr('data-teamid') === '') {
            $(newOpt).attr('selected', 'selected');
        }

        $(widget).change(function() { $(this).attr('data-group', $(this).val()); });
        $(widget).append(optGroupProject, optGroupGeneral, optGroupNew);
        $(span).prepend(buttons).prepend(newOption).prepend(widget).prepend(queryBox);
        $(teamRow).prepend(span);
    }
};

Desk.prototype.removeStaff = function (e) {
    'use strict';

    var occupantCount, selectedAllocation, selectedIndex;

    occupantCount = this.info.proposed.length;

    switch (occupantCount > 1) {
    case true: // remove entry
        selectedAllocation = $(e.currentTarget).parents('.staff-data-block')[0];
        selectedIndex = $(selectedAllocation).index();
        this.info.proposed.splice(selectedIndex, 1);
        $(selectedAllocation).detach();
        break;
    default: // empty remaining entry
        this.lock({e: null});
        this.unlock({delegateTarget: $(e.delegateTarget)[0]});
        break;
    }
};


Desk.prototype.addActions = function () {
    'use strict';

    var desk = this;

    $(desk.node).mouseenter(function (e) {
        var mode = $('#locations').attr('data-mode'),
            targetId = $(e.currentTarget).attr('id'),
            deskObject = deskInfo[targetId][mode][0],
            snippetData = $('.desk-snippet li'),
            parent = $(e.currentTarget).parent();
        $(e.currentTarget).appendTo(parent);
        $('.hilite').appendTo($('.hilite').parent());
        $(snippetData[0]).find('img').attr('class', 'profilepicture ' + deskObject.email);
        $(snippetData[1]).text(deskObject.occupiedby.split('|')[0]);
        $(snippetData[2]).text(deskObject.index);
    });

    $(desk.node).mouseleave(function () {
        // Do not persist the rollover header info
        var snippetData = $('.desk-snippet li');

        $(snippetData[0]).find('img').attr('class', '');
        $(snippetData[1]).text('');
        $(snippetData[2]).text('');
    });

    $(desk.node).click(function () {

        var targetId = this.id,
            mode = $('#locations').attr('data-mode'),
            deskObjects = deskInfo[targetId][mode],
            dataBlocks = $('.staff-data'),
            deskCounter,
            focusDesk;

        $(dataBlocks).empty();

        for (deskCounter in deskObjects) {
            if (deskObjects.hasOwnProperty(deskCounter)) {
                updateDataBlock(dataBlocks, deskObjects[deskCounter], mode);
            }
        }

        //add click event to each icon in the row, specific action will be determined by the function attribute of each.
        $(dataBlocks).undelegate('i', 'click').delegate('i', 'click', desk.iconFunctions());

        focusDesk = $('#' + this.id);
        $('.deskUnit').each(function () {
            $(this).attr('class', $(this).attr('class').replace(' hilite', ''));
        });
        $(focusDesk).attr('class', $(focusDesk).attr('class') + ' hilite').mouseenter();
    });
};