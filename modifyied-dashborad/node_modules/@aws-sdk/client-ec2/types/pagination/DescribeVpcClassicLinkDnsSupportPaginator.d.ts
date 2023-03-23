import { DescribeVpcClassicLinkDnsSupportCommandInput, DescribeVpcClassicLinkDnsSupportCommandOutput } from "../commands/DescribeVpcClassicLinkDnsSupportCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeVpcClassicLinkDnsSupport(config: EC2PaginationConfiguration, input: DescribeVpcClassicLinkDnsSupportCommandInput, ...additionalArguments: any): Paginator<DescribeVpcClassicLinkDnsSupportCommandOutput>;
