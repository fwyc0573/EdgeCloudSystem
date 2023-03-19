import { DescribeFastSnapshotRestoresCommandInput, DescribeFastSnapshotRestoresCommandOutput } from "../commands/DescribeFastSnapshotRestoresCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeFastSnapshotRestores(config: EC2PaginationConfiguration, input: DescribeFastSnapshotRestoresCommandInput, ...additionalArguments: any): Paginator<DescribeFastSnapshotRestoresCommandOutput>;
