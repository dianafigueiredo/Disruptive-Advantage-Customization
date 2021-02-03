function onLoadJobDestinationRibbon(executionContext) {
    var formContext = executionContext.getFormContext();
    VerifyRemainingCapacity(formContext);
    formContext.getAttribute("dia_quantity").addOnChange(quantityOnChange);
    //formContext.getAttribute("dia_vessel").addOnChange(vesselOnChange);
    formContext.getAttribute("dia_vessel").addOnChange(PopulateFields);
}

function vesselOnChange(executionContext) {
    var formContext = executionContext.getFormContext();
    if (formContext.getAttribute("dia_vessel").getValue() != null) {
        var formContext = executionContext.getFormContext();
        if (formContext.getAttribute("dia_vessel").getValue() != null) {
            var vesselId = formContext.getAttribute("dia_vessel").getValue()[0].id;
            var capacity = 99999;
            var fetchXml = [
                "<fetch>",
                "  <entity name='dia_vessel'>",
                "    <attribute name='dia_capacity' />",
                "    <filter>",
                "      <condition attribute='dia_vesselid' operator='eq' value='", vesselId, "'/>",
                "    </filter>",
                "  </entity>",
                "</fetch>",
            ].join("");
            var req = new XMLHttpRequest();
            req.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_vessels?fetchXml=" + encodeURIComponent(fetchXml), false);
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
                            if (results.value.length > 0) {
                                capacity = results.value[0]["dia_capacity"];
                            }
                        }

                    }
                }
            };
            req.send();
        }
    }
}
function quantityOnChange(executionContext) {
    var formContext = executionContext.getFormContext();
    if (formContext.getAttribute("dia_vessel").getValue() != null) {
        var vesselId = formContext.getAttribute("dia_vessel").getValue()[0].id;
        var capacity = 99999;
        var fetchXml = [
            "<fetch>",
            "  <entity name='dia_vessel'>",
            "    <attribute name='dia_capacity' />",
            "    <filter>",
            "      <condition attribute='dia_vesselid' operator='eq' value='", vesselId, "'/>",
            "    </filter>",
            "  </entity>",
            "</fetch>",
        ].join("");
        var req = new XMLHttpRequest();
        req.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_vessels?fetchXml=" + encodeURIComponent(fetchXml), false);
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
                        if (results.value.length > 0) {
                            capacity = results.value[0]["dia_capacity"];
                        }
                    }

                }
            }
        };
        req.send();
        if (capacity < formContext.getAttribute("dia_quantity").getValue()) {
            formContext.getControl("dia_quantity").setNotification('Invalid value. Value must be lower than ' + capacity);
        }
        else {
            formContext.getControl("dia_quantity").clearNotification();
        }
    }
    VerifyRemainingCapacity(formContext);
}

