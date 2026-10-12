const Portfolio = require('../models/Portfolio');

// GET all portfolio items (with optional filters & search)
exports.getAllPortfolio = async (req, res) => {
  try {
    const { category, style, search, q } = req.query;
    let filter = {};

    if (category) filter.category = category;
    if (style) filter.style = style;

    const searchTerm = search || q;
    if (searchTerm) {
      filter.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { designerName: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } },
        { style: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    const items = await Portfolio.find(filter).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET single portfolio item by ID
exports.getPortfolioById = async (req, res) => {
  try {
    const item = await Portfolio.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// CREATE new portfolio item
exports.createPortfolio = async (req, res) => {
  try {
    const newItem = new Portfolio(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE portfolio item
exports.updatePortfolio = async (req, res) => {
  try {
    const updatedItem = await Portfolio.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE portfolio item
exports.deletePortfolio = async (req, res) => {
  try {
    const deletedItem = await Portfolio.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ message: 'Item not found' });
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};