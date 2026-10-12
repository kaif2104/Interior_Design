const Item = require('../models/Item');

// GET all items with category filter, search, sorting
exports.getAllItems = async (req, res) => {
  try {
    const { category, search, q, sort, featured, inStock } = req.query;
    let filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (featured === 'true') {
      filter.featured = true;
    }

    if (inStock === 'true') {
      filter.inStock = true;
    }

    const searchTerm = search || q;
    if (searchTerm) {
      filter.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { material: { $regex: searchTerm, $options: 'i' } },
        { color: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    let query = Item.find(filter);

    if (sort === 'price_asc') {
      query = query.sort({ price: 1 });
    } else if (sort === 'price_desc') {
      query = query.sort({ price: -1 });
    } else if (sort === 'rating') {
      query = query.sort({ rating: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const items = await query.exec();
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Failed to retrieve items', error: error.message });
  }
};

// GET single item by ID
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json(item);
  } catch (error) {
    console.error('Error fetching item by ID:', error);
    res.status(500).json({ message: 'Failed to retrieve item', error: error.message });
  }
};

// CREATE new item (Admin)
exports.createItem = async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      originalPrice,
      dimensions,
      material,
      color,
      leadTime,
      images,
      description,
      features,
      featured,
      inStock
    } = req.body;

    if (!name || !category || !price || !description) {
      return res.status(400).json({ message: 'Name, category, price, and description are required.' });
    }

    const newItem = new Item({
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      dimensions: dimensions || '',
      material: material || '',
      color: color || '',
      leadTime: leadTime || '3-5 Business Days',
      images: Array.isArray(images) ? images : (images ? [images] : []),
      description: description.trim(),
      features: Array.isArray(features) ? features : (features ? [features] : []),
      featured: Boolean(featured),
      inStock: inStock !== undefined ? Boolean(inStock) : true
    });

    const saved = await newItem.save();
    res.status(201).json({ message: 'Item added successfully', item: saved });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ message: 'Failed to create item', error: error.message });
  }
};

// UPDATE item
exports.updateItem = async (req, res) => {
  try {
    const updated = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json({ message: 'Item updated successfully', item: updated });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ message: 'Failed to update item', error: error.message });
  }
};

// DELETE item
exports.deleteItem = async (req, res) => {
  try {
    const deleted = await Item.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Failed to delete item', error: error.message });
  }
};
