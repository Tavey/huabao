export const splitArrByOdd = (arr) => {   // 按照奇偶数拆分数组
    if (typeof arr === 'object') arr = Object.values(arr);
    if (arr.length <= 1) {
        return arr;
    }
    let arr1 = arr.map((a, i) => {
        if (i % 2 === 0) {
            return a;
        }
        return '';
    });
    let arr2 = arr.map((a, i) => {
        if (i % 2 !== 0) {
            return a;
        }
        return '';
    });
    return [arr1, arr2];
};


export const isSupportFlash = () => {
    let ie_flash;
    try {
        ie_flash = (window.ActiveXObject && (new ActiveXObject("ShockwaveFlash.ShockwaveFlash")) != false)
    } catch (err) {
        ie_flash = false;
    }
    let _flash_installed = ((typeof navigator.plugins != "undefined" && typeof navigator.plugins["Shockwave Flash"] == "object") || ie_flash);

    return _flash_installed;
};

// 获取地图上给定两个点的距离
function Rad(d) {
    return d * Math.PI / 180;
}

export const getDistance = (latlng1, latlng2) => {
    let lat1 = latlng1.latitude;
    let lng1 = latlng1.longitude;
    let lat2 = latlng2.latitude;
    let lng2 = latlng2.longitude;

    let radLat1 = Rad(lat1);
    let radLat2 = Rad(lat2);
    let a = radLat1 - radLat2;
    let b = Rad(lng1) - Rad(lng2);
    let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
        Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378.137;// EARTH_RADIUS;
    s = Math.floor(s * 10000) / 10000;  //输出为公里
    s = parseInt(s);
    return s;
};

/**
 * 首字母大写
 * @param str
 * @returns {string}
 */
export function ucfirst(str) {
    //  discuss at: http://locutus.io/php/ucfirst/
    // original by: Kevin van Zonneveld (http://kvz.io)
    // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
    // improved by: Brett Zamir (http://brett-zamir.me)
    //   example 1: ucfirst('kevin van zonneveld')
    //   returns 1: 'Kevin van zonneveld'

    str += '';
    let f = str.charAt(0).toUpperCase();
    return f + str.substr(1);
};
