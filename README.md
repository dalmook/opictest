# OPIc Style Mock Test (GitHub Pages)

공식 OPIc 화면 흐름을 참고한 연습용 모의테스트입니다.

## 구현 흐름
1. Background Survey
2. Self Assessment(1~6 단계)
3. Setup(마이크 체크)
4. Questions

## 핵심 동작
- 문제별 제한시간이 아닌 **총 답변시간(기본 40분)** 카운트다운 방식
- 질문 mp3는 `assets/audio/*.mp3` 사용자 파일 사용
- 설문/문항/설정은 JSON으로 분리

## 설정 파일
- `survey.json`: Background Survey
- `questions.json`: 문항
- `test-config.json`: 총 답변시간, Self Assessment 단계
