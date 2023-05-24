const mongoose = require('mongoose')
const Test = mongoose.model("Test");
const Exam = mongoose.model("Exam");

exports.getCummulativeResult = async (req) => {
    const {studentName, session} = req

    const [
        firstTermTestResult, 
        firstTermExamResult, 
        secondTermTestResult, 
        secondTermExamResult, 
        thirdTermTestResult, 
        thirdTermExamResult
    ] = await Promise.all([
        Test.findOne({studentName, term: '1st', session}),
        Exam.findOne({studentName, term: '1st', session}),
        Test.findOne({studentName, term: '2nd', session}),
        Exam.findOne({studentName, term: '2nd', session}),
        Test.findOne({studentName, term: '3rd', session}),
        Exam.findOne({studentName, term: '3rd', session})
    ])

    let firstTermResult = getTermScorePercentage(firstTermExamResult?.examResult, firstTermTestResult?.testResult)
    let secondTermResult = getTermScorePercentage(secondTermExamResult?.examResult, secondTermTestResult?.testResult)
    let thirdTermResult = getTermScorePercentage(thirdTermExamResult?.examResult, thirdTermTestResult?.testResult)

    return {
        firstTermScorePercentage: firstTermResult.toFixed(1),
        secondTermScorePercentage: secondTermResult.toFixed(1),
        thirdTermScorePercentage: thirdTermResult.toFixed(1),
        cummulativeScorePercentage: ((firstTermResult + secondTermResult + thirdTermResult) /3).toFixed(1)
    }
}

function getTermScorePercentage (examResult = [], testResult = []) {
    let totalTermResult = 0
    let numberOfSubjects = Math.max(...[examResult.length, testResult.length])
    let expectedScore = numberOfSubjects * 100
   
    for (let result of examResult) totalTermResult += result.score
    for (let result of testResult) totalTermResult += result.score

    let scorePercentage = totalTermResult === 0 ? 0 : (totalTermResult / expectedScore) * 100
    // console.log({totalTermResult, expectedScore, numberOfSubjects})
    return scorePercentage
}