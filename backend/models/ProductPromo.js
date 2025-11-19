const db = require('../config/db');

class ProductPromo {
  // Get active promotional messages
  static async getActive() {
    try {
      const query = `
        SELECT * FROM product_promo_messages 
        WHERE is_active = 1 
        ORDER BY created_at DESC
      `;
      const [rows] = await db.executeWithRetry(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get all promotional messages (for admin)
  static async getAll() {
    try {
      const query = `
        SELECT * FROM product_promo_messages 
        ORDER BY created_at DESC
      `;
      const [rows] = await db.executeWithRetry(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get promotional message by ID
  static async getById(promoId) {
    try {
      const query = `
        SELECT * FROM product_promo_messages 
        WHERE id = ?
      `;
      const [rows] = await db.executeWithRetry(query, [promoId]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Create new promotional message
  static async create(promoData) {
    try {
      const query = `
        INSERT INTO product_promo_messages (
          message, theme, color, is_active
        ) VALUES (?, ?, ?, ?)
      `;
      
      const values = [
        promoData.message,
        promoData.theme || 'primary',
        promoData.color || '#ef4444',
        promoData.is_active !== undefined ? promoData.is_active : 1
      ];
      
      const [result] = await db.executeWithRetry(query, values);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Update promotional message
  static async update(promoId, promoData) {
    try {
      const query = `
        UPDATE product_promo_messages SET 
          message = ?, theme = ?, color = ?, is_active = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      const values = [
        promoData.message,
        promoData.theme,
        promoData.color,
        promoData.is_active,
        promoId
      ];
      
      const [result] = await db.executeWithRetry(query, values);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Delete promotional message
  static async delete(promoId) {
    try {
      const query = 'DELETE FROM product_promo_messages WHERE id = ?';
      const [result] = await db.executeWithRetry(query, [promoId]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Toggle active status
  static async toggleActive(promoId, isActive) {
    try {
      const query = `
        UPDATE product_promo_messages 
        SET is_active = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      const [result] = await db.executeWithRetry(query, [isActive, promoId]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Create the simplified table
  static async createTable() {
    try {
      const query = `
        CREATE TABLE IF NOT EXISTS product_promo_messages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          message TEXT NOT NULL,
          theme VARCHAR(50) DEFAULT 'primary',
          color VARCHAR(7) DEFAULT '#ef4444',
          is_active BOOLEAN DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_active (is_active),
          INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `;
      await db.executeWithRetry(query);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ProductPromo;