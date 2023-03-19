import { Credentials, Endpoint, HashConstructor, InitializeHandlerOptions, InitializeMiddleware, Pluggable, Provider } from "@aws-sdk/types";
interface PreviouslyResolved {
    credentials: Provider<Credentials>;
    endpoint: Provider<Endpoint>;
    region: Provider<string>;
    sha256: HashConstructor;
    signingEscapePath: boolean;
}
export declare function copySnapshotPresignedUrlMiddleware(options: PreviouslyResolved): InitializeMiddleware<any, any>;
export declare const copySnapshotPresignedUrlMiddlewareOptions: InitializeHandlerOptions;
export declare const getCopySnapshotPresignedUrlPlugin: (config: PreviouslyResolved) => Pluggable<any, any>;
export {};
