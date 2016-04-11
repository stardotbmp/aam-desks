/*global deskInfo, R*/

function processStats() {

    'use strict';
    var statlist = $('#resolvedstatslist');
    var desks = Object.keys(deskInfo), desk;
    var count, status;
    var occupiedDesks = {current: [], proposed: []}, d;
    var unoccupiedDesks = {current: [], proposed: []};
    var lockedDesks = {current: [], proposed: []};
    var noStaffWithTeam = {current: [], proposed: []};
    var noTeamWithStaff = {current: [], proposed: []};
    var desksPerFloor = {}, prefix;

    for (desk in deskInfo) {
    
        prefix = desk.split('-').slice(0,-1).join('-')
        
        if (!desksPerFloor.hasOwnProperty(prefix)) {
            desksPerFloor[prefix] = 1;
        } else {
            desksPerFloor[prefix] += 1;
        }

        if (deskInfo.hasOwnProperty(desk)) {

            d = deskInfo[desk];

            if (d.current && d.current[0]) {
                for (status in d) {
                    if (d.hasOwnProperty(status)) {
                        count = d[status].filter(function (info) { return (info.teamId === '' && info.occupiedby !== ''); }).length;
                        if (count > 0) {
                            noTeamWithStaff[status].push({desk: d.current[0].index, staff: d[status].map(function (xx) { if (xx.teamId === '') { return xx.occupiedby; } }).join(', ')});
                        }
                        count = d[status].filter(function (info) { return (info.occupiedby === '' && info.teamId !== ''); }).length;
                        if (count > 0) {
                            noStaffWithTeam[status].push(d.current[0].index);
                        }
                        count = d[status].filter(function (info) { return (info.occupiedby !== '' || info.teamId !== ''); }).length;
                        if (count > 0) {
                            occupiedDesks[status].push(d.current[0].index);
                        } else {
                            unoccupiedDesks[status].push(d.current[0].index);
                        }
                        count = d[status].filter(function (info) { return info.available !== 'Yes'; }).length;
                        if (count > 0) {
                            lockedDesks[status].push(d.current[0].index);
                        }
                    }
                }
            }
        }
    }

    // console.log(desksPerFloor);

    var staff = {current: R.staff.map(function (m) { return {id: m.id, name: m.name}; }), proposed: R.staff.map(function (m) { return {id: m.id, name: m.name}; })};
    var deskOccupants = (
        function () {
            var occupants = {current: [], proposed: []}, desk, status, i;
            for (desk in deskInfo) {
                if (deskInfo.hasOwnProperty(desk)) {
                    for (status in deskInfo[desk]) {
                        if (deskInfo[desk].hasOwnProperty(status)) {
                            count = deskInfo[desk][status].filter(function (r) {
                                return r.occupiedby !== '';
                            });
                            for (i = 0; i < count.length; i += 1) {
                                occupants[status].push({name: count[i].occupiedby, id: count[i].email});
                            }
                        }
                    }
                }
            }
            return occupants;
        }()
    );

    var currentoccupants = deskOccupants.current.map(function (p) { return p.id; });
    var proposedoccupants = deskOccupants.proposed.map(function (p) { return p.id; });

    var unseatedStaff = {
        current: staff.current.filter(function (s) { return currentoccupants.indexOf(s.id) < 0; }).map(function (n) { return n.name; }),
        proposed: staff.proposed.filter(function (s) { return proposedoccupants.indexOf(s.id) < 0; }).map(function (n) { return n.name; })
    };

    var movestally = $(statlist).find('dd.movetally');
    movestally.html('<p>Desks/Staff subject to change in the proposed scenario: ' + (function (items) { return items.length; }(M.moves)) + '</p>');

    var empty = $(statlist).find('dd.empty');
    empty.html('<p>Desks not currently allocated per scenario</p><dl>' + (function (desks) { return (desks.current.length <= 0 && desks.proposed.length <= 0) ? '<dt>None</dt>' : ''; }(unoccupiedDesks)) + '<dt class="' + (function (desks) { return (desks.length <= 0) ? 'hidden' : ''; }(unoccupiedDesks.current)) + '">Current Layout ' + (function (desks) { return '(' + desks.length + ')'; }(unoccupiedDesks.current)) + '</dt><dd>' + (function (roster) { var list = ''; roster.forEach(function (t) { list += '<span class="rosterName">' + t + "</span>"; }); return list; }(unoccupiedDesks.current)) + '</dd><dt class="' + (function (desks) { return (desks.length <= 0) ? 'hidden' : ''; }(unoccupiedDesks.proposed)) + '">Proposed Layout ' + (function (desks) { return '(' + desks.length + ')'; }(unoccupiedDesks.proposed)) + '</dt><dd>' + (function (roster) { var list = ''; roster.forEach(function (t) { list += '<span class="rosterName">' + t + "</span>"; }); return list; }(unoccupiedDesks.proposed)) + '</dd></dl>');

    var tallies = $(statlist).find('dd.floortally');
    tallies.html('Number of Desks per floor per building:<dl>' + (function (tally) { var list = '', keys = Object.keys(tally).sort(), t; for (t = 0; t < keys.length; t += 1) { list += ('<dt style="font-weight: bold; padding:0 0.25ex 0 1ex;">' + keys[t] + ':</dt><dd style="float: left; margin:0;">' + tally[keys[t]] + '</dd>'); } return list; }(desksPerFloor)) + '</dl><span style="clear: both; height: 0; font-size: 0; line-height: 0;">&nbsp;</span>');

    var locked = $(statlist).find('dd.locked');
    locked.html('<p>Desks that have been identified as unavailable for seating</p><dl>' + (function (desks) { return (desks.current.length <= 0 && desks.proposed.length <= 0) ? '<dt>None</dt>' : ''; }(lockedDesks)) + '<dt class="' + (function (desks) { return (desks.length <= 0) ? 'hidden' : ''; }(lockedDesks.current)) + '">Current Layout</dt><dd>' + (function (roster) { var list = ''; roster.forEach(function (t) { list += '<span class="rosterName">' + t + "</span>"; }); return list; }(lockedDesks.current)) + '</dd><dt class="' + (function(desks){ return (desks.length <= 0) ? 'hidden' : ''; }(lockedDesks.proposed)) + '">Proposed Layout</dt><dd>' + (function (roster) { var list = ''; roster.forEach(function (t) { list += '<span class="rosterName">' + t + "</span>"; }); return list; }(lockedDesks.proposed)) + '</dd></dl>');

    var placeholder = $(statlist).find('dd.placeholder');
    placeholder.html('<p>Desks that have a Team allocated but no Staff Member</p><dl>' + (function (desks) { return (desks.current.length <= 0 && desks.proposed.length <= 0) ? '<dt>None</dt>' : ''; }(noStaffWithTeam)) + '<dt class="' + (function (desks) { return (desks.length <= 0) ? 'hidden' : ''; }(noStaffWithTeam.current)) + '">Current Layout</dt><dd>' + (function (roster) { var list = ''; roster.forEach(function (t) { list += '<span class="rosterName">' + t + "</span>"; }); return list; }(noStaffWithTeam.current)) + '</dd><dt class="' + (function(desks){ return (desks.length <= 0) ? 'hidden' : ''; }(noStaffWithTeam.proposed)) + '">Proposed Layout</dt><dd>' + (function (roster) { var list = ''; roster.forEach(function (t) { list += '<span class="rosterName">' + t + "</span>"; }); return list; }(noStaffWithTeam.proposed)) + '</dd></dl>');

    var noteams = $(statlist).find('dd.noteams');
    noteams.html('<p>Desks that have a Staff Member allocated but no Team set</p><dl>' + (function (desks) { return (desks.current.length <= 0 && desks.proposed.length <= 0) ? '<dt>None</dt>' : ''; }(noTeamWithStaff)) + '<dt class="' + (function (desks) { return (desks.length <= 0) ? 'hidden' : ''; }(noTeamWithStaff.current)) + '">Current Layout</dt><dd>' + (function (roster) { var list = ''; roster.forEach(function (t) { list += '<span class="rosterName">[' + t.desk + '] ' + t.staff + "</span>"; }); return list; }(noTeamWithStaff.current)) + '</dd><dt class="' + (function (desks) { return (desks.length <= 0) ? 'hidden' : ''; }(noTeamWithStaff.proposed)) + '">Proposed Layout</dt><dd>' + (function (roster) { var list = ''; roster.forEach(function (t) { list += '<span class="rosterName">[' + t.desk + '] ' + t.staff + "</span>"; }); return list; }(noTeamWithStaff.proposed)) + '</dd></dl>');

    var unseated = $(statlist).find('dd.unseated');

    // var unseatedHTML = '<p>Staff not allocated a desk per scenario</p><dl><dt>Current Layout ';
    //     unseatedHTML += (function(desks){ return '(' + desks.length + ')';}(unseatedStaff.current));
    //     unseatedHTML += '</dt><dd>';
    //     unseatedHTML += (function (roster) { var list = ''; roster.forEach(function(t) { list += '<span class="rosterName">' + t + "</span>"; }); return list; }(unseatedStaff.current));
    //     unseatedHTML += '</dd><dt>Proposed Layout ';
    //     unseatedHTML += (function(desks){ return '(' + desks.length + ')';}(unseatedStaff.proposed));
    //     unseatedHTML += '</dt><dd>';
    //     unseatedHTML += (function (roster) { var list = ''; roster.forEach(function(t) { list += '<span class="rosterName">' + t + "</span>"; }); return list; }(unseatedStaff.proposed));
    //     unseatedHTML += "</dd></dl>";
    // unseated.html(unseatedHTML);

   unseated.html('<p>Staff not allocated a desk per scenario</p><dl><dt>Current Layout ' + (function(desks){ return '(' + desks.length + ')';}(unseatedStaff.current)) + '</dt><dd>' + (function (roster) { var list = ''; roster.forEach(function(t) { list += '<span class="rosterName">' + t + "</span>"; }); return list; }(unseatedStaff.current)) + '</dd><dt>Proposed Layout ' + (function(desks){ return '(' + desks.length + ')';}(unseatedStaff.proposed)) + '</dt><dd>' + (function (roster) { var list = ''; roster.forEach(function(t) { list += '<span class="rosterName">' + t + "</span>"; }); return list; }(unseatedStaff.proposed)) + "</dd></dl>");
}