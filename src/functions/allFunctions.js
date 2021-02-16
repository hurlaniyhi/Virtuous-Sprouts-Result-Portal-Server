exports.passwordGenerator = () => {

    var resletter = '';
    var resNum = '';
    var resSymbol = "";
    var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var number = '0123456789';
    var symbol = '$%@#^?&><';
    var numberLength = number.length;
    var lettersLength = letters.length;
    var symbolLength = symbol.length;
    
    for (var i = 0; i < 5; i++) {
      resletter += letters.charAt(Math.floor(Math.random() * lettersLength));
    }
    for (var i = 0; i < 4; i++) {
      resNum += number.charAt(Math.floor(Math.random() * numberLength));
    }
    for (var i = 0; i < 1; i++) {
      resSymbol += symbol.charAt(Math.floor(Math.random() * symbolLength));
    } 
    return resletter + resNum + resSymbol;

}

exports.capitalizer = (str) => {
   
    return str.toLowerCase().replace(/^\w|\s\w/g, function (letter) {
        return letter.toUpperCase();
    })
      
}

exports.spaceRemover = (str) => {
   
    var removed = str.replace(/ /g, "")
    return removed
      
}
