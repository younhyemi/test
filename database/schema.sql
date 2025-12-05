-- MENU 테이블 생성
CREATE TABLE IF NOT EXISTS menu (
  id BIGSERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  menu_name VARCHAR(100) NOT NULL,
  price INTEGER NOT NULL,
  sale_yn CHAR(1) DEFAULT 'Y' CHECK (sale_yn IN ('Y', 'N')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ORDER 테이블 생성
CREATE TABLE IF NOT EXISTS "order" (
  id BIGSERIAL PRIMARY KEY,
  table_no VARCHAR(20) NOT NULL,
  category VARCHAR(50) NOT NULL,
  menu_name VARCHAR(100) NOT NULL,
  price INTEGER NOT NULL,
  qty INTEGER NOT NULL DEFAULT 1,
  order_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ready_yn CHAR(1) DEFAULT 'N' CHECK (ready_yn IN ('Y', 'N')),
  serve_yn CHAR(1) DEFAULT 'N' CHECK (serve_yn IN ('Y', 'N')),
  serve_at TIMESTAMP WITH TIME ZONE NULL,
  pay_yn CHAR(1) DEFAULT 'N' CHECK (pay_yn IN ('Y', 'N')),
  pay_at TIMESTAMP WITH TIME ZONE NULL,
  use_yn CHAR(1) DEFAULT 'Y' CHECK (use_yn IN ('Y', 'N')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_order_table_no ON "order"(table_no);
CREATE INDEX IF NOT EXISTS idx_order_use_yn ON "order"(use_yn);
CREATE INDEX IF NOT EXISTS idx_order_pay_yn ON "order"(pay_yn);
CREATE INDEX IF NOT EXISTS idx_order_serve_yn ON "order"(serve_yn);
CREATE INDEX IF NOT EXISTS idx_order_ready_yn ON "order"(ready_yn);
CREATE INDEX IF NOT EXISTS idx_menu_sale_yn ON menu(sale_yn);
CREATE INDEX IF NOT EXISTS idx_menu_category ON menu(category);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거
CREATE TRIGGER update_menu_updated_at BEFORE UPDATE ON menu
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- MENU 테이블에 조리필요여부 컬럼 추가
ALTER TABLE menu 
ADD COLUMN IF NOT EXISTS cook_required_yn CHAR(1) DEFAULT 'Y' CHECK (cook_required_yn IN ('Y', 'N'));

-- ORDER 테이블에 조리필요여부 컬럼 추가
ALTER TABLE "order" 
ADD COLUMN IF NOT EXISTS cook_required_yn CHAR(1) DEFAULT 'Y' CHECK (cook_required_yn IN ('Y', 'N'));

-- ORDER 테이블의 cook_required_yn 컬럼에 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_order_cook_required_yn ON "order"(cook_required_yn);

-- 화면관리 테이블 생성
CREATE TABLE IF NOT EXISTS screen_management (
  id BIGSERIAL PRIMARY KEY,
  screen_key VARCHAR(50) NOT NULL UNIQUE,
  screen_name VARCHAR(100) NOT NULL,
  use_yn CHAR(1) DEFAULT 'Y' CHECK (use_yn IN ('Y', 'N')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 화면관리 테이블 초기 데이터 삽입
INSERT INTO screen_management (screen_key, screen_name, use_yn, display_order) 
VALUES 
  ('menu', '메뉴관리', 'Y', 1),
  ('orders', '테이블별 주문확인', 'Y', 2),
  ('food-kitchen', '음식확인(주방)', 'Y', 3),
  ('food-serving', '음식확인(서빙)', 'Y', 4),
  ('food-serving-table', '서빙확인(테이블)', 'Y', 5),
  ('orders-manager', '주문확인(매니저)', 'Y', 6),
  ('food-manager', '매니저확인(음식)', 'Y', 7),
  ('payment', '계산', 'Y', 8)
ON CONFLICT (screen_key) DO NOTHING;

-- 화면관리 테이블의 updated_at 트리거
CREATE TRIGGER update_screen_management_updated_at BEFORE UPDATE ON screen_management
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

