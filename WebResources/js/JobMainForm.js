function OnLoad(executionContext)
{
	var formContext = executionContext.getFormContext();
	SaveForm(executionContext);
	formContext.getAttribute("dia_type").addOnChange(jobTypeOnChange);
	formContext.getAttribute("dia_schelduledstart").addOnChange(startDateOnChange);
	formContext.getAttribute("dia_schelduledfinish").addOnChange(endDateLimit);
	formContext.getAttribute("dia_estimatedduration").addOnChange(EstimatedDuration);
	formContext.getAttribute("dia_template").addOnChange(PopulateFields);
	

	jobTypeOnChange(executionContext);
	QuantityLeft(executionContext);
}
function endDateLimit(executionContext) {
	var formContext = executionContext.getFormContext();
	
	
	if (formContext.getAttribute("dia_schelduledfinish").getValue() != null) {
		var endDate = formContext.getAttribute("dia_schelduledfinish").getValue();
		var startDate = formContext.getAttribute("dia_schelduledstart").getValue();

		if (endDate.getTime() < Date.now() || (startDate != null && startDate.getTime() > endDate.getTime())) {

			formContext.getControl("dia_schelduledfinish").setNotification("Invalid date");
			//formContext.getAttribute("dia_schelduledfinish").setValue();
		}
		else formContext.getControl("dia_schelduledfinish").clearNotification();
	}

}


function EstimatedDuration(executionContext) {
	var formContext = executionContext.getFormContext();
	var EstimatedDuration = formContext.getAttribute("dia_estimatedduration").getValue();
	var endDate = formContext.getAttribute("dia_schelduledstart").getValue();


	var newDateObj = new Date(endDate.getTime() + EstimatedDuration * 60000);
	formContext.getAttribute("dia_schelduledfinish").setValue(newDateObj);


}


function QuantityLeft(executionContext) {
	var formContext = executionContext.getFormContext();
	if (formContext.ui.getFormType() != 2) return;

	var jobId = formContext.data.entity.getId();
	var quantitySources = 0;
	var quantityDestinations = 0;
	if (formContext.getAttribute("dia_type").getValue() == null) return;

	var jobType = formContext.getAttribute("dia_type").getValue();

	if (jobType != 914440001) return;

	var fetchXmlSources = [
		"<fetch top='50'>",
		"  <entity name='dia_jobsourcevessel'>",
		"    <attribute name='dia_quantity' />",
		"    <filter>",
		"      <condition attribute='dia_job' operator='eq' value='", jobId, "'/>",
		"    </filter>",
		"  </entity>",
		"</fetch>",
	].join("");

	var req = new XMLHttpRequest();
	req.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_jobsourcevessels?fetchXml=" + encodeURIComponent(fetchXmlSources), false);
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
						quantitySources += results.value[i]["dia_quantity"];
					}
				}
			}

		}
	};
	req.send();
	var fetchXmlDestinations = [
		"<fetch top='50'>",
		"  <entity name='dia_jobdestinationvessel'>",
		"    <attribute name='dia_quantity' />",
		"    <filter>",
		"      <condition attribute='dia_job' operator='eq' value='", jobId, "'/>",
		"    </filter>",
		"  </entity>",
		"</fetch>",
	].join("");

	var reqDest = new XMLHttpRequest();
	reqDest.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_jobdestinationvessels?fetchXml=" + encodeURIComponent(fetchXmlDestinations), false);
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
						quantityDestinations += results.value[i]["dia_quantity"];
					}
				}
			}

		}
	};
	reqDest.send();

	if (quantitySources > quantityDestinations) {
		var aux = parseInt(quantitySources) - parseInt(quantityDestinations);
		formContext.ui.setFormNotification("There are still " + aux + "L not allocated in a Destination Vessel.", "INFO", "1")
    }
}
function setVisibleControl(formContext, controlName, state){
	var ctrl = formContext.getControl(controlName);
	if(ctrl){
		ctrl.setVisible(state);
	}
}

function setRequiredLevelControl(formContext, controlName, level){
	var att = formContext.getAttribute(controlName);
	if(att){
		att.setRequiredLevel(level);
	}
}

function startDateOnChange(executionContext) {
	var formContext = executionContext.getFormContext();
	endDateLimit(executionContext);
	var endDateValue = formContext.getAttribute("dia_schelduledfinish").getValue();
	
	if(!endDateValue){
		var startDate = formContext.getAttribute("dia_schelduledstart").getValue();
		if(startDate) {
			var newDateTime = new Date(startDate.setHours(startDate.getHours() + 1));
			formContext.getAttribute("dia_schelduledfinish").setValue(newDateTime);
		}
	}
}





