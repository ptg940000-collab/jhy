# Running TEST

체중, 키, 목표를 입력하면 러닝 페이스와 러닝화 종류를 추천하는 웹페이지입니다.

## 실행

```bash
npm start
```

그다음 브라우저에서 `http://localhost:3000`을 여세요.

## 참고

- 이 폴더는 로컬 서버로 실행해야 `추천받기` 버튼이 정상 동작합니다.
- Vercel 배포에서는 `/api/recommend`가 함께 올라가며, `OPENAI_API_KEY`가 없으면 규칙 기반 추천으로 자동 전환됩니다.
