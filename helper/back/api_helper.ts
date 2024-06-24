import { APIResponse } from "../type";

export const HTTP_METHOD = {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    DELETE: "DELETE",
    PATCH: "PATCH",
};

export const formatSuccessResponse = (data: any, statusCode: number = 200): APIResponse => {
    return {
        statusCode,
        body: { data }
    };
};

export const formatErrorResponse = (error: string, statusCode: number = 500): APIResponse => {
    return {
        statusCode,
        body: { error }
    };
};