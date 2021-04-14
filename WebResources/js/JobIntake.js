function OnLoad(executionContext) {
    var formContext = executionContext.getFormContext();
    percentage(executionContext);
	formContext.getAttribute("dia_level").addOnChange(percentage);
	formContext.getAttribute("dia_type").addOnChange(jobTypeOnChange);
	jobTypeOnChange(executionContext);
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

function jobTypeOnChange(executionContext) {
	var formContext = executionContext.getFormContext();
	//formContext.getAttribute("dia_template").setValue();
	//TypeOnChange(executionContext);
	//formContext.getControl("dia_template").addPreSearch(function () {
	//	FilterJobTemplate(formContext);
	//});

	var Type = formContext.getAttribute('dia_type').getValue();

	if (Type == 914440002) { //Bulk Wine Intake

		formContext.ui.tabs.get("Loads").setVisible(false);	

	}
	else if (Type == 587800001) { //fruit
		
		formContext.ui.tabs.get("Loads").setVisible(true);	
	}
}