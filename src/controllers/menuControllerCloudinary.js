import { sql } from '../config/database.js';
import { cloudinary } from '../config/cloudinary.js';
import { retryQuery } from '../utils/dbRetry.js';

// @desc    Get all menu categories
// @route   GET /api/menu/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await retryQuery(async () => {
      return await sql`
        SELECT * FROM menu_categories
        ORDER BY display_order ASC
      `;
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create menu category
// @route   POST /api/menu/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  try {
    const { name, description, displayOrder } = req.body;

    const categories = await sql`
      INSERT INTO menu_categories (name, description, display_order)
      VALUES (${name}, ${description}, ${displayOrder || 0})
      RETURNING *
    `;

    res.status(201).json({ success: true, data: categories[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update menu category
// @route   PUT /api/menu/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, displayOrder } = req.body;

    const categories = await sql`
      UPDATE menu_categories
      SET name = ${name}, description = ${description}, display_order = ${displayOrder}
      WHERE id = ${id}
      RETURNING *
    `;

    res.json({ success: true, data: categories[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete menu category
// @route   DELETE /api/menu/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    await sql`
      DELETE FROM menu_categories WHERE id = ${id}
    `;

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all menu items
// @route   GET /api/menu/items
// @access  Public
export const getMenuItems = async (req, res) => {
  try {
    const { category } = req.query;

    const items = await retryQuery(async () => {
      if (category) {
        return await sql`
          SELECT
            mi.*,
            json_build_object('name', mc.name) as menu_categories
          FROM menu_items mi
          LEFT JOIN menu_categories mc ON mi.category_id = mc.id
          WHERE mi.category_id = ${category}
        `;
      } else {
        return await sql`
          SELECT
            mi.*,
            json_build_object('name', mc.name) as menu_categories
          FROM menu_items mi
          LEFT JOIN menu_categories mc ON mi.category_id = mc.id
        `;
      }
    });

    res.json({ success: true, data: items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/items/:id
// @access  Public
export const getMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const items = await sql`
      SELECT
        mi.*,
        json_build_object('name', mc.name) as menu_categories
      FROM menu_items mi
      LEFT JOIN menu_categories mc ON mi.category_id = mc.id
      WHERE mi.id = ${id}
    `;

    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    res.json({ success: true, data: items[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Helper function to extract Cloudinary public ID from URL
const getCloudinaryPublicId = (imageUrl) => {
  if (!imageUrl) return null;

  // Extract public ID from Cloudinary URL
  // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/hood-eatery/menu/image.jpg
  // Returns: hood-eatery/menu/image
  const matches = imageUrl.match(/\/v\d+\/(.+)\.\w+$/);
  return matches ? matches[1] : null;
};

// @desc    Create menu item
// @route   POST /api/menu/items
// @access  Private/Admin
export const createMenuItem = async (req, res) => {
  try {
    const { categoryId, name, description, price, originalPrice, isAvailable, isFeatured } = req.body;

    let imageUrl = null;
    if (req.file) {
      // Cloudinary URL is stored in req.file.path
      imageUrl = req.file.path;
    }

    const items = await sql`
      INSERT INTO menu_items (category_id, name, description, price, original_price, image_url, is_available, is_featured)
      VALUES (${categoryId}, ${name}, ${description}, ${price}, ${originalPrice || null}, ${imageUrl}, ${isAvailable !== undefined ? isAvailable : true}, ${isFeatured || false})
      RETURNING *
    `;

    res.status(201).json({ success: true, data: items[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/items/:id
// @access  Private/Admin
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, name, description, price, originalPrice, isAvailable, isFeatured } = req.body;

    // Get existing item
    const existingItems = await sql`
      SELECT image_url FROM menu_items WHERE id = ${id}
    `;

    const existingItem = existingItems[0];
    let imageUrl = existingItem?.image_url;

    // If new file uploaded, delete old one from Cloudinary and use new one
    if (req.file) {
      // Delete old image from Cloudinary
      if (existingItem?.image_url) {
        const publicId = getCloudinaryPublicId(existingItem.image_url);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.error('Error deleting old image from Cloudinary:', err);
          }
        }
      }

      // Use new Cloudinary image URL
      imageUrl = req.file.path;
    }

    const items = await sql`
      UPDATE menu_items
      SET
        category_id = ${categoryId},
        name = ${name},
        description = ${description},
        price = ${price},
        original_price = ${originalPrice || null},
        image_url = ${imageUrl},
        is_available = ${isAvailable},
        is_featured = ${isFeatured},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    res.json({ success: true, data: items[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/items/:id
// @access  Private/Admin
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Get item to delete image
    const items = await sql`
      SELECT image_url FROM menu_items WHERE id = ${id}
    `;

    const item = items[0];

    // Delete image from Cloudinary if exists
    if (item?.image_url) {
      const publicId = getCloudinaryPublicId(item.image_url);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error('Error deleting image from Cloudinary:', err);
        }
      }
    }

    await sql`
      DELETE FROM menu_items WHERE id = ${id}
    `;

    res.json({ success: true, message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
