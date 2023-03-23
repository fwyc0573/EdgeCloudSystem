import { DescribeLaunchTemplateVersionsCommandInput, DescribeLaunchTemplateVersionsCommandOutput } from "../commands/DescribeLaunchTemplateVersionsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeLaunchTemplateVersions(config: EC2PaginationConfiguration, input: DescribeLaunchTemplateVersionsCommandInput, ...additionalArguments: any): Paginator<DescribeLaunchTemplateVersionsCommandOutput>;
