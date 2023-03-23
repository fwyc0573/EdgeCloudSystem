import { DescribeTrafficMirrorTargetsCommandInput, DescribeTrafficMirrorTargetsCommandOutput } from "../commands/DescribeTrafficMirrorTargetsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeTrafficMirrorTargets(config: EC2PaginationConfiguration, input: DescribeTrafficMirrorTargetsCommandInput, ...additionalArguments: any): Paginator<DescribeTrafficMirrorTargetsCommandOutput>;
