function OnLoad(executionContext) {
    var formContext = executionContext.getFormContext();
    percentage(executionContext);
	formContext.getAttribute("dia_level").addOnChange(percentage);
	formContext.getAttribute("dia_type").addOnChange(jobTypeOnChange);
	jobTypeOnChange(executionContext);
	formContext.getAttribute("dia_template").addOnChange(PopulateFields);
	formContext.getControl("dia_template").addPreSearch(function () {
		FilterJobTemplate(formContext);
	});
	formContext.getAttribute("dia_scheduledstart").addOnChange(startDateOnChange);
	formContext.getAttribute("dia_scheduledfinish").addOnChange(endDateLimit);
	formContext.getAttribute("dia_estimatedduration").addOnChange(EstimatedDuration);
}


function percentage(executionContext) {
    var formContext = executionContext.getFormContext();
    var level = formContext.getAttribute('dia_level').getValue();

    if (level == 914440000) {

        Xrm.Page.ui.tabs.get('tab_3').sections.get('Summary').setVisible(true);
        Xrm.Page.ui.tabs.get('tab_3').sections.get('Detail').setVisible(false);
    }


    else if (level == 914440001) {

        Xrm.Page.ui.tabs.get('tab_3').sections.get('Summary').setVisible(false);
        Xrm.Page.ui.tabs.get('tab_3').sections.get('Detail').setVisible(true);

    }

}
function setVisibleControl(formContext, controlName, state) {
	var ctrl = formContext.getControl(controlName);
	if (ctrl) {
		ctrl.setVisible(state);
	}
}
function TypeOnChange(executionContext) {
	var formContext = executionContext.getFormContext();
	formContext.getAttribute("dia_template").setValue();
}


function jobTypeOnChange(executionContext) {
	var formContext = executionContext.getFormContext();
	//formContext.getAttribute("dia_template").setValue();
	//TypeOnChange(executionContext);
	formContext.getControl("dia_template").addPreSearch(function () {
		FilterJobTemplate(formContext);
	});

	var Type = formContext.getAttribute('dia_type').getValue();

	if (Type == 587800000) { //Bulk Wine Intake

		formContext.ui.tabs.get("Loads").setVisible(false);	
		setVisibleControl(formContext, "Additives", true);
		setVisibleControl(formContext, "DestinationVessels", true);

	}
	else if (Type == 587800003) { //fruit
		
		formContext.ui.tabs.get("Loads").setVisible(true);	
		setVisibleControl(formContext, "DestinationVessels", false);
		setVisibleControl(formContext, "Additives", false);
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
		"      <condition attribute='dia_groupid' operator='eq' value='", GroupId, "'/>",
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


function FilterJobTemplate(formContext) {

	if (formContext.getAttribute("dia_type").getValue() == null) return;
	var type = formContext.getAttribute("dia_type").getValue();

	var fetchXml = [
		"<fetch>",
		"  <entity name='dia_jobtemplate'>",
		"    <attribute name='dia_jobtemplateid' />",
		"    <filter type='or'>",
		"      <condition attribute='dia_type' operator='eq' value='", type ,"'/>",
		"    </filter>",
		"  </entity>",
		"</fetch>",
	].join("");

	var reqjobtype = new XMLHttpRequest();
	reqjobtype.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_jobtemplates?fetchXml=" + encodeURIComponent(fetchXml), false);
	reqjobtype.setRequestHeader("OData-MaxVersion", "4.0");
	reqjobtype.setRequestHeader("OData-Version", "4.0");
	reqjobtype.setRequestHeader("Accept", "application/json");
	reqjobtype.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
	reqjobtype.onreadystatechange = function () {
		if (this.readyState === 4) {
			reqjobtype.onreadystatechange = null;
			if (this.status === 200) {
				var results = JSON.parse(this.response);
				if (results.value != null) {
					var values = "";
					if (results.value.length > 0) {
						for (var i = 0; i < results.value.length; i++) {
							var jobTemplateId = results.value[i].dia_jobtemplateid;
							values += "<value>" + jobTemplateId + "</value>"
						}
					}
					if (values == "") values = "<value>00000000-0000-0000-0000-000000000000</value>";
					var jobTemplateFilter = "<filter type='and'><condition attribute='dia_jobtemplateid' operator='in'>" + values + "</condition></filter>";
					formContext.getControl("dia_template").addCustomFilter(jobTemplateFilter, "dia_jobtemplate");
				}
			}
		}
	};
	reqjobtype.send();
}

function endDateLimit(executionContext) {
	var formContext = executionContext.getFormContext();


	if (formContext.getAttribute("dia_scheduledfinish").getValue() != null) {
		var endDate = formContext.getAttribute("dia_scheduledfinish").getValue();
		var startDate = formContext.getAttribute("dia_scheduledstart").getValue();

		if (endDate.getTime() < Date.now() || (startDate != null && startDate.getTime() > endDate.getTime())) {

			//formContext.getControl("dia_schelduledfinish").setNotification("Invalid date");
			//formContext.getAttribute("dia_schelduledfinish").setValue();
		}
		else formContext.getControl("dia_scheduledfinish").clearNotification();
	}

}


function EstimatedDuration(executionContext) {
	var formContext = executionContext.getFormContext();
	var EstimatedDuration = formContext.getAttribute("dia_estimatedduration").getValue();
	var endDate = formContext.getAttribute("dia_scheduledstart").getValue();
	var newDateObj = new Date(endDate.getTime() + EstimatedDuration * 60000);
	formContext.getAttribute("dia_scheduledfinish").setValue(newDateObj);


}

function startDateOnChange(executionContext) {
	var formContext = executionContext.getFormContext();
	endDateLimit(executionContext);
	var endDateValue = formContext.getAttribute("dia_scheduledfinish").getValue();

	if (!endDateValue) {
		var startDate = formContext.getAttribute("dia_scheduledfinish").getValue();
		if (startDate) {
			var newDateTime = new Date(startDate.setHours(startDate.getHours() + 1));
			formContext.getAttribute("dia_scheduledfinish").setValue(newDateTime);
		}
	}
	if (formContext.getAttribute("dia_scheduledstart").getValue() == null) return;
	EstimatedDuration(executionContext)
}