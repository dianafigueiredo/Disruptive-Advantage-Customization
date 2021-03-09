function onLoad(executionContext) {
    var formContext = executionContext.getFormContext();

    
    formContext.getControl("dia_storage").addPreSearch(function () {
        GetAdditiveStock(executionContext);
    });
    formContext.getAttribute("dia_location").addOnChange(LocationOnChange);
}


function GetAdditiveStock(executionContext) {
    var values = "";
    var formContext = executionContext.getFormContext();
    if (formContext.getAttribute("dia_location").getValue() == null) return;
    var LocationId = formContext.getAttribute("dia_location").getValue()[0].id;

    var fetchXml = [
        "<fetch>",
        "  <entity name='dia_storage'>",
        "    <attribute name='dia_name' />",
        "    <filter>",
        "      <condition attribute='dia_locations' operator='eq' value='", LocationId , "'/>",
        "    </filter>",
        "  </entity>",
        "</fetch>",
    ].join("");

    var reqStorages = new XMLHttpRequest();
    reqStorages.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_storages?fetchXml=" + encodeURIComponent(fetchXml), false);
    reqStorages.setRequestHeader("OData-MaxVersion", "4.0");
    reqStorages.setRequestHeader("OData-Version", "4.0");
    reqStorages.setRequestHeader("Accept", "application/json");
    reqStorages.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
    reqStorages.onreadystatechange = function () {
        if (this.readyState === 4) {
            reqStorages.onreadystatechange = null;
            if (this.status === 200) {
                var results = JSON.parse(this.response);
                if (results.value != null) {
                    if (results.value.length > 0) {
                        for (var i = 0; i < results.value.length; i++) {
                            var storageid = results.value[i]["dia_storageid"];
                            values += "<value>" + storageid + "</value>"
                        }
                    }

                }
            }
        }
    };
    reqStorages.send();

    if (values == "") values = "<value>00000000-0000-0000-0000-000000000000</value>";
    var locationFilter = "<filter type='and'><condition attribute='dia_storageid' operator='in'>" + values + "</condition></filter>";
    formContext.getControl("dia_storage").addCustomFilter(locationFilter, "dia_storage");
    return values;

   

}

function LocationOnChange(executionContext) {

    var formContext = executionContext.getFormContext();
    formContext.getAttribute("dia_storage").setValue();

}

