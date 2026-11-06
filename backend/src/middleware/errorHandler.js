export const errorHandler = (error, req, res, next) => {
  console.error("API Error:", error.message);

  const statusCode =
    error.name === "MulterError" ? 400 : 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error"
  });
};