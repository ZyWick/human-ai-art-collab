const keywordService = require('../services/keywordService');

/**
 * Controller to manually create a new keyword.
 */
const createKeyword = async (req, res) => {
  try {
    const keyword = await keywordService.createKeyword(req.body);
    res.status(201).json(keyword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Controller to retrieve a keyword by its ID.
 */
const getKeyword = async (req, res) => {
  try {
    const { keywordId } = req.params;
    const keyword = await keywordService.getKeywordById(keywordId);
    if (!keyword) return res.status(404).json({ error: 'Keyword not found' });
    res.json(keyword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Controller to update keyword fields (x, y, isSelected, etc.).
 */
const updateKeyword = async (req, res) => {
  try {
    const { keywordId } = req.params;
    const updateData = req.body;
    const keyword = await keywordService.updateKeyword(keywordId, updateData);
    if (!keyword) return res.status(404).json({ error: 'Keyword not found' });
    res.json(keyword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Controller to toggle the isSelected field of a keyword.
 */
const toggleKeywordSelection = async (req, res) => {
  try {
    const { keywordId } = req.params;
    const keyword = await keywordService.toggleKeywordSelection(keywordId);
    res.json(keyword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Controller to delete a keyword.
 */
const deleteKeyword = async (req, res) => {
  try {
    const { keywordId } = req.params;
    await keywordService.deleteKeyword(keywordId);
    res.json({ message: 'Keyword deleted.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createKeyword,
  getKeyword,
  updateKeyword,
  toggleKeywordSelection,
  deleteKeyword,
};
