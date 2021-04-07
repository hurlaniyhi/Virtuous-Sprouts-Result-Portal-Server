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

exports.cocantenateTestAndExam = (firstArray, secondArray) => {
  let subjectResult
  let resultData = []
  
  for(let check of firstArray){
    let isPushed = false
    for(let compare of secondArray){
        if(check.subject === compare.subject){
            subjectResult = {
                subject: check.subject,
                testScore: compare.score,
                examScore: check.score,
                totalScore: check.score + compare.score
            }
            resultData.push(subjectResult)
            isPushed = true;
            break;
        }
        else{
             subjectResult = {
                subject: check.subject,
                testScore: "",
                examScore: check.score,
                totalScore: check.score
            }
        }
    }
    if(!isPushed && subjectResult){
        resultData.push(subjectResult)
        isPushed = false
    }
  }

  let combinedResult = [...resultData]
  for(let add of secondArray){
      let isAmong = false
      for(let check of resultData){
          if(add.subject === check.subject){
              isAmong = true
              break
          }
      }
      if(!isAmong){
           subjectResult = {
              subject: add.subject,
              testScore: add.score,
              examScore: "",
              totalScore: add.score
          }
          combinedResult.push(subjectResult)
      }
  }
  return combinedResult
}
