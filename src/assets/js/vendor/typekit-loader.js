'use strict';

(function() {
    var TypekitConfig = {
        kitId: 'rhk3rvc'
    };
    var typekit = document.createElement('script');
    typekit.src = '//use.typekit.com/' + TypekitConfig.kitId + '.js';
    typekit.type = 'text/javascript';
    typekit.async = 'true';
    typekit.onload = typekit.onreadystatechange = function() {
        var rs = this.readyState;
        if (rs && rs != 'complete' && rs != 'loaded') return;
        try {
            Typekit.load(TypekitConfig);
        } catch (e) {}
    };
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(typekit, s);
})();