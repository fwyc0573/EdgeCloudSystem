import { DescribeIamInstanceProfileAssociationsCommandInput, DescribeIamInstanceProfileAssociationsCommandOutput } from "../commands/DescribeIamInstanceProfileAssociationsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeIamInstanceProfileAssociations(config: EC2PaginationConfiguration, input: DescribeIamInstanceProfileAssociationsCommandInput, ...additionalArguments: any): Paginator<DescribeIamInstanceProfileAssociationsCommandOutput>;
