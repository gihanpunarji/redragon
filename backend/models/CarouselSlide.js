const db = require('../config/db');

class CarouselSlide {
  // Get all carousel slides
  static async getAll() {
    try {
      const query = `
        SELECT * FROM carousel_slides 
        ORDER BY slide_order ASC
      `;
      const [rows] = await db.executeWithRetry(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get slide by ID
  static async getById(slideId) {
    try {
      const query = 'SELECT * FROM carousel_slides WHERE id = ?';
      const [rows] = await db.executeWithRetry(query, [slideId]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Create new slide
  static async create(slideData) {
    try {
      const { slide_order, image_path, title, subtitle, alt_text } = slideData;
      const query = `
        INSERT INTO carousel_slides (slide_order, image_path, title, subtitle, alt_text)
        VALUES (?, ?, ?, ?, ?)
      `;
      const [result] = await db.executeWithRetry(query, [
        slide_order, 
        image_path, 
        title, 
        subtitle || null, 
        alt_text || null
      ]);
      
      return {
        id: result.insertId,
        slide_order,
        image_path,
        title,
        subtitle: subtitle || null,
        alt_text: alt_text || null,
        created_at: new Date(),
        updated_at: new Date()
      };
    } catch (error) {
      throw error;
    }
  }

  // Update slide
  static async update(slideId, slideData) {
    try {
      const { slide_order, image_path, title, subtitle, alt_text } = slideData;
      const query = `
        UPDATE carousel_slides 
        SET slide_order = ?, image_path = ?, title = ?, subtitle = ?, alt_text = ?, updated_at = NOW()
        WHERE id = ?
      `;
      const [result] = await db.executeWithRetry(query, [
        slide_order, 
        image_path, 
        title, 
        subtitle || null, 
        alt_text || null,
        slideId
      ]);
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return await this.getById(slideId);
    } catch (error) {
      throw error;
    }
  }

  // Delete slide
  static async delete(slideId) {
    try {
      const query = 'DELETE FROM carousel_slides WHERE id = ?';
      const [result] = await db.executeWithRetry(query, [slideId]);
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Update multiple slides (for bulk update)
  static async updateMultiple(slidesData) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const results = [];
      
      for (const slide of slidesData) {
        const { id, slide_order, image_path, title, subtitle, alt_text } = slide;
        
        if (id) {
          // Update existing slide
          const query = `
            UPDATE carousel_slides 
            SET slide_order = ?, image_path = ?, title = ?, subtitle = ?, alt_text = ?, updated_at = NOW()
            WHERE id = ?
          `;
          await connection.execute(query, [
            slide_order, 
            image_path, 
            title, 
            subtitle || null, 
            alt_text || null,
            id
          ]);
          
          const [updatedRows] = await connection.execute('SELECT * FROM carousel_slides WHERE id = ?', [id]);
          results.push(updatedRows[0]);
        } else {
          // Create new slide
          const query = `
            INSERT INTO carousel_slides (slide_order, image_path, title, subtitle, alt_text)
            VALUES (?, ?, ?, ?, ?)
          `;
          const [result] = await connection.execute(query, [
            slide_order, 
            image_path, 
            title, 
            subtitle || null, 
            alt_text || null
          ]);
          
          results.push({
            id: result.insertId,
            slide_order,
            image_path,
            title,
            subtitle: subtitle || null,
            alt_text: alt_text || null,
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      }
      
      await connection.commit();
      return results;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get next available slide order
  static async getNextOrder() {
    try {
      const query = 'SELECT MAX(slide_order) as max_order FROM carousel_slides';
      const [rows] = await db.executeWithRetry(query);
      return (rows[0].max_order || 0) + 1;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CarouselSlide;