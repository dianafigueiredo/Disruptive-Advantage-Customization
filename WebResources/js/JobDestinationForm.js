function onLoad(executionContext) {
    var formContext = executionContext.getFormContext();
    formDestination(executionContext);
    extractiontype(executionContext);
    ChangeFields(executionContext);
    populateFieldsIntake(executionContext);
    formContext.getAttribute("dia_vessel").addOnChange(BlendChange);
    formContext.getAttribute("dia_batch").addOnChange(extractiontype);
    formContext.getAttribute("dia_quantity").addOnChange(populateFieldsIntake);
    formContext.getAttribute("dia_vessel").addOnChange(populateFieldsIntake);
}

function formDestination(executionContext) {

    var formContext = executionContext.getFormContext();
    if (formContext.getAttribute('dia_job').getValue() == null) return;
    var jobId = formContext.getAttribute('dia_job').getValue()[0].id;
    var jobType = 0;
    var fetchXml = [
        "<fetch >",
        "  <entity name='dia_job'>",
        "    <attribute name='dia_type' />",
        "    <filter>",
        "      <condition attribute='dia_jobid' operator='eq' value='", jobId, "'/>",
        "    </filter>",
        "  </entity>",
        "</fetch>",
    ].join("");



    var req = new XMLHttpRequest();
    req.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_jobs?fetchXml=" + encodeURIComponent(fetchXml), false);
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
                        jobType = results.value[0]["dia_type"];
                    }
                }

            }
        }
    };
    req.send();
    if (jobType == 914440000)//in-situ
    {
        formContext.ui.controls.get('dia_quantity').setVisible(false);
        formContext.ui.controls.get('dia_extractiontype').setVisible(false);
        formContext.ui.controls.get('dia_extractionrate').setVisible(false);
      
    }
    else if (jobType == 914440001) //transfer
    {
        formContext.ui.controls.get('dia_quantity').setVisible(true);
        formContext.ui.controls.get('dia_extractiontype').setVisible(false);
        formContext.ui.controls.get('dia_extractionrate').setVisible(false);
        
    }
    else if (jobType == 587800001) //Crush/Press
    {
        formContext.ui.controls.get('dia_quantity').setVisible(true);
        formContext.ui.controls.get('dia_extractiontype').setVisible(true);
        formContext.ui.controls.get('dia_extractionrate').setVisible(true);

    }
    else if (jobType == 914440003) //Dispatch
    {
        formContext.ui.controls.get('dia_quantity').setVisible(true);
    
    }
}

function ChangeFields(executionContext) {

    var formContext = executionContext.getFormContext();
    if (formContext.getAttribute('dia_intakebooking').getValue() == null) return;
    var intakeId = formContext.getAttribute('dia_intakebooking').getValue()[0].id;
    var Type = 0;

    var fetchXml = [
        "<fetch top='50'>",
        "  <entity name='dia_intakebookings'>",
        "    <attribute name='dia_type' />",
        "    <filter>",
        "      <condition attribute='dia_intakebookingsid' operator='eq' value='", intakeId, "'/>",
        "    </filter>",
        "  </entity>",
        "</fetch>",
    ].join("");

    var req = new XMLHttpRequest();
    req.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_intakebookingses?fetchXml=" + encodeURIComponent(fetchXml), false);
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
                        Type = results.value[0]["dia_type"];
                    }
                }

            }
        }
    };
    req.send();

    if (Type == 587800000)//Bulk
    {
       
        formContext.ui.controls.get('dia_extractiontype').setVisible(false);
        formContext.ui.controls.get('dia_extractionrate').setVisible(false);

    }
    

}





function BlendChange(executionContext)
{
    var formContext = executionContext.getFormContext();
    var blend = formContext.getAttribute("dia_blend").getValue();
    var prevolume = formContext.getAttribute("dia_prevolume").getValue();

    if (prevolume > 0) {

        formContext.getAttribute("dia_blend").setValue(true);

    } else if (prevolume <= 0) {

        formContext.getAttribute("dia_blend").setValue(false);

    }
}

