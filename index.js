exports.handler = async (event) => {
    let msg = "Bad request - Requested resource is not available";
    let response = {
        statusCode: 400
    };
    let operation = null;
    const method = event.requestContext.http.method;
    const path = event.rawPath;
    
    console.log("Request received: " + JSON.stringify(event));
    
    try {
        if (method === "POST") {
            if (path === "/transactions-api/v1/transaction") {
                operation = "saving transaction";
                const body = JSON.parse(event.body);
                console.log("POST transaction");
                
                if (!body || !body.payer || !body.product || !body.total || !body.receiver) {
                    msg = "Bad request - Required params are missing";
                    response.statusCode = 400;
                } else {
                    // TODO - save the transaction to the DB
                    msg = "Successfully saved transaction";
                    response.statusCode = 201;
                }
            }
        } else if (method === "GET") {
            if (event.pathParameters && path.includes("/transactions-api/v1/transaction")) {
                operation = "getting transaction by id";
                const transactionId = event.pathParameters.id;
                console.log("GET transaction by id");
                if (isNaN(transactionId)) {
                    msg = "Bad request - Transaction id is invalid";
                    response.statusCode = 400;
                } else {
                    // TODO - get transaction by id from DB
                    msg = "Successfully sent transaction record by id";
                    response.statusCode = 200;
                }
            } else if (path === "/transactions-api/v1/transaction") {
                operation = "getting list of transactions";
                console.log("GET list of transactions");
                // TODO
                msg = "Successfully sent list of transactions";
                response.statusCode = 200;
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
