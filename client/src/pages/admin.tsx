import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Settings, ClipboardCheck, CheckSquare, DollarSign } from "lucide-react";

export default function AdminPage() {
  const menuItems = [
    {
      to: "/manage",
      icon: Settings,
      label: "메뉴관리",
      description: "메뉴 등록 및 판매 관리",
      testId: "link-manage",
    },
    {
      to: "/admin-order",
      icon: ClipboardCheck,
      label: "테이블별 주문확인",
      description: "테이블 단위 주문 조회 및 처리",
      testId: "link-admin-order",
    },
    {
      to: "/food-confirm",
      icon: CheckSquare,
      label: "음식확인",
      description: "메뉴별 제공 체크",
      testId: "link-food-confirm",
    },
    {
      to: "/payment",
      icon: DollarSign,
      label: "계산",
      description: "결제 처리",
      testId: "link-payment",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card border-b h-16 flex items-center justify-between px-4">
        <h1 className="text-xl font-bold">관리자 페이지</h1>
        <Link href="/">
          <a className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-home">
            로그아웃
          </a>
        </Link>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center mb-8 mt-4">
          <p className="text-muted-foreground">원하시는 기능을 선택하세요</p>
        </div>

        <div className="space-y-4">
          {menuItems.map((item) => (
            <Link key={item.to} href={item.to}>
              <Card 
                className="hover-elevate active-elevate-2 cursor-pointer transition-all"
                data-testid={item.testId}
              >
                <div className="flex items-center gap-4 p-6 min-h-[80px]">
                  <div className="flex-shrink-0">
                    <item.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-foreground">{item.label}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
