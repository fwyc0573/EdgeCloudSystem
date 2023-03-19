import { DescribeScheduledInstancesCommandInput, DescribeScheduledInstancesCommandOutput } from "../commands/DescribeScheduledInstancesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeScheduledInstances(config: EC2PaginationConfiguration, input: DescribeScheduledInstancesCommandInput, ...additionalArguments: any): Paginator<DescribeScheduledInstancesCommandOutput>;
