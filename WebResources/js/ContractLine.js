function onload(executionContext) {

    var formContext = executionContext.getFormContext();
    var contracttype = ChangeUnit(executionContext);
    formContext.getAttribute("dia_quantity").addOnChange(calculateContractlines);
    formContext.getAttribute("dia_unitprice").addOnChange(calculateContractlines);
    PopulateFields(executionContext, contracttype);
   

}

function ChangeUnit(executionContext) {

    var formContext = executionContext.getFormContext();
    if (formContext.getAttribute('dia_contracts').getValue() == null) return;
    var contractId = formContext.getAttribute('dia_contracts').getValue()[0].id;
    var contracttype = 0;

    var fetchXml = [
        "<fetch>",
        "  <entity name='dia_contracts'>",
        "    <attribute name='dia_type' />",
        "    <filter>",
        "      <condition attribute='dia_contractsid' operator='eq' value='", contractId, "'/>",
        "    </filter>",
        "  </entity>",
        "</fetch>",
    ].join("");


    var reqDest = new XMLHttpRequest();
    reqDest.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_contractses?fetchXml=" + encodeURIComponent(fetchXml), false);
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
                        contracttype = results.value[i]["dia_type"];

                    }
                }
            }

        }
    };
    reqDest.send();

    if (contracttype == 587800003) { // Fruit


        formContext.ui.controls.get('dia_wineunit').setVisible(false);


    } else if (contracttype == 587800000) { //Bulk wine

        formContext.ui.controls.get('dia_grapeunit').setVisible(false);

    }
    return contracttype;
}

function calculateContractlines(executionContext) {

    var formContext = executionContext.getFormContext();

    var quantity = formContext.getAttribute("dia_quantity").getValue();
    var unitprice = formContext.getAttribute("dia_unitprice").getValue();
    var total = quantity * unitprice;

    formContext.getAttribute("dia_total").setValue(total);


}

function PopulateFields(executionContext, contracttype) {

    var formContext = executionContext.getFormContext();

    var fetchXml = [
        "<fetch top='1'>",
        "  <entity name='dia_winerysettings'>",
        "    <attribute name='dia_grapeunit' />",
        "    <attribute name='dia_wineunit' />",
        "  </entity>",
        "</fetch>",
    ].join("");


    var reqVessel = new XMLHttpRequest();
    reqVessel.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_winerysettingses?fetchXml=" + encodeURIComponent(fetchXml), false);
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
                        var grapeUnitId = results.value[i]["_dia_grapeunit_value"];
                        var WineUnitId = results.value[i]["_dia_wineunit_value"];

                        var WineName = GetNameWine(formContext, WineUnitId);
                        var GrapeName = GetNameGrape(formContext, grapeUnitId);

                        var lookupWine = new Array();
                        lookupWine[0] = new Object();
                        lookupWine[0].id = WineUnitId;
                        lookupWine[0].name = WineName;
                        lookupWine[0].entityType = "dia_unit";

                        var lookupGrape = new Array();
                        lookupGrape[0] = new Object();
                        lookupGrape[0].id = grapeUnitId;
                        lookupGrape[0].name = GrapeName;
                        lookupGrape[0].entityType = "dia_unit";

                        if (contracttype == 587800003) { //fruit

                            formContext.getAttribute("dia_grapeunit").setValue(lookupGrape);

                        } else if (contracttype == 587800000) {

                            formContext.getAttribute("dia_wineunit").setValue(lookupWine);
                        }
                        
                    

                    }
                }
            }
        }

    };
    reqVessel.send();


}





function GetNameWine(formContext, WineUnitId ) {

    var unitname = "";

    var fetchXml = [
        "<fetch>",
        "  <entity name='dia_unit'>",
        "    <attribute name='dia_name' />",
        "    <filter>",
        "      <condition attribute='dia_unitid' operator='eq' value='", WineUnitId, "'/>",
        "    </filter>",
        "  </entity>",
        "</fetch>",
    ].join("");

    var reqVessel = new XMLHttpRequest();
    reqVessel.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_units?fetchXml=" + encodeURIComponent(fetchXml), false);
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
                        unitname = results.value[i]["dia_name"];

                    }
                }
            }

        }
    };
    reqVessel.send();


    return unitname;
}

function GetNameGrape(executionContext, grapeUnitId) {


    var unitname = "";

    var fetchXml = [
        "<fetch>",
        "  <entity name='dia_unit'>",
        "    <attribute name='dia_name' />",
        "    <filter>",
        "      <condition attribute='dia_unitid' operator='eq' value='", grapeUnitId, "'/>",
        "    </filter>",
        "  </entity>",
        "</fetch>",
    ].join("");

    var reqVessel = new XMLHttpRequest();
    reqVessel.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/dia_units?fetchXml=" + encodeURIComponent(fetchXml), false);
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
                        unitname = results.value[i]["dia_name"];

                    }
                }
            }

        }
    };
    reqVessel.send();


    return unitname;
}

