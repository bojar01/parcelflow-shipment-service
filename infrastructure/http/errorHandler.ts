import type { NextFunction, Request, Response } from "express";

interface HttpError extends Error {
    status?: number;
    statusCode?: number;
    type?: string;
    expose?: boolean;
}

export function notFoundHandler(req: Request, res: Response): void {
    res.status(404).json({
        status: 404,
        error: `Route ${req.method} ${req.path} not found`
    });
}

export function errorHandler(
    error: HttpError,
    _req: Request,
    res: Response,
    next: NextFunction
): void {
    if (res.headersSent) {
        next(error);
        return;
    }

    if (error.type === "entity.parse.failed") {
        res.status(400).json({
            status: 400,
            error: "Malformed JSON body"
        });
        return;
    }

    // Client errors raised by Express/body-parser (413 payload too large, 415...)
    const status = error.status ?? error.statusCode;
    if (status !== undefined && status >= 400 && status < 500 && error.expose) {
        res.status(status).json({
            status,
            error: error.message
        });
        return;
    }

    console.error("Unhandled error:", error);

    res.status(500).json({
        status: 500,
        error: "Internal server error"
    });
}
