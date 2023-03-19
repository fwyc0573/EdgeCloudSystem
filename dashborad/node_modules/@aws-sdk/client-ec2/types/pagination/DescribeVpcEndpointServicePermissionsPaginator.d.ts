import { DescribeVpcEndpointServicePermissionsCommandInput, DescribeVpcEndpointServicePermissionsCommandOutput } from "../commands/DescribeVpcEndpointServicePermissionsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeVpcEndpointServicePermissions(config: EC2PaginationConfiguration, input: DescribeVpcEndpointServicePermissionsCommandInput, ...additionalArguments: any): Paginator<DescribeVpcEndpointServicePermissionsCommandOutput>;
