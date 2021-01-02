const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
const tableName = "transactions-api";

exports.handler = async (event) => {
    let msg = "Bad request - Requested resource is not available";
    let response = {
        headers: {
            "Content-type": "application/json"  
        },
        statusCode: 400
    };
    let operation = null;
    const method = event.httpMethod;
    const path = event.path;
    
    console.log("Request received: " + JSON.stringify(event));
    
    try {
        if (method === "POST") {
            if (path === "/transaction") {
                operation = "saving transaction";
                const body = JSON.parse(event.body);
                console.log("POST transaction");
                
                if (!body || !body.payer || !body.product || !body.total || !body.receiver) {
                    msg = "Bad request - Required params are missing";
                    response.statusCode = 400;
                } else {
                    const saveParams = {
                        TableName: tableName,
                        Item: {
                            "id": {
                                S: Math.floor(Math.random() * 10000).toString()
                            },
                            "payer": {
                                S: body.payer
                            },
                            "receiver": {
                                S: body.receiver
                            },
                            "product": {
                                S: body.product
                            },
                            "total": {
                                N: body.total.toString()
                            }
                        }
                    };
                    
                    await dynamodb.putItem(saveParams).promise();
                    
                    response.body = JSON.stringify(saveParams.Item);
                    response.statusCode = 201;
                    
                    return response;
                }
            }
        } else if (method === "GET") {
            if (event.pathParameters && path.includes("/transaction")) {
                operation = "getting transaction by id";
                const transactionId = event.pathParameters.id;
                console.log("GET transaction by id");
                if (isNaN(transactionId)) {
                    msg = "Bad request - Transaction id is invalid";
                    response.statusCode = 400;
                } else {
                    const getItemParams = {
                        TableName: tableName,
                        Key: {
                            "id": {
                                S: transactionId
                            }
                        }
                    };
                    
                    const transaction = await dynamodb.getItem(getItemParams).promise();
                    
                    response.body = JSON.stringify(transaction.Item);
                    response.statusCode = 200;
                    
                    return response;
                }
            } else if (path === "/transaction") {
                operation = "getting list of transactions";
                console.log("GET list of transactions");
                
                const scanParams = {
                    TableName: tableName
                };
                
                const transactions = await dynamodb.scan(scanParams).promise();
                
                response.body = JSON.stringify(transactions.Items);
                response.statusCode = 200;
                
                return response;
            }
        }
        
    } catch (ex) {
        console.error(ex);
        msg = "System error while " + operation;
        response.statusCode = 500;
    }
    
    console.log(msg);
    response.body = msg;
    return response;
};
