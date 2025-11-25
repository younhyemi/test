import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage from "@/pages/home";
import AdminPage from "@/pages/admin";
import CustomerPage from "@/pages/customer";
import ManagePage from "@/pages/manage";
import AdminOrderPage from "@/pages/admin-order";
import OrderPage from "@/pages/order";
import OrderStatusPage from "@/pages/order-status";
import FoodConfirmPage from "@/pages/food-confirm";
import PaymentPage from "@/pages/payment";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/customer" component={CustomerPage} />
      <Route path="/manage" component={ManagePage} />
      <Route path="/admin-order" component={AdminOrderPage} />
      <Route path="/order" component={OrderPage} />
      <Route path="/order-status" component={OrderStatusPage} />
      <Route path="/food-confirm" component={FoodConfirmPage} />
      <Route path="/payment" component={PaymentPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
