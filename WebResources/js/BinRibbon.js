function UpdateFields(formContext) {
    if (formContext.data.entity._entityId.guid == null) return;

    var LoadID = formContext.data.entity._entityId.guid;

    var fetchXml = [
        "<fetch aggregate='true'>",
        "  <entity name='dia_bin'>",
        "    <attribute name='dia_gross' alias='SumGross' aggregate='sum' />",
        "    <attribute name='dia_tare' alias='SumTare' aggregate='sum' />",
        "    <attribute name='dia_net' alias='SumNet' aggregate='sum' />",
        "    <attribute name='dia_mog' alias='SumMog' aggregate='sum' />",
        "    <filter>",
        "      <condition attribute='dia_load' operator='eq' value='", LoadID, "'/>",
        "    </filter>",
        "  </entity>",
        "</fetch>",
    ].join("");

    var req = new XMLHttpRequest();
    req.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_bins?fetchXml=" + encodeURIComponent(fetchXml), false);
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

                        var sumgross = results.value[i]["SumGross"];
                        var sumtare = results.value[i]["SumTare"];
                        var sumnet = results.value[i]["SumNet"];
                        var summog = results.value[i]["SumMog"];

                        formContext.getAttribute("dia_totalgross").setValue(sumgross);
                        formContext.getAttribute("dia_totaltare").setValue(sumtare);
                        formContext.getAttribute("dia_totalnet").setValue(sumnet);
                        formContext.getAttribute("dia_totalmog").setValue(summog);
                    }
                }
            }

        }
    };
    req.send();
}
