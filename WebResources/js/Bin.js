function onload(executionContext) {
    var formContext = executionContext.getFormContext();
    CalculateFields(executionContext);
    formContext.getAttribute("dia_bintype").addOnChange(CalculateFields);
    formContext.getAttribute("dia_gross").addOnChange(CalculateFields);
    formContext.getAttribute("dia_binquantity").addOnChange(CalculateFields);
    formContext.getAttribute("dia_mog").addOnChange(CalculateFields);
}

function CalculateFields(executionContext) {

    var formContext = executionContext.getFormContext();

    var type = formContext.getAttribute("dia_bintype").getValue();

    if (type == null) return;



    var fetchXml = [
        "<fetch>",
        "  <entity name='dia_bintypes'>",
        "    <attribute name='dia_binweight' />",
        "    <filter>",
        "      <condition attribute='dia_bintypesid' operator='eq' value='", type[0].id.replace("{", "").replace("}", ""), "'/>",
        "    </filter>",
        "  </entity>",
        "</fetch>",
    ].join("");

    var req = new XMLHttpRequest();
    req.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_bintypeses?fetchXml=" + encodeURIComponent(fetchXml), false);
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            req.onreadystatechange = null;
            if (this.status === 200) {
                var results = JSON.parse(this.response);
                if (results.value != null) {
                    for (var i = 0; i < results.value.length; i++) {

                        var weight = results.value[i]["dia_binweight"];
                        var Quantity = formContext.getAttribute("dia_binquantity").getValue();
                        var Gross = formContext.getAttribute("dia_gross").getValue();
                        var Tare = formContext.getAttribute("dia_tare").getValue();
                        var MOG = formContext.getAttribute("dia_mog").getValue();

                        var TotalTare = Gross - (weight * Quantity);
                        var TotalNETFinal = Gross - (Tare + MOG);

                        formContext.getAttribute("dia_gross").setValue(Gross);
                        formContext.getAttribute("dia_tare").setValue(TotalTare);
                        formContext.getAttribute("dia_net").setValue(TotalNETFinal);
                        formContext.getAttribute("dia_mog").setValue(MOG);

                    }
                }

            }
        }
    };
    req.send();
}