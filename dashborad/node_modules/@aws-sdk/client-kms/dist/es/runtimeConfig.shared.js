import { defaultRegionInfoProvider } from "./endpoints";
import { parseUrl } from "@aws-sdk/url-parser";
/**
 * @internal
 */
export var ClientSharedValues = {
    apiVersion: "2014-11-01",
    disableHostPrefix: false,
    logger: {},
    regionInfoProvider: defaultRegionInfoProvider,
    serviceId: "KMS",
    urlParser: parseUrl,
};
//# sourceMappingURL=runtimeConfig.shared.js.map