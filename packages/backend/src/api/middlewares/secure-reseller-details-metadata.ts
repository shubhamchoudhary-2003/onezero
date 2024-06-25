import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { NextFunction } from "express";
import _ from "lodash";

function secureResellerDetailsMetadata(
    rawData: Record<string, unknown> | string
) {
    let data: Record<string, unknown>;

    try {
        data = _.isString(rawData) ? JSON.parse(rawData) : rawData;
    } catch (e) {
        return rawData;
    }

    if (_.isArray(data)) {
        return data.map((d) => secureResellerDetailsMetadata(d));
    } else if (_.isObject(data)) {
        const passwordKeys = (data.metadata as any)
            ?.resellerPasswordParameterName;
        const usernameKeys = (data.metadata as any)
            ?.resellerUsernameParameterName;

        for (const key in data) {
            if (key === "metadata") {
                delete data.metadata?.[passwordKeys];
                delete data.metadata?.[usernameKeys];
            } else if (_.isArray(data[key])) {
                data[key] = (data[key] as []).map((d) =>
                    secureResellerDetailsMetadata(d)
                );
            } else if (_.isObject(data[key]) && key != "metadata") {
                secureResellerDetailsMetadata(data[key] as any);
            }
        }
        return data;
    }
}
export async function cleanPasswordsFromProduct(
    req: MedusaRequest,
    res: MedusaResponse,
    next: NextFunction
) {
    const oldResponse = res.send;
    res.send = (data) => {
        try {
            data = secureResellerDetailsMetadata(data as any);
            res.send = oldResponse;
            oldResponse.apply(res, [data]);
        } catch (e) {
            res.send = oldResponse;
            oldResponse.apply(res, [data]);
        }
        return res;
    };

    next();
}
