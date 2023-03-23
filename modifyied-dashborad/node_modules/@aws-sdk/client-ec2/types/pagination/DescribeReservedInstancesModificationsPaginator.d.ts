import { DescribeReservedInstancesModificationsCommandInput, DescribeReservedInstancesModificationsCommandOutput } from "../commands/DescribeReservedInstancesModificationsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeReservedInstancesModifications(config: EC2PaginationConfiguration, input: DescribeReservedInstancesModificationsCommandInput, ...additionalArguments: any): Paginator<DescribeReservedInstancesModificationsCommandOutput>;
