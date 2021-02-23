function onLoad(executionContext) {
    var formContext = executionContext.getFormContext();
    formDestination(executionContext);
    formContext.getAttribute("dia_vessel").addOnChange(BlendChange);
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
    if (jobType == 914440000)
    {
        formContext.ui.controls.get('dia_quantity').setVisible(false);
      
    }
    else
    {
        formContext.ui.controls.get('dia_quantity').setVisible(true);
        
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
