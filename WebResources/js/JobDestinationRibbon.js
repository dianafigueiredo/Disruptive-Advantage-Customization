function onLoadJobDestinationRibbon(executionContext) {
    var formContext = executionContext.getFormContext();
    VerifyRemainingCapacity(formContext);
    PopulateFields(executionContext);
    formContext.getAttribute("dia_quantity").addOnChange(quantityOnChange);
    //formContext.getAttribute("dia_vessel").addOnChange(vesselOnChange);
    formContext.getAttribute("dia_vessel").addOnChange(PopulateFields);
    formContext.getAttribute("dia_postvolume").addOnChange(PopulateFields);
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
function UpdatePostVolume(formContext) {
    var quantity = formContext.getAttribute("dia_quantity").getValue();
    formContext.getAttribute("dia_postvolume").setValue(quantity);

}
function quantityOnChange(executionContext) {
    var formContext = executionContext.getFormContext();
    UpdatePostVolume(formContext);
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

function VerifyRemainingCapacity(formContext)
{
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
    var scheduledStart = new Date();
    var fetchXml = [
        "<fetch>",
        "  <entity name='dia_job'>",
        "    <attribute name='dia_type' />",
        "    <attribute name='dia_schelduledstart' />",
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
                        scheduledStart = results.value[i]["dia_schelduledstart"];
                    }
                }
            }

        }
    };
    reqDest.send();

    if (jobtype == 914440000 ) { //In-Situ

        if (formContext.getAttribute("dia_vessel").getValue() == null) return;

        var vesselId = formContext.getAttribute("dia_vessel").getValue()[0].id;

        var fetchXml = [
            "<fetch top='1'>",
            "  <entity name='dia_jobdestinationvessel'>",
            "    <attribute name='dia_vessel' />",
            "    <attribute name='dia_quantity' />",
            "    <attribute name='dia_batch' />",
            "    <attribute name='dia_stage' />",
            "    <filter>",
            "      <condition attribute='dia_vessel' operator='eq' value='", vesselId, "'/>",
            "      <condition attribute='statecode' operator='eq' value='", 0, "'/>",
            "    </filter>",
            "    <link-entity name='dia_job' from='dia_jobid' to='dia_job'>",
            "      <attribute name='dia_type' />",
            "      <filter type='or'>",
            //"        <condition attribute='dia_type' operator='eq' value='", 914440003, "'/>",
            "        <condition attribute='dia_type' operator='eq' value='", 914440002, "'/>",
            "      </filter>",
            "      <filter type='and'>",
            "        <condition attribute='dia_schelduledstart' operator='le' value='", scheduledStart, "'/>",
            "      </filter>",
            "    </link-entity>",
            "  </entity>",
            "</fetch>",
        ].join("");

        var reqVessel = new XMLHttpRequest();
        reqVessel.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_jobdestinationvessels?fetchXml=" + encodeURIComponent(fetchXml), false);
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
                            var occupation = results.value[i]["dia_quantity"];
                            var batchId = results.value[i]["_dia_batch_value"];
                            var stageId = results.value[i]["_dia_stage_value"];
                            var BatchName = GetNameBatch(formContext,batchId);
                            var StageName = GetNameStage(formContext,stageId);


                            var lookupBatch = new Array();
                            lookupBatch[0] = new Object();
                            lookupBatch[0].id = batchId;
                            lookupBatch[0].name = BatchName;
                            lookupBatch[0].entityType = "dia_batch";

                            var lookupStage = new Array();
                            lookupStage[0] = new Object();
                            lookupStage[0].id = stageId;
                            lookupStage[0].name = StageName;
                            lookupStage[0].entityType = "dia_stage";

                            formContext.getAttribute("dia_quantity").setValue(occupation);
                            formContext.getAttribute("dia_batch").setValue(lookupBatch);
                            formContext.getAttribute("dia_stage").setValue(lookupStage);
                        }
                    }
                }

            }
        };
        reqVessel.send();
    }
    if (jobtype == 914440001) //Transfer
    {

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
                reqVessel.onreadystatechange = null;
                if (this.status === 200) {
                    var results = JSON.parse(this.response);
                    if (results.value != null) {
                        for (var i = 0; i < results.value.length; i++) {
                            var occupation = results.value[i]["dia_occupation"];
                            if (occupation == null) occupation = 0;
                            var prevolume = formContext.getAttribute("dia_prevolume").getValue();
                            var quantity = formContext.getAttribute("dia_quantity").getValue();
                            var sum = 0;
                            sum = Number(quantity) + Number(occupation);
                            formContext.getAttribute("dia_prevolume").setValue(occupation);
                            //formContext.getAttribute("dia_quantity").setValue(quantity);
                            formContext.getAttribute("dia_postvolume").setValue(sum);

                            var batchId = results.value[i]["_dia_batch_value"];
                            var stageId = results.value[i]["_dia_stage_value"];

                            /*var BatchName = GetNameBatch(formContext, batchId);
                            var StageName = GetNameStage(formContext, stageId);

                            var lookupBatch = new Array();
                            lookupBatch[0] = new Object();
                            lookupBatch[0].id = batchId;
                            lookupBatch[0].name = BatchName;
                            lookupBatch[0].entityType = "dia_batch";

                            var lookupStage = new Array();
                            lookupStage[0] = new Object();
                            lookupStage[0].id = stageId;
                            lookupStage[0].name = StageName;
                            lookupStage[0].entityType = "dia_stage";

                            formContext.getAttribute("dia_batch").setValue(lookupBatch);
                            formContext.getAttribute("dia_stage").setValue(lookupStage);
                            */
                        }
                    }
                }

            }
        };
        reqVessel.send();

        if (formContext.getAttribute("dia_job").getValue() == null) return;

        var jobId = formContext.getAttribute("dia_job").getValue()[0].id;

        var fetchXmlJobSource = [
            "<fetch top='50'>",
            "  <entity name='dia_job'>",
            "    <attribute name='dia_jobid' />",
            "    <filter>",
            "      <condition attribute='dia_jobid' operator='eq' value='", jobId, "'/>",
            "    </filter>",
            "    <link-entity name='dia_jobsourcevessel' from='dia_job' to='dia_jobid'>",
            "      <attribute name='dia_jobsourcevesselid' />",
            "      <attribute name='dia_batch' />",
            "      <attribute name='dia_stage' />",
            "    </link-entity>",
            "  </entity>",
            "</fetch>",
        ].join("");
        var reqJob = new XMLHttpRequest();
        reqJob.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_jobs?fetchXml=" + encodeURIComponent(fetchXmlJobSource), false);
        reqJob.setRequestHeader("OData-MaxVersion", "4.0");
        reqJob.setRequestHeader("OData-Version", "4.0");
        reqJob.setRequestHeader("Accept", "application/json");
        reqJob.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        reqJob.onreadystatechange = function () {
            if (this.readyState === 4) {
                reqJob.onreadystatechange = null;
                if (this.status === 200) {
                    var results = JSON.parse(this.response);
                    if (results.value != null) {
                        for (var i = 0; i < results.value.length; i++) {

                            var batchId = results.value[i]["dia_jobsourcevessel1.dia_batch"];
                            var stageId = results.value[i]["dia_jobsourcevessel1.dia_stage"];

                            var BatchName = GetNameBatch(formContext, batchId);
                            var StageName = GetNameStage(formContext, stageId);

                            var lookupBatch = new Array();
                            lookupBatch[0] = new Object();
                            lookupBatch[0].id = batchId;
                            lookupBatch[0].name = BatchName;
                            lookupBatch[0].entityType = "dia_batch";

                            var lookupStage = new Array();
                            lookupStage[0] = new Object();
                            lookupStage[0].id = stageId;
                            lookupStage[0].name = StageName;
                            lookupStage[0].entityType = "dia_stage";

                            formContext.getAttribute("dia_batch").setValue(lookupBatch);
                            formContext.getAttribute("dia_stage").setValue(lookupStage);
                            
                        }
                    }
                }

            }
        };
        reqJob.send();

    }

    if (jobtype == 914440002) //Intake 
    {
        if (formContext.getAttribute("dia_job").getValue() == null) return;
        
        var JobId = formContext.getAttribute("dia_job").getValue()[0].id;


        var fetchXmlJob = [
            "<fetch>",
            "  <entity name='dia_job'>",
            "    <attribute name='dia_quantity' />",
            "    <filter>",
            "      <condition attribute='dia_jobid' operator='eq' value='", JobId, "'/>",
            "    </filter>",
            "  </entity>",
            "</fetch>",
        ].join("");

      

        var reqjob = new XMLHttpRequest();
        reqjob.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_jobs?fetchXml=" + encodeURIComponent(fetchXmlJob), false);
        reqjob.setRequestHeader("OData-MaxVersion", "4.0");
        reqjob.setRequestHeader("OData-Version", "4.0");
        reqjob.setRequestHeader("Accept", "application/json");
        reqjob.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        reqjob.onreadystatechange = function () {
            if (this.readyState === 4) {
                reqjob.onreadystatechange = null;
                if (this.status === 200) {
                    var results = JSON.parse(this.response);
                    if (results.value != null) {
                        for (var i = 0; i < results.value.length; i++) {
                            var quantityjob = results.value[i]["dia_quantity"];
                            var prevolume = formContext.getAttribute("dia_prevolume").getValue();
                        

                            var sum = 0;
                            sum = Number(quantityjob);
                            formContext.getAttribute("dia_prevolume").setValue(0);
                            formContext.getAttribute("dia_postvolume").setValue(sum);

                        }
                    }
                }

            }
        };
        reqjob.send();
    }
}

function GetNameBatch( formContext, batchId) {

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
function GetNameStage(formContext ,StageId) {

    var StageName = "";

    var fetchXml = [
        "<fetch top='50'>",
        "  <entity name='dia_stage'>",
        "    <attribute name='dia_name' />",
        "    <filter>",
        "      <condition attribute='dia_stageid' operator='eq' value='", StageId, "'/>",
        "    </filter>",
        "  </entity>",
        "</fetch>",
    ].join("");

    var reqStageName = new XMLHttpRequest();
    reqStageName.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_stages?fetchXml=" + encodeURIComponent(fetchXml), false);
    reqStageName.setRequestHeader("OData-MaxVersion", "4.0");
    reqStageName.setRequestHeader("OData-Version", "4.0");
    reqStageName.setRequestHeader("Accept", "application/json");
    reqStageName.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    reqStageName.onreadystatechange = function () {
        if (this.readyState === 4) {
            reqStageName.onreadystatechange = null;
            if (this.status === 200) {
                var results = JSON.parse(this.response);
                if (results.value != null) {
                    for (var i = 0; i < results.value.length; i++) {
                        StageName = results.value[i]["dia_name"];
                    }
                }
            }

        }
    };
    reqStageName.send();

    return StageName;

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