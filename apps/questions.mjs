import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const questionRouter = Router();

// =========================
// Questions (ตาม API Design)
// =========================

// POST /questions - Create a new question
questionRouter.post("/", async (req, res) => {
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

  try {
    await connectionPool.query(
      `INSERT INTO questions (title, description, category) VALUES ($1, $2, $3)`,
      [title.trim(), description.trim(), category.trim()]
    );
    return res.status(201).json({ message: "Question created successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Unable to create question." });
  }
});

// GET /questions - Get all questions
questionRouter.get("/", async (req, res) => {
  try {
    const result = await connectionPool.query(
      `SELECT id, title, description, category FROM questions ORDER BY id ASC`
    );
    return res.status(200).json({ data: result.rows });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch questions." });
  }
});

// GET /questions/search - Search questions by title or category
questionRouter.get("/search", async (req, res) => {
  const { title, category } = req.query;

  if ((!title || !String(title).trim()) && (!category || !String(category).trim())) {
    return res.status(400).json({ message: "Invalid search parameters." });
  }

  try {
    const conditions = [];
    const values = [];

    if (title && String(title).trim()) {
      values.push(`%${String(title).trim()}%`);
      conditions.push(`title ILIKE $${values.length}`);
    }

    if (category && String(category).trim()) {
      values.push(`%${String(category).trim()}%`);
      conditions.push(`category ILIKE $${values.length}`);
    }

    const result = await connectionPool.query(
      `SELECT id, title, description, category
       FROM questions
       WHERE ${conditions.join(" AND ")}
       ORDER BY id ASC`,
      values
    );

    return res.status(200).json({ data: result.rows });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch a question." });
  }
});

// POST /questions/:questionId/answers - Create an answer for a question
questionRouter.post("/:questionId/answers", async (req, res) => {
  const { questionId } = req.params;
  const { content } = req.body;

  if (
    !content ||
    typeof content !== "string" ||
    !content.trim() ||
    content.trim().length > 300
  ) {
    return res.status(400).json({ message: "Invalid request data." });
  }

  try {
    const questionCheck = await connectionPool.query(
      `SELECT id FROM questions WHERE id = $1`,
      [questionId]
    );

    if (questionCheck.rows.length === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    await connectionPool.query(
      `INSERT INTO answers (question_id, content) VALUES ($1, $2)`,
      [questionId, content.trim()]
    );

    return res.status(201).json({ message: "Answer created successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Unable to create answers." });
  }
});

// GET /questions/:questionId/answers - Get answers for a question
questionRouter.get("/:questionId/answers", async (req, res) => {
  const { questionId } = req.params;

  try {
    const questionCheck = await connectionPool.query(
      `SELECT id FROM questions WHERE id = $1`,
      [questionId]
    );

    if (questionCheck.rows.length === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    const result = await connectionPool.query(
      `SELECT id, content FROM answers WHERE question_id = $1 ORDER BY id ASC`,
      [questionId]
    );

    return res.status(200).json({ data: result.rows });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch answers." });
  }
});

// DELETE /questions/:questionId/answers - Delete answers for a question
questionRouter.delete("/:questionId/answers", async (req, res) => {
  const { questionId } = req.params;

  try {
    const questionCheck = await connectionPool.query(
      `SELECT id FROM questions WHERE id = $1`,
      [questionId]
    );

    if (questionCheck.rows.length === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    await connectionPool.query(`DELETE FROM answers WHERE question_id = $1`, [
      questionId,
    ]);

    return res.status(200).json({
      message: "All answers for the question have been deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to delete answers." });
  }
});

// POST /questions/:questionId/vote - Vote on a question
questionRouter.post("/:questionId/vote", async (req, res) => {
  const { questionId } = req.params;
  const { vote } = req.body;

  if (vote !== 1 && vote !== -1) {
    return res.status(400).json({ message: "Invalid vote value." });
  }

  try {
    const questionCheck = await connectionPool.query(
      `SELECT id FROM questions WHERE id = $1`,
      [questionId]
    );

    if (questionCheck.rows.length === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    await connectionPool.query(
      `INSERT INTO question_votes (question_id, vote) VALUES ($1, $2)`,
      [questionId, vote]
    );

    return res.status(200).json({
      message: "Vote on the question has been recorded successfully.",
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to vote question." });
  }
});

// GET /questions/:questionId - Get a question by ID
questionRouter.get("/:questionId", async (req, res) => {
  const { questionId } = req.params;

  try {
    const result = await connectionPool.query(
      `SELECT id, title, description, category FROM questions WHERE id = $1`,
      [questionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    return res.status(200).json({ data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch questions." });
  }
});

// PUT /questions/:questionId - Update a question by ID
questionRouter.put("/:questionId", async (req, res) => {
  const { questionId } = req.params;
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

  try {
    const result = await connectionPool.query(
      `UPDATE questions
       SET title = $1, description = $2, category = $3
       WHERE id = $4
       RETURNING id`,
      [title.trim(), description.trim(), category.trim(), questionId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    return res.status(200).json({ message: "Question updated successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch questions." });
  }
});

// DELETE /questions/:questionId - Delete a question by ID
questionRouter.delete("/:questionId", async (req, res) => {
  const { questionId } = req.params;

  try {
    const result = await connectionPool.query(
      `DELETE FROM questions WHERE id = $1 RETURNING id`,
      [questionId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    return res.status(200).json({
      message: "Question post has been deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to delete question." });
  }
});

export default questionRouter;
