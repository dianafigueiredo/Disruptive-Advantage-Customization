function onLoad(executionContext) {
    var formContext = executionContext.getFormContext();
    formContext.getAttribute("dia_analysistemplate").addOnChange(PopulateFields);

}

function PopulateFields(executionContext) {
    var formContext = executionContext.getFormContext();

    if (formContext.getAttribute("dia_analysistemplate").getValue() == null) return;

    var analysisID = formContext.getAttribute("dia_analysistemplate").getValue()[0].id;

    var fetchXml = [
        "<fetch>",
        "  <entity name='dia_analysistemplate'>",
        "    <attribute name='dia_laboratory' />",
        "    <attribute name='dia_instruction' />",
        "    <attribute name='dia_laboratoryname' />",
        "    <filter>",
        "      <condition attribute='dia_analysistemplateid' operator='eq' value='", analysisID, "'/>",
        "    </filter>",
        "  </entity>",
        "</fetch>",
    ].join("");

    var reqAnalysis = new XMLHttpRequest();
    reqAnalysis.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_analysistemplates?fetchXml=" + encodeURIComponent(fetchXml), false);
    reqAnalysis.setRequestHeader("OData-MaxVersion", "4.0");
    reqAnalysis.setRequestHeader("OData-Version", "4.0");
    reqAnalysis.setRequestHeader("Accept", "application/json");
    reqAnalysis.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    reqAnalysis.onreadystatechange = function () {
        if (this.readyState === 4) {
            reqAnalysis.onreadystatechange = null;
            if (this.status === 200) {
                var results = JSON.parse(this.response);
                if (results.value != null) {
                    for (var i = 0; i < results.value.length; i++) {
                        var instruction = results.value[i]["dia_instruction"];
                        var laboratoryId = results.value[i]["_dia_laboratory_value"];

                        var LaboratoryName = GetLaboratoryName(formContext, laboratoryId);


                        var lookupLaboratories = new Array();
                        lookupLaboratories[0] = new Object();
                        lookupLaboratories[0].id = laboratoryId;
                        lookupLaboratories[0].name = LaboratoryName;
                        lookupLaboratories[0].entityType = "dia_laboratory";

                        formContext.getAttribute("dia_instruction").setValue(instruction);
                        formContext.getAttribute("dia_laboratory").setValue(lookupLaboratories);



                    }
                }
            }

        }
    };
    reqAnalysis.send();
}

function GetLaboratoryName(executionContext, laboratoryId) {
    var LaboratoryName = "";

    var fetchXml = [
        "<fetch top='50'>",
        "  <entity name='dia_laboratory'>",
        "    <attribute name='dia_name' />",
        "    <filter>",
        "      <condition attribute='dia_laboratoryid' operator='eq' value='", laboratoryId, "'/>",
        "    </filter>",
        "  </entity>",
        "</fetch>",
    ].join("");

    var reqName = new XMLHttpRequest();
    reqName.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_laboratories?fetchXml=" + encodeURIComponent(fetchXml), false);
    reqName.setRequestHeader("OData-MaxVersion", "4.0");
    reqName.setRequestHeader("OData-Version", "4.0");
    reqName.setRequestHeader("Accept", "application/json");
    reqName.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    reqName.onreadystatechange = function () {
        if (this.readyState === 4) {
            reqName.onreadystatechange = null;
            if (this.status === 200) {
                var results = JSON.parse(this.response);
                if (results.value != null) {
                    for (var i = 0; i < results.value.length; i++) {
                        LaboratoryName = results.value[i]["dia_name"];
                    }
                }
            }

        }
    };
    reqName.send();

    return LaboratoryName;
}

