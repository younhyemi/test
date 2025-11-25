import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { ShoppingCart, List } from "lucide-react";

export default function CustomerPage() {
  const [, setLocation] = useLocation();
  const [tableNo, setTableNo] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get("table");
    
    let finalTableNo = tableParam || sessionStorage.getItem("tableNo");
    
    if (!finalTableNo) {
      setLocation("/");
      return;
    }
    
    sessionStorage.setItem("tableNo", finalTableNo);
    setTableNo(finalTableNo);
  }, [setLocation]);

  if (!tableNo) {
    return null;
  }

  const menuItems = [
    {
      to: "/order",
      icon: ShoppingCart,
      label: "주문",
      description: "메뉴를 선택하고 주문하기",
      testId: "link-order",
    },
    {
      to: "/order-status",
      icon: List,
      label: "주문확인",
      description: "주문 내역 확인하기",
      testId: "link-order-status",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card border-b h-16 flex items-center justify-between px-4">
        <div>
          <h1 className="text-xl font-bold">{tableNo}번 테이블</h1>
        </div>
        <Link href="/">
          <a className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-home">
            나가기
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
