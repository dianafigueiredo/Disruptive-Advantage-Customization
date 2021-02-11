function onLoad(executionContext) {
    var formContext = executionContext.getFormContext();
    jobSource(executionContext);
    formContext.getAttribute("dia_vessel").addOnChange(jobSource);
}
function jobSource(executionContext) {

    var formContext = executionContext.getFormContext();

    if (formContext.getAttribute("dia_vessel").getValue() != null && formContext.ui.getFormType() == 1) {

        var vesselId = formContext.getAttribute('dia_vessel').getValue()[0].id;

        var req = new XMLHttpRequest();
        req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v9.1/dia_vessels(" + vesselId.replace("{", "").replace("}", "").toLowerCase() + ")?$select=_dia_batch_value, dia_occupation, _dia_stage_value", false);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 200) {
                    var result = JSON.parse(this.response);
                    var _dia_batch_value = result["_dia_batch_value"];
                    var _dia_batch_value_formatted = result["_dia_batch_value@OData.Community.Display.V1.FormattedValue"];
                    var _dia_batch_value_lookuplogicalname = result["_dia_batch_value@Microsoft.Dynamics.CRM.lookuplogicalname"];

                    var _dia_stage_value = result["_dia_stage_value"];
                    var _dia_stage_value_formatted = result["_dia_stage_value@OData.Community.Display.V1.FormattedValue"];
                    var _dia_stage_value_lookuplogicalname = result["_dia_stage_value@Microsoft.Dynamics.CRM.lookuplogicalname"];

                    var occupation = result["dia_occupation"];

                    var lookupValue = new Array();
                    lookupValue[0] = new Object();
                    lookupValue[0].id = _dia_batch_value;
                    lookupValue[0].name = _dia_batch_value_formatted;
                    lookupValue[0].entityType = _dia_batch_value_lookuplogicalname;

                    var lookupValueStage = new Array();
                    lookupValueStage[0] = new Object();
                    lookupValueStage[0].id = _dia_stage_value;
                    lookupValueStage[0].name = _dia_stage_value_formatted;
                    lookupValueStage[0].entityType = _dia_stage_value_lookuplogicalname;

                    formContext.getAttribute("dia_stage").setValue(lookupValueStage);
                    formContext.getAttribute("dia_batch").setValue(lookupValue);
                    formContext.getAttribute("dia_quantity").setValue(occupation);

                } else {
                    Xrm.Utility.alertDialog(this.statusText);
                }
            }
        };
        req.send();
    }

}