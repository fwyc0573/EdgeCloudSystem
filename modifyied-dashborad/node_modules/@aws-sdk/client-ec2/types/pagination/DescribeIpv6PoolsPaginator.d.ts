import { DescribeIpv6PoolsCommandInput, DescribeIpv6PoolsCommandOutput } from "../commands/DescribeIpv6PoolsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeIpv6Pools(config: EC2PaginationConfiguration, input: DescribeIpv6PoolsCommandInput, ...additionalArguments: any): Paginator<DescribeIpv6PoolsCommandOutput>;