function extractiontype(executionContext) {

    var formContext = executionContext.getFormContext();
    if (formContext.getAttribute('dia_batch').getValue() == null) return;
    var batchId = formContext.getAttribute('dia_batch').getValue()[0].id;

    var colour = "";

    var fetchXml = [
        "<fetch>",
        "  <entity name='dia_batch'>",
        "    <filter>",
        "      <condition attribute='dia_batchid' operator='eq' value='", batchId, "'/>",
        "    </filter>",
        "    <link-entity name='dia_variety' from='dia_varietyid' to='dia_variety'>",
        "      <attribute name='dia_colour' />",
        "    </link-entity>",
        "  </entity>",
        "</fetch>",
    ].join("");

    var req = new XMLHttpRequest();
    req.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_batchs?fetchXml=" + encodeURIComponent(fetchXml), false);
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
                        colour = results.value[0]["dia_variety1.dia_colour"];
                    }
                }

            }
        }
    };
    req.send();


    var fetchXmlrate = [
        "<fetch top='1'>",
        "  <entity name='dia_fruitextractionrate'>",
        "    <attribute name='dia_fruitextractionrateid' />",
        "    <attribute name='dia_name' />",
        "    <attribute name='dia_rate' />",
        "    <filter>",
        "      <condition attribute='dia_colour' operator='eq' value='", colour, "'/>",
        "    </filter>",
        "  </entity>",
        "</fetch>",
    ].join("");

    var reqrate = new XMLHttpRequest();
    reqrate.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_fruitextractionrates?fetchXml=" + encodeURIComponent(fetchXmlrate), false);
    reqrate.setRequestHeader("OData-MaxVersion", "4.0");
    reqrate.setRequestHeader("OData-Version", "4.0");
    reqrate.setRequestHeader("Accept", "application/json");
    reqrate.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    reqrate.onreadystatechange = function () {
        if (this.readyState === 4) {
            reqrate.onreadystatechange = null;
            if (this.status === 200) {
                var results = JSON.parse(this.response);
                if (results.value != null) {
                    if (results.value.length > 0) {


                        var lookupExtractionRate = new Array();
                        lookupExtractionRate[0] = new Object();
                        lookupExtractionRate[0].id = results.value[0]["dia_fruitextractionrateid"];
                        lookupExtractionRate[0].name = results.value[0]["dia_name"];
                        lookupExtractionRate[0].entityType = "dia_fruitextractionrate";


                        formContext.getAttribute("dia_extractiontype").setValue(lookupExtractionRate);
                        formContext.getAttribute("dia_extractionrate").setValue(results.value[0]["dia_rate"]);
                    }
                }

            }
        }
    };
    reqrate.send();
}

function populateFieldsIntake(executionContext) {

    var formContext = executionContext.getFormContext();
    if (formContext.getAttribute("dia_intakebooking").getValue() == null) return;
    var IntakeId = formContext.getAttribute("dia_intakebooking").getValue()[0].id;
    var intaketype = 0;

    var fetchXml = [
        "<fetch top='50'>",
        "  <entity name='dia_intakebookings'>",
        "    <attribute name='dia_type' />",
        "    <filter>",
        "      <condition attribute='dia_intakebookingsid' operator='eq' value='", IntakeId, "'/>",
        "    </filter>",
        "  </entity>",
        "</fetch>",
    ].join("");


    var req = new XMLHttpRequest();
    req.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_intakebookingses?fetchXml=" + encodeURIComponent(fetchXml), false);
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
                        intaketype = results.value[0]["dia_type"];
                    }
                }

            }
        }
    };
    req.send();

    if (intaketype == 587800000)//Bulk
    {
        if (formContext.getAttribute("dia_intakebooking").getValue() == null) return;

        var IntakeId = formContext.getAttribute("dia_intakebooking").getValue()[0].id;

        var fetchXml = [
            "<fetch>",
            "  <entity name='dia_intakebookings'>",
            "    <attribute name='dia_quantity' />",
            "    <filter>",
            "      <condition attribute='dia_intakebookingsid' operator='eq' value='", IntakeId, "'/>",
            "    </filter>",
            "  </entity>",
            "</fetch>",
        ].join("");

        var req = new XMLHttpRequest();
        req.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_intakebookingses?fetchXml=" + encodeURIComponent(fetchXml), false);
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
                            var Quantity = results.value[0]["dia_quantity"];

                           
                            var vesselId = Xrm.Page.getAttribute("dia_vesseldropdown").getValue().split("_ ")[1];
                            var vesselQuantity = GetQuantity(formContext, vesselId);

                            var sum = 0;
                            sum = vesselQuantity - Quantity;
                            formContext.getAttribute("dia_prevolume").setValue(Quantity);
                            formContext.getAttribute("dia_postvolume").setValue(sum);
                        }
                    }

                }
            }
        };
        req.send();


    }


}

function GetQuantity(formContext, vesselId) {
    var VesselQuantity = "";

    if (formContext.getAttribute("dia_vesseldropdown").getValue() == null) return;

    var fetchXmlVessel = [
        "<fetch>",
        "  <entity name='dia_vessel'>",
        "    <attribute name='dia_occupation' />",
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
                        VesselQuantity = results.value[i]["dia_occupation"];

                    }
                }
            }

        }
    };
    reqVessel.send();


    return VesselQuantity;

}

