function OnLoad (executionContext) {
    var formContext = executionContext.getFormContext();
    HideJob (executionContext);
    formContext.getAttribute("statuscode").addOnChange(HideJob);
}

function HideJob (executionContext)
{
    var formContext = executionContext.getFormContext();
    var status = formContext.getAttribute('statuscode').getValue();

    if (status == 914440003) {// Active

        formContext.ui.controls.get('jobs').setVisible(true);
    }
    else if (status == 914440004){ //inactive
    
        formContext.ui.controls.get('jobs').setVisible(false);
    }
}