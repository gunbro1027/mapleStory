# Starter Web Project

기본적인 정적 웹사이트를 프로젝트 형태로 관리할 수 있게 정리한 예제입니다.

## 구조

- `index.html`: 앱 진입 페이지
- `src/styles/main.css`: 전체 스타일
- `src/scripts/main.js`: 기본 인터랙션
- `package.json`: 프로젝트 메타데이터와 실행 스크립트
- `.gitignore`: Git에서 제외할 파일 목록

## 실행

Node.js가 설치되어 있다면 아래처럼 실행할 수 있습니다.

```bash
npm install
npm run dev
```

빌드 결과를 보고 싶다면:

```bash
npm run build
npm run preview
```

Node.js가 아직 없다면, 일단 `index.html`을 브라우저에서 직접 열어도 화면은 확인할 수 있습니다.

## 확장 아이디어

- 포트폴리오 사이트로 변경
- 소개 페이지와 프로젝트 목록 추가
- 문의 영역을 실제 폼으로 확장