function VerifyRemainingCapacity(formContext) {
    if (formContext.getAttribute("dia_job").getValue() != null) {
        var jobId = formContext.getAttribute("dia_job").getValue()[0].id;
        var allocatedCapacity = 0;
        var jobCapacity = 0;
        var fetchXml = [
            "<fetch>",
            "  <entity name='dia_jobdestinationvessel'>",
            "    <attribute name='dia_jobdestinationvesselid' />",
            "    <attribute name='dia_quantity' />",
            "    <filter>",
            "      <condition attribute='dia_job' operator='eq' value='", jobId, "'/>",
            "    </filter>",
            "    <link-entity name='dia_job' from='dia_jobid' to='dia_job'>",
            "      <attribute name='dia_quantity' />",
            "    </link-entity>",
            "  </entity>",
            "</fetch>",
        ].join("");
        var req = new XMLHttpRequest();
        req.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_jobdestinationvessels?fetchXml=" + encodeURIComponent(fetchXml), false);
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
                        if (results.value.length > 0) {
                            jobCapacity = results.value[0]["dia_job1.dia_quantity"];
                            var currentJobDestinationId = formContext.data.entity.getId();
                            for (var i = 0; i < results.value.length; i++) {
                                if (results.value[i]["dia_jobdestinationvesselid"] != currentJobDestinationId.toLower().replace('{', '').replace('}', '')) {
                                    allocatedCapacity += results.value[i]["dia_quantity"];
                                }
                            }
                            if (formContext.getAttribute("dia_quantity").getValue() != null) {
                                var sourceVesselQuantity = formContext.getAttribute("dia_quantity").getValue();
                                if (sourceVesselQuantity + allocatedCapacity > jobCapacity) {
                                    formContext.getControl("dia_quantity").setNotification('Invalid value. Not enough quantity. Quantity Left: ' + (jobCapacity - allocatedCapacity), "1");
                                }
                                else {
                                    formContext.getControl("dia_quantity").clearNotification("1");
                                }
                            }
                        }
                    }

                }
            }
        };
        req.send();
    }
}
function PopulateFields(executionContext) {
    var formContext = executionContext.getFormContext();
    if (formContext.getAttribute("dia_job").getValue() == null) return; 
    var jobId = formContext.getAttribute("dia_job").getValue()[0].id;
    var jobtype = 0;

    var fetchXml = [
        "<fetch>",
        "  <entity name='dia_job'>",
        "    <attribute name='dia_type' />",
        "    <filter>",
        "      <condition attribute='dia_jobid' operator='eq' value='", jobId, "'/>",
        "    </filter>",
        "  </entity>",
        "</fetch>",
    ].join("");

    var reqDest = new XMLHttpRequest();
    reqDest.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_jobs?fetchXml=" + encodeURIComponent(fetchXml), false);
    reqDest.setRequestHeader("OData-MaxVersion", "4.0");
    reqDest.setRequestHeader("OData-Version", "4.0");
    reqDest.setRequestHeader("Accept", "application/json");
    reqDest.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    reqDest.onreadystatechange = function () {
        if (this.readyState === 4) {
            reqDest.onreadystatechange = null;
            if (this.status === 200) {
                var results = JSON.parse(this.response);
                if (results.value != null) {
                    for (var i = 0; i < results.value.length; i++) {
                        jobtype = results.value[i]["dia_type"];
                    }
                }
            }

        }
    };
    reqDest.send();

    if (jobtype == 914440000) {

        if (formContext.getAttribute("dia_vessel").getValue() == null) return;

        var vesselId = formContext.getAttribute("dia_vessel").getValue()[0].id;

        var fetchXmlVessel = [
            "<fetch>",
            "  <entity name='dia_vessel'>",
            "    <attribute name='dia_occupation' />",
            "    <attribute name='dia_batch' />",
            "    <attribute name='dia_batchname' />",
            "    <attribute name='dia_stage' />",
            "    <filter>",
            "      <condition attribute='dia_vesselid' operator='eq' value='", vesselId, "'/>",
            "    </filter>",
            "  </entity>",
            "</fetch>",
        ].join("");

        var reqVessel = new XMLHttpRequest();
        reqVessel.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_vessels?fetchXml=" + encodeURIComponent(fetchXmlVessel), false);
        reqVessel.setRequestHeader("OData-MaxVersion", "4.0");
        reqVessel.setRequestHeader("OData-Version", "4.0");
        reqVessel.setRequestHeader("Accept", "application/json");
        reqVessel.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        reqVessel.onreadystatechange = function () {
            if (this.readyState === 4) {
                reqDest.onreadystatechange = null;
                if (this.status === 200) {
                    var results = JSON.parse(this.response);
                    if (results.value != null) {
                        for (var i = 0; i < results.value.length; i++) {
                            var occupation = results.value[i]["dia_occupation"];
                            var batchId = results.value[i]["_dia_batch_value"];
                            var stageId = results.value[i]["_dia_stage_value"];

                            var lookupBatch = new Array();
                            lookupBatch[0] = new Object();
                            lookupBatch[0].id = batchId;
                            //lookupBatch[0].name = "Custom Team";
                            lookupBatch[0].entityType = "dia_batch";

                            var lookupStage = new Array();
                            lookupStage[0] = new Object();
                            lookupStage[0].id = stageId;
                            //lookupBatch[0].name = "Custom Team";
                            lookupStage[0].entityType = "dia_stage";

                            formContext.getAttribute("dia_batch").setValue(occupation);
                            formContext.getAttribute("dia_batch").setValue(lookupBatch);
                            formContext.getAttribute("dia_stage").setValue(lookupStage);
                        }
                    }
                }

            }
        };
        reqVessel.send();
    }

}

function OpenForm(formContext) {

    var batch = formContext.getAttribute("dia_batch").getValue();

    var RecordId = formContext.data.entity.getEntityReference();
    var jobName = formContext.getAttribute("dia_name").getValue();
    var entityFormOptions = {};
    entityFormOptions["entityName"] = "dia_jobdestinationvessel";
    var entityName = formContext.data.entity.getEntityName();

    // Set default values for the Contact form
    var formParameters = {};
    formParameters["dia_batch"] = batch;
    formParameters["dia_jobname"] = jobName;

    if (entityName == "dia_vessel") {
        var quantity = formContext.getAttribute("dia_occupation").getValue();


        formParameters["dia_vessel"] = RecordId;
    }
    else if (entityName == "dia_job") {
        var quantity = formContext.getAttribute("dia_quantity").getValue();
        formParameters["dia_job"] = RecordId;
    }

    formParameters["dia_quantity"] = quantity;

    // Open the form.
    Xrm.Navigation.openForm(entityFormOptions, formParameters).then(
        function (success) {
            console.log(success);
        },
        function (error) {
            console.log(error);
        });
    /*var batch = formContext.getAttribute("dia_batch").getValue();
    var quantity = formContext.getAttribute("dia_quantity").getValue();
    var jobId = formContext.data.entity.getId();
    var jobName = formContext.getAttribute("dia_name").getValue();
    var entityFormOptions = {};
    entityFormOptions["entityName"] = "dia_jobdestinationvessel";

    // Set default values for the Contact form
    var formParameters = {};
    formParameters["dia_batch"] = batch;
    formParameters["dia_quantity"] = quantity;
    formParameters["dia_job"] = jobId;
    formParameters["dia_jobname"] = jobName;

    // Open the form.
    Xrm.Navigation.openForm(entityFormOptions, formParameters).then(
        function (success) {
            console.log(success);
        },
        function (error) {
            console.log(error);
        });*/
}