function OnLoad(executionContext) {
	var formContext = executionContext.getFormContext();
	formContext.getAttribute("dia_location").addOnChange(LocationOnChange);
	formContext.getControl("dia_storage").addPreSearch(function () {
		FilterJobAdditive(executionContext);
	});
	var values = GetDestinationVessel(executionContext);
	formContext.getControl("dia_vessel").addPreSearch(function () {
		GetSourceVessel(executionContext, values);
	});
}
function FilterJobAdditive(executionContext) {
	var formContext = executionContext.getFormContext();
	if (formContext.getAttribute("dia_location").getValue() == null) return;
	var location = formContext.getAttribute("dia_location").getValue();

	var fetchXml = [
		"<fetch>",
		"  <entity name='dia_storage'>",
		"    <attribute name='dia_storageid' />",
		"    <filter>",
		"      <condition attribute='dia_locations' operator='eq' value='", location[0].id , "'/>",
		"    </filter>",
		"  </entity>",
		"</fetch>",
	].join("");

	var reqlocation = new XMLHttpRequest();
	reqlocation.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_storages?fetchXml=" + encodeURIComponent(fetchXml), false);
	reqlocation.setRequestHeader("OData-MaxVersion", "4.0");
	reqlocation.setRequestHeader("OData-Version", "4.0");
	reqlocation.setRequestHeader("Accept", "application/json");
	reqlocation.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
	reqlocation.onreadystatechange = function () {
		if (this.readyState === 4) {
			reqlocation.onreadystatechange = null;
			if (this.status === 200) {
				var results = JSON.parse(this.response);
				if (results.value != null) {
					var values = "";
					if (results.value.length > 0) {
						for (var i = 0; i < results.value.length; i++) {
							var storageId = results.value[i].dia_storageid;
							values += "<value>" + storageId + "</value>"
						}
					}
					if (values == "") values = "<value>00000000-0000-0000-0000-000000000000</value>";
					var locationFilter = "<filter type='and'><condition attribute='dia_storageid' operator='in'>" + values + "</condition></filter>";
					formContext.getControl("dia_storage").addCustomFilter(locationFilter, "dia_storage");
				}
			}
		}
	};
	reqlocation.send();
}

function LocationOnChange(executionContext) {

	var formContext = executionContext.getFormContext();
	formContext.getAttribute("dia_storage").setValue();

}

function GetDestinationVessel(executionContext) {
    var values = "";
    var formContext = executionContext.getFormContext();
    if (formContext.getAttribute("dia_jobid").getValue() == null) return;
    var JobId = formContext.getAttribute("dia_jobid").getValue()[0].id;

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
    if (formContext.getAttribute("dia_jobid").getValue() == null) return;
    var JobId = formContext.getAttribute("dia_jobid").getValue()[0].id;

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

function ChangeConsumptionType(executionContext) {

    var formContext = executionContext.getFormContext();
    if (formContext.data.entity._entityId.guid == null) return;

    var JobAddID = formContext.data.entity._entityId.guid;


    var fetchXml = [
        "<fetch>",
        "  <entity name='dia_jobadditive'>",
        "    <attribute name='dia_consumptiontype' />",
        "    <filter>",
        "      <condition attribute='dia_jobadditiveid' operator='eq' value='", JobAddID, "'/>",
        "    </filter>",
        "  </entity>",
        "</fetch>",
    ].join("");

    var req = new XMLHttpRequest();
    req.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_jobadditives?fetchXml=" + encodeURIComponent(fetchXml), false);
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

                        var consumptiontype = results.value[i]["dia_consumptiontype"];

                        if (consumptiontype == 587800000) {



                        }

                    }
                }

            }
        }
    };
    req.send();
    

}