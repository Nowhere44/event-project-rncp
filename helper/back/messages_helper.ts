import { APIResponse } from "../type";

export const formatSuccessMessage = (data: any): APIResponse => {
    return {
        statusCode: 200,
        body: data
    };
};

export const formatErrorMessage = (error: string, statusCode: number = 500): APIResponse => {
    return {
        statusCode,
        body: {
            error
        }
    };
};

export const formatNotFoundMessage = (): APIResponse => {
    return {
        statusCode: 404,
        body: {
            error: "Not Found"
        }
    };
};