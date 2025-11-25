import { useState, useEffect } from "react";
import { ArrowLeft, Minus, Plus, RefreshCw } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Menu } from "@shared/schema";

export default function OrderPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [tableNo, setTableNo] = useState<string>("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

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

  const { data: menus = [], isLoading } = useQuery<Menu[]>({
    queryKey: ["/api/menus/available"],
    enabled: !!tableNo,
  });

  const createOrderMutation = useMutation({
    mutationFn: (orders: any[]) => apiRequest("POST", "/api/orders", { orders }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "주문이 등록되었습니다",
        duration: 2000,
      });
      setQuantities({});
      setTimeout(() => setLocation("/customer"), 500);
    },
    onError: (error: any) => {
      toast({
        title: "오류가 발생했습니다",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleQuantityChange = (menuId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[menuId] || 0;
      const newValue = Math.max(0, current + delta);
      return { ...prev, [menuId]: newValue };
    });
  };

  const handleOrderSubmit = () => {
    const ordersToCreate = menus
      .filter((menu) => quantities[menu.id] > 0)
      .map((menu) => ({
        tableNo: tableNo,
        menuName: menu.menuName,
        price: menu.price,
        qty: quantities[menu.id],
      }));

    if (ordersToCreate.length === 0) {
      toast({
        title: "메뉴를 선택해주세요",
        variant: "destructive",
      });
      return;
    }

    createOrderMutation.mutate(ordersToCreate);
  };

  const totalItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  const totalAmount = menus.reduce((sum, menu) => {
    const qty = quantities[menu.id] || 0;
    return sum + menu.price * qty;
  }, 0);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/menus/available"] });
  };

  if (!tableNo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-card border-b h-16 flex items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/customer">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold ml-4">주문</h1>
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
          <p className="text-sm text-muted-foreground mt-1">메뉴를 선택해주세요</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>로딩 중...</p>
          </div>
        ) : menus.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>판매 가능한 메뉴가 없습니다</p>
            <p className="text-sm mt-1">잠시 후 다시 시도해주세요</p>
          </div>
        ) : (
          <div className="space-y-4">
            {menus.map((menu) => {
              const qty = quantities[menu.id] || 0;
              return (
                <Card key={menu.id} data-testid={`card-menu-${menu.id}`}>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold">{menu.menuName}</h3>
                        <p className="text-xl font-semibold text-primary mt-1">
                          ₩{menu.price.toLocaleString('ko-KR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(menu.id, -1)}
                        disabled={qty === 0}
                        className="h-12 w-12"
                        data-testid={`button-decrease-${menu.id}`}
                      >
                        <Minus className="w-5 h-5" />
                      </Button>
                      
                      <div className="flex-1 text-center">
                        <span className="text-2xl font-bold" data-testid={`text-qty-${menu.id}`}>
                          {qty}
                        </span>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(menu.id, 1)}
                        className="h-12 w-12"
                        data-testid={`button-increase-${menu.id}`}
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4">
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">선택한 메뉴</p>
                <p className="text-lg font-semibold">{totalItems}개</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">총 금액</p>
                <p className="text-2xl font-bold text-primary">
                  ₩{totalAmount.toLocaleString('ko-KR')}
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleOrderSubmit}
              disabled={createOrderMutation.isPending}
              className="w-full h-14 text-lg"
              data-testid="button-submit-order"
            >
              주문하기
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