function jobTypeOnChange(executionContext) {
    var formContext = executionContext.getFormContext();
	
	var intake = formContext.getAttribute('dia_type').getValue();
	
    if(intake == 914440000){ //InSitu
        setVisibleControl(formContext, "dia_batch", false);
		setVisibleControl(formContext, "SourceVessel", false);
		setVisibleControl(formContext, "DestinationVessel", false);
		setVisibleControl(formContext, "JobDestinationVessel", true);
		setVisibleControl(formContext, "dia_quantity", false);
		setRequiredLevelControl(formContext, "dia_additive", "required");
		//setRequiredLevelControl(formContext, "dia_quantity", "required");
		
    }
    else if(intake == 914440001){ //Transfer
        setVisibleControl(formContext, "dia_batch", false);
		setVisibleControl(formContext, "SourceVessel", true);
		setVisibleControl(formContext, "DestinationVessel", true);
		setVisibleControl(formContext, "JobDestinationVessel", false);
		setVisibleControl(formContext, "dia_quantity", true);
		setRequiredLevelControl(formContext, "dia_additive", "none");
		//setRequiredLevelControl(formContext, "dia_quantity", "required");
		
    }
	else if(intake == 914440002){ //Intake
        setVisibleControl(formContext, "dia_batch", true);
		setVisibleControl(formContext, "SourceVessel", false);
		setVisibleControl(formContext, "DestinationVessel", true);
		setVisibleControl(formContext, "JobDestinationVessel", false);
		setRequiredLevelControl(formContext, "dia_additive", "none");
		setRequiredLevelControl(formContext, "dia_quantity", "required");
		formContext.getControl("dia_quantity").setDisabled(false);
		
    }
	else if(intake == 914440003){ //Dispatch
        setVisibleControl(formContext, "dia_batch", false);
		setVisibleControl(formContext, "SourceVessel", true);
		setVisibleControl(formContext, "DestinationVessel", false);
		setVisibleControl(formContext, "JobDestinationVessel", false);
		setRequiredLevelControl(formContext, "dia_additive", "none");
		setRequiredLevelControl(formContext, "dia_quantity", "required");
		
    }
}

function SaveForm(executionContext){

	var formContext = executionContext.getFormContext();
	var formType = formContext.ui.getFormType();

	if (formContext.ui.getFormType() == 1) {

		setVisibleControl(formContext, "dia_template", false);
		setVisibleControl(formContext, "dia_estimatedduration", false);

	} else if (formContext.ui.getFormType() != 1) {

		setVisibleControl(formContext, "dia_template", true);
		setVisibleControl(formContext, "dia_estimatedduration", true);
	}
	

}

function PopulateFields(executionContext) {

	var formContext = executionContext.getFormContext();
	if (formContext.getAttribute("dia_template").getValue() == null) return;
	var TemplateId = formContext.getAttribute("dia_template").getValue()[0].id;


	var fetchXml = [
		"<fetch>",
		"  <entity name='dia_jobtemplate'>",
		"    <attribute name='dia_group' />",
		"    <attribute name='dia_estimatedduration' />",
		"    <filter>",
		"      <condition attribute='dia_jobtemplateid' operator='eq' value='", TemplateId, "'/>",
		"    </filter>",
		"  </entity>",
		"</fetch>",
	].join("");

	var reqTemplate = new XMLHttpRequest();
	reqTemplate.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_jobtemplates?fetchXml=" + encodeURIComponent(fetchXml), false);
	reqTemplate.setRequestHeader("OData-MaxVersion", "4.0");
	reqTemplate.setRequestHeader("OData-Version", "4.0");
	reqTemplate.setRequestHeader("Accept", "application/json");
	reqTemplate.setRequestHeader("Content-Type", "application/json; charset=utf-8");
	reqTemplate.onreadystatechange = function () {
		if (this.readyState === 4) {
			reqTemplate.onreadystatechange = null;
			if (this.status === 200) {
				var results = JSON.parse(this.response);
				if (results.value != null) {
					for (var i = 0; i < results.value.length; i++) {

						var estimated = results.value[i]["dia_estimatedduration"];
						var GroupId = results.value[i]["_dia_group_value"];
						var GroupName = GetNamegroup(formContext, GroupId);
						
						var lookupGroup = new Array();
						lookupGroup[0] = new Object();
						lookupGroup[0].id = GroupId;
						lookupGroup[0].name = GroupName;
						lookupGroup[0].entityType = "dia_group";

						
						formContext.getAttribute("dia_estimatedduration").setValue(estimated);
						formContext.getAttribute("dia_group").setValue(lookupGroup);
						EstimatedDuration(executionContext);


					}
				}
			}

		}
	};
	reqTemplate.send();
}

function GetNamegroup(formContext, GroupId) {

	var groupName = "";

	var fetchXmlgroup = [
		"<fetch top='50'>",
		"  <entity name='dia_group'>",
		"    <attribute name='dia_name' />",
		"    <filter>",
		"      <condition attribute='dia_groupid' operator='eq' value='", GroupId , "'/>",
		"    </filter>",
		"  </entity>",
		"</fetch>",
	].join("");

	var reqName = new XMLHttpRequest();
	reqName.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_groups?fetchXml=" + encodeURIComponent(fetchXmlgroup), false);
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
						groupName = results.value[i]["dia_name"];

					}
				}
			}

		}
	};
	reqName.send();

	return groupName;

}


