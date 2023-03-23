import { DescribeImportSnapshotTasksCommandInput, DescribeImportSnapshotTasksCommandOutput } from "../commands/DescribeImportSnapshotTasksCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeImportSnapshotTasks(config: EC2PaginationConfiguration, input: DescribeImportSnapshotTasksCommandInput, ...additionalArguments: any): Paginator<DescribeImportSnapshotTasksCommandOutput>;
