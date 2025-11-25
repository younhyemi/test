import { useState } from "react";
import { ArrowLeft, ChevronDown, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

export default function AdminOrderPage() {
  const { toast } = useToast();
  const [openTables, setOpenTables] = useState<Set<string>>(new Set());
  const [cancelTable, setCancelTable] = useState<string | null>(null);

  const { data: tables = [], isLoading } = useQuery<TableOrders[]>({
    queryKey: ["/api/orders/tables"],
  });

  const serveMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/orders/${id}/serve`, { serveYn: 'Y' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "제공 완료 처리되었습니다",
        duration: 2000,
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (tableNo: string) => 
      apiRequest("PATCH", "/api/orders/cancel-table", { tableNo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setCancelTable(null);
      toast({
        title: "주문이 취소되었습니다",
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

  const handleCancelConfirm = () => {
    if (cancelTable) {
      cancelMutation.mutate(cancelTable);
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/orders/tables"] });
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
          <h1 className="text-xl font-bold ml-4">테이블별 주문확인</h1>
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
        <div className="mb-4">
          <h2 className="text-lg font-semibold">테이블별 주문 조회</h2>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>로딩 중...</p>
          </div>
        ) : tables.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>주문이 없습니다</p>
            <p className="text-sm mt-1">주문 페이지에서 새 주문을 접수해주세요</p>
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
                        주문 {table.totalOrders}개 · ₩{table.totalAmount.toLocaleString('ko-KR')}
                      </p>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
                        openTables.has(table.tableNo) ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="px-6 pb-6 space-y-4 border-t pt-4">
                    <div className="space-y-3">
                      {table.orders.map((order) => (
                        <div key={order.id} className="flex justify-between items-start py-2">
                          <div className="flex-1">
                            <p className="font-medium">{order.menuName}</p>
                            <p className="text-sm text-muted-foreground">
                              ₩{order.price.toLocaleString('ko-KR')} × {order.qty}개
                            </p>
                          </div>
                          {order.serveYn === 'Y' ? (
                            <div className="px-3 py-1 rounded-md bg-primary/10 text-primary text-sm">
                              제공완료
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8"
                              onClick={() => serveMutation.mutate(order.id)}
                              disabled={serveMutation.isPending}
                              data-testid={`button-serve-${order.id}`}
                            >
                              제공완료
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        className="flex-1 h-12 text-destructive border-destructive hover:bg-destructive/10"
                        onClick={() => setCancelTable(table.tableNo)}
                        data-testid={`button-cancel-${table.tableNo}`}
                      >
                        전체 주문취소
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))
        )}
      </div>

      <AlertDialog open={!!cancelTable} onOpenChange={(open) => !open && setCancelTable(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>주문 취소</AlertDialogTitle>
            <AlertDialogDescription>
              정말 이 테이블의 모든 주문을 취소하시겠습니까? 취소된 주문은 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-dialog">취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleCancelConfirm}
              data-testid="button-confirm-cancel-order"
            >
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
