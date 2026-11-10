// 텍스트를 Maestro 텍스트 셀렉터(정규식)에 넣을 수 있게 이스케이프하고, 실행 로그에 남긴다.
//
// 입력 (runScript env)
//   TEXT  원문 (예: ${maestro.copiedText})
//   NAME  결과를 담을 output 이름 (예: savedTitle)
// 출력
//   output[NAME]           원문 그대로
//   output[NAME + "Regex"] 정규식 특수문자를 이스케이프한 값 → assertVisible 등 셀렉터에 사용
// 로그
//   maestro.log에 "JsConsole: [NAME] ..." 두 줄 (CLI 화면에는 나오지 않는다)
//
// Maestro 텍스트 셀렉터는 정규식이라 "이진희 (배우)"의 괄호가 그룹으로 해석되어
// 원문과 일치하지 않는다. 그래서 . * + ? ^ $ ( ) { } | [ ] \ 앞에 \ 를 붙인다.

var text = String(TEXT);
var escaped = text.replace(/[.*+?^$(){}|[\]\\]/g, "\\$&");

output[NAME] = text;
output[NAME + "Regex"] = escaped;

console.log("[" + NAME + "] 원문: " + text);
console.log("[" + NAME + "] 셀렉터용 정규식: " + escaped);
