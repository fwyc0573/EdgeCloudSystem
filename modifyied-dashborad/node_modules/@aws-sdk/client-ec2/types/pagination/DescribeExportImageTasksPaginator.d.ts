import { DescribeExportImageTasksCommandInput, DescribeExportImageTasksCommandOutput } from "../commands/DescribeExportImageTasksCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeExportImageTasks(config: EC2PaginationConfiguration, input: DescribeExportImageTasksCommandInput, ...additionalArguments: any): Paginator<DescribeExportImageTasksCommandOutput>;
