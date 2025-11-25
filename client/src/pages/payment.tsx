import { useState } from "react";
import { ArrowLeft, ChevronDown, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Order } from "@shared/schema";

interface TableOrders {
  tableNo: string;
  orders: Order[];
  totalOrders: number;
  totalAmount: number;
}

export default function PaymentPage() {
  const { toast } = useToast();
  const [openTables, setOpenTables] = useState<Set<string>>(new Set());

  const { data: tables = [], isLoading } = useQuery<TableOrders[]>({
    queryKey: ["/api/orders/tables/unpaid"],
  });

  const payMutation = useMutation({
    mutationFn: (tableNo: string) =>
      apiRequest("PATCH", "/api/orders/pay", { tableNo, payYn: 'Y' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/tables/unpaid"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "결제가 완료되었습니다",
        duration: 2000,
      });
    },
  });

  const toggleTable = (tableNo: string) => {
    setOpenTables((prev) => {
      const next = new Set(prev);
      if (next.has(tableNo)) {
        next.delete(tableNo);
      } else {
        next.add(tableNo);
      }
      return next;
    });
  };

  const formatPrice = (price: number) => {
    return `₩${price.toLocaleString('ko-KR')}`;
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/orders/tables/unpaid"] });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-card border-b h-16 flex items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/admin">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold ml-4">계산</h1>
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
        ) : tables.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>미결제 주문이 없습니다</p>
            <p className="text-sm mt-1">모든 주문이 결제 완료되었습니다</p>
          </div>
        ) : (
          tables.map((table) => (
            <Collapsible
              key={table.tableNo}
              open={openTables.has(table.tableNo)}
              onOpenChange={() => toggleTable(table.tableNo)}
            >
              <Card>
                <CollapsibleTrigger
                  className="w-full"
                  data-testid={`button-toggle-${table.tableNo}`}
                >
                  <div className="flex items-center justify-between p-6 min-h-[72px]">
                    <div className="text-left flex-1">
                      <h3 className="text-lg font-bold text-foreground">{table.tableNo}번 테이블</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        주문 {table.totalOrders}개
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(table.totalAmount)}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
                          openTables.has(table.tableNo) ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="px-6 pb-6 space-y-3 border-t pt-4">
                    <div className="space-y-2">
                      {table.orders.map((order) => (
                        <div key={order.id} className="flex justify-between py-2">
                          <span className="text-muted-foreground">
                            {order.menuName} × {order.qty}
                          </span>
                          <span className="font-semibold">
                            {formatPrice(order.price * order.qty)}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-bold">총 금액</span>
                        <span className="text-2xl font-bold text-primary">
                          {formatPrice(table.totalAmount)}
                        </span>
                      </div>
                      
                      <Button
                        className="w-full h-14 text-lg"
                        onClick={() => payMutation.mutate(table.tableNo)}
                        disabled={payMutation.isPending}
                        data-testid={`button-pay-${table.tableNo}`}
                      >
                        계산완료
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
