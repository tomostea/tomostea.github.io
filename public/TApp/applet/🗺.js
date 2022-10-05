javascript: (function() {
    var url = location.href;
    if (url.indexOf('@') != -1) {
        data01 = url.split('@');
        data02 = data01[1].split(',');
        data03 = data02[2].split('z');
        data04 = Number(data03[0]) + 1;
        url = 'http://maps.apple.com/?ll=' + data02[0] + ',' + data02[1] + '&z=' + data04;
        window.open(url, '_blank');
    } else {
        url = 'https://www.google.co.jp/maps/';
        location.href = url;
    }
})();
// https://www.nanigoto.com/gy%e5%9c%b0%e5%9b%b3%e5%a4%89%e6%8f%9b/;