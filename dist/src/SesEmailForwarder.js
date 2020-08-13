"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SesEmailForwarder = void 0;
const assets_1 = require("@aws-cdk/assets");
const aws_iam_1 = require("@aws-cdk/aws-iam");
const lambda = require("@aws-cdk/aws-lambda");
const aws_s3_1 = require("@aws-cdk/aws-s3");
const aws_ses_1 = require("@aws-cdk/aws-ses");
const ses_actions = require("@aws-cdk/aws-ses-actions");
const aws_ses_actions_1 = require("@aws-cdk/aws-ses-actions");
const core_1 = require("@aws-cdk/core");
const auto_delete_bucket_1 = require("@mobileposse/auto-delete-bucket");
const path = require("path");
class SesEmailForwarder extends core_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        const code = lambda.Code.fromAsset(path.resolve(__dirname, 'lambda'), {
            follow: assets_1.FollowMode.ALWAYS,
        });
        code.bind(core_1.Stack.of(this));
        const bucketForIncomingMail = new auto_delete_bucket_1.AutoDeleteBucket(this, 'incoming-mail', {
            accessControl: aws_s3_1.BucketAccessControl.PRIVATE,
        });
        bucketForIncomingMail.addToResourcePolicy(new aws_iam_1.PolicyStatement({
            principals: [
                new aws_iam_1.AccountPrincipal(core_1.Stack.of(this).account),
            ],
            actions: ["*"],
            resources: ["*"]
        }));
        const fnEmailForwarder = new lambda.Function(this, 'forward-email', {
            code,
            handler: 'forward.lambda_handler',
            runtime: lambda.Runtime.PYTHON_3_7,
            initialPolicy: [
                new aws_iam_1.PolicyStatement({
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
                Region: core_1.Stack.of(this).region,
            }
        });
        new aws_ses_1.ReceiptRuleSet(this, 'receipt-rule-set', {
            rules: [
                {
                    recipients: props.recipients,
                    actions: [
                        new aws_ses_actions_1.S3({
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
exports.SesEmailForwarder = SesEmailForwarder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VzRW1haWxGb3J3YXJkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvU2VzRW1haWxGb3J3YXJkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNENBQTJDO0FBQzNDLDhDQUFtRTtBQUNuRSw4Q0FBOEM7QUFDOUMsNENBQW9EO0FBQ3BELDhDQUFnRDtBQUNoRCx3REFBd0Q7QUFDeEQsOERBQTRDO0FBQzVDLHdDQUErQztBQUMvQyx3RUFBaUU7QUFDakUsNkJBQTZCO0FBTzdCLE1BQWEsaUJBQWtCLFNBQVEsZ0JBQVM7SUFDNUMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUE2QjtRQUNuRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxFQUFFO1lBQ2xFLE1BQU0sRUFBRSxtQkFBVSxDQUFDLE1BQU07U0FDNUIsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDMUIsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLHFDQUFnQixDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDdEUsYUFBYSxFQUFFLDRCQUFtQixDQUFDLE9BQU87U0FDN0MsQ0FBQyxDQUFDO1FBQ0gscUJBQXFCLENBQUMsbUJBQW1CLENBQUMsSUFBSSx5QkFBZSxDQUFDO1lBQzFELFVBQVUsRUFBRTtnQkFDUixJQUFJLDBCQUFnQixDQUFDLFlBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDO2FBQy9DO1lBQ0QsT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDO1lBQ2QsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDO1NBQ25CLENBQUMsQ0FBQyxDQUFBO1FBQ0gsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUNoRSxJQUFJO1lBQ0osT0FBTyxFQUFFLHdCQUF3QjtZQUNqQyxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVO1lBQ2xDLGFBQWEsRUFBRTtnQkFDWCxJQUFJLHlCQUFlLENBQUM7b0JBQ2hCLE9BQU8sRUFBRTt3QkFDTCxjQUFjO3dCQUNkLE9BQU87cUJBRVY7b0JBQ0QsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDO2lCQUNuQixDQUFDO2FBQ0w7WUFDRCxXQUFXLEVBQUU7Z0JBQ1QsWUFBWSxFQUFFLHFCQUFxQixDQUFDLFVBQVU7Z0JBQzlDLFlBQVksRUFBRSxFQUFFO2dCQUNoQixVQUFVLEVBQUUsS0FBSyxDQUFDLGNBQWM7Z0JBQ2hDLGFBQWEsRUFBRSxLQUFLLENBQUMsY0FBYztnQkFDbkMsTUFBTSxFQUFFLFlBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTTthQUNoQztTQUNKLENBQUMsQ0FBQztRQUVILElBQUksd0JBQWMsQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUU7WUFDekMsS0FBSyxFQUFFO2dCQUNIO29CQUNJLFVBQVUsRUFBRSxLQUFLLENBQUMsVUFBVTtvQkFDNUIsT0FBTyxFQUFFO3dCQUNMLElBQUksb0JBQUUsQ0FBQzs0QkFDSCxNQUFNLEVBQUUscUJBQXFCO3lCQUNoQyxDQUFDO3dCQUNGLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQzs0QkFDbkIsUUFBUSxFQUFFLGdCQUFnQjt5QkFDN0IsQ0FBQztxQkFDTDtpQkFDSjthQUNKO1NBQ0osQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBeERELDhDQXdEQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Rm9sbG93TW9kZX0gZnJvbSAnQGF3cy1jZGsvYXNzZXRzJztcbmltcG9ydCB7QWNjb3VudFByaW5jaXBhbCwgUG9saWN5U3RhdGVtZW50fSBmcm9tICdAYXdzLWNkay9hd3MtaWFtJztcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdAYXdzLWNkay9hd3MtbGFtYmRhJztcbmltcG9ydCB7QnVja2V0QWNjZXNzQ29udHJvbH0gZnJvbSAnQGF3cy1jZGsvYXdzLXMzJztcbmltcG9ydCB7UmVjZWlwdFJ1bGVTZXR9IGZyb20gJ0Bhd3MtY2RrL2F3cy1zZXMnO1xuaW1wb3J0ICogYXMgc2VzX2FjdGlvbnMgZnJvbSAnQGF3cy1jZGsvYXdzLXNlcy1hY3Rpb25zJztcbmltcG9ydCB7UzN9IGZyb20gJ0Bhd3MtY2RrL2F3cy1zZXMtYWN0aW9ucyc7XG5pbXBvcnQge0NvbnN0cnVjdCwgU3RhY2t9IGZyb20gJ0Bhd3MtY2RrL2NvcmUnO1xuaW1wb3J0IHtBdXRvRGVsZXRlQnVja2V0fSBmcm9tICdAbW9iaWxlcG9zc2UvYXV0by1kZWxldGUtYnVja2V0JztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2VzRW1haWxGb3J3YXJkZXJQcm9wcyB7XG4gICAgZm9yd2FyZFRvRW1haWw6IHN0cmluZyxcbiAgICByZWNpcGllbnRzOiBzdHJpbmdbXSxcbn1cblxuZXhwb3J0IGNsYXNzIFNlc0VtYWlsRm9yd2FyZGVyIGV4dGVuZHMgQ29uc3RydWN0IHtcbiAgICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogU2VzRW1haWxGb3J3YXJkZXJQcm9wcykge1xuICAgICAgICBzdXBlcihzY29wZSwgaWQpO1xuICAgICAgICBjb25zdCBjb2RlID0gbGFtYmRhLkNvZGUuZnJvbUFzc2V0KHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdsYW1iZGEnKSwge1xuICAgICAgICAgICAgZm9sbG93OiBGb2xsb3dNb2RlLkFMV0FZUyxcbiAgICAgICAgfSk7XG4gICAgICAgIGNvZGUuYmluZChTdGFjay5vZih0aGlzKSk7XG4gICAgICAgIGNvbnN0IGJ1Y2tldEZvckluY29taW5nTWFpbCA9IG5ldyBBdXRvRGVsZXRlQnVja2V0KHRoaXMsICdpbmNvbWluZy1tYWlsJywge1xuICAgICAgICAgICAgYWNjZXNzQ29udHJvbDogQnVja2V0QWNjZXNzQ29udHJvbC5QUklWQVRFLFxuICAgICAgICB9KTtcbiAgICAgICAgYnVja2V0Rm9ySW5jb21pbmdNYWlsLmFkZFRvUmVzb3VyY2VQb2xpY3kobmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICBwcmluY2lwYWxzOiBbXG4gICAgICAgICAgICAgICAgbmV3IEFjY291bnRQcmluY2lwYWwoU3RhY2sub2YodGhpcykuYWNjb3VudCksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgYWN0aW9uczogW1wiKlwiXSxcbiAgICAgICAgICAgIHJlc291cmNlczogW1wiKlwiXVxuICAgICAgICB9KSlcbiAgICAgICAgY29uc3QgZm5FbWFpbEZvcndhcmRlciA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ2ZvcndhcmQtZW1haWwnLCB7XG4gICAgICAgICAgICBjb2RlLFxuICAgICAgICAgICAgaGFuZGxlcjogJ2ZvcndhcmQubGFtYmRhX2hhbmRsZXInLFxuICAgICAgICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfNyxcbiAgICAgICAgICAgIGluaXRpYWxQb2xpY3k6IFtcbiAgICAgICAgICAgICAgICBuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJzMzpHZXRPYmplY3RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic2VzOipcIixcblxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICByZXNvdXJjZXM6IFtcIipcIl0sXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgICAgICAgICBNYWlsUzNCdWNrZXQ6IGJ1Y2tldEZvckluY29taW5nTWFpbC5idWNrZXROYW1lLFxuICAgICAgICAgICAgICAgIE1haWxTM1ByZWZpeDogXCJcIixcbiAgICAgICAgICAgICAgICBNYWlsU2VuZGVyOiBwcm9wcy5mb3J3YXJkVG9FbWFpbCxcbiAgICAgICAgICAgICAgICBNYWlsUmVjaXBpZW50OiBwcm9wcy5mb3J3YXJkVG9FbWFpbCxcbiAgICAgICAgICAgICAgICBSZWdpb246IFN0YWNrLm9mKHRoaXMpLnJlZ2lvbixcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgbmV3IFJlY2VpcHRSdWxlU2V0KHRoaXMsICdyZWNlaXB0LXJ1bGUtc2V0Jywge1xuICAgICAgICAgICAgcnVsZXM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJlY2lwaWVudHM6IHByb3BzLnJlY2lwaWVudHMsXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBTMyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVja2V0OiBidWNrZXRGb3JJbmNvbWluZ01haWwsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBzZXNfYWN0aW9ucy5MYW1iZGEoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uOiBmbkVtYWlsRm9yd2FyZGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXVxuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=