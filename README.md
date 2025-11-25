# 모바일 웹 주문 시스템

매장의 테이블별 주문 및 음식 제공, 계산을 모바일 웹으로 처리하는 시스템입니다.

## 주요 기능

### 관리자 기능
- **메뉴관리**: 메뉴 등록, 수정, 삭제, 마감 관리
- **테이블별 주문확인**: 테이블별 주문 확인 및 제공완료/주문취소 처리 (개별 주문취소 포함)
- **음식확인**: 메뉴별 주문 상태 확인 및 제공여부 수정
- **계산**: 미결제 테이블 확인 및 결제 완료 처리

### 고객 기능
- **주문**: 메뉴 선택 및 주문 등록
- **주문확인**: 현재 테이블의 주문 내역 확인

## 기술 스택

- **Frontend**: HTML, CSS, JavaScript (ES6 Modules)
- **Backend**: Supabase
- **Build Tool**: Vite

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. Supabase 설정

1. `.env` 파일을 생성하고 다음 내용을 추가하세요:

```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

2. Supabase에서 데이터베이스 스키마를 생성하세요:
   - `database/schema.sql` 파일의 내용을 Supabase SQL Editor에서 실행하세요.

### 3. 개발 서버 실행

```bash
npm run dev
```

### 4. 빌드

```bash
npm run build
```

## 데이터베이스 스키마

### MENU 테이블
- `id`: 메뉴 ID (PK)
- `menu_name`: 메뉴명
- `price`: 가격
- `sale_yn`: 판매여부 (Y/N)
- `created_at`: 생성일시
- `updated_at`: 수정일시

### ORDER 테이블
- `id`: 주문 ID (PK)
- `table_no`: 테이블번호
- `menu_name`: 메뉴명
- `price`: 가격
- `qty`: 수량
- `serve_yn`: 제공여부 (Y/N)
- `pay_yn`: 계산여부 (Y/N)
- `use_yn`: 사용여부 (Y/N)
- `created_at`: 주문시간

## 페이지 구조

- `index.html`: 메인 페이지 (테이블번호 입력)
- `admin.html`: 관리자 메인 페이지
- `admin-menu.html`: 메뉴관리
- `admin-orders.html`: 테이블별 주문확인
- `admin-food.html`: 음식확인
- `admin-payment.html`: 계산
- `customer.html`: 고객 메인 페이지
- `customer-order.html`: 주문
- `customer-check.html`: 주문확인

## 모바일 UI 최적화

- 모든 버튼은 터치 영역 고려 (최소 높이 60px)
- 폰트 16px 이상
- 버튼 간 spacing 12~16px
- 카드형 UI로 정보 분리
- 스크롤 최소화
- 입력은 자동 포커스 또는 숫자 키패드 호출
- 색 대비와 가독성 높게 유지
- 실수 방지 팝업 (주문취소, 계산완료 등)

## QR 코드 지원

QR 코드를 통해 테이블 번호를 자동으로 입력할 수 있습니다.
URL 형식: `index.html?table=5`

## 관리자 접근

메인 페이지에서 테이블 번호 입력란에 "admin"을 입력하면 관리자 페이지로 이동합니다.

