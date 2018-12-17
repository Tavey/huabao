let subDomain = window.location.hostname.split(".")[0];
function defineTitle() {
    switch (subDomain) {
        // case "127":
        case "zgc":
            return "找罐车";
        default:
            return "华保云";
    }
}

var changeIcon = function() {
    var link = document.createElement("link");
    link.rel = "shortcut icon";
    switch (subDomain) {
        // case "127":
        case "zgc":
            link.href = require("@/assets/zgc/favicon.png");
            break;
        default:
            link.href = require("@/assets/default/favicon.png");
            break;
    }
    document.head.appendChild(link);
};

document.title = defineTitle();
changeIcon();
