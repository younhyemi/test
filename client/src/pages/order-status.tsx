import { useEffect, useState } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";
import type { Order } from "@shared/schema";

export default function OrderStatusPage() {
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

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders/tables", tableNo],
    queryFn: async () => {
      const response = await fetch(`/api/orders/tables/${encodeURIComponent(tableNo)}`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
    enabled: !!tableNo,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/orders/tables", tableNo] });
  };

  if (!tableNo) {
    return null;
  }

  const totalAmount = orders.reduce((sum, order) => sum + order.price * order.qty, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card border-b h-16 flex items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/customer">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold ml-4">주문확인</h1>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleRefresh}
          data-testid="button-refresh"
        >
          <RefreshCw className="w-5 h-5" />
        </Button>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">{tableNo}번 테이블</h2>
          <p className="text-sm text-muted-foreground mt-1">주문하신 내역입니다</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>로딩 중...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>주문 내역이 없습니다</p>
            <p className="text-sm mt-1">주문 페이지에서 주문해주세요</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Card>
              <div className="p-6">
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="flex justify-between items-start py-3 border-b last:border-b-0">
                      <div className="flex-1">
                        <p className="font-medium text-lg">{order.menuName}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          ₩{order.price.toLocaleString('ko-KR')} × {order.qty}개
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">
                          ₩{(order.price * order.qty).toLocaleString('ko-KR')}
                        </p>
                        {order.serveYn === 'Y' ? (
                          <div className="mt-1 inline-block px-3 py-1 rounded-md bg-primary/10 text-primary text-sm">
                            제공완료
                          </div>
                        ) : (
                          <div className="mt-1 inline-block px-3 py-1 rounded-md bg-muted text-muted-foreground text-sm">
                            준비중
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">총 금액</span>
                    <span className="text-2xl font-bold text-primary">
                      ₩{totalAmount.toLocaleString('ko-KR')}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
