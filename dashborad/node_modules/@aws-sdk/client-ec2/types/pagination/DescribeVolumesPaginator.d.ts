import { DescribeVolumesCommandInput, DescribeVolumesCommandOutput } from "../commands/DescribeVolumesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeVolumes(config: EC2PaginationConfiguration, input: DescribeVolumesCommandInput, ...additionalArguments: any): Paginator<DescribeVolumesCommandOutput>;
