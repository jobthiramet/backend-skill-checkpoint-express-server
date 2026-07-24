export const validateSearchQuery = (req, res, next) => {
  const { title, category } = req.query;

  if (
    (!title || !String(title).trim()) &&
    (!category || !String(category).trim())
  ) {
    return res.status(400).json({ message: "Invalid search parameters." });
  }

  next();
};
