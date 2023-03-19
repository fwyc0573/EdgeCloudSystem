import { DescribeClientVpnAuthorizationRulesCommandInput, DescribeClientVpnAuthorizationRulesCommandOutput } from "../commands/DescribeClientVpnAuthorizationRulesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeClientVpnAuthorizationRules(config: EC2PaginationConfiguration, input: DescribeClientVpnAuthorizationRulesCommandInput, ...additionalArguments: any): Paginator<DescribeClientVpnAuthorizationRulesCommandOutput>;
