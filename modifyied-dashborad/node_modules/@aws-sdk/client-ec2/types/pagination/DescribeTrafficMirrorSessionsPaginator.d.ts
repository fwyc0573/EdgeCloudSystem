import { DescribeTrafficMirrorSessionsCommandInput, DescribeTrafficMirrorSessionsCommandOutput } from "../commands/DescribeTrafficMirrorSessionsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeTrafficMirrorSessions(config: EC2PaginationConfiguration, input: DescribeTrafficMirrorSessionsCommandInput, ...additionalArguments: any): Paginator<DescribeTrafficMirrorSessionsCommandOutput>;
