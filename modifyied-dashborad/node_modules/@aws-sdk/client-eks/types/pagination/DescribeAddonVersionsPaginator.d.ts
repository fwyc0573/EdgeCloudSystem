import { DescribeAddonVersionsCommandInput, DescribeAddonVersionsCommandOutput } from "../commands/DescribeAddonVersionsCommand";
import { EKSPaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeAddonVersions(config: EKSPaginationConfiguration, input: DescribeAddonVersionsCommandInput, ...additionalArguments: any): Paginator<DescribeAddonVersionsCommandOutput>;
