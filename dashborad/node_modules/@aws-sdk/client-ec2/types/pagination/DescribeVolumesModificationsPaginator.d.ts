import { DescribeVolumesModificationsCommandInput, DescribeVolumesModificationsCommandOutput } from "../commands/DescribeVolumesModificationsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeVolumesModifications(config: EC2PaginationConfiguration, input: DescribeVolumesModificationsCommandInput, ...additionalArguments: any): Paginator<DescribeVolumesModificationsCommandOutput>;
