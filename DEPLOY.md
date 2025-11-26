# Vercel 배포 가이드

이 문서는 Vercel CLI를 사용하여 GitHub 연동 없이 직접 배포하는 방법을 설명합니다.

## 사전 준비

### 1. Vercel 계정 생성

1. [Vercel](https://vercel.com)에 접속
2. GitHub, GitLab, Bitbucket 중 하나로 가입 (또는 이메일로 가입)
3. 대시보드 접속

### 2. Vercel CLI 설치

전역 설치 (권장):
```bash
npm install -g vercel
```

또는 프로젝트 로컬 설치:
```bash
npm install --save-dev vercel
```

설치 확인:
```bash
vercel --version
```

## 배포 절차

### 1단계: Vercel 로그인

터미널에서 다음 명령어 실행:
```bash
vercel login
```

브라우저가 자동으로 열리며 로그인 페이지가 표시됩니다. 로그인을 완료하면 터미널로 돌아옵니다.

### 2단계: 프로젝트 빌드 확인

배포 전에 로컬에서 빌드가 정상적으로 작동하는지 확인:
```bash
npm run build
```

빌드가 성공하면 `dist` 폴더가 생성됩니다.

### 3단계: 첫 배포 (프리뷰 환경)

프로젝트 루트 디렉토리에서 다음 명령어 실행:
```bash
vercel
```

첫 배포 시 다음 질문들이 표시됩니다:

1. **Set up and deploy?** → `Y` 입력
2. **Which scope?** → 본인의 계정 선택
3. **Link to existing project?** → `N` 입력 (새 프로젝트)
4. **What's your project's name?** → 프로젝트 이름 입력 (예: `order-system`) 또는 Enter로 기본값 사용
5. **In which directory is your code located?** → `./` 입력 (현재 디렉토리)
6. **Want to override the settings?** → `N` 입력 (vercel.json 사용)

배포가 완료되면 프리뷰 URL이 표시됩니다:
```
🔗  Preview: https://order-system-xxxxx.vercel.app
```

### 4단계: 프로덕션 배포

프리뷰 배포가 정상 작동하는지 확인한 후, 프로덕션으로 배포:
```bash
vercel --prod
```

또는:
```bash
vercel production
```

프로덕션 URL이 표시됩니다:
```
🔗  Production: https://order-system.vercel.app
```

## 환경변수 설정

Supabase 연결을 위해 환경변수를 설정해야 합니다.

### 방법 1: Vercel CLI로 설정 (권장)

```bash
# 프로덕션 환경변수 설정
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production

# 프리뷰 환경변수 설정
vercel env add VITE_SUPABASE_URL preview
vercel env add VITE_SUPABASE_ANON_KEY preview

# 개발 환경변수 설정
vercel env add VITE_SUPABASE_URL development
vercel env add VITE_SUPABASE_ANON_KEY development
```

각 명령어 실행 시 값을 입력하라는 프롬프트가 나타납니다.

### 방법 2: Vercel 대시보드에서 설정

1. [Vercel 대시보드](https://vercel.com/dashboard) 접속
2. 프로젝트 선택
3. Settings → Environment Variables 메뉴 클릭
4. 다음 환경변수 추가:
   - `VITE_SUPABASE_URL`: Supabase 프로젝트 URL
   - `VITE_SUPABASE_ANON_KEY`: Supabase anon key
5. 각 환경변수에 대해 적용할 환경 선택 (Production, Preview, Development)
6. Save 클릭

### 환경변수 확인

설정된 환경변수 확인:
```bash
vercel env ls
```

## 배포 후 확인 사항

### 1. 배포 상태 확인

```bash
vercel ls
```

모든 배포 내역이 표시됩니다.

### 2. 로그 확인

실시간 로그 확인:
```bash
vercel logs
```

특정 배포의 로그 확인:
```bash
vercel logs [deployment-url]
```

### 3. 브라우저에서 테스트

1. 프로덕션 URL 접속
2. 메인 페이지에서 테이블번호 입력 테스트
3. 관리자 페이지 접속 테스트 (테이블번호에 "admin" 입력)
4. Supabase 연결 확인 (메뉴 등록 시도)

## 업데이트 배포

코드 변경 후 다시 배포:

```bash
# 프리뷰 배포
vercel

# 프로덕션 배포
vercel --prod
```

## 프로젝트 정보 확인

프로젝트 설정 확인:
```bash
vercel inspect
```

프로젝트 상세 정보:
```bash
vercel project ls
```

## 도메인 설정 (선택사항)

### 커스텀 도메인 추가

1. Vercel 대시보드 → 프로젝트 → Settings → Domains
2. "Add Domain" 클릭
3. 도메인 입력 및 DNS 설정 안내 따르기

또는 CLI로:
```bash
vercel domains add yourdomain.com
```

## 문제 해결

### 빌드 실패

1. 로컬에서 빌드 테스트:
   ```bash
   npm run build
   ```

2. 빌드 로그 확인:
   ```bash
   vercel logs [deployment-url]
   ```

3. `vercel.json` 설정 확인

### 환경변수 미적용

1. 환경변수 확인:
   ```bash
   vercel env ls
   ```

2. 재배포:
   ```bash
   vercel --prod
   ```

3. Vercel 대시보드에서 환경변수 재확인

### 404 오류

- `vercel.json`의 `rewrites` 설정 확인
- 모든 HTML 파일이 `dist` 폴더에 포함되는지 확인

### CORS 오류

- Supabase 대시보드에서 도메인 허용 설정 확인
- Vercel 배포 URL을 Supabase에 추가

## 유용한 명령어

```bash
# 배포 취소
vercel remove [deployment-url]

# 프로젝트 삭제
vercel remove [project-name]

# 도메인 목록
vercel domains ls

# 팀 목록
vercel teams ls

# 도움말
vercel help
```

## 참고 자료

- [Vercel CLI 문서](https://vercel.com/docs/cli)
- [Vercel 배포 가이드](https://vercel.com/docs/deployments/overview)
- [환경변수 설정](https://vercel.com/docs/concepts/projects/environment-variables)

