-- MENU 테이블 생성
CREATE TABLE IF NOT EXISTS menu (
  id BIGSERIAL PRIMARY KEY,
  menu_name VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL,
  sale_yn CHAR(1) DEFAULT 'Y' CHECK (sale_yn IN ('Y', 'N')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ORDER 테이블 생성
CREATE TABLE IF NOT EXISTS "order" (
  id BIGSERIAL PRIMARY KEY,
  table_no VARCHAR(50) NOT NULL,
  menu_name VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL,
  qty INTEGER NOT NULL DEFAULT 1,
  serve_yn CHAR(1) DEFAULT 'N' CHECK (serve_yn IN ('Y', 'N')),
  pay_yn CHAR(1) DEFAULT 'N' CHECK (pay_yn IN ('Y', 'N')),
  use_yn CHAR(1) DEFAULT 'Y' CHECK (use_yn IN ('Y', 'N')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_order_table_no ON "order"(table_no);
CREATE INDEX IF NOT EXISTS idx_order_use_yn ON "order"(use_yn);
CREATE INDEX IF NOT EXISTS idx_order_pay_yn ON "order"(pay_yn);
CREATE INDEX IF NOT EXISTS idx_menu_sale_yn ON menu(sale_yn);

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

