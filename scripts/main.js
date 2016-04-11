/*global
    $,
    makeColorGradient,
    Registers,
    FloorsList,
    PhoneList,
    TeamsList,
    MoveList,
    filterDesks,
    filterStaff,
    DeskActions,
    Desk,
    processMoves,
    processStats,
    hideTabs,
    unhideTabs,
    getId,
    buildTeamCSS,
    buildKeys,
    consoleDump
*/
/*jslint
    browser: true,
    devel: true,
    bitwise: true,
    nomen: true,
    camelcase: false
*/

var deskInfo = {},
    teamsList = {},
    d,
    cols,
    t = 0,
    team,
    teamName,
    teamColor,
    teamsCSS = '',
    floorTeams = {},
    c,
    floor,
    zF,
    modes = ['current', 'proposed'],
    M = new MoveList(),
    R = new Registers(),
    F = new FloorsList(),
    T = new TeamsList(),
    P = new PhoneList(),
    staffDesks = {},
    sdo,
    desks,
    staffId,
    s,
    beforePrint = function() {
        'use strict';
        zF = $('#zoomSlider').val();
        $('#zoomSlider').val(1).change();
    },
    afterPrint = function() {
        'use strict';
    //     $('#zoomSlider').val(zF).change();
    },
    mediaQueryList;

if (window.matchMedia) {
    mediaQueryList = window.matchMedia('print');
    mediaQueryList.addListener(function(mql) {

        'use strict';
        if (mql.matches) {
            beforePrint();
        } else {
            afterPrint();
        }
    });
}

window.onbeforeprint = beforePrint;
window.onafterprint = afterPrint;

buildTeamCSS();

for (sdo = 0; sdo < R.staff.length; sdo += 1) {
    s = R.staff[sdo];
    staffId = s.id;
    desks = filterDesks(staffId, R.desks);
    staffDesks[staffId] = {
        name: s.name,
        desks: desks
    };
}

var seatedStaff = [], unseatedStaff = [], i, staffIds = Object.keys(staffDesks);

for (i = 0;  i < staffIds.length; i += 1) {
    if (staffDesks[staffIds[i]].desks.length > 0) {
        seatedStaff.push(staffDesks[staffIds[i]].name);
    } else {
        unseatedStaff.push(staffDesks[staffIds[i]].name);
    }
}

