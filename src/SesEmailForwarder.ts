import {FollowMode} from '@aws-cdk/assets';
import {AccountPrincipal, PolicyStatement} from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import {BucketAccessControl} from '@aws-cdk/aws-s3';
import {ReceiptRuleSet} from '@aws-cdk/aws-ses';
import * as ses_actions from '@aws-cdk/aws-ses-actions';
import {S3} from '@aws-cdk/aws-ses-actions';
import {Construct, Stack} from '@aws-cdk/core';
import {AutoDeleteBucket} from '@mobileposse/auto-delete-bucket';
import * as path from 'path';

export interface SesEmailForwarderProps {
    forwardToEmail: string,
    recipients: string[],
}

export class SesEmailForwarder extends Construct {
    constructor(scope: Construct, id: string, props: SesEmailForwarderProps) {
        super(scope, id);
        const code = lambda.Code.fromAsset(path.resolve(__dirname, 'lambda'), {
            follow: FollowMode.ALWAYS,
        });
        code.bind(Stack.of(this));
        const bucketForIncomingMail = new AutoDeleteBucket(this, 'incoming-mail', {
            accessControl: BucketAccessControl.PRIVATE,
        });
        bucketForIncomingMail.addToResourcePolicy(new PolicyStatement({
            principals: [
                new AccountPrincipal(Stack.of(this).account),
            ],
            actions: ["*"],
            resources: ["*"]
        }))
        const fnEmailForwarder = new lambda.Function(this, 'forward-email', {
            code,
            handler: 'forward.lambda_handler',
            runtime: lambda.Runtime.PYTHON_3_7,
            initialPolicy: [
                new PolicyStatement({
                    actions: [
                        "s3:GetObject",
                        "ses:*",

                    ],
                    resources: ["*"],
                }),
            ],
            environment: {
                MailS3Bucket: bucketForIncomingMail.bucketName,
                MailS3Prefix: "",
                MailSender: props.forwardToEmail,
                MailRecipient: props.forwardToEmail,
                Region: Stack.of(this).region,
            }
        });

        new ReceiptRuleSet(this, 'receipt-rule-set', {
            rules: [
                {
                    recipients: props.recipients,
                    actions: [
                        new S3({
                            bucket: bucketForIncomingMail,
                        }),
                        new ses_actions.Lambda({
                            function: fnEmailForwarder,
                        })
                    ],
                },
            ]
        });
    }
}
