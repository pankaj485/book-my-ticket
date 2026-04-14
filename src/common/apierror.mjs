export class ApiResponse {
  static created(res, message, data = null) {
    return res.status(201).json({
      message: message,
      data,
    });
  }

  static success(res, message, data = null) {
    return res.status(200).json({
      message: message,
      data,
    });
  }

  static badRequest(res, message, data = null) {
    return res.status(400).json({
      message: message,
      data,
    });
  }

  static unauthorized(res, message) {
    return res.status(401).json({
      message: message,
    });
  }

  static forbidden(res, message) {
    return res.status(403).json({
      message: message,
    });
  }

  static internal(res, message, data = null) {
    return res.status(500).json({
      message: message,
      data,
    });
  }
}
