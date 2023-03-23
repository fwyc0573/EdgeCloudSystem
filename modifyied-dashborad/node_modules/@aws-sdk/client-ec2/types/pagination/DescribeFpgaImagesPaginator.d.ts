import { DescribeFpgaImagesCommandInput, DescribeFpgaImagesCommandOutput } from "../commands/DescribeFpgaImagesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeFpgaImages(config: EC2PaginationConfiguration, input: DescribeFpgaImagesCommandInput, ...additionalArguments: any): Paginator<DescribeFpgaImagesCommandOutput>;
