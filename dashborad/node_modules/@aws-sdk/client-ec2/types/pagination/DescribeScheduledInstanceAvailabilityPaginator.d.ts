import { DescribeScheduledInstanceAvailabilityCommandInput, DescribeScheduledInstanceAvailabilityCommandOutput } from "../commands/DescribeScheduledInstanceAvailabilityCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeScheduledInstanceAvailability(config: EC2PaginationConfiguration, input: DescribeScheduledInstanceAvailabilityCommandInput, ...additionalArguments: any): Paginator<DescribeScheduledInstanceAvailabilityCommandOutput>;
