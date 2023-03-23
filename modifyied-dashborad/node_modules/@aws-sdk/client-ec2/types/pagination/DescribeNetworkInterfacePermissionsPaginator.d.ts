import { DescribeNetworkInterfacePermissionsCommandInput, DescribeNetworkInterfacePermissionsCommandOutput } from "../commands/DescribeNetworkInterfacePermissionsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeNetworkInterfacePermissions(config: EC2PaginationConfiguration, input: DescribeNetworkInterfacePermissionsCommandInput, ...additionalArguments: any): Paginator<DescribeNetworkInterfacePermissionsCommandOutput>;
