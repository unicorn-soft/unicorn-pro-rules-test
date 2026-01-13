## 🚀 프로젝트 개요

본 레포지토리는 Unicorn Pro 서비스의 고급 기능 테스트를 위해 개발되었습니다. 주요 기능은 다음과 같습니다.

- 확장 CSS 규칙의 정상 작동 여부 테스트
- Scriptlet 규칙 테스트

## 🔗 데모 사이트

[테스트 페이지로 이동](https://unicorn-soft.github.io/unicorn-pro-rules-test/)

## 📝 테스트 방법

### 기본 테스트 절차

1. [데모 사이트](https://unicorn-soft.github.io/unicorn-pro-rules-test/)에 접속
2. Home 페이지의 Test Filters 섹션에서 규칙 복사 (`복사하기` 버튼 사용)
3. 복사한 규칙을 Unicorn Pro 사용자 규칙에 추가
4. Test Pages의 유형별 버튼으로 이동하여 테스트 진행

### 테스트 성공 기준

- 각 테스트 페이지에서 빨간색 박스가 보이지 않아야 합니다
- 모든 CSS 규칙이 정상적으로 적용되어야 합니다

## ✅ 테스트 항목

### 확장 CSS 테스트

- `:has(...)`
  - 역할: 현재 요소가 괄호 안 selector에 매칭되는 요소를 하나라도 포함하면 현재 요소를 매칭한다.
  - 검증: 매칭 결과로 `.target`에 `display: none`이 적용됐는지 확인한다.
- `:upward(...)`
  - 역할: 현재 매칭된 요소 기준으로 상위 요소를 적용 대상으로 올린다.
  - 검증: 최종 대상에 `display: none`이 적용됐는지 확인한다.
- `:matches-css(...)`
  - 역할: 요소의 CSS 값이 조건과 일치하면 매칭한다.
  - 검증: 매칭 결과로 `.target`에 `display: none`이 적용됐는지 확인한다.
- `:has-text(...)`
  - 역할: 요소의 텍스트가 조건(문자열/정규식)에 매칭되면 매칭한다.
  - 검증: 매칭 결과로 `.target`에 `display: none`이 적용됐는지 확인한다.
- `:not(...)`
  - 역할: 괄호 안 selector에 매칭되지 않는 요소만 매칭한다.
  - 검증: 매칭 결과로 `.target`에 `display: none`이 적용됐는지 확인한다.
- `:style(...)`
  - 역할: 매칭된 요소에 지정한 스타일을 적용한다.
  - 검증: computedStyle이 케이스의 `checkStyle`과 일치하는지 확인한다.
- `:remove()`
  - 역할: 매칭된 요소를 DOM에서 제거한다.
  - 검증: `MutationObserver`로 `.target` 노드가 제거됐는지(removedNodes) 확인한다.

### Scriptlet 테스트

- `set-constant` (alias: `set`)
  - 역할: 지정된 property를 읽을 때(getter) 지정된 값으로 고정해 반환한다.
  - 검증: `window.xxx` 값을 `equals`/`functionCall` 등으로 폴링 비교한다.
- `json-prune`
  - 역할: `JSON.parse`로 string → JSON 변환 시 지정 경로의 property를 삭제한다.
  - 검증: `window.xxx`를 `jsonEquals`로 확인한다.
- `json-prune-xhr-response`
  - 역할: XHR로 받은 JSON 응답에서 지정 경로의 property를 삭제한다.
  - 검증: XHR 결과를 `jsonEquals`로 확인한다(MSW mock).
- `json-prune-fetch-response`
  - 역할: fetch로 받은 JSON 응답에서 지정 경로의 property를 삭제한다.
  - 검증: fetch 결과를 `jsonEquals`로 확인한다(MSW mock).
- `trusted-replace-fetch-response`
  - 역할: fetch 응답 텍스트를 정규식/문자열(param1) 기준으로 param2로 치환한다.
  - 검증: 결과 텍스트를 `textEquals` 등으로 확인한다.
- `trusted-replace-node-text` (alias: `trusted-rpnt`, `rpnt`)
  - 역할: 특정 DOM 노드의 특정 텍스트를 다른 텍스트로 치환한다.
  - 검증: MutationObserver 반영값을 `textEquals`로 확인한다.
- `remove-node-text` (alias: `rmnt`)
  - 역할: 특정 DOM 노드에 지정 텍스트가 있으면 해당 노드의 텍스트를 제거한다.
  - 검증: 결과 텍스트/실행 여부를 `textEquals`/`equals`로 확인한다.
- `trusted-replace-outbound-text` (alias: `trusted-rpot`)
  - 역할: 지정 함수의 반환값에서 특정 텍스트를 다른 텍스트로 치환한다.
  - 검증: 반환 결과를 `textEquals`로 확인한다.
- `abort-current-inline-script` (alias: `acis`)
  - 역할: 지정 property 접근 시 오류를 발생시켜 인라인 스크립트 실행을 중지시킨다.
  - 검증: 실행 결과가 미설정(`undefined`) 등으로 남는지 확인한다.
- `no-xhr-if`
  - 역할: XHR 요청을 차단하고 responseType에 맞는 빈 응답을 반환한다.
  - 검증: 차단 여부를 `textBlocked*`/`surrogateLoaded` 등으로 확인한다.
- `no-fetch-if`
  - 역할: fetch 요청을 차단하고 빈 응답을 반환한다.
  - 검증: 차단 여부를 `textBlocked`/`jsonEquals` 등으로 확인한다.
- `trusted-json-edit-fetch-request`
  - 역할: fetch 요청 body(JSON)에서 지정 경로의 key를 삭제·수정한다.
  - 검증: echo된 요청 JSON을 `jsonEquals`로 확인한다(deepEqual).
- `trusted-json-edit-xhr-request`
  - 역할: XHR 요청 body(JSON)에서 지정 경로의 key를 삭제·수정한다.
  - 검증: echo된 요청 JSON을 `jsonEquals`로 확인한다(deepEqual).

## 📌 테스트 케이스 추가 방법

`src/filter/extend-css` 또는 `src/filter/scriptlet/*.json`에 해당하는 유형의 다른 규칙과 동일한 형태의 JSON data를 추가하면 케이스가 추가됩니다.

### 1) 케이스 JSON 추가 위치

- Extend-CSS 케이스
  - `src/filter/extend-css/basic.json`
  - `src/filter/extend-css/style.json`
  - `src/filter/extend-css/remove.json`
- Scriptlet 케이스
  - `src/filter/scriptlet/*.json`
  - 예: `src/filter/scriptlet/json-prune.json`, `src/filter/scriptlet/no-xhr-if.json`, `src/filter/scriptlet/trusted-replace-node-text.json`

### 2) “새 유형(type)”을 추가하려면

JSON만 추가하는 게 아니라 `src/index.js`에 해당 JSON을 import 하고 `testCase` 맵에 등록해야 Home/테스트 페이지에서 인식됩니다.

- 예: `src/filter/scriptlet/my-new-type.json`을 만들었다면
- `src/index.js`에 import 추가
- `testCase['my-new-type'] = myNewTypeCases` 등록
- Home 페이지에서 접근 링크가 필요하면 `public/index.html`의 버튼 목록에 추가(선택)

### 3) 검증 방식(왜 빨간 박스가 사라지는가)

각 케이스는 테스트 페이지(`src/test-page.js`)에서 렌더링되고 아래 방식으로 판정합니다.

- CSS/DOM 제거 계열: `MutationObserver`로 “요소가 제거됐는지/스타일이 바뀌었는지” 관찰
- Scriptlet 계열: 케이스의 `verification` 값에 따라 `src/scriptlet-verifiers/*`의 검증 로직으로 판정

### 4) 네트워크 기반 케이스를 추가한다면(MSW)

fetch/xhr 응답/요청을 건드리는 테스트는 브라우저에서 실제 API가 필요하므로, `src/mocks/handlers.js`에 mock 응답(엔드포인트)을 함께 추가해야 테스트가 재현됩니다.

## 🛠️ 개발 가이드

### 코드 포맷팅

```bash
npm run format
```

이 명령어는 Prettier를 사용하여 프로젝트의 모든 파일을 포맷팅합니다.

## 📈 향후 계획

1. 테스트 케이스 정교화
2. 사용자 피드백 기반 개선

## 📌 주의사항

- 테스트 전 최신 버전의 Unicorn Pro가 설치되어 있는지 확인하세요
- 규칙 적용 후 페이지 새로고침이 필요할 수 있습니다

## 🤝 기여 방법

이슈나 개선사항이 있다면 GitHub Issues에 등록해주세요.

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
