export function evaluateRule(requestContext, rules){
    for(const rule of rules){
        if(!rule.enabled){
            continue;
        }

        switch(rule.type){
            case 'BLOCK_IP':
                if(requestContext.ip === rule.value){
                    return { blocked: true, reason: `Blocked IP: ${rule.value} by Firewall` };
                }
                break;
            case 'BLOCK_METHOD':
                if(requestContext.method === rule.value){
                    return { blocked: true, reason: `Blocked Method: ${rule.value} by Firewall` };
                }    
                break;
            case 'BLOCK_ROUTE':
                if(requestContext.path.startsWith(rule.value)){
                    return { blocked: true, reason: `Blocked Route: ${rule.value} by Firewall` };
                }
                break;
            default:
                break;    
        }
    }
    return { blocked: false };
}