import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UtensilsCrossed } from "lucide-react";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [tableNo, setTableNo] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get("table");
    if (tableParam) {
      setTableNo(tableParam);
    }
  }, []);

  const handleEnter = () => {
    if (!tableNo.trim()) {
      return;
    }

    if (tableNo.toLowerCase() === "admin") {
      setLocation("/admin");
    } else {
      sessionStorage.setItem("tableNo", tableNo);
      setLocation("/customer");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEnter();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <UtensilsCrossed className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold">주문 관리 시스템</h1>
            <p className="text-muted-foreground">
              테이블번호를 입력하거나<br />관리자는 "admin"을 입력하세요
            </p>
          </div>

          <div className="space-y-4">
            <Input
              type="text"
              placeholder="테이블번호 입력"
              value={tableNo}
              onChange={(e) => setTableNo(e.target.value)}
              onKeyPress={handleKeyPress}
              className="h-14 text-lg text-center"
              data-testid="input-table-no"
              autoFocus
            />

            <Button
              onClick={handleEnter}
              className="w-full h-14 text-lg"
              disabled={!tableNo.trim()}
              data-testid="button-enter"
            >
              입장하기
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>QR 코드로 접속하시면 자동으로 입력됩니다</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
