import { DescribeFlowLogsCommandInput, DescribeFlowLogsCommandOutput } from "../commands/DescribeFlowLogsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeFlowLogs(config: EC2PaginationConfiguration, input: DescribeFlowLogsCommandInput, ...additionalArguments: any): Paginator<DescribeFlowLogsCommandOutput>;
