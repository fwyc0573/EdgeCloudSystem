import { DescribeSpotFleetRequestsCommandInput, DescribeSpotFleetRequestsCommandOutput } from "../commands/DescribeSpotFleetRequestsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeSpotFleetRequests(config: EC2PaginationConfiguration, input: DescribeSpotFleetRequestsCommandInput, ...additionalArguments: any): Paginator<DescribeSpotFleetRequestsCommandOutput>;
