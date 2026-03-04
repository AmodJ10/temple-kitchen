class ApiResponse {
    constructor(statusCode, message, data = null, pagination = null) {
        this.success = statusCode < 400;
        this.message = message;
        this.data = data;
        if (pagination) {
            this.pagination = pagination;
        }
    }

    static success(res, message, data, pagination, statusCode = 200) {
        const response = new ApiResponse(statusCode, message, data, pagination);
        return res.status(statusCode).json(response);
    }

    static created(res, message, data) {
        return ApiResponse.success(res, message, data, null, 201);
    }

    static noContent(res) {
        return res.status(204).send();
    }
}

export default ApiResponse;
