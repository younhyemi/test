import { useState } from "react";
import { ArrowLeft, Pencil, Trash2, XCircle, Check, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { Menu } from "@shared/schema";

export default function ManagePage() {
  const { toast } = useToast();
  const [menuName, setMenuName] = useState("");
  const [price, setPrice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: menus = [], isLoading } = useQuery<Menu[]>({
    queryKey: ["/api/menus"],
  });

  const createMutation = useMutation({
    mutationFn: (data: { menuName: string; price: number }) => 
      apiRequest("POST", "/api/menus", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menus"] });
      setMenuName("");
      setPrice("");
      toast({
        title: "메뉴가 등록되었습니다",
        duration: 2000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류가 발생했습니다",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { menuName: string; price: number } }) =>
      apiRequest("PATCH", `/api/menus/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menus"] });
      setEditingId(null);
      setMenuName("");
      setPrice("");
      toast({
        title: "메뉴가 수정되었습니다",
        duration: 2000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류가 발생했습니다",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/menus/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menus"] });
      setDeleteId(null);
      toast({
        title: "메뉴가 삭제되었습니다",
        duration: 2000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류가 발생했습니다",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const soldOutMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/menus/${id}/soldout`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menus"] });
      toast({
        title: "판매 마감 처리되었습니다",
        duration: 2000,
      });
    },
  });

  const availableMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/menus/${id}/available`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menus"] });
      toast({
        title: "판매 재개되었습니다",
        duration: 2000,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseInt(price);
    
    if (!menuName.trim() || isNaN(priceNum) || priceNum < 0) {
      toast({
        title: "입력 값을 확인해주세요",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        data: { menuName: menuName.trim(), price: priceNum },
      });
    } else {
      createMutation.mutate({
        menuName: menuName.trim(),
        price: priceNum,
      });
    }
  };

  const handleEdit = (menu: Menu) => {
    setEditingId(menu.id);
    setMenuName(menu.menuName);
    setPrice(menu.price.toString());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setMenuName("");
    setPrice("");
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/menus"] });
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
          <h1 className="text-xl font-bold ml-4">메뉴 관리</h1>
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

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "메뉴 수정" : "메뉴 등록"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="menuName">메뉴명</Label>
                <Input
                  id="menuName"
                  type="text"
                  placeholder="메뉴명을 입력하세요"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  className="h-14 text-base"
                  data-testid="input-menu-name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">가격</Label>
                <Input
                  id="price"
                  type="number"
                  inputMode="numeric"
                  placeholder="가격을 입력하세요"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="h-14 text-base"
                  data-testid="input-price"
                  min="0"
                  step="100"
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1 h-14 text-lg"
                  data-testid="button-save-menu"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingId ? "수정" : "저장"}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-14 px-6"
                    onClick={handleCancelEdit}
                    data-testid="button-cancel-edit"
                  >
                    취소
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">메뉴 목록</h2>
          
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>로딩 중...</p>
            </div>
          ) : menus.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>등록된 메뉴가 없습니다</p>
              <p className="text-sm mt-1">위 양식으로 메뉴를 추가해주세요</p>
            </div>
          ) : (
            menus.map((menu) => (
              <Card key={menu.id} data-testid={`card-menu-${menu.id}`}>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground">{menu.menuName}</h3>
                      <p className="text-base font-semibold text-muted-foreground mt-1">
                        ₩{menu.price.toLocaleString('ko-KR')}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-md text-sm font-medium ${
                      menu.saleYn === 'Y' 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {menu.saleYn === 'Y' ? '판매중' : '마감'}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 flex-wrap">
                    <Button
                      variant="outline"
                      className="h-11 px-6"
                      onClick={() => handleEdit(menu)}
                      data-testid={`button-edit-${menu.id}`}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      수정
                    </Button>
                    {menu.saleYn === 'Y' ? (
                      <Button
                        variant="outline"
                        className="h-11 px-6"
                        onClick={() => soldOutMutation.mutate(menu.id)}
                        disabled={soldOutMutation.isPending}
                        data-testid={`button-soldout-${menu.id}`}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        마감
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="h-11 px-6"
                        onClick={() => availableMutation.mutate(menu.id)}
                        disabled={availableMutation.isPending}
                        data-testid={`button-available-${menu.id}`}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        판매재개
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="h-11 px-6 text-destructive border-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteId(menu.id)}
                      data-testid={`button-delete-${menu.id}`}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      삭제
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>메뉴 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말 이 메뉴를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              data-testid="button-confirm-delete"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
