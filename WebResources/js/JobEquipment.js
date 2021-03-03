function OnLoad(executionContext) {
	var formContext = executionContext.getFormContext();
	formContext.getAttribute("dia_location").addOnChange(LocationOnChange);
	formContext.getControl("dia_equipment").addPreSearch(function () {
		FilterEquipment(executionContext);
	});
}

function FilterEquipment(executionContext) {
	var formContext = executionContext.getFormContext();
	if (formContext.getAttribute("dia_location").getValue() == null) return;
	var location = formContext.getAttribute("dia_location").getValue();

	var fetchXml = [
		"<fetch >",
		"  <entity name='dia_equipment'>",
		"    <attribute name='dia_equipmentid' />",
		"    <filter>",
		"      <condition attribute='dia_locations' operator='eq' value='", location[0].id, "'/>",
		"    </filter>",
		"  </entity>",
		"</fetch>",
	].join("");
	var reqlocation = new XMLHttpRequest();
	reqlocation.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_equipments?fetchXml=" + encodeURIComponent(fetchXml), false);
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
							var equipmentId = results.value[i].dia_equipmentid;
							values += "<value>" + equipmentId + "</value>"
						}
					}
					if (values == "") values = "<value>00000000-0000-0000-0000-000000000000</value>";
					var locationFilter = "<filter type='and'><condition attribute='dia_equipmentid' operator='in'>" + values + "</condition></filter>";
					formContext.getControl("dia_equipment").addCustomFilter(locationFilter, "dia_equipment");
				}
			}
		}
	};
	reqlocation.send();
}

function LocationOnChange(executionContext) {

	var formContext = executionContext.getFormContext();
	formContext.getAttribute("dia_equipment").setValue();

}