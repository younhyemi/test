import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMenuSchema, insertOrderSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // ==================== MENU ROUTES ====================
  
  // Get all menus
  app.get("/api/menus", async (req, res) => {
    try {
      const menus = await storage.getMenus();
      res.json(menus);
    } catch (error) {
      console.error("Error fetching menus:", error);
      res.status(500).json({ error: "Failed to fetch menus" });
    }
  });

  // Get available menus (sale_yn = 'Y')
  app.get("/api/menus/available", async (req, res) => {
    try {
      const menus = await storage.getMenus();
      const availableMenus = menus.filter((m) => m.saleYn === 'Y');
      res.json(availableMenus);
    } catch (error) {
      console.error("Error fetching available menus:", error);
      res.status(500).json({ error: "Failed to fetch available menus" });
    }
  });

  // Create new menu
  app.post("/api/menus", async (req, res) => {
    try {
      const validatedData = insertMenuSchema.parse(req.body);
      const menu = await storage.createMenu(validatedData);
      res.status(201).json(menu);
    } catch (error: any) {
      console.error("Error creating menu:", error);
      res.status(400).json({ error: error.message || "Failed to create menu" });
    }
  });

  // Update menu
  app.patch("/api/menus/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertMenuSchema.partial().parse(req.body);
      const menu = await storage.updateMenu(id, validatedData);
      
      if (!menu) {
        return res.status(404).json({ error: "Menu not found" });
      }
      
      res.json(menu);
    } catch (error: any) {
      console.error("Error updating menu:", error);
      res.status(400).json({ error: error.message || "Failed to update menu" });
    }
  });

  // Delete menu
  app.delete("/api/menus/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteMenu(id);
      
      if (!success) {
        return res.status(404).json({ error: "Menu not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting menu:", error);
      res.status(500).json({ error: "Failed to delete menu" });
    }
  });

  // Mark menu as sold out
  app.patch("/api/menus/:id/soldout", async (req, res) => {
    try {
      const { id } = req.params;
      const menu = await storage.markMenuSoldOut(id);
      
      if (!menu) {
        return res.status(404).json({ error: "Menu not found" });
      }
      
      res.json(menu);
    } catch (error) {
      console.error("Error marking menu as sold out:", error);
      res.status(500).json({ error: "Failed to mark menu as sold out" });
    }
  });

  // Mark menu as available
  app.patch("/api/menus/:id/available", async (req, res) => {
    try {
      const { id } = req.params;
      const menu = await storage.markMenuAvailable(id);
      
      if (!menu) {
        return res.status(404).json({ error: "Menu not found" });
      }
      
      res.json(menu);
    } catch (error) {
      console.error("Error marking menu as available:", error);
      res.status(500).json({ error: "Failed to mark menu as available" });
    }
  });

  // ==================== ORDER ROUTES ====================
  
  // Get all active orders
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getActiveOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Get unpaid orders
  app.get("/api/orders/unpaid", async (req, res) => {
    try {
      const orders = await storage.getUnpaidOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching unpaid orders:", error);
      res.status(500).json({ error: "Failed to fetch unpaid orders" });
    }
  });

  // Get unpaid tables list - MUST come before generic :tableNo route
  app.get("/api/orders/tables/unpaid", async (req, res) => {
    try {
      const orders = await storage.getUnpaidOrders();
      
      // Group orders by table number
      const tableMap = new Map<string, any[]>();
      
      for (const order of orders) {
        if (!tableMap.has(order.tableNo)) {
          tableMap.set(order.tableNo, []);
        }
        tableMap.get(order.tableNo)!.push(order);
      }
      
      // Convert to array of table objects
      const tables = Array.from(tableMap.entries()).map(([tableNo, orders]) => ({
        tableNo,
        orders,
        totalOrders: orders.length,
        totalAmount: orders.reduce((sum, o) => sum + (o.price * o.qty), 0),
      }));
      
      res.json(tables);
    } catch (error) {
      console.error("Error fetching unpaid tables:", error);
      res.status(500).json({ error: "Failed to fetch unpaid tables" });
    }
  });

  // Get tables list with their orders
  app.get("/api/orders/tables", async (req, res) => {
    try {
      const orders = await storage.getActiveOrders();
      
      // Group orders by table number
      const tableMap = new Map<string, any[]>();
      
      for (const order of orders) {
        if (!tableMap.has(order.tableNo)) {
          tableMap.set(order.tableNo, []);
        }
        tableMap.get(order.tableNo)!.push(order);
      }
      
      // Convert to array of table objects
      const tables = Array.from(tableMap.entries()).map(([tableNo, orders]) => ({
        tableNo,
        orders,
        totalOrders: orders.length,
        totalAmount: orders.reduce((sum, o) => sum + (o.price * o.qty), 0),
      }));
      
      res.json(tables);
    } catch (error) {
      console.error("Error fetching tables:", error);
      res.status(500).json({ error: "Failed to fetch tables" });
    }
  });

  // Get orders by table - MUST come before /tables/unpaid to avoid route conflict
  app.get("/api/orders/tables/:tableNo", async (req, res) => {
    try {
      const { tableNo } = req.params;
      const orders = await storage.getOrdersByTable(decodeURIComponent(tableNo));
      res.json(orders);
    } catch (error) {
      console.error("Error fetching table orders:", error);
      res.status(500).json({ error: "Failed to fetch table orders" });
    }
  });

  // Get menu list with orders - comes after specific :menuName route
  app.get("/api/orders/menus", async (req, res) => {
    try {
      const orders = await storage.getActiveOrders();
      
      // Group orders by menu name
      const menuMap = new Map<string, any[]>();
      
      for (const order of orders) {
        if (!menuMap.has(order.menuName)) {
          menuMap.set(order.menuName, []);
        }
        menuMap.get(order.menuName)!.push(order);
      }
      
      // Convert to array of menu objects
      const menuOrders = Array.from(menuMap.entries()).map(([menuName, orders]) => ({
        menuName,
        orders,
        totalOrders: orders.length,
        totalQty: orders.reduce((sum, o) => sum + o.qty, 0),
      }));
      
      res.json(menuOrders);
    } catch (error) {
      console.error("Error fetching menu orders:", error);
      res.status(500).json({ error: "Failed to fetch menu orders" });
    }
  });

  // Get orders by menu - MUST come before generic /menus route
  app.get("/api/orders/menus/:menuName", async (req, res) => {
    try {
      const { menuName } = req.params;
      const orders = await storage.getOrdersByMenu(decodeURIComponent(menuName));
      res.json(orders);
    } catch (error) {
      console.error("Error fetching menu orders:", error);
      res.status(500).json({ error: "Failed to fetch menu orders" });
    }
  });

  // Create new order (can accept single order or batch)
  app.post("/api/orders", async (req, res) => {
    try {
      const { orders: orderList } = req.body;
      
      // Check if this is a batch order
      if (Array.isArray(orderList)) {
        const createdOrders = [];
        
        for (const orderData of orderList) {
          const validatedData = insertOrderSchema.parse(orderData);
          const order = await storage.createOrder(validatedData);
          createdOrders.push(order);
        }
        
        res.status(201).json(createdOrders);
      } else {
        // Single order
        const validatedData = insertOrderSchema.parse(req.body);
        const order = await storage.createOrder(validatedData);
        res.status(201).json(order);
      }
    } catch (error: any) {
      console.error("Error creating order:", error);
      res.status(400).json({ error: error.message || "Failed to create order" });
    }
  });

  // Update serve status
  app.patch("/api/orders/:id/serve", async (req, res) => {
    try {
      const { id } = req.params;
      const { serveYn } = req.body;
      
      if (serveYn !== 'Y' && serveYn !== 'N') {
        return res.status(400).json({ error: "Invalid serve status" });
      }
      
      const order = await storage.updateOrderServeStatus(id, serveYn);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error updating serve status:", error);
      res.status(500).json({ error: "Failed to update serve status" });
    }
  });

  // Batch update serve status
  app.patch("/api/orders/serve-batch", async (req, res) => {
    try {
      const { orderIds, serveYn } = req.body;
      
      if (!Array.isArray(orderIds) || orderIds.length === 0) {
        return res.status(400).json({ error: "Invalid order IDs" });
      }
      
      if (serveYn !== 'Y' && serveYn !== 'N') {
        return res.status(400).json({ error: "Invalid serve status" });
      }
      
      await storage.updateMultipleOrdersServeStatus(orderIds, serveYn);
      res.status(204).send();
    } catch (error) {
      console.error("Error batch updating serve status:", error);
      res.status(500).json({ error: "Failed to batch update serve status" });
    }
  });

  // Update pay status (can accept single ID or table number)
  app.patch("/api/orders/pay", async (req, res) => {
    try {
      const { tableNo, payYn } = req.body;
      
      if (payYn !== 'Y' && payYn !== 'N') {
        return res.status(400).json({ error: "Invalid pay status" });
      }
      
      // Get all unpaid orders for this table
      const orders = await storage.getOrdersByTable(tableNo);
      const unpaidOrders = orders.filter(o => o.payYn === 'N');
      
      // Update all unpaid orders
      for (const order of unpaidOrders) {
        await storage.updateOrderPayStatus(order.id, payYn);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error updating pay status:", error);
      res.status(500).json({ error: "Failed to update pay status" });
    }
  });

  // Cancel order
  app.patch("/api/orders/:id/cancel", async (req, res) => {
    try {
      const { id } = req.params;
      const order = await storage.cancelOrder(id);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error canceling order:", error);
      res.status(500).json({ error: "Failed to cancel order" });
    }
  });

  // Cancel all orders for a table
  app.patch("/api/orders/cancel-table", async (req, res) => {
    try {
      const { tableNo } = req.body;
      
      if (!tableNo) {
        return res.status(400).json({ error: "Table number is required" });
      }
      
      const orders = await storage.getOrdersByTable(tableNo);
      
      for (const order of orders) {
        await storage.cancelOrder(order.id);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error canceling customer orders:", error);
      res.status(500).json({ error: "Failed to cancel customer orders" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
