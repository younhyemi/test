import { menus, orders, type Menu, type Order, type InsertMenu, type InsertOrder } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // Menu operations
  getMenus(): Promise<Menu[]>;
  getMenu(id: string): Promise<Menu | undefined>;
  createMenu(menu: InsertMenu): Promise<Menu>;
  updateMenu(id: string, menu: Partial<InsertMenu>): Promise<Menu | undefined>;
  deleteMenu(id: string): Promise<boolean>;
  markMenuSoldOut(id: string): Promise<Menu | undefined>;
  markMenuAvailable(id: string): Promise<Menu | undefined>;
  
  // Order operations
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByTable(tableNo: string): Promise<Order[]>;
  getOrdersByMenu(menuName: string): Promise<Order[]>;
  getActiveOrders(): Promise<Order[]>; // use_yn = 'Y'
  getUnpaidOrders(): Promise<Order[]>; // pay_yn = 'N', use_yn = 'Y'
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderServeStatus(id: string, serveYn: 'Y' | 'N'): Promise<Order | undefined>;
  updateOrderPayStatus(id: string, payYn: 'Y' | 'N'): Promise<Order | undefined>;
  cancelOrder(id: string): Promise<Order | undefined>; // use_yn = 'N'
  updateMultipleOrdersServeStatus(ids: string[], serveYn: 'Y' | 'N'): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Menu operations
  async getMenus(): Promise<Menu[]> {
    return await db.select().from(menus).orderBy(menus.menuName);
  }

  async getMenu(id: string): Promise<Menu | undefined> {
    const [menu] = await db.select().from(menus).where(eq(menus.id, id));
    return menu || undefined;
  }

  async createMenu(insertMenu: InsertMenu): Promise<Menu> {
    const [menu] = await db
      .insert(menus)
      .values(insertMenu)
      .returning();
    return menu;
  }

  async updateMenu(id: string, updateData: Partial<InsertMenu>): Promise<Menu | undefined> {
    const [menu] = await db
      .update(menus)
      .set(updateData)
      .where(eq(menus.id, id))
      .returning();
    return menu || undefined;
  }

  async deleteMenu(id: string): Promise<boolean> {
    const result = await db.delete(menus).where(eq(menus.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async markMenuSoldOut(id: string): Promise<Menu | undefined> {
    const [menu] = await db
      .update(menus)
      .set({ saleYn: 'N' })
      .where(eq(menus.id, id))
      .returning();
    return menu || undefined;
  }

  async markMenuAvailable(id: string): Promise<Menu | undefined> {
    const [menu] = await db
      .update(menus)
      .set({ saleYn: 'Y' })
      .where(eq(menus.id, id))
      .returning();
    return menu || undefined;
  }

  // Order operations
  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrdersByTable(tableNo: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(and(eq(orders.tableNo, tableNo), eq(orders.useYn, 'Y')))
      .orderBy(desc(orders.createdAt));
  }

  async getOrdersByMenu(menuName: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(and(eq(orders.menuName, menuName), eq(orders.useYn, 'Y')))
      .orderBy(desc(orders.createdAt));
  }

  async getActiveOrders(): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.useYn, 'Y'))
      .orderBy(desc(orders.createdAt));
  }

  async getUnpaidOrders(): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(and(eq(orders.payYn, 'N'), eq(orders.useYn, 'Y')))
      .orderBy(desc(orders.createdAt));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(insertOrder)
      .returning();
    return order;
  }

  async updateOrderServeStatus(id: string, serveYn: 'Y' | 'N'): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ serveYn })
      .where(eq(orders.id, id))
      .returning();
    return order || undefined;
  }

  async updateOrderPayStatus(id: string, payYn: 'Y' | 'N'): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ payYn })
      .where(eq(orders.id, id))
      .returning();
    return order || undefined;
  }

  async cancelOrder(id: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ 
        useYn: 'N',
        serveYn: 'N',
        payYn: 'N'
      })
      .where(eq(orders.id, id))
      .returning();
    return order || undefined;
  }

  async updateMultipleOrdersServeStatus(ids: string[], serveYn: 'Y' | 'N'): Promise<void> {
    if (ids.length === 0) return;
    
    await db
      .update(orders)
      .set({ serveYn })
      .where(inArray(orders.id, ids));
  }
}

export const storage = new DatabaseStorage();
