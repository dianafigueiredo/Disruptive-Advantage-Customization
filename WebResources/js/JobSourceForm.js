function onLoad(executionContext){
    var formContext = executionContext.getFormContext();
    jobSource(executionContext);
    formContext.getAttribute("dia_vessel").addOnChange(jobSource);
    }
    function jobSource(executionContext){
    
        var formContext = executionContext.getFormContext();
    
        if(formContext.getAttribute("dia_vessel").getValue() != null){
    
            var vesselId = formContext.getAttribute('dia_vessel').getValue()[0].id;
            var fetchXml = [
                "<fetch top='1'>",
                "  <entity name='dia_vessel'>",
                "    <attribute name='dia_batch' />",
                "    <filter>",
                "      <condition attribute='dia_vesselid' operator='eq' value='", vesselId, "'/>",
                "    </filter>",
                "  </entity>",
                "</fetch>",
                    ].join("");
        
    var req = new XMLHttpRequest();
    req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v9.1/dia_vessels("+vesselId.replace("{", "").replace("}", "").toLowerCase()+")?$select=_dia_batch_value", true);
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
    req.onreadystatechange = function() {
        if (this.readyState === 4) {
            req.onreadystatechange = null;
            if (this.status === 200) {
                var result = JSON.parse(this.response);
                var _dia_batch_value = result["_dia_batch_value"];
                var _dia_batch_value_formatted = result["_dia_batch_value@OData.Community.Display.V1.FormattedValue"];
                var _dia_batch_value_lookuplogicalname = result["_dia_batch_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
                                        var lookupValue = new Array();
                                        lookupValue[0] = new Object();
                                        lookupValue[0].id = _dia_batch_value; 
                                        lookupValue[0].name = _dia_batch_value_formatted; 
                                        lookupValue[0].entityType = _dia_batch_value_lookuplogicalname; 
                                        formContext.getAttribute("dia_batch").setValue(lookupValue);
            } else {
                Xrm.Utility.alertDialog(this.statusText);
            }
        }
    };
    req.send();
        }
    
    }