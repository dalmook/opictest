# OPIc Mock Test (GitHub Pages)

OPIc 스타일 모의 테스트 웹앱입니다.

## 구성
- `index.html`: 화면/레이아웃
- `styles.css`: 스타일
- `app.js`: 설문/문항/타이머 로직
- `survey.json`: 설문 항목
- `questions.json`: 문항 데이터 (MP3 경로 포함)

## 사용 방법
1. `assets/audio/` 폴더를 만들고 문항 mp3를 넣습니다.
2. `questions.json`의 `audio` 경로를 실제 파일명에 맞게 수정합니다.
3. GitHub Pages로 배포합니다.

## GitHub Pages 배포
1. 저장소에 push
2. Settings → Pages
3. Branch를 `main` / root로 설정
4. 접속 URL 확인
