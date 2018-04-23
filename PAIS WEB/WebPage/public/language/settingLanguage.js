$.lang = {};
function setLanguage(currentLanguage) {
    if(getCookie("language") == 'undefined' || getCookie("language") == "") {
        setCookie("language", "ko", 30);
        currentLanguage = "ko";
    }

    if (currentLanguage == 'en') {
        $('#language_en').addClass("w3-white");
        $('#language_ko').removeClass("w3-white");
    } else if (currentLanguage == 'ko') {
        $('#language_ko').addClass("w3-white");
        $('#language_en').removeClass("w3-white");
    }

    $('[data-langLabel]').each(function() {
        var $this = $(this);
        $this.html($.lang[currentLanguage][$this.data('langlabel')]);
    });
}

$('a.setLang').click(function() {
    var lang = $(this).data('lang');
    setCookie('language', lang, 30);
    setLanguage(lang);
    location.reload();
})
