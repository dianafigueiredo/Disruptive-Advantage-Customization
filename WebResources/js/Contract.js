function OnLoad(executionContext) {
	var formContext = executionContext.getFormContext();
	
	formContext.getAttribute("dia_type").addOnChange(jobTypeOnChange);
	jobTypeOnChange(executionContext);

}

function jobTypeOnChange(executionContext) {
	var formContext = executionContext.getFormContext();
	

	var type = formContext.getAttribute('dia_type').getValue();

	if (type == 587800002) { //fruit

		Xrm.Page.ui.tabs.get('tab_3').sections.get('fruit').setVisible(true);
		Xrm.Page.ui.tabs.get('tab_3').sections.get('wine').setVisible(false);

	}
	else if (type == 587800000) { //bulk wine
		
		Xrm.Page.ui.tabs.get('tab_3').sections.get('fruit').setVisible(false);
		Xrm.Page.ui.tabs.get('tab_3').sections.get('wine').setVisible(true);
		
	}

}