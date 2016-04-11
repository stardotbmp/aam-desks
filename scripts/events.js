/*global
    $,
    deskInfo,
    staffRegister
*/
/*jslint
    browser: true,
    devel: true,
    bitwise: true,
    nomen: true,
    camelcase: false
*/

function deskEnter(e) {

	'use strict';

	var targetId = $(e.currentTarget).attr('id'),
		deskObject = deskInfo[targetId][0],
		snippetData = $('.desk-snippet li'),
		parent = $(e.currentTarget).parent();

	$(e.currentTarget).appendTo(parent);
	$('.hilite').appendTo($('.hilite').parent());

	$(snippetData[0]).find('img').attr('class', 'profilepicture ' + deskObject.email);
	$(snippetData[1]).text(deskObject.occupiedby.split('|')[0]);
	$(snippetData[2]).text(deskObject.index);
}

function deskLeave() {

	'use strict';

	var	snippetData = $('.desk-snippet li');

	$(snippetData[0]).find('img').attr('class', '');
	$(snippetData[1]).text('');
	$(snippetData[2]).text('');
}

function deskClick(e) {

	'use strict';

	var targetId = $(e.currentTarget).attr('id'),
		deskObjects = deskInfo[targetId],
		dataBlocks = $('.staff-data'),
		deskCounter,
		deskObject,
		dataBlockObject = {},
		dataBlockText,
		dataBlockStaff,
		focusDesk,
		parentSVG,
		parentSVGViewport,
		hiliteHolder;

	$(dataBlocks).empty();

	for (deskCounter in deskObjects) {

		if (deskObjects.hasOwnProperty(deskCounter)) {
			deskObject = deskObjects[deskCounter];
			dataBlockObject = {};
			dataBlockStaff = staffRegister.filter(
				function (id) {
					return (id.id === deskObject.email);
				}
			)[0];

			dataBlockObject = {
				name: deskObject.occupiedby,
				team: deskObject.team,
				desk: deskObject.index,
				phone: deskObject.extension,
				initials: (dataBlockStaff) ? dataBlockStaff.initials : ''
			};

			dataBlockText = '<div class="staff-data-block">';
			dataBlockText += '<img src="./images/spacer.gif" class="profilepicture ' + deskObject.email + '">';
			dataBlockText += '<ul>';
			dataBlockText += (dataBlockObject.name) ? '<li class="name">' + dataBlockObject.name.split('|')[0] + '<span class="initials">' + dataBlockObject.initials + '</span></li>' : '';
			dataBlockText += (dataBlockObject.team) ? '<li class="team">' + dataBlockObject.team + '</li>' : '';
			dataBlockText += (dataBlockObject.desk) ? '<li class="index">' + dataBlockObject.desk + '</li>' : '';
			dataBlockText += (dataBlockObject.phone) ? '<li><i class="icon-phone"></i>' + dataBlockObject.phone + '</li>' : '';

			dataBlockText += '<ul class="app-person"><li title="Lock this Desk"';
			dataBlockText += (deskObject.available !== 'Yes') ? 'class="hidden" ' : '';
			dataBlockText += '><i class="icon-lock"></i></li><li title="Unlock this Desk"';
			dataBlockText += (deskObject.available === 'Yes') ? 'class="hidden" ' : '';
			dataBlockText += '><i class="icon-unlock"></i></li><li title="Remove This Desk Allocation"><i class="icon-signout"></i></li><li title="Add and Allocation to this Desk"><i class="icon-signin"></i></li><li title="Change Hardware Allocation" disabled="disabled"><i class="icon-desktop"></i></li><li title="Change Software Allocations" disabled="disabled"><i class="icon-cogs"></i></li></ul>';

			dataBlockObject += '</ul>';
			dataBlockText += '</div>';

			$(dataBlocks).append(dataBlockText);
			// $(dataBlocks).find('[title="Lock this Desk"]').each(function () {
			// 	$(this).click(function (e) {
			// 		lockDesk(e);
			// 	});
			// });

			$(e.currentTarget.offsetParent).parent().scroll($(e.currentTarget).parent()[0].transform.baseVal.getItem(0).matrix.e, $(e.currentTarget).parent()[0].transform.baseVal.getItem(0).matrix.f);
		}
	}

	focusDesk = $('#' + targetId);

	$('.deskUnit').each(function () {
		$(this).attr('class', $(this).attr('class').replace(' hilite', ''));
	});
	$(focusDesk).attr('class', $(focusDesk).attr('class') + ' hilite').mouseenter();
}