import { DescribePrincipalIdFormatCommandInput, DescribePrincipalIdFormatCommandOutput } from "../commands/DescribePrincipalIdFormatCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribePrincipalIdFormat(config: EC2PaginationConfiguration, input: DescribePrincipalIdFormatCommandInput, ...additionalArguments: any): Paginator<DescribePrincipalIdFormatCommandOutput>;
