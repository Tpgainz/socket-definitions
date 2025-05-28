"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeviceType = void 0;
function getDeviceType(userAgent) {
    // Convertir en minuscules pour une comparaison plus facile
    const ua = userAgent.toLowerCase();
    // Liste des indicateurs mobiles courants
    const mobileIndicators = [
        'mobile',
        'android',
        'iphone',
        'ipad',
        'ipod',
        'blackberry',
        'windows phone',
        'opera mini',
        'iemobile',
        'webos',
        'palm',
        'symbian',
        'kindle',
        'silk',
        'fennec'
    ];
    // Vérifier si l'un des indicateurs mobiles est présent
    const isMobile = mobileIndicators.some(indicator => ua.includes(indicator));
    return isMobile ? "mobile" : "web";
}
exports.getDeviceType = getDeviceType;
