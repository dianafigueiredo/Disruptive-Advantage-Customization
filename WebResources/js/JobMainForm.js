function OnLoad (executionContext)
{
	var formContext = executionContext.getFormContext();
	
	formContext.getAttribute("dia_type").addOnChange(jobTypeOnChange);
	formContext.getAttribute("dia_schelduledstart").addOnChange(startDateOnChange);
	
    jobTypeOnChange(executionContext);
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
		setVisibleControl(formContext, "DestinationVessel", true);
		setRequiredLevelControl(formContext, "dia_additive", "required");
		setRequiredLevelControl(formContext, "dia_quantity", "required");
    }
    else if(intake == 914440001){ //Transfer
        setVisibleControl(formContext, "dia_batch", false);
		setVisibleControl(formContext, "SourceVessel", true);
		setVisibleControl(formContext, "DestinationVessel", true);
		setRequiredLevelControl(formContext, "dia_additive", "none");
		setRequiredLevelControl(formContext, "dia_quantity", "required");
    }
	else if(intake == 914440002){ //Intake
        setVisibleControl(formContext, "dia_batch", true);
		setVisibleControl(formContext, "SourceVessel", false);
		setVisibleControl(formContext, "DestinationVessel", true);
		setRequiredLevelControl(formContext, "dia_additive", "none");
		setRequiredLevelControl(formContext, "dia_quantity", "required");
    }
	else if(intake == 914440003){ //Dispatch
        setVisibleControl(formContext, "dia_batch", false);
		setVisibleControl(formContext, "SourceVessel", false);
		setVisibleControl(formContext, "DestinationVessel", false);
		setRequiredLevelControl(formContext, "dia_additive", "none");
		setRequiredLevelControl(formContext, "dia_quantity", "required");
    }
}function OnLoad (executionContext)
{
	var formContext = executionContext.getFormContext();
	
	formContext.getAttribute("dia_type").addOnChange(jobTypeOnChange);
	formContext.getAttribute("dia_schelduledstart").addOnChange(startDateOnChange);
	
    jobTypeOnChange(executionContext);
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
		setVisibleControl(formContext, "DestinationVessel", true);
		setRequiredLevelControl(formContext, "dia_additive", "required");
		setRequiredLevelControl(formContext, "dia_quantity", "required");
    }
    else if(intake == 914440001){ //Transfer
        setVisibleControl(formContext, "dia_batch", false);
		setVisibleControl(formContext, "SourceVessel", true);
		setVisibleControl(formContext, "DestinationVessel", true);
		setRequiredLevelControl(formContext, "dia_additive", "none");
		setRequiredLevelControl(formContext, "dia_quantity", "required");
    }
	else if(intake == 914440002){ //Intake
        setVisibleControl(formContext, "dia_batch", true);
		setVisibleControl(formContext, "SourceVessel", false);
		setVisibleControl(formContext, "DestinationVessel", true);
		setRequiredLevelControl(formContext, "dia_additive", "none");
		setRequiredLevelControl(formContext, "dia_quantity", "required");
    }
	else if(intake == 914440003){ //Dispatch
        setVisibleControl(formContext, "dia_batch", false);
		setVisibleControl(formContext, "SourceVessel", false);
		setVisibleControl(formContext, "DestinationVessel", false);
		setRequiredLevelControl(formContext, "dia_additive", "none");
		setRequiredLevelControl(formContext, "dia_quantity", "required");
    }
}