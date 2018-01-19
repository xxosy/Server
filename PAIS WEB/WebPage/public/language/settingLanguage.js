var language;

function languageInit() {
    if(getCookie("language") == false) {
        setCookie("language", "ko", 30);
        language = new KoreanLanguage();
    }
    else {
        switch(getCookie("language")) {
            case "ko" :
                language = new KoreanLanguage();
                $('#language_ko').addClass("w3-white");
                $('#language_en').removeClass("w3-white"); break;
            case "en" :
                language = new EnglishLanguage();
                $('#language_ko').removeClass("w3-white");
                $('#language_en').addClass("w3-white"); break;
        }
    }
}

function setEnglishLanguage() {
    language = new EnglishLanguage();
    $('#language_en').addClass("w3-white");
    $('#language_ko').removeClass("w3-white");
    setCookie("language", "en", 30);
    location.reload();
    //setDatas();
}

function setKoreanLanguage() {
    language = new KoreanLanguage();
    $('#language_ko').addClass("w3-white");
    $('#language_en').removeClass("w3-white");
    setCookie("language", "ko", 30);
    location.reload();
    //setDatas();
}
