import { useState, useEffect } from "react";
import { ArrowLeft, ChevronDown, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Order } from "@shared/schema";

interface MenuOrders {
  menuName: string;
  orders: Order[];
  totalOrders: number;
  totalQty: number;
}

export default function FoodConfirmPage() {
  const { toast } = useToast();
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set());
  const [serveStatus, setServeStatus] = useState<Record<string, boolean>>({});

  const { data: menuOrders = [], isLoading } = useQuery<MenuOrders[]>({
    queryKey: ["/api/orders/menus"],
  });

  useEffect(() => {
    if (menuOrders.length > 0) {
      const status: Record<string, boolean> = {};
      menuOrders.forEach((menu) => {
        menu.orders.forEach((order) => {
          status[order.id] = order.serveYn === 'Y';
        });
      });
      setServeStatus(status);
    }
  }, [menuOrders]);

  const updateServeMutation = useMutation({
    mutationFn: ({ orderIds, serveYn }: { orderIds: string[]; serveYn: 'Y' | 'N' }) =>
      apiRequest("PATCH", "/api/orders/serve-batch", { orderIds, serveYn }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "저장되었습니다",
        duration: 2000,
      });
    },
  });

  const toggleMenu = (menuName: string) => {
    setOpenMenus((prev) => {
      const next = new Set(prev);
      if (next.has(menuName)) {
        next.delete(menuName);
      } else {
        next.add(menuName);
      }
      return next;
    });
  };

  const handleServeToggle = (orderId: string, checked: boolean) => {
    setServeStatus((prev) => ({
      ...prev,
      [orderId]: checked,
    }));
  };

  const handleSave = (menuName: string) => {
    const menu = menuOrders.find((m) => m.menuName === menuName);
    if (!menu) return;

    const toServe: string[] = [];
    const toUnserve: string[] = [];

    menu.orders.forEach((order) => {
      const currentStatus = serveStatus[order.id];
      const originalStatus = order.serveYn === 'Y';
      
      if (currentStatus && !originalStatus) {
        toServe.push(order.id);
      } else if (!currentStatus && originalStatus) {
        toUnserve.push(order.id);
      }
    });

    if (toServe.length > 0) {
      updateServeMutation.mutate({ orderIds: toServe, serveYn: 'Y' });
    }
    if (toUnserve.length > 0) {
      updateServeMutation.mutate({ orderIds: toUnserve, serveYn: 'N' });
    }

    if (toServe.length === 0 && toUnserve.length === 0) {
      toast({
        title: "변경사항이 없습니다",
        duration: 2000,
      });
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/orders/menus"] });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card border-b h-16 flex items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/admin">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold ml-4">음식확인</h1>
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

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>로딩 중...</p>
          </div>
        ) : menuOrders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>주문된 메뉴가 없습니다</p>
            <p className="text-sm mt-1">주문 페이지에서 새 주문을 접수해주세요</p>
          </div>
        ) : (
          menuOrders.map((menu) => (
            <Collapsible
              key={menu.menuName}
              open={openMenus.has(menu.menuName)}
              onOpenChange={() => toggleMenu(menu.menuName)}
            >
              <Card>
                <CollapsibleTrigger
                  className="w-full"
                  data-testid={`button-toggle-${menu.menuName}`}
                >
                  <div className="flex items-center justify-between p-6 min-h-[72px]">
                    <div className="text-left flex-1">
                      <h3 className="text-lg font-bold text-foreground">{menu.menuName}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        총 {menu.totalQty}개 주문 ({menu.totalOrders}건)
                      </p>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
                        openMenus.has(menu.menuName) ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="px-6 pb-6 space-y-3 border-t pt-4">
                    {menu.orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between py-3 border-b last:border-b-0"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{order.tableNo}번 테이블</p>
                          <p className="text-sm text-muted-foreground">{order.qty}개</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`serve-${order.id}`}
                            checked={serveStatus[order.id] || false}
                            onCheckedChange={(checked) =>
                              handleServeToggle(order.id, checked as boolean)
                            }
                            data-testid={`checkbox-serve-${order.id}`}
                          />
                          <label
                            htmlFor={`serve-${order.id}`}
                            className="text-sm cursor-pointer select-none"
                          >
                            제공완료
                          </label>
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-2">
                      <Button
                        className="w-full h-12"
                        onClick={() => handleSave(menu.menuName)}
                        disabled={updateServeMutation.isPending}
                        data-testid={`button-save-${menu.menuName}`}
                      >
                        저장
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))
        )}
      </div>
    </div>
  );
}
