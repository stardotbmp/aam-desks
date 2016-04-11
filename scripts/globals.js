var aam = {};

aam.deskInfoSrc = {
    'v1': 'https://script.google.com/macros/alliesandmorrison.com/s/AKfycbw87ukfkjFCVztHzeAQba0z73eoaTJ5VogPkPJrip28sRQHPJo/exec',
    'v1-5': 'https://script.google.com/macros/alliesandmorrison.com/s/AKfycbz3ecx0-OQuwaWyT8Qxkna4XSbC5WaplImy9AXknrrJj4swdV4/exec',
    'v2': 'https://script.google.com/a/macros/alliesandmorrison.com/s/AKfycbw6uNUWIXx4On55SO_--DssAFWcjWQe5WxAiG1p4FQ9/dev',
    'v2-1': 'https://script.google.com/macros/s/AKfycbxP4Ax7aGi_fP99c5jtp7ekRE80cJfrXu_LlxWSQRmKDwqSwSYS/exec',
    'v2-2': 'https://script.google.com/a/macros/alliesandmorrison.com/s/AKfycbxP4Ax7aGi_fP99c5jtp7ekRE80cJfrXu_LlxWSQRmKDwqSwSYS/exec'

};

aam.activeSrcPointer = 'v2-2';

aam.activeSrc = function (version) {
    'use strict';
    version = version || aam.activeSrcPointer;
    return aam.deskInfoSrc[version] || aam.deskInfoSrc[aam.activeSrcPointer];
};