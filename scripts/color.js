function makeColorGradient(frequency1, frequency2, frequency3, phase1, phase2, phase3, center, width, len) {

    'use strict';

    var colors = [], rndColors = [], red, grn, blu, i;

    frequency1 *= Math.PI/len;
    frequency2 *= Math.PI/len;
    frequency3 *= Math.PI/len;

    len = (len || 50);
    center = (center || 128);
    width = (width || 127);

    for (i = 0; i < len; i += 1) {
        red = Math.sin(frequency1 * i + phase1) * width + center;
        grn = Math.sin(frequency2 * i + phase2) * width + center;
        blu = Math.sin(frequency3 * i + phase3) * width + center;

        colors.push({red: red, grn: grn, blu: blu});
        rndColors.push({red: Math.round(red), grn: Math.round(grn), blu: Math.round(blu)});
    }

    return {colors: colors, roundedColors: rndColors};
}
