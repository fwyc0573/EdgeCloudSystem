import { DescribeClientVpnRoutesCommandInput, DescribeClientVpnRoutesCommandOutput } from "../commands/DescribeClientVpnRoutesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeClientVpnRoutes(config: EC2PaginationConfiguration, input: DescribeClientVpnRoutesCommandInput, ...additionalArguments: any): Paginator<DescribeClientVpnRoutesCommandOutput>;
