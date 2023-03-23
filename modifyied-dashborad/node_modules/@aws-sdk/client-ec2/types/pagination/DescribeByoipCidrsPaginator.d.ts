import { DescribeByoipCidrsCommandInput, DescribeByoipCidrsCommandOutput } from "../commands/DescribeByoipCidrsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeByoipCidrs(config: EC2PaginationConfiguration, input: DescribeByoipCidrsCommandInput, ...additionalArguments: any): Paginator<DescribeByoipCidrsCommandOutput>;