$(function () {
    'use strict';

    var d,
        l,
        m,
        a = $('<a href="./">')[0],
        selectOptions = '',
        sid,
        hasDesks,
        optionRow,
        staffSelector,
        zoomDesk,
        zoomFloor,
        zoomId,
        zoomBuilding,
        thisDesk;

    $('[name="postProposal"]')
        .append($('<input type="hidden" name="uriurl" value="' + encodeURI(a.origin + a.pathname) + '">'))
        .append($('<input type="hidden" name="mode" value="saveProposal">'))
        .append($('<input type="hidden" name="fn" value="saveProposal">'))
        .submit(function (e) {
          hideTabs();
          $('<p>Saving proposal to database. Please allow this to finish.</p>')
            .dialog({
                resizable: false,
                height: 100,
                width: 500,
                modal: false,
                appendTo: $('#loading'),
                position: {
                    my: 'bottom',
                    at: 'top',
                    of: $(this).parent()
                }
            });
            console && console.log('sending moves only');
            var d, move;
            $(e.currentTarget).find('[name="desk"]').remove();
            $(e.currentTarget).find('[name="url"]').remove();
            $(e.currentTarget).find('[name="move"]').remove();
            $(e.currentTarget).find('[name="phone"]').remove();

/* DISABLED MOVES LIST ADD TILL POST LIMIT HAS A SOLUTION
*
*
*/
            for (move = 0; move < M.moves.length; move += 1) {
                $('<input />').attr('type', 'hidden')
                    .attr('name', 'move')
                    .attr('value', JSON.stringify(M.moves[move]))
                    .appendTo('[name="postProposal"]');
            }
/*
*
*
*/

            for (d in deskInfo) {
                if (deskInfo.hasOwnProperty(d)) {
                    $('<input />').attr('type', 'hidden')
                        .attr('name', 'desk')
                        // .attr('value', JSON.stringify({proposed:deskInfo[d].proposed}))
                        .attr('value', JSON.stringify(deskInfo[d]))
                        .appendTo('[name="postProposal"]');
                }
            }
        });

    $('.emailschedule').click(function () {
        hideTabs();

        $('<p>This will send an email with a pdf of the current layout to the last saved proposal</p>')
            .dialog({
                resizable: false,
                height: 100,
                width: 500,
                modal: false,
                appendTo: $('#loading'),
                position: {
                    my: 'bottom',
                    at: 'top',
                    of: $(this).parent()
                },
                buttons: {
                    'Email Moves Report': function () {
                        $.ajax(
                            {
                                data: {fn: 'emailMoves'},
                                dataType: 'json',
                                url: aam.activeSrc() + '?future=' + ($('#deskmoves').attr('data-mode') || 'all') + '&uriurl=' + encodeURI(a.origin + a.pathname) + '&callback=?',
                                context: $(this),
                                success: function(data) {
                                  // console.log(data);
                                    switch (data.success) {
                                    case true:
                                      // console && console.log(data);

                                      $(this).dialog('close');
                                        unhideTabs();
                                        break;
                                    default:
                                        $(this).dialog('close');
                                        unhideTabs();
                                    }
                                }
                            }
                        );
                    },
                    'Save Proposal Now': function () {
                        $('[name="postProposal"]').submit();
                        $(this).dialog('close');
                    },
                    'Cancel': function () {
                        $(this).dialog('close');
                        unhideTabs();
                    }
                }
            });
    });

    $('.concludeMoves').click(function () {
        hideTabs();

        $('<p>This will set the current layout to the last saved proposal</p>')
            .dialog({
                resizable: false,
                height: 100,
                width: 500,
                modal: false,
                appendTo: $('#loading'),
                position: {
                    my: 'bottom',
                    at: 'top',
                    of: $(this).parent()
                },
                buttons: {
                    'Conclude Moves': function () {
                        $.ajax(
                            {
                                data: {fn: 'concludeMoves'},
                                dataType: 'json',
                                url: aam.activeSrc() + '?uriurl=' + encodeURI(a.origin + a.pathname) + '&callback=?',
                                context: $(this),
                                success: function(data) {
                                    switch (data.success) {
                                    case true:
                                      console && console.log(data);
                                      $(this).dialog('close');
                                        unhideTabs();

                                        // reload the page until a smarter reload function is available!!!
                                        // really this could be a client side clone of Moves into Desks
                                        // but there isn't a refresher function on already loaded data as yet
                                        window.location.reload();
                                        break;
                                    default:
                                        $(this).dialog('close');
                                        unhideTabs();
                                    }
                                }
                            }
                        );
                    },
                    'Save Proposal Now': function () {
                        $('[name="postProposal"]').submit();
                        $(this).dialog('close');
                    },
                    'Cancel': function () {
                        $(this).dialog('close');
                        unhideTabs();
                    }
                }
            });
    });

    $('.tabs a').each(function() {
        $(this).click(function (e) {


//            switch (e.target.href.replace(e.target.baseURI, '')) { // event properties changed in chrome that includes hash in baseURI
        switch (e.target.hash) {
            case '#deskmoves':
                processMoves();
                break;
            case '#deskstats':
                processStats();
                break;
            }
        });
    });
    $('[name=viewFilter]').each(function () {
        $(this).click(function () {
            console.debug($(this).attr('id'));
            var that = this;
            $('.floorplans').each(
                function () {
                    $(this).attr('data-' + $(that).attr('id'), $(this).attr('data-' + $(that).attr('id')) !== 'true');
                }
            );
        });
    });

    for (d = 0; d < R.desks.length; d += 1) {
        l = R.desks[d];
        if (deskInfo.hasOwnProperty(l.index)) {
            thisDesk = deskInfo[l.index];
            if (thisDesk.hasOwnProperty('current')) {
                deskInfo[l.index].current.push(l);
            } else {
                deskInfo[l.index] = {current: [l]};
            }
        } else {
            deskInfo[l.index] = {current: [l]};
        }
    }

    for (m = 0; m < R.moves.length; m += 1) {
        l = R.moves[m];
        // console.log(l.index);
        if (deskInfo.hasOwnProperty(l.index)) {
            thisDesk = deskInfo[l.index];
            if (thisDesk.hasOwnProperty('proposed')) {
                deskInfo[l.index].proposed.push(l);
            } else {
                deskInfo[l.index].proposed = [l];
            }
        } else {
            deskInfo[l.index] = {proposed: [l]};
        }
    }

    // CONVERT TEAM INFO IN DESK OBJECTS
    for (d in deskInfo) {
        if (deskInfo.hasOwnProperty(d)) {
            for (m in deskInfo[d]) {
                if (deskInfo[d].hasOwnProperty(m)) {
                    for (i = 0; i < deskInfo[d][m].length; i += 1) {
                         // corrected to allow for properly indexed projects
                        deskInfo[d][m][i].teamId = deskInfo[d][m][i].teamId || getId(deskInfo[d][m][i].team);
                    }
                }
            }
        }
    }

    // BUILD STAFF SELECTOR //
    for (sid in staffDesks) {
        if (staffDesks.hasOwnProperty(sid)) {
            hasDesks = (staffDesks[sid].desks.length > 0);
            optionRow = '<option value="' + sid + '"' + ((hasDesks === true) ? '' : ' disabled="disabled"') + '>' + staffDesks[sid].name + '</option>';
            selectOptions += optionRow;
        }
    }

    staffSelector = $('select[name="staffSelector"]');
    $(staffSelector)
        .change(function (e) {

            var staffId = e.target.value;
            if (staffDesks[staffId].desks.length > 1) {
                console.debug(staffDesks[staffId].name + ' has ' + staffDesks[staffId].desks.length + ' desks');
            }
            zoomDesk = staffDesks[staffId].desks[0];
            zoomId = zoomDesk.index;
            zoomFloor = zoomDesk.floor;
            zoomBuilding = zoomDesk.building;

            $('#locations .buttons [name=floorSelector]').val(zoomFloor).change();
            $('#locations .buttons [name=buildingSelector]').val(zoomBuilding).change();
            $('#' + zoomId).click();
            $('#view-Proposed').attr('checked', true);
            $('#view-Current').click();
            $('#locations').attr('data-mode', 'current');
            $('.deskUnit.hilite').click();
        })
        .append(selectOptions);

    // build floor selector //
    $('#locations .buttons [name=floorSelector]').change(
        function (e) {
            if (e.originalEvent !== undefined) {
                $('.floorplans').removeClass('hilite');
            }
            $('[data-floor]').each(function () {
                $(this).attr('class', ($(this).attr('class')) ? $(this).attr('class').replace(' live', '') : '');
            });

            $('.lines[data-floor="' + this.value + '"]')
                .add('.desks g[data-floor="' + this.value + '"]')
                .add('ul[data-floor="' + this.value + '"]')
                .each(function () {
                    $(this).attr('class', $(this).attr('class') + ' live');
                });
        }
    );

    // BUILD FLOOR LAYOUTS AND POPULATE DESKS //
    $('#locations object').each(
        function () {
            var svgClass = $(this).attr('class'),
                SVGContent = $('<div>').addClass(svgClass).attr('data-floor', $(this).attr('data-floor')).load($(this).attr('data'),
                    function () {
                        var desks = $(this).filter('.desks'),
                            isDeskLayout = desks.length > 0;
                        if (isDeskLayout) {
                            $(desks).find('use:not(.hiliteCircle)').each(
                                function () {
                                    var desk = new Desk();


                                    if (!deskInfo[this.id]) {
                                        // console.log(this.id);

                                        deskInfo[this.id] = {
                                            current: [{
                                                available: 'Yes',
                                                building: this.id.split('-')[0],
                                                desknumber: this.id.split('-')[2],
                                                email: '',
                                                extension: '',
                                                floor: this.id.split('-')[1],
                                                free: 'Free',
                                                fulltime: '',
                                                hotdesk: '',
                                                index: this.id,
                                                movedate: '',
                                                notes: '',
                                                occupiedby: '',
                                                originaldesk: '',
                                                team: '',
                                                teamId: ''
                                            }]
                                        };

                                        deskInfo[this.id].proposed = deskInfo[this.id].current.map(
                                            function(occ) {
                                                var newOcc = {}, p;
                                                for (p in occ) {
                                                    if (occ.hasOwnProperty(p)) {
                                                        newOcc[p] = occ[p];
                                                    }
                                                }
                                                return newOcc;
                                            }
                                        );
                                    }

                                    /*
                                    ERRORS HAPPEN HERE.

                                    There really is no reason why any desk should not have
                                    a current or proposed state and reflects that something
                                    is wrong with the db. best course of action is to break
                                    out of the script, restore from last saved backup, and reload.
                                    */

                                    desk.build({
                                        id: this.id,
                                        transform: $(this).attr('transform'),
                                        _info_: deskInfo[this.id],
                                        'data-team': (deskInfo[this.id].current) ? (deskInfo[this.id].current[0].teamId || getId(deskInfo[this.id].current[0].team)) : '',
                                        'data-proposed-team': (deskInfo[this.id].proposed) ? (deskInfo[this.id].proposed[0].teamId || getId(deskInfo[this.id].proposed[0].team)) : '',
                                        'data-free': (!deskInfo[this.id].current || deskInfo[this.id].current[0].free === 'Free') ? true : false,
                                        'data-proposed-free': (!deskInfo[this.id].proposed || deskInfo[this.id].proposed[0].free === 'Free') ? true : false,
                                        'data-locked': (deskInfo[this.id].current && deskInfo[this.id].current[0].available.match(/Yes|y|true/i)) ? false : true,
                                        'data-proposed-locked': (deskInfo[this.id].proposed && deskInfo[this.id].proposed[0].available.match(/Yes|y|true/i)) ? false : true,
                                        'data-occupied': (deskInfo[this.id].current && deskInfo[this.id].current[0].email !== ''),
                                        'data-proposed-occupied': (deskInfo[this.id].proposed && deskInfo[this.id].proposed[0].email !== ''),
                                        class: 'deskUnit'
                                    });
                                    $(this).replaceWith(desk.node);
                                }
                            );
                            $('#locations .buttons [name=floorSelector]').change();
                        }
                    });
            $(this).parent().append(SVGContent);
            $(this).remove();
        }
    );

    $('#zoomSlider').change(function () {

        var map = $('#locations svg'),
            zoomLevel = $('#locations .floorplans'),
            zoomFactor = $(this).val();
        $(map).each(
            function () {
                var x = this.viewBox.baseVal.width,
                    y = this.viewBox.baseVal.height;

                $(this).attr('width', x * zoomFactor);
                $(this).attr('height', y * zoomFactor);

            }
        );
        $(zoomLevel).attr('data-zoom', zoomFactor);
    });

    $('.viewToggle [name="view"]').click(function () {
        $(this).parents('.viewToggle').find('[name="view"]:checked').each(function () {
            var toggle = this.id.replace('view-', '').toLowerCase();

            $('#locations').attr('data-mode', toggle);

        });

        $('.deskUnit.hilite').click();

    });

    $('.dateToggle [name="dateFilter"]').click(function () {
        $(this).parents('.dateToggle').find('[name="dateFilter"]:checked').each(function () {
            var datetoggle = this.id.replace('view-', '').toLowerCase();
            var dateparts = [];

            $('#deskmoves').attr('data-mode', datetoggle);
            var start = new Date();
            start.setHours(0,0,0,0);

            var movesbydate = $('#deskmoves tbody tr td.date');

            for (var i = 0, mlen = movesbydate.length; i < mlen; i += 1) {

                try {
                    dateparts = movesbydate[i].textContent.split('/');

                    var d = new Date([dateparts[2],dateparts[1],dateparts[0]].join('-'));

                } catch (err) {
                    d = new Date(start.getTime());
                }

                if (isNaN( d.getTime()) || (d.getTime() >= start.getTime())) {
                    $(movesbydate[i]).parents('tr').addClass('future').removeClass('past');
                } else {
                    $(movesbydate[i]).parents('tr').addClass('past').removeClass('future');

                }
            }
        });
    });

    $('button.downloadTable').each(function () {
        $(this).click(function (e) {
            e.preventDefault();
            var parent, csv;
            parent = $(e.currentTarget).parents('.tab').find('table').clone()[0];
            $(parent).find('.template.hidden').remove();
            csv = $(parent).table2CSV({delivery: 'value'});
            window.location.href = 'data:text/csv;charset=UTF-8,' + encodeURIComponent(csv);
        });
    });

    buildKeys();
    processMoves();
    processStats();
    consoleDump();
});