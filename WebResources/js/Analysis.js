function onLoad(executionContext) {
    var formContext = executionContext.getFormContext();
    formContext.getAttribute("dia_vessel").addOnChange(VesselOnChange);
    PopulateBatch(executionContext);
    formContext.getAttribute("dia_analysistemplate").addOnChange(PopulateFields);
    formContext.getAttribute("dia_vessel").addOnChange(PopulateBatch);
    var values = GetDestinationVessel(executionContext);
    formContext.getControl("dia_vessel").addPreSearch(function () {
        GetSourceVessel(executionContext, values);
    });

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


function GetDestinationVessel(executionContext) {
    var values = "";
    var formContext = executionContext.getFormContext();
    if (formContext.getAttribute("dia_job").getValue() == null) return;
    var JobId = formContext.getAttribute("dia_job").getValue()[0].id;

    var fetchXml = [
        "<fetch>",
        "  <entity name='dia_jobdestinationvessel'>",
        "    <attribute name='dia_vessel' />",
        "    <attribute name='dia_vesselname' />",
        "    <filter>",
        "      <condition attribute='dia_job' operator='eq' value='", JobId, "'/>",
        "    </filter>",
        "  </entity>",
        "</fetch>",
    ].join("");

    var reqJob = new XMLHttpRequest();
    reqJob.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_jobdestinationvessels?fetchXml=" + encodeURIComponent(fetchXml), false);
    reqJob.setRequestHeader("OData-MaxVersion", "4.0");
    reqJob.setRequestHeader("OData-Version", "4.0");
    reqJob.setRequestHeader("Accept", "application/json");
    reqJob.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
    reqJob.onreadystatechange = function () {
        if (this.readyState === 4) {
            reqJob.onreadystatechange = null;
            if (this.status === 200) {
                var results = JSON.parse(this.response);
                if (results.value != null) {
                    
                    if (results.value.length > 0) {
                        for (var i = 0; i < results.value.length; i++) {
                            var vesselid = results.value[i]["_dia_vessel_value"];
                            values += "<value>" + vesselid + "</value>"
                        }
                    }
                    if (values == "") values = "<value>00000000-0000-0000-0000-000000000000</value>";
                    var jobFilter = "<filter type='and'><condition attribute='dia_vesselid' operator='in'>" + values + "</condition></filter>";
                }
            }
        }
    };
    reqJob.send();

    return values;
}

function GetSourceVessel(executionContext, values) {

    var formContext = executionContext.getFormContext();
    if (formContext.getAttribute("dia_job").getValue() == null) return;
    var JobId = formContext.getAttribute("dia_job").getValue()[0].id;

    var fetchXml = [
        "<fetch top='50'>",
        "  <entity name='dia_jobsourcevessel'>",
        "    <attribute name='dia_vessel' />",
        "    <attribute name='dia_vesselname' />",
        "    <filter>",
        "      <condition attribute='dia_job' operator='eq' value='", JobId, "'/>",
        "    </filter>",
        "  </entity>",
        "</fetch>",
    ].join("");

    var reqJob = new XMLHttpRequest();
    reqJob.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_jobsourcevessels?fetchXml=" + encodeURIComponent(fetchXml), false);
    reqJob.setRequestHeader("OData-MaxVersion", "4.0");
    reqJob.setRequestHeader("OData-Version", "4.0");
    reqJob.setRequestHeader("Accept", "application/json");
    reqJob.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
    reqJob.onreadystatechange = function () {
        if (this.readyState === 4) {
            reqJob.onreadystatechange = null;
            if (this.status === 200) {
                var results = JSON.parse(this.response);
                if (results.value != null) {
                    if (results.value.length > 0) {
                        for (var i = 0; i < results.value.length; i++) {
                            var vesselid = results.value[i]["_dia_vessel_value"];
                            values += "<value>" + vesselid + "</value>"
                        }
                    }
                  
                }
            }
        }
    };
    reqJob.send();

    if (values == "") values = "<value>00000000-0000-0000-0000-000000000000</value>";
    var jobFilter = "<filter type='and'><condition attribute='dia_vesselid' operator='in'>" + values + "</condition></filter>";
    formContext.getControl("dia_vessel").addCustomFilter(jobFilter, "dia_vessel");

}

function PopulateBatch(executionContext) {

    var formContext = executionContext.getFormContext();
    if (formContext.getAttribute("dia_vessel").getValue() == null) return;

    var vesselId = formContext.getAttribute("dia_vessel").getValue()[0].id;
    var fetchXml = [
        "<fetch>",
        "  <entity name='dia_vessel'>",
        "    <attribute name='dia_batch' />",
        "    <attribute name='dia_batchname' />",
        "    <filter>",
        "      <condition attribute='dia_vesselid' operator='eq' value='", vesselId, "'/>",
        "    </filter>",
        "  </entity>",
        "</fetch>",
    ].join("");

    var reqVessel = new XMLHttpRequest();
    reqVessel.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_vessels?fetchXml=" + encodeURIComponent(fetchXml), false);
    reqVessel.setRequestHeader("OData-MaxVersion", "4.0");
    reqVessel.setRequestHeader("OData-Version", "4.0");
    reqVessel.setRequestHeader("Accept", "application/json");
    reqVessel.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    reqVessel.onreadystatechange = function () {
        if (this.readyState === 4) {
            reqVessel.onreadystatechange = null;
            if (this.status === 200) {
                var results = JSON.parse(this.response);
                if (results.value != null) {
                    for (var i = 0; i < results.value.length; i++) {

                        var batchId = results.value[i]["_dia_batch_value"];
                        var BatchName = GetNameBatch(formContext, batchId);

                        var lookupBatch = new Array();
                        lookupBatch[0] = new Object();
                        lookupBatch[0].id = batchId;
                        lookupBatch[0].name = BatchName;
                        lookupBatch[0].entityType = "dia_batch";

                        formContext.getAttribute("dia_batch").setValue(lookupBatch);
                    }
                
                }
            }

        }
    };
    reqVessel.send();
}

function GetNameBatch(formContext, batchId) {

    var batchName = "";

    var fetchXml = [
        "<fetch top='50'>",
        "  <entity name='dia_batch'>",
        "    <attribute name='dia_name' />",
        "    <filter>",
        "      <condition attribute='dia_batchid' operator='eq' value='", batchId, "'/>",
        "    </filter>",
        "  </entity>",
        "</fetch>",
    ].join("");

    var reqName = new XMLHttpRequest();
    reqName.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_batchs?fetchXml=" + encodeURIComponent(fetchXml), false);
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
                        batchName = results.value[i]["dia_name"];
                    }
                }
            }

        }
    };
    reqName.send();

    return batchName;

}

function VesselOnChange(executionContext) {

    var formContext = executionContext.getFormContext();
    formContext.getAttribute("dia_batch").setValue();

}
