export const validateQuestionBody = (req, res, next) => {
  const { title, description, category } = req.body;

  if (
    !title ||
    typeof title !== "string" ||
    !title.trim() ||
    !description ||
    typeof description !== "string" ||
    !description.trim() ||
    !category ||
    typeof category !== "string" ||
    !category.trim()
  ) {
    return res.status(400).json({ message: "Invalid request data." });
  }

  next();
};
