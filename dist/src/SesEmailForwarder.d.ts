import { Construct } from '@aws-cdk/core';
export interface SesEmailForwarderProps {
    forwardToEmail: string;
    recipients: string[];
}
export declare class SesEmailForwarder extends Construct {
    constructor(scope: Construct, id: string, props: SesEmailForwarderProps);
}
