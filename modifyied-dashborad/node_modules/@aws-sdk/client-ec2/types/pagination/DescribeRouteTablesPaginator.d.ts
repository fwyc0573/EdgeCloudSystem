import { DescribeRouteTablesCommandInput, DescribeRouteTablesCommandOutput } from "../commands/DescribeRouteTablesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeRouteTables(config: EC2PaginationConfiguration, input: DescribeRouteTablesCommandInput, ...additionalArguments: any): Paginator<DescribeRouteTablesCommandOutput>;
