import { ProxyIntegrationEvent } from 'aws-lambda-router/lib/proxyIntegration';
import { Context } from 'aws-lambda';
import { handler } from './src/index';

const transactionChargeCard = {
    data: 12344182,
};

const transactionCVUToComplete = {
    id: '33821803',
};

const transactionCVUToCompleteList = {
    list: [
        '33895783',
        '33752589',
        '33788239',
        '33879275',
        '33871444',
        '33914859',
        '33768775',
        '33818922',
        '33873110',
    ],
};

const transactionCVUToCompleteEvent: ProxyIntegrationEvent = {
    body: JSON.stringify(transactionCVUToComplete),
    headers: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    path: '/transaction/cvu/complete',
    pathParameters: {},
    multiValueQueryStringParameters: {},
    queryStringParameters: {},
    multiValueHeaders: {},
    requestContext: {} as any,
    resource: '',
    stageVariables: {},
};

const transactionCVUToCompleteGetListEvent: ProxyIntegrationEvent = {
    body: JSON.stringify({}),
    headers: {},
    httpMethod: 'GET',
    isBase64Encoded: false,
    path: '/transaction/cvu',
    pathParameters: {},
    multiValueQueryStringParameters: {},
    queryStringParameters: {},
    multiValueHeaders: {},
    requestContext: {} as any,
    resource: '',
    stageVariables: {},
};

const transactionCVUToCompleteListEvent: ProxyIntegrationEvent = {
    body: JSON.stringify(transactionCVUToCompleteList),
    headers: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    path: '/transaction/cvu/complete/list',
    pathParameters: {},
    multiValueQueryStringParameters: {},
    queryStringParameters: {},
    multiValueHeaders: {},
    requestContext: {} as any,
    resource: '',
    stageVariables: {},
};

const transactionCVUToCompleteListCronEvent: ProxyIntegrationEvent = {
    body: JSON.stringify({}),
    headers: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    path: '/transaction/cvu/complete/list/cron',
    pathParameters: {},
    multiValueQueryStringParameters: {},
    queryStringParameters: {},
    multiValueHeaders: {},
    requestContext: {} as any,
    resource: '',
    stageVariables: {},
};

const transactionChargeCardEvent: ProxyIntegrationEvent = {
    body: JSON.stringify(transactionChargeCard),
    headers: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    path: '/transaction/charge/card',
    pathParameters: {},
    multiValueQueryStringParameters: {},
    queryStringParameters: {},
    multiValueHeaders: {},
    requestContext: {} as any,
    resource: '',
    stageVariables: {},
};

const transactionChargeCardListCronEvent: ProxyIntegrationEvent = {
    body: JSON.stringify({
        page: 1,
        limit: 10,
    }),
    headers: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    path: '/transaction/charge/card/list/cron',
    pathParameters: {},
    multiValueQueryStringParameters: {},
    queryStringParameters: {},
    multiValueHeaders: {},
    requestContext: {} as any,
    resource: '',
    stageVariables: {},
};

const transactionChargeCardListEvent: ProxyIntegrationEvent = {
    body: JSON.stringify({}),
    headers: {},
    httpMethod: 'GET',
    isBase64Encoded: false,
    path: '/transaction/charge/card/list',
    pathParameters: {},
    multiValueQueryStringParameters: {},
    queryStringParameters: {},
    multiValueHeaders: {},
    requestContext: {} as any,
    resource: '',
    stageVariables: {},
};

const transactionAvailableOnChangeEvent: ProxyIntegrationEvent = {
    body: JSON.stringify({
        transactionId: '13613043',
        date: '2023-06-08',
    }),
    headers: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    path: '/transaction/available-on/change',
    pathParameters: {},
    multiValueQueryStringParameters: {},
    queryStringParameters: {},
    multiValueHeaders: {},
    requestContext: {} as any,
    resource: '',
    stageVariables: {},
};

const transactionAvailableOnChangeListCountEvent: ProxyIntegrationEvent = {
    body: JSON.stringify({}),
    headers: {},
    httpMethod: 'GET',
    isBase64Encoded: false,
    path: '/transaction/available-on/list',
    pathParameters: {},
    multiValueQueryStringParameters: {},
    queryStringParameters: {},
    multiValueHeaders: {},
    requestContext: {} as any,
    resource: '',
    stageVariables: {},
};

const transactionExecutePaymentEvent: ProxyIntegrationEvent = {
    body: JSON.stringify({
        data: '12979985',
    }),
    headers: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    path: '/transaction/payment/execute',
    pathParameters: {},
    multiValueQueryStringParameters: {},
    queryStringParameters: {},
    multiValueHeaders: {},
    requestContext: {} as any,
    resource: '',
    stageVariables: {},
};

const transactionExecutePaymentListEvent: ProxyIntegrationEvent = {
    body: JSON.stringify({
        page: 0,
        limit: 100,
    }),
    headers: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    path: '/transaction/payment/execute/list',
    pathParameters: {},
    multiValueQueryStringParameters: {},
    queryStringParameters: {},
    multiValueHeaders: {},
    requestContext: {} as any,
    resource: '',
    stageVariables: {},
};

const transactionExecutePaymentCountEvent: ProxyIntegrationEvent = {
    body: JSON.stringify({}),
    headers: {},
    httpMethod: 'GET',
    isBase64Encoded: false,
    path: '/transaction/payment/execute/count',
    pathParameters: {},
    multiValueQueryStringParameters: {},
    queryStringParameters: {},
    multiValueHeaders: {},
    requestContext: {} as any,
    resource: '',
    stageVariables: {},
};

const transactionExecutePaymentCronEvent: ProxyIntegrationEvent = {
    body: JSON.stringify({
        page: 0,
        limit: 100,
    }),
    headers: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    path: '/transaction/payment/execute/cron',
    pathParameters: {},
    multiValueQueryStringParameters: {},
    queryStringParameters: {},
    multiValueHeaders: {},
    requestContext: {} as any,
    resource: '',
    stageVariables: {},
};

const context: Context = {
    awsRequestId: 'some-request-id',
    callbackWaitsForEmptyEventLoop: true,
    functionName: 'my-function-name',
    functionVersion: 'my-function-version',
    invokedFunctionArn: 'my-function-arn',
    logGroupName: 'my-log-group-name',
    logStreamName: 'my-log-stream-name',
    memoryLimitInMB: '128',
    getRemainingTimeInMillis: () => 1000,
    done: () => {
        return;
    },
    fail: () => {
        return;
    },
    succeed: () => {
        return;
    },
};

handler(transactionExecutePaymentEvent, context)
    .then((response) => {
        console.log(response);
    })
    .catch((error) => {
        console.error(error);
    });
