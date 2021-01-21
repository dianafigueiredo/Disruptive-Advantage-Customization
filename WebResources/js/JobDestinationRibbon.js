function onLoad(executionContext)
{
    var formContext = executionContext.getFormContext();
    debugger;
	VerifyRemainingCapacity(formContext);
	formContext.getAttribute("dia_quantity").addOnChange(MaximumCapacity);
}
function OpenForm(formContext)
{

    var batch = formContext.getAttribute("dia_batch").getValue();
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
        });
}
function MaximumCapacity(executionContext)
{
    var formContext = executionContext.getFormContext();
    if(formContext.getAttribute("dia_vessel").getValue() != null)
    {
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
        if(capacity < formContext.getAttribute("dia_quantity").getValue())
        {
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
    if(formContext.getAttribute("dia_job").getValue() != null)
    {
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
                            for(var i = 0; i < results.value.length; i++)
                            {
                                allocatedCapacity += results.value[i]["dia_quantity"];
                            }
                            if(formContext.getAttribute("dia_quantity").getValue() != null)
                            {
                                var sourceVesselQuantity = formContext.getAttribute("dia_quantity").getValue();
                                if(sourceVesselQuantity + allocatedCapacity > jobCapacity)
                                {
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
        //formContext.getAttribute("dia_quantity").addOnChange(RemainingCapacityAvailable(formContext, jobCapacity, allocatedCapacity));
    }
}
function RemainingCapacityAvailable(formContext, jobCapacity, allocatedCapacity)
{
    if(formContext.getAttribute("dia_quantity").getValue() != null)
    {
        var sourceVesselQuantity = formContext.getAttribute("dia_quantity").getValue();
        if(sourceVesselQuantity + allocatedCapacity > jobCapacity)
        {
            formContext.getControl("dia_quantity").setNotification('Invalid value. Not enough quantity. Quantity Left: ' + jobCapacity - allocatedCapacity);
        }
        else {
            formContext.getControl("dia_quantity").clearNotification();
          }
    }

}